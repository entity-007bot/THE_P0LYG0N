import { Landmark, PiggyBank, ShieldCheck, Sparkles, Mic, Wallet, TrendingUp, Award, Clock } from 'lucide-react'; 
import { processVoiceIntent, createDeposit } from '../api'; 
import { verifyAriaTransaction } from '../api.js';

import React, { useState } from 'react';

const formatNaira = (kobo = 0) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(kobo / 100);

export default function WalletDashboard({ dashboard, onMockPayment, loading }) {
  const { user, wallet, trustScore, economicIdentity } = dashboard;
  const scoreProgress = Math.max(0, Math.min(100, Number(trustScore || 0)));
  const identityVerified = user.identity_status === 'verified';
  const [verifying, setVerifying] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

// Add state for voice session
const [voiceSession, setVoiceSession] = useState(null);
const [showVoiceConfirm, setShowVoiceConfirm] = useState(false);
const [pendingJob, setPendingJob] = useState(null);

// Handle voice response confirmation
const handleVoiceConfirm = async () => {
  if (!pendingJob) return;
  
  try {
    // Send "yes" to backend to accept the job
    const response = await processVoiceIntent("yes", user.id);
    
    // Speak the response
    if (response.speak && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(response.speak);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
    
    // Create escrow deposit for the job
    const depositResult = await createDeposit(pendingJob.id, user.id);
    
    // Show success message
    alert(`✅ Job accepted! Escrow deposit created. Check your jobs tab for details.`);
    
    // Refresh dashboard
    window.location.reload();
    
  } catch (err) {
    console.error("Job acceptance failed:", err);
    alert(`Failed to accept job: ${err.message}`);
  } finally {
    setShowVoiceConfirm(false);
    setPendingJob(null);
  }
};

// Handle voice response cancel
const handleVoiceCancel = () => {
  setShowVoiceConfirm(false);
  setPendingJob(null);
  // Optionally send "no" to backend
  processVoiceIntent("no", user.id).catch(console.error);
};

// Update your voice search handler
const handleVoiceSearch = () => {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    alert("Voice search not supported on this browser.");
    return;
  }

  const recognition = new Recognition();
  recognition.lang = 'en-NG';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  
  recognition.onstart = () => {
    console.log("🎤 Listening...");
  };
  
  recognition.onerror = (event) => {
    console.error("Voice error:", event.error);
    alert("Could not hear you. Please try again.");
  };
  
  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    console.log(`📝 You said: "${transcript}"`);
    
    try {
      const response = await processVoiceIntent(transcript, user.id);
      
      // Speak response
      if (response.speak && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(response.speak);
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
      
      // If response includes a job, show confirmation dialog
      if (response.job && response.requiresFollowUp) {
        setPendingJob(response.job);
        setShowVoiceConfirm(true);
        
        // Auto-hide after 30 seconds
        setTimeout(() => {
          setShowVoiceConfirm(false);
          setPendingJob(null);
        }, 30000);
      }
      
      // Show toast message
      showVoiceToast(response.speak, response.job);
      
    } catch (err) {
      console.error("Processing failed:", err);
      alert("Sorry, I couldn't process your request.");
    }
  };
  
  recognition.start();
};

// Helper function for toast notifications
const showVoiceToast = (message, job) => {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-24 left-4 right-4 bg-ink text-white rounded-2xl p-4 shadow-2xl z-50 animate-slide-up';
  toast.innerHTML = `
    <div class="flex items-start gap-3">
      <div class="text-2xl">${job ? '💼' : '🤖'}</div>
      <div class="flex-1">
        <p class="font-bold text-sm">${job ? 'Job Match Found!' : 'ARIA AI'}</p>
        <p class="text-sm text-white/80">${message}</p>
        ${job ? `<p class="text-xs text-green-400 mt-2">💰 ₦${job.amount} • 🎯 ${job.matchPercent}% match</p>` : ''}
      </div>
      <button class="text-white/60 hover:text-white" onclick="this.parentElement.parentElement.remove()">✕</button>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 8000);
};

  async function handleVerifyPayment(ref) {
    setVerifying(true);
    try {
      const status = await verifyAriaTransaction(ref);
      alert(`Payment Status: ${status.data.transaction_status}`);
    } catch (err) {
      alert("Verification failed: " + err.message);
    } finally {
      setVerifying(false);
    }
  }

  return (
    <aside className="space-y-5">
      {/* Main Wallet Card */}
      <section className="rounded-2xl bg-gradient-to-br from-ink to-gray-900 p-5 text-white shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-white/60">Welcome back</p>
            <h2 className="text-2xl font-black tracking-tight">{user.full_name}</h2>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 backdrop-blur-sm">
            <Landmark size={22} className="text-amber" />
          </div>
        </div>

        <p className="text-sm font-semibold text-white/60">Aria wallet balance</p>
        <p className="mb-5 text-4xl font-black">{formatNaira(wallet.balanceKobo)}</p>

        <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase text-white/50">Dedicated NUBAN</p>
            <button 
              onClick={() => handleVerifyPayment(user.id)} 
              className="text-xs text-amber hover:underline"
              disabled={verifying}
            >
              {verifying ? 'Syncing...' : 'Sync'}
            </button>
          </div>
          <p className="text-lg font-black font-mono">{wallet.virtualAccount?.accountNumber || 'Pending sync'}</p>
          <p className="text-sm text-white/70">{wallet.virtualAccount?.bankName}</p>
          <p className="text-xs text-white/50 truncate">{wallet.virtualAccount?.accountName}</p>
        </div>
      </section>

      {/* KiScore Gauge */}
      <section className="rounded-2xl border border-black/10 bg-white shadow-sm p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-black/55">AI Trust Score</p>
            <h3 className="text-xl font-black tracking-tight">KiScore</h3>
          </div>
          <Sparkles className="text-amber" size={22} />
        </div>

        <div className="relative mx-auto h-40 w-40">
          <svg className="h-full w-full transform -rotate-90">
            <circle cx="80" cy="80" r="72" fill="none" stroke="#E5E7EB" strokeWidth="12" />
            <circle 
              cx="80" 
              cy="80" 
              r="72" 
              fill="none" 
              stroke="url(#gradient)" 
              strokeWidth="12"
              strokeDasharray={`${(scoreProgress / 100) * 452.389} 452.389`}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2fb083" />
                <stop offset="100%" stopColor="#f2b84b" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-4xl font-black">{trustScore}</p>
            <p className="text-xs font-bold text-black/50">credit signal</p>
          </div>
        </div>
        
        <div className="mt-3 text-center">
          <div className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1">
            <TrendingUp size={12} className="text-green-600" />
            <span className="text-xs font-bold text-green-600">+42 this month</span>
          </div>
        </div>
      </section>

      {/* Growth Vault */}
      <section className="rounded-2xl border border-black/10 bg-gradient-to-r from-amber/5 to-orange/5 p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-r from-amber to-orange text-white shadow-md">
            <PiggyBank size={22} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-black/55">Growth Vault</p>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-black">{formatNaira(wallet.growthVaultKobo)}</p>
              <span className="rounded-full bg-amber/20 px-2 py-0.5 text-[10px] font-black text-amber">5% auto-save</span>
            </div>
          </div>
        </div>
        <button
          className="mt-4 h-11 w-full rounded-xl bg-gradient-to-r from-palm to-mint px-4 font-bold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-60"
          onClick={onMockPayment}
          disabled={loading}
        >
          {loading ? 'Processing...' : '💰 Simulate Completed Job'}
        </button>
      </section>

<button 
  className="h-12 w-full rounded-xl bg-white font-bold text-palm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
  onClick={handleVoiceSearch}
>
  <Mic size={18} />
  Tap to Speak
</button>

{/* Voice Confirmation Modal */}
{showVoiceConfirm && pendingJob && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl transform animate-scale-up">
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-palm to-mint text-white text-3xl mb-3">
          🎤
        </div>
        <h3 className="text-xl font-black text-ink">Confirm Job Application</h3>
      </div>
      
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-black/60">Position:</span>
          <span className="font-bold">{pendingJob.title}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-black/60">Location:</span>
          <span>{pendingJob.city}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-black/60">Payment:</span>
          <span className="text-palm font-bold">₦{pendingJob.amount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-black/60">AI Match:</span>
          <span className="text-green-600 font-bold">{pendingJob.matchPercent}%</span>
        </div>
      </div>
      
      <p className="text-sm text-black/60 text-center mb-6">
        Would you like to apply for this job? Escrow will be created to secure your payment.
      </p>
      
      <div className="flex gap-3">
        <button
          onClick={handleVoiceConfirm}
          className="flex-1 h-12 rounded-xl bg-gradient-to-r from-palm to-mint text-white font-bold shadow-md hover:shadow-lg transition-all"
        >
          ✅ Yes, Apply
        </button>
        <button
          onClick={handleVoiceCancel}
          className="flex-1 h-12 rounded-xl border border-black/15 font-bold hover:bg-gray-50 transition-all"
        >
          ❌ No, Cancel
        </button>
      </div>
      
      <button
        onClick={handleVoiceCancel}
        className="w-full mt-3 text-xs text-black/40 hover:text-black/60"
      >
        Close
      </button>
    </div>
  </div>
)}

      {/* Economic Identity Card */}
      {economicIdentity && (
        <>
          <section className="rounded-2xl border border-black/10 bg-white shadow-sm p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-r from-mint to-palm/20 text-palm">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-black/55">Portable profile</p>
                <h3 className="text-xl font-black tracking-tight">AI Economic Identity</h3>
              </div>
            </div>

            <div className="grid gap-2 text-sm">
              <IdentityRow label="Identity status" value={identityVerified ? 'Verified' : user.identity_status || 'Pending'} />
              <IdentityRow label="Identity rail" value={user.identity_provider ? `${user.identity_provider} ${String(user.identity_type || '').toUpperCase()}` : 'Demo provider'} />
              <IdentityRow label="AI credit score" value={economicIdentity.aiCreditScore} />
              <IdentityRow label="Risk tier" value={economicIdentity.aiTrustProfile.riskTier} />
              <IdentityRow label="Work history" value={`${economicIdentity.workHistory.completedJobs} jobs`} />
              <IdentityRow label="Skill graph" value={economicIdentity.skillGraph.join(', ') || 'Not set'} />
              <IdentityRow label="Reputation" value={`${Math.round((economicIdentity.reputationGraph.reputationRatio || 0) * 100)}% positive`} />
              <IdentityRow label="Access mode" value={economicIdentity.aiTrustProfile.accessMode} />
            </div>
          </section>

          {/* Insurance Banner */}
          <section className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-blue-600" size={20} />
                <span className="text-sm font-bold text-blue-800">Gig-Safe Active</span>
              </div>
              <span className="rounded-full bg-blue-600/10 px-3 py-1 text-xs font-black text-blue-600">₦50 Premium Paid</span>
            </div>
            <p className="mt-2 text-xs text-black/60 leading-relaxed">
              Your current job is covered for accidental injury via the Aria Escrow split.
            </p>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-blue-600">
              <Clock size={10} />
              Coverage ends in 72 hours
            </div>
          </section>
        </>
      )}
    </aside>
  );
}

function IdentityRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2.5 border border-black/5">
      <span className="text-sm font-semibold text-black/55">{label}</span>
      <strong className="text-right text-sm">{String(value)}</strong>
    </div>
  );
}
