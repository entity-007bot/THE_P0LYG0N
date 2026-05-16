// backend/services/voice_assistant.js
import { db } from '../db/index.js';
import * as MatchingEngine from './MatchingEngine.js';
import * as tools from './tools.js';

/**
 * Enhanced voice assistant with contextual memory and follow-up support
 */
export async function processVoiceMatch(transcript, userId, sessionContext = {}) {
    console.log(`🎤 Processing voice intent: "${transcript}" for User: ${userId}`);
    
    const worker = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!worker) {
        return { speak: "I couldn't find your profile.", intent: 'error', requiresFollowUp: false };
    }

    const lowerInput = transcript.toLowerCase();

    // --- MOVED CONTEXTUAL LOGIC START ---
    if (sessionContext.pendingJob && (lowerInput.includes('yes') || lowerInput.includes('accept') || lowerInput.includes('ok'))) {
        const job = sessionContext.pendingJob;
        return {
            speak: `Great! I've started your application for the ${job.title} job. The escrow deposit is being created.`,
            intent: 'job_accepted',
            jobId: job.id,
            job: job,
            requiresFollowUp: false
        };
    }

    if (sessionContext.pendingJob && (lowerInput.includes('no') || lowerInput.includes('skip') || lowerInput.includes('cancel'))) {
        return {
            speak: `Okay, I'll skip that job. Would you like me to find other jobs for you? Just say "find jobs".`,
            intent: 'job_skipped',
            requiresFollowUp: true,
            followUpPrompt: 'find jobs'
        };
    }
    
    // Handle "balance" or "wallet" queries
    if (lowerInput.includes('balance') || lowerInput.includes('wallet') || lowerInput.includes('money')) {
        const balanceKobo = worker.wallet_balance_kobo || 0;
        const vaultKobo = worker.growth_vault_kobo || 0;
        const balanceNaira = Math.round(balanceKobo / 100);
        const vaultNaira = Math.round(vaultKobo / 100);
        
        return {
            speak: `Your wallet balance is ${balanceNaira} Naira. You have ${vaultNaira} Naira saved in your Growth Vault. Would you like to see available jobs?`,
            intent: 'balance_inquiry',
            data: { balance: balanceNaira, vault: vaultNaira },
            requiresFollowUp: true,
            followUpPrompt: 'jobs'
        };
    }
    
    // Handle "skills" query
    if (lowerInput.includes('my skills') || lowerInput.includes('what skills')) {
        const skills = worker.skills || 'not set';
        return {
            speak: `Your skills are: ${skills}. You can update them in your profile settings.`,
            intent: 'skills_inquiry',
            data: { skills },
            requiresFollowUp: false
        };
    }
    
    // Handle "help" or "commands"
    if (lowerInput.includes('help') || lowerInput.includes('what can you do')) {
        return {
            speak: `I can help you find jobs by skill, check your wallet balance, show your skills, or connect you to support. Just tell me what you need. For example: "find plumbing jobs" or "check my balance".`,
            intent: 'help',
            requiresFollowUp: true,
            followUpPrompt: 'anything'
        };
    }

    // 3. Extract keywords for job matching
    const skills = tools.extractSkills(transcript);
    
    if (skills.length === 0) {
        // Try to detect general job search intent
        if (lowerInput.includes('job') || lowerInput.includes('work') || lowerInput.includes('gig')) {
            // Return all available jobs in their area
            const allJobs = db.prepare("SELECT * FROM jobs WHERE status = 'open' AND city = ?").all(worker.city);
            if (allJobs.length > 0) {
                const firstJob = allJobs[0];
                const amount = Math.round(firstJob.budget_kobo / 100);
                return {
                    speak: `I found ${allJobs.length} jobs in ${worker.city}. The first one is a ${firstJob.title} paying ${amount} Naira. Would you like to hear more?`,
                    intent: 'job_listing',
                    jobCount: allJobs.length,
                    pendingJob: firstJob,
                    requiresFollowUp: true,
                    followUpPrompt: 'yes or no'
                };
            }
        }
        
        return {
            speak: "I couldn't identify a specific skill. Please tell me what kind of work you do, like 'plumbing', 'delivery', or 'cleaning'.",
            intent: 'error_no_skill',
            requiresFollowUp: false
        };
    }

    // 4. Fetch open jobs
    const jobs = db.prepare("SELECT * FROM jobs WHERE status = 'open'").all();
    
    // 5. Rank jobs for this worker
    const matches = await MatchingEngine.rankJobsForWorker(worker, jobs);
    
    // Filter by extracted skills
    const relevantMatches = matches.filter(match => 
        skills.some(skill => 
            match.title.toLowerCase().includes(skill) || 
            match.description.toLowerCase().includes(skill) ||
            (match.required_skill && match.required_skill.toLowerCase().includes(skill))
        )
    );
    
    const topMatches = relevantMatches.length > 0 ? relevantMatches : matches;

    // 6. Format response
    if (topMatches.length > 0) {
        const topJob = topMatches[0];
        const amount = Math.round(topJob.budget_kobo / 100);
        const matchPercent = Math.round(topJob.match_score * 100);
        
        let response = `I found a ${topJob.title} job in ${topJob.city} paying ${amount} Naira. `;
        response += `It's a ${matchPercent} percent match for your skills. `;
        response += `Would you like to apply for this job? Just say yes or no.`;
        
        return {
            speak: response,
            intent: 'job_match',
            job: {
                id: topJob.id,
                title: topJob.title,
                city: topJob.city,
                amount: amount,
                matchPercent: matchPercent
            },
            pendingJob: topJob,
            requiresFollowUp: true,
            followUpPrompt: 'yes or no'
        };
    }

    // No matches found
    return {
        speak: `I couldn't find any jobs matching ${skills.join(', ')} in your area right now. Would you like me to alert you when jobs appear? Just say "alert me".`,
        intent: 'no_matches',
        skills: skills,
        requiresFollowUp: true,
        followUpPrompt: 'alert me'
    };
}

// Session management for voice conversations
const sessions = new Map();

export async function processVoiceWithSession(transcript, userId) {
    // 1. Get or create session
    if (!sessions.has(userId)) {
        sessions.set(userId, {});
    }
    const session = sessions.get(userId);
    
    // 2. Call processVoiceMatch using the 'session' variable
    const result = await processVoiceMatch(transcript, userId, session);
    
    // 3. Update session with pending context from the result
    if (result.pendingJob) {
        session.pendingJob = result.pendingJob;
    }
    if (result.intent === 'job_accepted' || result.intent === 'job_skipped') {
        delete session.pendingJob;
    }
    
    // 4. Session cleanup (30 mins)
    setTimeout(() => {
        if (sessions.has(userId)) sessions.delete(userId);
    }, 30 * 60 * 1000);
    
    return result;
}

export default { 
    processVoiceMatch, 
    processVoiceWithSession 
};