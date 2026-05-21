import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Bell,
  Bookmark,
  Bot,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronRight,
  Globe2,
  Gift,
  HandCoins,
  HelpCircle,
  Home,
  Landmark,
  MapPinned,
  Menu,
  MessageCircle,
  RefreshCw,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Umbrella,
  Users,
  WalletCards,
  Wrench,
  CreditCard,
  ArrowUpRight,
  Clock,
  Star,
  BarChart3,
  LayoutDashboard,
  Zap
} from 'lucide-react';
import {
  createDynamicVirtualAccountPool,
  createJob,
  createSavingsGroup,
  getAdminInsights,
  getDashboard,
  getDynamicVirtualAccountStatus,
  getEcosystemIntegrations,
  getHealth,
  getImpact,
  getJobs,
  getLgaHeatmap,
  getAriaStatus,
  getToolWorkspace,
  initiateDynamicVirtualAccount,
  mockPayment,
  reQueryTransfer,
  runToolAction,
  updateDynamicVirtualAccount,
  verifyBankDetails
} from './api.js';
import OnboardingForm from './components/OnboardingForm.jsx';
import WalletDashboard from './components/WalletDashboard.jsx';
import AIMatchFeed from './components/AIMatchFeed.jsx';
import ProofOfWorkPanel from './components/ProofOfWorkPanel.jsx';
import AdminInsights from './components/AdminInsights.jsx';
import ImpactDashboard from './pages/ImpactDashboard.jsx';
import getControlPanel from './pages/ControlPanel.jsx';
import VoiceAssistant from './components/VoiceAssistant';
import AdminPanel from './pages/AdminPanel.jsx';

<<<<<<< HEAD
=======
// Helper function (module-level is fine — no JSX, no return)
>>>>>>> 565d7f5200e05d1f1da83fdafd8c2f277b0e6198
function readSavedUserId() {
  try {
    return window.localStorage.getItem('aria_user_id');
  } catch {
    return null;
  }
}

<<<<<<< HEAD
export default function App() {
  if (window.location.pathname === '/admin') {
  return <AdminPanel />;
}
  /*
  if (window.location.pathname === '/impact') {
    return <ImpactDashboard />;
  }
  */
=======
// Main App component with routing
function AppContent() {
  // Route table — add new pages here without touching App()
  const PATH_ROUTES = {
    '/admin':         AdminPanel,
    '/impact':        ImpactDashboard,
    '/control-panel': ControlPanel,
  };
>>>>>>> 565d7f5200e05d1f1da83fdafd8c2f277b0e6198

  // Pathname-based routing — MUST be the very first thing inside the function body
  const RouteComponent = PATH_ROUTES[window.location.pathname];
  if (RouteComponent) return <RouteComponent />;

  const [userId, setUserId] = useState(readSavedUserId);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTool, setActiveTool] = useState('AI Search');
  const [backendOnline, setBackendOnline] = useState(false);
  const [ariaStatus, setAriaStatus] = useState(null);

  async function refresh(id = userId) {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      setDashboard(await getDashboard(id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    getHealth()
      .then(() => {
        if (!cancelled) setBackendOnline(true);
      })
      .catch(() => {
        if (!cancelled) setBackendOnline(false);
      });
    getAriaStatus()
      .then((status) => {
        if (!cancelled) setAriaStatus(status);
      })
      .catch(() => {
        if (!cancelled) setAriaStatus(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleOnboard(result) {
    try {
      window.localStorage.setItem('aria_user_id', result.user.id);
    } catch {
      // Some mobile browser modes disable storage; keep the session in memory.
    }
    setUserId(result.user.id);
    setDashboard({
      user: result.user,
      wallet: {
        balanceKobo: result.user.wallet_balance_kobo,
        growthVaultKobo: result.user.growth_vault_kobo,
        virtualAccount: result.virtualAccount
      },
      trustScore: result.user.trust_score,
      matches: []
    });
  }

  async function handleMockPayment() {
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      await mockPayment(userId, 50000);
      await refresh(userId);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (!userId) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#f7f4ec] via-[#f0ede3] to-[#e8e5db] px-4 py-5 text-ink">
        <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_480px] lg:items-start">
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-ink text-white shadow-2xl">
            <div className="relative min-h-[560px] p-6 sm:p-8">
              <div className="absolute inset-0 opacity-40">
                <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,#2fb083_0,transparent_30%),radial-gradient(circle_at_80%_0%,#f2b84b_0,transparent_25%),linear-gradient(135deg,#1a1a1a_0,#333_100%)]"></div>
              </div>
              <div className="relative z-[1] flex min-h-[500px] flex-col justify-between gap-8">
                <div>
                  <div className="mb-6 flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-amber to-palm text-white shadow-lg">
                      <Zap size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white/70">🏆 Squad Hackathon 3.0</p>
                      <h1 className="text-3xl font-black tracking-tight sm:text-4xl">POLYGON</h1>
                    </div>
                  </div>
                  <p className="max-w-2xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                    Local AI, Aria payments, verified identity, and proof-of-work for the informal economy.
                  </p>
                  <p className="mt-6 max-w-xl text-base leading-7 text-white/80">
                    A mobile-first operating system for workers: NIN/BVN checks, Aria virtual accounts, matching, payouts, savings, KiScore, and government-grade labour insights in one live flow.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <LaunchMetric icon={Bot} label="AI match loop" value="Local-first" />
                  <LaunchMetric icon={WalletCards} label="Aria rail" value="Wallet + escrow" />
                  <LaunchMetric icon={ShieldCheck} label="Identity" value="NIN/BVN + KiScore" />
                </div>
              </div>
            </div>
          </div>
          <div className="transform transition-all duration-300 hover:scale-[1.02]">
            <OnboardingForm onComplete={handleOnboard} />
          </div>
        </section>
      </main>
    );
  }

  const currentTab = MAIN_TABS.find((tab) => tab.id === activeTab) || MAIN_TABS[0];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f7f4ec] via-[#f0ede3] to-[#e8e5db] pb-24 text-ink">
      <header className="sticky top-0 z-10 border-b border-black/10 bg-white/80 backdrop-blur-xl px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <button
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-black/10 bg-white shadow-sm hover:shadow-md transition-all"
              onClick={() => setDrawerOpen(true)}
              title="Open tools menu"
            >
              <Menu size={19} />
            </button>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-clay">{currentTab.kicker}</p>
              <h1 className="truncate text-xl font-black tracking-tight">{currentTab.label}</h1>
            </div>
          </div>
          <button
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-black/10 bg-white shadow-sm hover:shadow-md transition-all disabled:opacity-50"
            onClick={() => refresh()}
            disabled={loading}
            title="Refresh dashboard"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
          </button>
        </div>
        <div className="mx-auto mt-3 flex max-w-6xl items-center justify-between gap-3 rounded-xl border border-black/10 bg-white/90 backdrop-blur-sm px-4 py-2 text-xs font-bold text-black/60">
          <span className="inline-flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${backendOnline ? 'bg-palm animate-pulse' : 'bg-clay'}`} />
            Backend {backendOnline ? 'active' : 'offline'}
          </span>
            <span className="truncate">AI matching | Aria wallet | KYC | Live insights</span>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pt-6">
        {error && (
          <div className="mb-4 rounded-xl border border-clay/20 bg-clay/10 px-4 py-3 text-sm text-clay backdrop-blur-sm">
            ⚠️ {error}
          </div>
        )}

        {dashboard && (
          <TabContent
            activeTab={activeTab}
            dashboard={dashboard}
            userId={userId}
            loading={loading}
            onMockPayment={handleMockPayment}
            onRefresh={refresh}
            activeTool={activeTool}
            ariaStatus={ariaStatus}
          />
        )}
      </section>

      <SlideMenu
        open={drawerOpen}
        activeTool={activeTool}
        onClose={() => setDrawerOpen(false)}
        onPick={(tool) => {
          setActiveTool(tool);
          setDrawerOpen(false);
        }}
      />

      <BottomTabs activeTab={activeTab} onChange={setActiveTab} />
      
      {userId && (
        <VoiceAssistant 
          userId={userId} 
          onJobAccepted={(job) => {
            refresh();
            setActiveTab('jobs');
          }}
        />
      )}
    </main>
  );
}

// Export wrapper component
export default function App() {
  return <AppContent />;
}

const MAIN_TABS = [
  { id: 'home', label: 'Home', kicker: 'Dashboard • Live', icon: Home },
  { id: 'chat', label: 'Chat', kicker: 'AI Assistant • 24/7', icon: MessageCircle },
  { id: 'jobs', label: 'Jobs', kicker: 'Opportunities • AI-matched', icon: BriefcaseBusiness },
  { id: 'wallet', label: 'Wallet', kicker: 'Aria • ₦ Balance', icon: WalletCards },
  { id: 'profile', label: 'Profile', kicker: 'KiScore • Identity', icon: Settings },
  { id: 'control', label: 'Control', kicker: "Gov't & Analytics", icon: LayoutDashboard },
  { id: 'impact', label: 'Impact', kicker: 'Community Impact', icon: BarChart3 }
];

const MENU_TOOLS = [
  { name: 'AI Search', icon: Search, detail: 'Search people, jobs, skills, payments, and reputation signals.', gradient: 'from-blue-500 to-cyan-500' },
  { name: 'Web Search', icon: Globe2, detail: 'Find external market opportunities and apprenticeship leads.', gradient: 'from-green-500 to-emerald-500' },
  { name: 'Social Feed', icon: Sparkles, detail: 'Worker posts, business updates, and informal-market news.', gradient: 'from-purple-500 to-pink-500' },
  { name: 'Saved Items', icon: Bookmark, detail: 'Saved jobs, posts, searches, and business profiles.', gradient: 'from-yellow-500 to-orange-500' },
  { name: 'Notifications', icon: Bell, detail: 'Messages, job alerts, escrow updates, and verification reminders.', gradient: 'from-red-500 to-rose-500' },
  { name: 'Communities/Groups', icon: Users, detail: 'Trade groups, local squads, training cohorts, and team spaces.', gradient: 'from-indigo-500 to-purple-500' },
  { name: 'Tasks/Missions', icon: CheckCircle2, detail: 'Profile boosts, verification tasks, and skill-building actions.', gradient: 'from-teal-500 to-green-500' },
  { name: 'Rewards/Points', icon: Gift, detail: 'Badges, rankings, completion streaks, and referral rewards.', gradient: 'from-amber-500 to-yellow-500' },
  { name: 'Help Center', icon: HelpCircle, detail: 'Support, FAQs, incident reports, and dispute help.', gradient: 'from-gray-500 to-slate-500' },
  { name: 'More Tools', icon: Wrench, detail: 'Invites, sharing, security shortcuts, and advanced settings.', gradient: 'from-stone-500 to-neutral-500' }
];

function TabContent({ activeTab, dashboard, userId, loading, onMockPayment, onRefresh, activeTool, ariaStatus }) {
  if (activeTab === 'chat') {
    return (
      <>
        <ToolActivationPanel activeTool={activeTool} currentArea="Chat" userId={userId} />
        <ChatView />
      </>
    );
  }

  if (activeTab === 'control') {
    return <ControlPanel />;
  }
  
  if (activeTab === 'impact') {
    return <ImpactDashboard />;
  }

  if (activeTab === 'jobs') {
    return (
      <>
        <ToolActivationPanel activeTool={activeTool} currentArea="Jobs" userId={userId} />
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <AIMatchFeed matches={dashboard.matches} userId={userId} onDeposit={() => onRefresh()} />
          <ApplicationsPanel userId={userId} onCreated={() => onRefresh()} />
        </div>
      </>
    );
  }

  if (activeTab === 'wallet') {
    return (
      <>
        <ToolActivationPanel activeTool={activeTool} currentArea="Wallet" userId={userId} />
        <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
          <WalletDashboard dashboard={dashboard} onMockPayment={onMockPayment} loading={loading} />
          <FinancialAccessPanel ariaStatus={ariaStatus} />
        </div>
      </>
    );
  }

  if (activeTab === 'profile') {
    return (
      <>
        <ToolActivationPanel activeTool={activeTool} currentArea="Settings" userId={userId} />
        <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
          <WalletDashboard dashboard={dashboard} onMockPayment={onMockPayment} loading={loading} />
          <ProfileSettingsPanel dashboard={dashboard} />
        </div>
      </>
    );
  }

  return (
    <>
      <DemoCommandCenter dashboard={dashboard} loading={loading} onMockPayment={onMockPayment} onRefresh={onRefresh} />
      <ToolActivationPanel activeTool={activeTool} currentArea="Home" userId={userId} />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Metric icon={CreditCard} label="Wallet rail" value="Aria" trend="Active" />
        <Metric icon={BarChart3} label="AI scoring" value="KiScore" trend="Real-time" />
        <Metric icon={Zap} label="Access modes" value="SMS/USSD" trend="Offline-first" />
        <Metric icon={ShieldCheck} label="Identity" value="NIN/BVN" trend="NDPR-ready" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <WalletDashboard dashboard={dashboard} onMockPayment={onMockPayment} loading={loading} />
        <HomeFeed dashboard={dashboard} userId={userId} onRefresh={onRefresh} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ProofOfWorkPanel userId={userId} matches={dashboard.matches} />
        <AdminInsights />
      </div>
      <div className="mt-6">
        <EcosystemIntegrationPanel />
      </div>
      <div className="mt-6">
        <BackendApiCoveragePanel />
      </div>
    </>
  );
}

function HomeFeed({ dashboard, userId, onRefresh }) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-black/10 bg-white shadow-sm p-5">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-clay">AI Economic Identity</p>
            <h2 className="text-2xl font-black tracking-tight">Portable work profile</h2>
          </div>
          <span className="rounded-lg bg-gradient-to-r from-mint to-palm/20 px-3 py-1.5 text-sm font-black text-palm">🟢 Live</span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Signal label="Wallet" value="Aria collections" icon={WalletCards} />
          <Signal label="Skill graph" value={dashboard.economicIdentity?.skillGraph?.slice(0, 2).join(', ') || 'Learning'} icon={TrendingUp} />
          <Signal label="KYC baseline" value={dashboard.user.identity_status || 'unverified'} icon={ShieldCheck} />
        </div>
      </section>

      <AIMatchFeed matches={dashboard.matches} userId={userId} onDeposit={() => onRefresh()} />
    </div>
  );
}

function DemoCommandCenter({ dashboard, loading, onMockPayment, onRefresh }) {
  const balance = dashboard.wallet?.balanceKobo || 0;
  const vault = dashboard.wallet?.growthVaultKobo || 0;
  const completed = dashboard.economicIdentity?.workHistory?.completedJobs || dashboard.user.completed_jobs || 0;
  const bestMatch = dashboard.matches?.[0];

  return (
    <section className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-ink via-ink to-gray-900 text-white shadow-xl">
      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black">
              <Activity size={14} /> Live demo command center
            </span>
            <span className="rounded-full bg-gradient-to-r from-amber to-orange px-3 py-1.5 text-xs font-black text-ink">🏆 Competition mode</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight">From worker onboarding to trusted earning in one flow.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
            Show the judges a complete loop: worker profile, AI-ranked gigs, Aria escrow, proof-of-work verification, 5% Growth Vault, and credit identity signals.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <LiveSignal icon={WalletCards} label="Wallet volume" value={formatCompactNaira(balance)} />
            <LiveSignal icon={Target} label="Top match" value={bestMatch ? `${bestMatch.match_percent}%` : 'Ready'} />
            <LiveSignal icon={TrendingUp} label="Jobs completed" value={completed} />
          </div>
        </div>

        <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-5">
          <p className="text-sm font-bold text-white/70">⚡ Quick actions</p>
          <div className="mt-4 space-y-3">
            <button
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-palm to-mint px-4 font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-60"
              onClick={onMockPayment}
              disabled={loading}
            >
              <Sparkles size={18} />
              Simulate paid job
            </button>
            <button
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 font-bold text-white transition-all hover:bg-white/10"
              onClick={() => onRefresh()}
            >
              <RefreshCw size={18} />
              Refresh live data
            </button>
          </div>
          <div className="mt-5 rounded-xl bg-white/5 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">🏦 Growth Vault</span>
              <strong className="text-lg font-black">{formatCompactNaira(vault)}</strong>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-amber to-orange"></div>
            </div>
            <p className="mt-2 text-xs text-white/50">5% auto-save toward tools & insurance</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function LaunchMetric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm p-4 transition-all hover:bg-white/15">
      <Icon size={22} className="mb-2 text-amber" />
      <p className="text-xs font-bold text-white/60 uppercase tracking-wide">{label}</p>
      <p className="text-lg font-black">{value}</p>
    </div>
  );
}

function LiveSignal({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/5 p-4">
      <div className="mb-2 flex items-center gap-2 text-white/60">
        <Icon size={16} />
        <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}

const TOOL_WORKSPACES = {
  'AI Search': {
    status: 'Active',
    title: 'Smart search across app content',
    description: 'Searches workers, gigs, wallet events, match reasons, groups, and support topics inside Aria.',
    actions: ['Find best gigs', 'Search wallet history', 'Explain trust score'],
    connected: ['Chat', 'Support', 'Groups']
  },
  'Web Search': {
    status: 'Demo-ready',
    title: 'External opportunity search',
    description: 'Surfaces external leads when a worker needs jobs beyond the local database. Kept as a controlled demo surface for hackathon safety.',
    actions: ['Market leads', 'Apprenticeships', 'Local contracts'],
    connected: ['Jobs', 'Saved Items', 'Alerts']
  },
  'Social Feed': {
    status: 'Active',
    title: 'Posts, updates, and job-related content',
    description: 'Shows marketplace updates, worker posts, employer notices, and community demand signals.',
    actions: ['Market update', 'Worker story', 'Employer request'],
    connected: ['Home', 'Notifications', 'Communities']
  },
  'Saved Items': {
    status: 'Active',
    title: 'Saved jobs, posts, and searches',
    description: 'Keeps important gigs, posts, search filters, and business profiles ready for follow-up.',
    actions: ['Saved gigs', 'Saved searches', 'Saved employers'],
    connected: ['Jobs', 'Web Search', 'Notifications']
  },
  Notifications: {
    status: 'Active',
    title: 'Alerts for messages, jobs, and wallet updates',
    description: 'Collects escrow updates, new matches, proof-of-work reminders, wallet events, and support responses.',
    actions: ['Job alert', 'Wallet update', 'Verification reminder'],
    connected: ['Home', 'Chat', 'Wallet']
  },
  'Communities/Groups': {
    status: 'Active',
    title: 'Team spaces and discussions',
    description: 'Connects workers into trade groups, local squads, employer channels, and training cohorts.',
    actions: ['Trade group', 'Local squad', 'Training cohort'],
    connected: ['Chat', 'Home', 'Tasks']
  },
  'Tasks/Missions': {
    status: 'Active',
    title: 'Small actions and activities',
    description: 'Turns onboarding, verification, savings, and skill-building into progress tasks.',
    actions: ['Verify profile', 'Complete proof-of-work', 'Save 5%'],
    connected: ['Home', 'Rewards', 'Wallet']
  },
  'Rewards/Points': {
    status: 'Active',
    title: 'Achievements, rankings, and badges',
    description: 'Rewards completed jobs, accepted matches, savings consistency, referrals, and verified work.',
    actions: ['Trust badge', 'Savings streak', 'Referral points'],
    connected: ['Wallet', 'Tasks', 'Profile']
  },
  'Help Center': {
    status: 'Active',
    title: 'Support, FAQs, and reports',
    description: 'Handles wallet problems, escrow disputes, failed verification, account safety, and report flows.',
    actions: ['Open report', 'Escrow help', 'Account safety'],
    connected: ['Settings', 'Chat', 'Security']
  },
  'More Tools': {
    status: 'Active',
    title: 'Invites, sharing, and settings extras',
    description: 'Adds referrals, share cards, exportable worker profiles, security shortcuts, and advanced preferences.',
    actions: ['Invite friends', 'Share profile', 'Security extras'],
    connected: ['Settings', 'Profile', 'Help']
  }
};

function ToolActivationPanel({ activeTool, currentArea, userId }) {
  const fallback = TOOL_WORKSPACES[activeTool] || TOOL_WORKSPACES['AI Search'];
  const [workspace, setWorkspace] = useState(null);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const toolId = useMemo(() => toolNameToId(activeTool), [activeTool]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMessage('');
    getToolWorkspace(toolId, { userId, query })
      .then((data) => {
        if (!cancelled) setWorkspace(data);
      })
      .catch((err) => {
        if (!cancelled) setMessage(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [toolId, userId, query]);

  async function handleAction(action) {
    setMessage('');
    try {
      const result = await runToolAction(toolId, { action, userId, query });
      setMessage(result.message);
    } catch (err) {
      setMessage(err.message);
    }
  }

  const tool = workspace || {
    ...fallback,
    name: activeTool,
    items: [],
    connections: fallback.connected
  };
  const actions = tool.actions || fallback.actions;
  const connections = tool.connections || fallback.connected;

  return (
    <section className="mb-6 rounded-2xl border border-black/10 bg-white shadow-sm p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-clay">{currentArea} connected tool</p>
          <h2 className="text-xl font-black tracking-tight">{activeTool}</h2>
        </div>
        <span className="rounded-full bg-gradient-to-r from-mint to-palm/20 px-3 py-1.5 text-sm font-black text-palm">
          {loading ? 'Loading...' : tool.status}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-black/65">{tool.description}</p>

      <div className="mt-4 grid grid-cols-[1fr_48px] gap-2">
        <input
          className="h-12 rounded-xl border border-black/15 px-4 outline-none focus:border-palm focus:ring-1 focus:ring-palm transition-all"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${activeTool}...`}
        />
        <button className="grid h-12 place-items-center rounded-xl bg-gradient-to-r from-palm to-mint text-white shadow-md hover:shadow-lg transition-all" onClick={() => setQuery(query.trim())} title="Search">
          <Search size={18} />
        </button>
      </div>

      {message && (
        <div className="mt-4 rounded-xl bg-gradient-to-r from-mint/20 to-palm/10 px-4 py-3 text-sm text-black/70 border border-palm/20">
          💬 {message}
        </div>
      )}

      <div className="mt-4 grid gap-2 md:grid-cols-3">
        {actions.map((action) => (
          <button key={action} className="rounded-xl border border-black/10 bg-gray-50 px-4 py-2.5 text-left text-sm font-bold hover:border-palm hover:bg-mint/20 transition-all" onClick={() => handleAction(action)}>
            {action}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {(tool.items || []).map((item) => (
          <div key={`${item.type}-${item.title}`} className="rounded-xl border border-black/10 px-4 py-3 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black">{item.title}</p>
              <span className="rounded-full bg-gradient-to-r from-mint to-palm/20 px-2 py-1 text-[11px] font-black text-palm">{item.type}</span>
            </div>
            <p className="mt-1 text-sm text-black/60">{item.detail}</p>
            <p className="mt-1 text-xs font-bold text-clay">{item.meta}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {connections.map((item) => (
          <span key={item} className="rounded-full border border-black/15 px-3 py-1.5 text-xs font-bold text-black/60 bg-gray-50">
            🔗 {item}
          </span>
        ))}
      </div>
    </section>
  );
}

function toolNameToId(name) {
  return {
    'AI Search': 'ai-search',
    'Web Search': 'web-search',
    'Social Feed': 'social-feed',
    'Saved Items': 'saved-items',
    Notifications: 'notifications',
    'Communities/Groups': 'communities',
    'Tasks/Missions': 'tasks',
    'Rewards/Points': 'rewards',
    'Help Center': 'help',
    'More Tools': 'more'
  }[name] || 'ai-search';
}

function Metric({ icon: Icon, label, value, trend }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white shadow-sm p-4 transition-all hover:shadow-md">
      <Icon size={20} className="mb-3 text-palm" />
      <p className="text-xs text-black/55 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-black tracking-tight">{value}</p>
      <p className="mt-1 text-xs font-semibold text-green-600">{trend}</p>
    </div>
  );
}

function Signal({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl bg-gradient-to-r from-gray-50 to-white p-4 border border-black/5">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon size={14} className="text-palm" />}
        <p className="text-xs font-semibold text-black/50 uppercase tracking-wide">{label}</p>
      </div>
      <p className="font-black text-lg">{value}</p>
    </div>
  );
}

function BottomTabs({ activeTab, onChange }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-black/10 bg-white/95 backdrop-blur-xl px-3 py-2 shadow-lg">
      <div className="mx-auto flex max-w-6xl justify-around gap-1">
        {MAIN_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`flex flex-1 h-14 flex-col items-center justify-center gap-1 rounded-xl text-xs font-bold transition-all ${
                active 
                  ? 'bg-gradient-to-r from-mint to-palm/20 text-palm shadow-inner' 
                  : 'text-black/55 hover:bg-gray-100'
              }`}
              onClick={() => onChange(tab.id)}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function SlideMenu({ open, activeTool, onClose, onPick }) {
  const selected = useMemo(() => MENU_TOOLS.find((tool) => tool.name === activeTool) || MENU_TOOLS[0], [activeTool]);

  return (
    <>
      <button
        className={`fixed inset-0 z-30 bg-black/40 transition-all duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
        aria-label="Close tools menu"
      />
      <aside className={`fixed bottom-0 left-0 top-0 z-40 w-[86vw] max-w-sm border-r border-black/10 bg-white shadow-2xl transition-transform duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="border-b border-black/10 bg-gradient-to-r from-palm/5 to-transparent p-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-clay">Power tools</p>
              <h2 className="text-2xl font-black tracking-tight">Slide menu</h2>
            </div>
            <button className="grid h-10 w-10 place-items-center rounded-xl border border-black/10 hover:bg-gray-50 transition-all" onClick={onClose}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className={`m-4 rounded-xl bg-gradient-to-r ${selected.gradient} p-4 text-white shadow-lg`}>
          <div className="mb-2 flex items-center gap-2">
            <selected.icon size={18} />
            <p className="font-black">{selected.name}</p>
          </div>
          <p className="text-sm leading-relaxed text-white/90">{selected.detail}</p>
        </div>

        <div className="space-y-1 px-2 pb-20">
          {MENU_TOOLS.map((tool) => {
            const Icon = tool.icon;
            const active = tool.name === activeTool;
            return (
              <button
                key={tool.name}
                className={`flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-bold transition-all ${
                  active 
                    ? 'bg-gradient-to-r from-mint to-palm/20 text-palm shadow-sm' 
                    : 'text-black/70 hover:bg-gray-50'
                }`}
                onClick={() => onPick(tool.name)}
              >
                <Icon size={18} />
                <span className="flex-1">{tool.name}</span>
                <ChevronRight size={15} className="text-black/40" />
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
}

function ChatView() {
  const quickPrompts = ['Find gigs near me', 'Explain my KiScore', 'Report escrow issue'];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="rounded-2xl border border-black/10 bg-white shadow-sm p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-r from-mint to-palm/30 text-palm">
            <Bot size={22} />
          </div>
          <div>
            <p className="text-sm font-semibold text-clay">AI assistant</p>
            <h2 className="text-xl font-black tracking-tight">Support and opportunity chat</h2>
          </div>
        </div>
        <div className="space-y-4">
          <ChatBubble name="Aria AI" text="I can search jobs, explain wallet activity, translate onboarding, or connect you to support." isBot />
          <ChatBubble name="Tailors Group" text="New uniforms contract near Yaba. Verified workers with 80+ trust score get priority." />
          <ChatBubble name="Support" text="Escrow disputes, failed withdrawals, and verification issues can be reported here." />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button key={prompt} className="rounded-full border border-black/15 bg-gray-50 px-4 py-2 text-sm font-bold hover:border-palm hover:bg-mint/20 transition-all">
              {prompt}
            </button>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-[1fr_48px] gap-2">
          <input className="h-12 rounded-xl border border-black/15 px-4 outline-none focus:border-palm focus:ring-1 focus:ring-palm transition-all" placeholder="Ask Aria AI..." />
          <button className="grid h-12 place-items-center rounded-xl bg-gradient-to-r from-palm to-mint text-white shadow-md hover:shadow-lg transition-all" title="Send message">
            <Rocket size={18} />
          </button>
        </div>
      </section>
      <QuickLinks title="Chat connects to" items={['AI Search', 'Support', 'Groups', 'Notifications']} />
    </div>
  );
}

function ChatBubble({ name, text, isBot }) {
  return (
    <div className={`rounded-xl p-4 ${isBot ? 'bg-gradient-to-r from-palm/5 to-mint/10 border border-palm/20' : 'bg-gray-50 border border-black/5'}`}>
      <p className="mb-1.5 text-sm font-black flex items-center gap-2">
        {isBot && <Bot size={14} className="text-palm" />}
        {name}
      </p>
      <p className="text-sm leading-relaxed text-black/65">{text}</p>
    </div>
  );
}

function ApplicationsPanel({ userId, onCreated }) {
  return (
    <aside className="space-y-6">
      <GigPostPanel userId={userId} onCreated={onCreated} />
      <QuickLinks title="Jobs connects to" items={['Web Search', 'Saved Jobs', 'Alerts', 'Applications']} />
      <section className="rounded-2xl border border-black/10 bg-white shadow-sm p-5">
        <p className="text-sm font-semibold text-clay">Application tracking</p>
        <h2 className="mb-4 text-xl font-black tracking-tight">Pipeline</h2>
        <div className="space-y-3">
          <Signal label="Applied" value="3 open" />
          <Signal label="Interview" value="1 scheduled" />
          <Signal label="Escrow ready" value="2 offers" />
        </div>
      </section>
    </aside>
  );
}

function GigPostPanel({ userId, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    payment: '',
    city: '',
    requiredSkill: ''
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const created = await createJob({
        employerId: userId,
        title: form.title.trim(),
        description: form.description.trim(),
        payment: Number(form.payment || 0),
        city: form.city.trim() || 'Lagos',
        requiredSkill: form.requiredSkill.trim()
      });
      setForm({ title: '', description: '', payment: '', city: '', requiredSkill: '' });
      setMessage(`Gig posted: ${created.title}`);
      onCreated?.();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-black/10 bg-white shadow-sm p-5">
      <p className="text-sm font-semibold text-clay">Post a gig</p>
      <h2 className="mb-4 text-xl font-black tracking-tight">Create local work</h2>
      <form className="space-y-3" onSubmit={submit}>
        <input
          className="h-11 w-full rounded-xl border border-black/15 px-3 text-sm outline-none transition focus:border-palm focus:ring-1 focus:ring-palm"
          value={form.title}
          onChange={(event) => update('title', event.target.value)}
          placeholder="Gig title"
          required
        />
        <textarea
          className="min-h-20 w-full resize-none rounded-xl border border-black/15 px-3 py-2 text-sm outline-none transition focus:border-palm focus:ring-1 focus:ring-palm"
          value={form.description}
          onChange={(event) => update('description', event.target.value)}
          placeholder="What needs to be done?"
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            className="h-11 rounded-xl border border-black/15 px-3 text-sm outline-none transition focus:border-palm focus:ring-1 focus:ring-palm"
            value={form.payment}
            onChange={(event) => update('payment', event.target.value)}
            placeholder="Pay in naira"
            inputMode="numeric"
            required
          />
          <input
            className="h-11 rounded-xl border border-black/15 px-3 text-sm outline-none transition focus:border-palm focus:ring-1 focus:ring-palm"
            value={form.city}
            onChange={(event) => update('city', event.target.value)}
            placeholder="City"
          />
        </div>
        <input
          className="h-11 w-full rounded-xl border border-black/15 px-3 text-sm outline-none transition focus:border-palm focus:ring-1 focus:ring-palm"
          value={form.requiredSkill}
          onChange={(event) => update('requiredSkill', event.target.value)}
          placeholder="Required skill"
        />
        <button
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-palm to-mint px-4 text-sm font-black text-white shadow-md transition hover:shadow-lg disabled:opacity-60"
          disabled={busy}
        >
          <BriefcaseBusiness size={16} />
          {busy ? 'Posting...' : 'Post gig'}
        </button>
      </form>
      {message && (
        <div className="mt-3 rounded-xl border border-palm/20 bg-mint/20 px-3 py-2 text-sm font-semibold text-black/70">
          {message}
        </div>
      )}
    </section>
  );
}

function FinancialAccessPanel({ ariaStatus }) {
  return (
    <div className="grid gap-6">
      <AriaApiStatusPanel ariaStatus={ariaStatus} />
      <AriaOperationsPanel />
      <section className="rounded-2xl border border-black/10 bg-white shadow-sm p-5">
        <p className="text-sm font-semibold text-clay">Financial inclusion</p>
        <h2 className="mb-4 text-xl font-black tracking-tight">Alternative credit signals</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Signal label="Microloan readiness" value="Eligible soon" />
          <Signal label="Insurance fit" value="Device and health" />
          <Signal label="Savings behavior" value="Auto-save active" />
          <Signal label="Payment consistency" value="Aria webhooks" />
          <Signal label="Identity baseline" value="NIN/BVN weighted" />
          <Signal label="Payout reach" value="Banks and wallets" />
        </div>
      </section>
      <section className="rounded-2xl border border-black/10 bg-white shadow-sm p-5">
        <p className="text-sm font-semibold text-clay">Expansion map</p>
        <h2 className="mb-4 text-xl font-black tracking-tight">Pilot rollout</h2>
        <div className="grid gap-3">
          {['Lagos market clusters', 'Kano solar technicians', 'Abuja emergency repairs'].map((place) => (
            <div key={place} className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-sm font-bold border border-black/5">
              <MapPinned size={16} className="text-palm" />
              <span>{place}</span>
            </div>
          ))}
        </div>
      </section>
      <QuickLinks title="Wallet connects to" items={['Rewards', 'Withdrawals', 'Transaction details', 'Loan offers']} />
    </div>
  );
}

function AriaApiStatusPanel({ ariaStatus }) {
  const mode = ariaStatus?.mode || 'checking';
  const live = mode === 'sandbox-live';

  return (
    <section className="rounded-2xl border border-black/10 bg-white shadow-sm p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-clay">Mandatory ARIA API</p>
          <h2 className="text-xl font-black tracking-tight">Integration status</h2>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-sm font-black ${live ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-700' : 'bg-amber/25 text-clay'}`}>
          {live ? '✅ Keys loaded' : '⚠️ Demo fallback'}
        </span>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <StatusRow label="Virtual accounts" active={ariaStatus?.virtualAccounts?.configured} detail="/virtual-account" />
        <StatusRow label="Dynamic VAs" active={ariaStatus?.virtualAccounts?.configured} detail="/virtual-account/initiate-dynamic-virtual-account" />
        <StatusRow label="Payment links" active={ariaStatus?.payments?.configured} detail="/transaction/initiate" />
        <StatusRow label="Webhook tracking" active={ariaStatus?.webhooks?.configured} detail="/api/aria/webhook" />
        <StatusRow label="Growth Vault split" active={ariaStatus?.growthVaultSplit?.configured} detail={`${ariaStatus?.growthVaultSplit?.percent || 5}% ledger`} />
        <StatusRow label="Transfers" active={ariaStatus?.transfers?.configured} detail={ariaStatus?.transfers?.fallback || 'transfer path'} />
        <StatusRow label="Transaction tracking" active detail="SQLite + webhooks" />
      </div>

      <p className="mt-4 text-sm leading-relaxed text-black/60 bg-gray-50 rounded-xl p-3">
        💡 Real ARIA calls activate when `backend/.env` contains valid sandbox keys. Without that file, the project still demos locally with virtual-account fallback, demo checkout URLs, and escrow splits.
      </p>
    </section>
  );
}

function AriaOperationsPanel() {
  const [bankForm, setBankForm] = useState({ accountNumber: '', bankCode: '' });
  const [dynamicRef, setDynamicRef] = useState('');
  const [transferRef, setTransferRef] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState('');

  async function run(label, action) {
    setBusy(label);
    setMessage('');
    try {
      const result = await action();
      setMessage(`${label}: ${summarizeResult(result)}`);
    } catch (err) {
      setMessage(`${label}: ${err.message}`);
    } finally {
      setBusy('');
    }
  }

  return (
    <section className="rounded-2xl border border-black/10 bg-white shadow-sm p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-clay">Frontend to backend links</p>
          <h2 className="text-xl font-black tracking-tight">ARIA operations console</h2>
        </div>
        <span className="rounded-full bg-gradient-to-r from-mint to-palm/20 px-3 py-1.5 text-xs font-black text-palm">API wired</span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-black/10 bg-gray-50 p-3">
          <p className="mb-2 text-sm font-black">Account lookup</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              className="h-10 rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-palm"
              value={bankForm.accountNumber}
              onChange={(event) => setBankForm((current) => ({ ...current, accountNumber: event.target.value }))}
              placeholder="Account number"
              inputMode="numeric"
            />
            <input
              className="h-10 rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-palm"
              value={bankForm.bankCode}
              onChange={(event) => setBankForm((current) => ({ ...current, bankCode: event.target.value }))}
              placeholder="Bank code"
              inputMode="numeric"
            />
          </div>
          <button
            className="mt-2 h-10 w-full rounded-lg bg-ink text-sm font-black text-white disabled:opacity-60"
            disabled={busy === 'Account lookup'}
            onClick={() => run('Account lookup', () => verifyBankDetails(bankForm))}
          >
            Verify account
          </button>
        </div>

        <div className="rounded-xl border border-black/10 bg-gray-50 p-3">
          <p className="mb-2 text-sm font-black">Dynamic virtual account</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              className="h-10 rounded-lg bg-palm text-sm font-black text-white disabled:opacity-60"
              disabled={busy === 'Dynamic VA pool'}
              onClick={() => run('Dynamic VA pool', () => createDynamicVirtualAccountPool({ quantity: 1, currency: 'NGN' }))}
            >
              Create pool
            </button>
            <button
              className="h-10 rounded-lg bg-palm text-sm font-black text-white disabled:opacity-60"
              disabled={busy === 'Dynamic VA initiate'}
              onClick={() => {
                const transactionRef = `sf_dva_${Date.now()}`;
                setDynamicRef(transactionRef);
                return run('Dynamic VA initiate', () => initiateDynamicVirtualAccount({
                  amountKobo: 100000,
                  transactionRef,
                  email: 'customer@aria_ai.demo',
                  customerName: 'ARIA Demo Customer',
                  expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
                  metadata: { source: 'frontend_console' }
                }));
              }}
            >
              Initiate ₦1,000
            </button>
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              className="h-10 rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-palm"
              value={dynamicRef}
              onChange={(event) => setDynamicRef(event.target.value)}
              placeholder="Dynamic transaction ref"
            />
            <button
              className="h-10 rounded-lg border border-black/15 px-3 text-sm font-black disabled:opacity-60"
              disabled={!dynamicRef || busy === 'Dynamic VA status'}
              onClick={() => run('Dynamic VA status', () => getDynamicVirtualAccountStatus(dynamicRef))}
            >
              Status
            </button>
          </div>
          <button
            className="mt-2 h-10 w-full rounded-lg border border-black/15 text-sm font-black disabled:opacity-60"
            disabled={!dynamicRef || busy === 'Dynamic VA update'}
            onClick={() => run('Dynamic VA update', () => updateDynamicVirtualAccount({
              transactionRef: dynamicRef,
              amountKobo: 150000,
              expiresAt: new Date(Date.now() + 45 * 60 * 1000).toISOString()
            }))}
          >
            Update to ₦1,500
          </button>
        </div>

        <div className="rounded-xl border border-black/10 bg-gray-50 p-3">
          <p className="mb-2 text-sm font-black">Transfer requery</p>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              className="h-10 rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-palm"
              value={transferRef}
              onChange={(event) => setTransferRef(event.target.value)}
              placeholder="Transfer reference"
            />
            <button
              className="h-10 rounded-lg bg-ink px-3 text-sm font-black text-white disabled:opacity-60"
              disabled={!transferRef || busy === 'Transfer requery'}
              onClick={() => run('Transfer requery', () => reQueryTransfer(transferRef))}
            >
              Requery
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-black/10 bg-gray-50 p-3">
          <p className="mb-2 text-sm font-black">Savings group</p>
          <button
            className="h-10 w-full rounded-lg bg-ink text-sm font-black text-white disabled:opacity-60"
            disabled={busy === 'Savings group'}
            onClick={() => run('Savings group', () => createSavingsGroup({
              name: `Demo VSLA ${new Date().toLocaleTimeString()}`,
              members: [{ name: 'Demo Worker', phone: '08000000000', weeklyAmount: 1000 }],
              duration_weeks: 12,
              payout_type: 'ROTATIONAL'
            }))}
          >
            Create demo group
          </button>
        </div>
      </div>

      {message && (
        <div className="mt-4 rounded-xl border border-palm/20 bg-mint/20 px-4 py-3 text-sm font-semibold text-black/70">
          {message}
        </div>
      )}
    </section>
  );
}

function summarizeResult(result) {
  if (!result) return 'No response';
  if (result.message) return result.message;
  if (result.dynamicVirtualAccount?.accountNumber) return `${result.dynamicVirtualAccount.accountNumber} (${result.dynamicVirtualAccount.bankName})`;
  if (result.accountName) return result.accountName;
  if (result.groupId) return `Created ${result.groupId}`;
  if (result.configured === false) return 'Demo fallback response received';
  return 'Connected';
}

function StatusRow({ label, active, detail }) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-2.5 border border-black/5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold">{label}</span>
        <span className={`h-2 w-2 rounded-full ${active ? 'bg-palm animate-pulse' : 'bg-clay'}`} />
      </div>
      <p className="mt-1 text-xs text-black/55 font-mono">{detail}</p>
    </div>
  );
}

function EcosystemIntegrationPanel() {
  const [ecosystem, setEcosystem] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getEcosystemIntegrations()
      .then((data) => {
        if (!cancelled) setEcosystem(data);
      })
      .catch(() => {
        if (!cancelled) setEcosystem({ sectors: ECOSYSTEM_FALLBACK });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sectors = ecosystem?.sectors || ECOSYSTEM_FALLBACK;

  return (
    <section className="rounded-2xl border border-black/10 bg-white shadow-sm p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-clay">Ecosystem integration</p>
          <h2 className="text-xl font-black tracking-tight">Partner rails connected to ARIA AI</h2>
        </div>
        <span className="rounded-full bg-gradient-to-r from-mint to-palm/20 px-3 py-1.5 text-sm font-black text-palm">🔗 API linked</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {sectors.map((sector) => {
          const Icon = ECOSYSTEM_ICONS[sector.sector] || Building2;
          return (
            <article key={sector.sector} className="rounded-xl border border-black/10 bg-gray-50 p-4 transition-all hover:shadow-md">
              <div className="mb-3 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white shadow-sm text-palm">
                  <Icon size={20} />
                </div>
                <h3 className="font-black text-lg">{sector.sector}</h3>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {sector.integrations.map((item) => (
                  <span key={item} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-black/70 shadow-sm">
                    {item}
                  </span>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-black/60">
                Enabled by <span className="font-semibold text-palm">{sector.enabledBy.slice(0, 3).join(', ')}</span>.
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function BackendApiCoveragePanel() {
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const items = [
      ['Health', getHealth],
      ['Jobs', getJobs],
      ['Admin insights', getAdminInsights],
      ['Impact stats', getImpact],
      ['LGA heatmap', () => getLgaHeatmap('otuoke')],
      ['Ecosystem', getEcosystemIntegrations],
      ['Aria status', getAriaStatus]
    ];

    Promise.all(items.map(async ([name, fn]) => {
      try {
        const data = await fn();
        return { name, ok: true, detail: summarizeApiCheck(data) };
      } catch (error) {
        return { name, ok: false, detail: error.message };
      }
    })).then((results) => {
      if (!cancelled) {
        setChecks(results);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="rounded-2xl border border-black/10 bg-white shadow-sm p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-clay">Live API coverage</p>
          <h2 className="text-xl font-black tracking-tight">Frontend screens connected to backend</h2>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-black text-black/60">
          {loading ? 'Checking...' : `${checks.filter((item) => item.ok).length}/${checks.length} online`}
        </span>
      </div>
      <div className="grid gap-2 md:grid-cols-4">
        {checks.map((item) => (
          <div key={item.name} className="rounded-xl border border-black/10 bg-gray-50 px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black">{item.name}</p>
              <span className={`h-2 w-2 rounded-full ${item.ok ? 'bg-palm' : 'bg-clay'}`} />
            </div>
            <p className="mt-1 truncate text-xs text-black/55">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function summarizeApiCheck(data) {
  if (data?.ok) return 'healthy';
  if (Array.isArray(data?.jobs)) return `${data.jobs.length} jobs`;
  if (Array.isArray(data?.sectors)) return `${data.sectors.length} sectors`;
  if (data?.mode) return data.mode;
  if (data?.totalWorkers !== undefined) return `${data.totalWorkers} workers`;
  if (data?.generatedAt) return 'live report';
  if (data?.skillHubs) return `${data.skillHubs.length} skill hubs`;
  if (data?.lga || data?.lgaName) return 'heatmap loaded';
  return 'connected';
}

const ECOSYSTEM_FALLBACK = [
  {
    sector: 'Banks',
    integrations: ['Behavioral lending', 'SME financing', 'Digital savings'],
    enabledBy: ['KiScore', 'Growth Vault', 'Aria virtual accounts']
  },
  {
    sector: 'Government',
    integrations: ['Youth employment programs', 'Economic intelligence dashboards', 'Policy planning'],
    enabledBy: ['LGA heatmaps', 'skill-gap analytics', 'verified jobs']
  },
  {
    sector: 'Telecoms',
    integrations: ['USSD onboarding', 'Mobile money', 'SIM-based verification'],
    enabledBy: ['USSD route', 'phone-first profile', 'mobile wallet rails']
  },
  {
    sector: 'Insurance',
    integrations: ['Microinsurance', 'Health and business protection', 'Embedded risk coverage'],
    enabledBy: ['proof-of-work', 'escrow splits', 'policy ledger']
  }
];

const ECOSYSTEM_ICONS = {
  Banks: Landmark,
  'Identity Providers': ShieldCheck,
  Government: Building2,
  Telecoms: MessageCircle,
  Insurance: Umbrella
};

function ProfileSettingsPanel({ dashboard }) {
  const identity = dashboard.economicIdentity;

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-black/10 bg-white shadow-sm p-5">
        <p className="text-sm font-semibold text-clay">Account security</p>
        <h2 className="mb-4 text-xl font-black tracking-tight">Verification and preferences</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Signal label="Identity" value={dashboard.user.identity_status === 'verified' ? 'NIN/BVN verified' : 'Pending verification'} />
          <Signal label="Provider" value={dashboard.user.identity_provider || 'Demo identity rail'} />
          <Signal label="Access mode" value={identity?.aiTrustProfile?.accessMode || 'Mobile app'} />
          <Signal label="Language" value={dashboard.user.language || 'English'} />
          <Signal label="Portable profile" value="Shareable with lenders" />
        </div>
      </section>
      <QuickLinks title="Settings connects to" items={['Help Center', 'Security', 'More Tools', 'Preferences']} />
    </div>
  );
}

function QuickLinks({ title, items }) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white shadow-sm p-5">
      <h2 className="mb-4 text-xl font-black tracking-tight">{title}</h2>
      <div className="grid gap-2">
        {items.map((item) => (
          <div key={item} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm font-bold border border-black/5 hover:border-palm/20 transition-all">
            <span>{item}</span>
            <ArrowUpRight size={15} className="text-black/45" />
          </div>
        ))}
      </div>
    </section>
  );
}

function formatCompactNaira(kobo = 0) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(kobo / 100);
}
