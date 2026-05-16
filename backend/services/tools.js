import { db } from '../db/index.js';

const TOOL_CONFIG = {
  'ai-search': {
    name: 'AI Search',
    area: 'Smart search across app content',
    description: 'Search workers, gigs, wallet events, match reasons, groups, and support topics.',
    actions: ['Search app', 'Explain KiScore', 'Find best gigs']
  },
  'web-search': {
    name: 'Web Search',
    area: 'External search results when needed',
    description: 'Demo-safe external opportunity discovery for market jobs, apprenticeships, and contracts.',
    actions: ['Find market leads', 'Find apprenticeships', 'Save search']
  },
  'social-feed': {
    name: 'Social Feed',
    area: 'Posts, updates, job-related content',
    description: 'Community updates, worker stories, employer notices, and demand signals.',
    actions: ['Post update', 'Follow topic', 'Share opportunity']
  },
  'saved-items': {
    name: 'Saved Items',
    area: 'Saved jobs, posts, searches',
    description: 'Saved opportunities, search filters, business profiles, and posts.',
    actions: ['Save top gig', 'Create collection', 'Review saved']
  },
  notifications: {
    name: 'Notifications',
    area: 'Messages, jobs, wallet alerts',
    description: 'Escrow, wallet, match, proof-of-work, group, and support alerts.',
    actions: ['Mark reviewed', 'Create job alert', 'Enable wallet alerts']
  },
  communities: {
    name: 'Communities/Groups',
    area: 'Team spaces and discussions',
    description: 'Trade groups, local squads, training cohorts, and employer channels.',
    actions: ['Join local squad', 'Start discussion', 'Invite worker']
  },
  tasks: {
    name: 'Tasks/Missions',
    area: 'Small actions in the app',
    description: 'Profile, verification, savings, and learning actions that increase trust.',
    actions: ['Complete mission', 'Verify profile', 'Start proof-of-work']
  },
  rewards: {
    name: 'Rewards/Points',
    area: 'Achievements, rankings, badges',
    description: 'Rewards for completed jobs, savings streaks, accepted matches, and referrals.',
    actions: ['Claim badge', 'View ranking', 'Share achievement']
  },
  help: {
    name: 'Help Center',
    area: 'Support, FAQs, reports',
    description: 'Support flows for escrow disputes, wallet issues, verification, and account safety.',
    actions: ['Open report', 'Get escrow help', 'Contact support']
  },
  more: {
    name: 'More Tools',
    area: 'Invites, share app, settings extras',
    description: 'Referrals, share cards, profile exports, security shortcuts, and preferences.',
    actions: ['Invite friends', 'Share app', 'Export profile']
  }
};

export const TOOL_ALIASES = new Map([
  ['AI Search', 'ai-search'],
  ['Web Search', 'web-search'],
  ['Social Feed', 'social-feed'],
  ['Saved Items', 'saved-items'],
  ['Notifications', 'notifications'],
  ['Communities/Groups', 'communities'],
  ['Tasks/Missions', 'tasks'],
  ['Rewards/Points', 'rewards'],
  ['Help Center', 'help'],
  ['More Tools', 'more']
]);

export function normalizeToolId(value) {
  return TOOL_ALIASES.get(value) || String(value || 'ai-search').toLowerCase();
}

export async function getToolWorkspace({ toolId, userId, query = '' }) {
  const normalized = normalizeToolId(toolId);
  const config = TOOL_CONFIG[normalized] || TOOL_CONFIG['ai-search'];
  const user = userId ? db.prepare('SELECT * FROM users WHERE id = ?').get(userId) : null;

  return {
    id: normalized,
    ...config,
    status: 'active',
    query,
    items: buildItems(normalized, user, query),
    connections: buildConnections(normalized),
    updatedAt: new Date().toISOString()
  };
}

export function runToolAction({ toolId, action, userId, query = '' }) {
  const normalized = normalizeToolId(toolId);
  const config = TOOL_CONFIG[normalized] || TOOL_CONFIG['ai-search'];

  return {
    ok: true,
    toolId: normalized,
    toolName: config.name,
    action,
    userId,
    query,
    message: `${action} is active in ${config.name}.`,
    createdAt: new Date().toISOString()
  };
}

function buildItems(toolId, user, query) {
  const jobs = db.prepare("SELECT * FROM jobs WHERE status = 'open' ORDER BY created_at DESC LIMIT 10").all();
  const q = String(query || '').trim().toLowerCase();

  // If query is very short (like 'H'), maybe don't filter yet or use 'startsWith'
  const filteredJobs = q.length > 0 
    ? jobs.filter((job) => 
        `${job.title} ${job.description} ${job.city}`.toLowerCase().includes(q)
      )
    : jobs; // Default to showing all recent jobs if query is empty

  const itemBuilders = {
    'ai-search': () => {
      const results = filteredJobs.map((job) => 
        item('gig', job.title, `${job.city}`, `${Math.round(job.budget_kobo / 100)} NGN`)
      );

      // FALLBACK: If no jobs match, show helpful system items
      if (results.length === 0) {
        return [
          item('info', 'No matches found', `Try searching for "Plumber" or "Lagos"`, 'System'),
          item('identity', 'View your KiScore', 'Your trust score affects search ranking', 'Credit')
        ];
      }
      return results;
    },

    'web-search': () => [
      item('lead', 'Market contract leads', 'External opportunity board placeholder', 'Demo-safe'),
      item('lead', 'Apprenticeship listings', 'Training and entry roles', 'Ready'),
      item('lead', 'Local government skill grants', 'Public support programs', 'Research')
    ],
    'social-feed': () => [
      item('post', 'Lagos market cluster hiring', 'Employers are asking for verified workers this week.', '2h ago'),
      item('post', 'Solar technicians in Kano', 'Battery testing and inverter repair requests are rising.', 'Today'),
      item('post', 'Proof-of-work wins', 'Verified photos speed up escrow release.', 'Today')
    ],
    'saved-items': () => filteredJobs.slice(0, 4).map((job) => item('saved', job.title, job.city, 'Saved job')),
    notifications: () => [
      item('wallet', 'Wallet update', transactions[0] ? `Latest transaction ${transactions[0].status}` : 'No wallet transaction yet', 'Squad'),
      item('job', 'New AI match', filteredJobs[0]?.title || 'Open gigs available', 'Jobs'),
      item('proof', 'Proof-of-work reminder', 'Upload completion evidence after a job.', 'Verification')
    ],
    communities: () => [
      item('group', `${user?.city || 'Lagos'} worker squad`, 'Local trade and job discussions', 'Open'),
      item('group', 'Verified artisans circle', 'Trust-building and referrals', 'Open'),
      item('group', 'Youth skills cohort', 'Training, missions, and mentorship', 'Open')
    ],
    tasks: () => [
      item('task', 'Complete worker profile', user ? 'Profile created' : 'Start onboarding', user ? 'Done' : 'Open'),
      item('task', 'Simulate paid job', 'Boost wallet and Growth Vault demo', 'Ready'),
      item('task', 'Submit proof-of-work', 'Verify completion before escrow release', 'Ready')
    ],
    rewards: () => [
      item('badge', 'Trusted Worker badge', `${user?.trust_score || 42}% KiScore`, 'Active'),
      item('points', 'Savings streak', `${Math.round((user?.growth_vault_kobo || 0) / 100)} NGN saved`, 'Growth Vault'),
      item('rank', 'Local squad ranking', 'Top workers by verified jobs', 'Live')
    ],
    help: () => [
      item('support', 'Escrow dispute report', 'Create a support case for held funds.', 'Available'),
      item('support', 'Wallet transfer issue', 'Track payment, deposit, and webhook status.', 'Available'),
      item('faq', 'How SquadFlow uses Squad', 'Virtual accounts, checkout, webhooks, splits.', 'FAQ')
    ],
    more: () => [
      item('share', 'Invite friends', 'Referral-ready worker invitation.', 'Ready'),
      item('export', 'Share profile', 'Portable work identity summary.', 'Ready'),
      item('security', 'Security extras', 'Account, wallet, and report settings.', 'Ready')
    ]

  };

  return (itemBuilders[toolId] || itemBuilders['ai-search'])();
}

function buildConnections(toolId) {
  const map = {
    'ai-search': ['Chat', 'Support', 'Groups'],
    'web-search': ['Jobs', 'Saved Items', 'Alerts'],
    'social-feed': ['Home', 'Notifications', 'Communities'],
    'saved-items': ['Jobs', 'Web Search', 'Notifications'],
    notifications: ['Home', 'Chat', 'Wallet'],
    communities: ['Chat', 'Home', 'Tasks'],
    tasks: ['Home', 'Rewards', 'Wallet'],
    rewards: ['Wallet', 'Tasks', 'Profile'],
    help: ['Settings', 'Chat', 'Security'],
    more: ['Settings', 'Profile', 'Help']
  };
  return map[toolId] || map['ai-search'];
}

function item(type, title, detail, meta) {
  return { type, title, detail, meta };
}

/**
 * Simple keyword extractor to identify skills from voice transcripts.
 */
export function extractSkills(transcript) {
  if (!transcript) return [];
  
  // Basic trade keywords - you can expand this list
  const skillKeywords = [
    'plumber', 'plumbing', 
    'electrician', 'electrical', 
    'carpenter', 'woodwork', 
    'mason', 'bricklayer', 
    'welder', 'mechanic', 
    'driver', 'cleaner'
  ];

  const words = transcript.toLowerCase().split(/\s+/);
  
  // Return any keywords found in the transcript
  return skillKeywords.filter(skill => words.includes(skill));
}

