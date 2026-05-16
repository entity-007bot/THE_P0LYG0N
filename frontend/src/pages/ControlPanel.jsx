import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Download,
  Landmark,
  LineChart,
  MapPinned,
  PieChart,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Users,
  WalletCards,
  Eye,
  FileText,
  Clock,
  TrendingDown,
  Award,
  Zap
} from 'lucide-react';
import { getControlPanel } from '../api.js';
import { LayoutDashboard } from 'lucide-react';

const fallbackControlPanel = {
  generatedAt: new Date().toISOString(),
  userIntelligence: {
    kycVerified: 8420,
    averageTrustScore: 72,
    averageCompletionRate: 86,
    profiles: [
      { id: 'u1', name: 'Amina Yusuf', city: 'Kano', skills: ['tailoring'], kycStatus: 'Verified', identityProvider: 'dojah', identityType: 'bvn', identityConfidence: 0.96, trustScore: 81, jobHistory: 24, earningsKobo: 184000000, employerRating: 4.7, loanHistory: 'Eligible', workCompletionRate: 92 },
      { id: 'u2', name: 'Chinedu Okeke', city: 'Lagos', skills: ['mechanic'], kycStatus: 'Verified', identityProvider: 'smile-id', identityType: 'nin', identityConfidence: 0.94, trustScore: 76, jobHistory: 18, earningsKobo: 232000000, employerRating: 4.5, loanHistory: 'No loan issued', workCompletionRate: 88 },
      { id: 'u3', name: 'Grace Bassey', city: 'Port Harcourt', skills: ['catering'], kycStatus: 'Pending', identityProvider: 'not connected', identityType: 'bvn', identityConfidence: 0, trustScore: 63, jobHistory: 11, earningsKobo: 98000000, employerRating: 4.2, loanHistory: 'No loan issued', workCompletionRate: 79 }
    ]
  },
  activityMonitoring: {
    jobsPosted: 3200,
    jobsAccepted: 2410,
    jobsCompleted: 1980,
    paymentsMade: 1765,
    loanRequests: 420,
    suspiciousActivity: [
      { label: 'Failed proof-of-work checks', value: 18, severity: 'medium' },
      { label: 'Pending escrow payments', value: 43, severity: 'medium' },
      { label: 'Low trust score accounts', value: 12, severity: 'high' }
    ],
    recentEvents: [
      { type: 'Job', title: 'Emergency bathroom leak repair', city: 'Abuja', time: new Date().toISOString() },
      { type: 'Payment', title: 'local escrow release', amountKobo: 4500000, time: new Date().toISOString() }
    ]
  },
  marketHeatmap: [
    { city: 'Lagos', skill: 'mechanic', jobs: 94, demand: 38, valueKobo: 188000000, coordinates: [6.52, 3.37] },
    { city: 'Kano', skill: 'solar repair', jobs: 71, demand: 31, valueKobo: 142000000, coordinates: [12.0, 8.59] },
    { city: 'Abuja', skill: 'drivers', jobs: 62, demand: 26, valueKobo: 118000000, coordinates: [9.07, 7.39] },
    { city: 'Ibadan', skill: 'tailoring', jobs: 55, demand: 19, valueKobo: 86000000, coordinates: [7.37, 3.94] }
  ],
  employmentStatistics: {
    totalWorkers: 12847,
    activeJobs: 620,
    jobsCompletedToday: 84,
    averageJobValueKobo: 6800000,
    workerEmploymentRate: 64,
    jobsCompletedPerDay: [
      { date: 'Mon', count: 44 },
      { date: 'Tue', count: 61 },
      { date: 'Wed', count: 78 },
      { date: 'Thu', count: 84 }
    ]
  },
  financialInclusion: {
    usersWithBankAccounts: 8420,
    identityVerifiedUsers: 8420,
    loansIssued: 420,
    loanRepaymentRate: 94,
    workerSavingsActivityKobo: 126000000,
    savingsUsers: 3900
  },
  governmentDataPortal: {
    skillDistribution: [
      { skill: 'mechanic', count: 1200 },
      { skill: 'tailoring', count: 980 },
      { skill: 'driver', count: 870 },
      { skill: 'catering', count: 650 }
    ],
    employmentTrends: [
      { date: 'Week 1', count: 240 },
      { date: 'Week 2', count: 310 },
      { date: 'Week 3', count: 455 }
    ],
    laborShortages: [
      { skill: 'solar repair', demand: 210, supply: 83, shortage: 127 },
      { skill: 'logistics', demand: 320, supply: 240, shortage: 80 }
    ],
    regionalEconomicActivity: [
      { city: 'Lagos', jobs: 94, demand: 38, valueKobo: 188000000 },
      { city: 'Kano', jobs: 71, demand: 31, valueKobo: 142000000 }
    ]
  },
  businessIntelligence: {
    availableWorkers: 8120,
    workerRatings: [
      { name: 'Amina Yusuf', city: 'Kano', trustScore: 81 },
      { name: 'Chinedu Okeke', city: 'Lagos', trustScore: 76 }
    ],
    skillSupply: [
      { skill: 'mechanic', count: 1200 },
      { skill: 'tailoring', count: 980 }
    ],
    averageJobPayBySector: [
      { skill: 'mechanic', valueKobo: 7200000 },
      { skill: 'tailoring', valueKobo: 5400000 }
    ]
  },
  fraudRiskMonitoring: {
    fakeJobs: 6,
    fraudAttempts: 18,
    identityIssues: 38,
    loanDefaultRisks: 12,
    riskQueue: [
      { type: 'Identity', subject: 'Incomplete KYC cluster', detail: 'Missing bank profile', severity: 'medium' },
      { type: 'Proof', subject: 'job_412', detail: 'Image proof mismatch', severity: 'high' }
    ]
  },
  platformGrowthAnalytics: {
    newUsers: 780,
    activeWorkers: 6410,
    jobsCreated: 3200,
    totalTransactionValueKobo: 1050000000,
    monthlyTrend: [
      { date: 'Mon', count: 32 },
      { date: 'Tue', count: 44 },
      { date: 'Wed', count: 58 },
      { date: 'Thu', count: 73 }
    ]
  },
  reports: [
    { name: 'Employment report', format: 'CSV/PDF', rows: 16047 },
    { name: 'Labor market insight', format: 'CSV/PDF', rows: 42 },
    { name: 'Economic data for policy review', format: 'CSV/PDF', rows: 18 }
  ]
};

export default function ControlPanel() {
  const [panel, setPanel] = useState(fallbackControlPanel);
  const [status, setStatus] = useState('demo');
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  async function load() {
    setLoading(true);
    try {
      const data = await getControlPanel();
      setPanel(data);
      setStatus('live');
      setLastRefresh(new Date());
    } catch {
      setStatus('demo');
      setPanel(fallbackControlPanel);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const sections = useMemo(() => buildSections(panel), [panel]);
  const currentSection = sections.find((section) => section.id === activeSection) || sections[0];
  const CurrentSectionIcon = currentSection.icon;

  return (
    <div className="space-y-5">
      {/* Header Card */}
      <div className="rounded-2xl bg-gradient-to-r from-ink to-gray-900 p-5 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 backdrop-blur-sm">
              <LayoutDashboard size={24} className="text-amber" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-amber">POLYGON Control Panel</p>
              <h1 className="text-2xl font-black tracking-tight">Informal Economy Intelligence</h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/70">
                Live command layer for users, jobs, payments, risk, market demand, government reporting, and business intelligence.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs">
              <Clock size={12} />
              <span>Last refresh: {lastRefresh.toLocaleTimeString()}</span>
            </div>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-black text-white backdrop-blur-sm transition hover:bg-white/20 disabled:opacity-60"
              onClick={load}
              disabled={loading}
            >
              <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
              Refresh
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-black ${status === 'live' ? 'bg-green-500/20 text-green-300' : 'bg-amber-500/20 text-amber-300'}`}>
            {status === 'live' ? '🟢 Live Data Feed' : '🟡 Demo Mode'}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/70">
            <Zap size={12} className="inline mr-1" />
            Real-time analytics
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-black/10 pb-2">
        {sections.map((section) => {
          const Icon = section.icon;
          const active = section.id === currentSection.id;
          return (
            <button
              key={section.id}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                active 
                  ? 'bg-gradient-to-r from-palm to-mint text-white shadow-md' 
                  : 'bg-white text-black/70 hover:bg-gray-50'
              }`}
              onClick={() => setActiveSection(section.id)}
            >
              <Icon size={16} />
              <span>{section.label}</span>
              {active && <span className="ml-1 text-xs">▶</span>}
            </button>
          );
        })}
      </div>

      {/* Active Section Content */}
      <div className="rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white p-5 border-b border-black/10">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-r from-mint to-palm/20 text-palm">
              <CurrentSectionIcon size={20} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-clay">Active Intelligence Module</p>
              <h2 className="text-xl font-black tracking-tight">{currentSection.label}</h2>
            </div>
            <div className="ml-auto">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-black/60">
                {currentSection.summary}
              </span>
            </div>
          </div>
        </div>
        <div className="p-5">
          {currentSection.render()}
        </div>
      </div>
    </div>
  );
}

function Overview({ panel }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard icon={Users} label="Total Workers" value={number(panel.employmentStatistics.totalWorkers)} trend="+12%" trendUp detail={`${panel.userIntelligence.kycVerified} KYC verified`} />
      <MetricCard icon={BriefcaseBusiness} label="Active Jobs" value={number(panel.employmentStatistics.activeJobs)} trend="+8%" trendUp detail={`${panel.activityMonitoring.jobsCompleted} completed`} />
      <MetricCard icon={WalletCards} label="Transaction Value" value={naira(panel.platformGrowthAnalytics.totalTransactionValueKobo)} trend="+23%" trendUp detail={`${panel.activityMonitoring.paymentsMade} payments`} />
      <MetricCard icon={ShieldAlert} label="Risk Signals" value={number(panel.fraudRiskMonitoring.fakeJobs + panel.fraudRiskMonitoring.fraudAttempts + panel.fraudRiskMonitoring.identityIssues)} trend="-5%" trendDown detail={`${panel.fraudRiskMonitoring.loanDefaultRisks} loan risks`} />
    </div>
  );
}

function buildSections(panel) {
  return [
    {
      id: 'overview',
      label: 'User Intelligence',
      icon: Users,
      summary: `${panel.userIntelligence.profiles.length} profiles sampled`,
      render: () => <UserIntelligence data={panel.userIntelligence} />
    },
    {
      id: 'activity',
      label: 'Activity Monitoring',
      icon: Activity,
      summary: `${panel.activityMonitoring.recentEvents.length} recent events`,
      render: () => <ActivityMonitoring data={panel.activityMonitoring} />
    },
    {
      id: 'heatmap',
      label: 'Market Heatmap',
      icon: MapPinned,
      summary: `${panel.marketHeatmap.length} city-skill clusters`,
      render: () => <MarketHeatmap data={panel.marketHeatmap} />
    },
    {
      id: 'employment',
      label: 'Employment Stats',
      icon: BarChart3,
      summary: `${panel.employmentStatistics.workerEmploymentRate}% employment`,
      render: () => <EmploymentStats data={panel.employmentStatistics} />
    },
    {
      id: 'finance',
      label: 'Financial Inclusion',
      icon: WalletCards,
      summary: `${panel.financialInclusion.usersWithBankAccounts} bank-linked`,
      render: () => <FinancialInclusion data={panel.financialInclusion} />
    },
    {
      id: 'government',
      label: 'Government Portal',
      icon: Landmark,
      summary: `${panel.governmentDataPortal.laborShortages.length} shortages`,
      render: () => <GovernmentPortal data={panel.governmentDataPortal} />
    },
    {
      id: 'business',
      label: 'Business Intel',
      icon: Building2,
      summary: `${panel.businessIntelligence.availableWorkers} available`,
      render: () => <BusinessIntelligence data={panel.businessIntelligence} />
    },
    {
      id: 'risk',
      label: 'Fraud & Risk',
      icon: ShieldAlert,
      summary: `${panel.fraudRiskMonitoring.riskQueue.length} queue items`,
      render: () => <RiskMonitoring data={panel.fraudRiskMonitoring} />
    },
    {
      id: 'growth',
      label: 'Growth Analytics',
      icon: TrendingUp,
      summary: `${panel.platformGrowthAnalytics.newUsers} new users`,
      render: () => <GrowthAnalytics data={panel.platformGrowthAnalytics} />
    },
    {
      id: 'reports',
      label: 'Reports & Export',
      icon: Download,
      summary: `${panel.reports.length} reports`,
      render: () => <ReportsExport data={panel.reports} />
    }
  ];
}

function UserIntelligence({ data }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={ShieldCheck} label="KYC Verified" value={number(data.kycVerified)} trend="+18%" trendUp detail="NIN/BVN provider match" />
        <MetricCard icon={LineChart} label="Avg Trust Score" value={`${data.averageTrustScore}%`} trend="+5%" trendUp detail="KiScore & work behavior" />
        <MetricCard icon={CheckCircle2} label="Completion Rate" value={`${data.averageCompletionRate}%`} trend="+3%" trendUp detail="Work completion signal" />
      </div>
      <div className="overflow-x-auto rounded-xl border border-black/10">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-gray-50 border-b border-black/10">
            <tr>
              {['Profile', 'KYC', 'Trust', 'Jobs', 'Earnings', 'Rating', 'Loan', 'Completion'].map((item) => (
                <th key={item} className="py-3 px-4 text-xs font-bold uppercase tracking-wide text-black/50">{item}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {data.profiles.map((profile, idx) => (
              <tr key={profile.id} className="hover:bg-gray-50 transition">
                <td className="py-3 px-4">
                  <p className="font-black">{profile.name}</p>
                  <p className="text-xs text-black/50">{profile.city} · {profile.skills.join(', ')}</p>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                    profile.kycStatus === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {profile.kycStatus === 'Verified' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                    {profile.kycStatus}
                  </span>
                  <p className="mt-1 text-[10px] uppercase text-black/40">
                    {profile.identityProvider || 'provider'} {profile.identityType || ''}
                  </p>
                </td>
                <td className="py-3 px-4 font-black text-palm">{profile.trustScore}</td>
                <td className="py-3 px-4">{profile.jobHistory}</td>
                <td className="py-3 px-4">{naira(profile.earningsKobo)}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <span>{profile.employerRating?.toFixed(1)}</span>
                    <span className="text-yellow-500">★</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`text-xs ${profile.loanHistory === 'Eligible' ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
                    {profile.loanHistory}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span>{profile.workCompletionRate}%</span>
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-palm rounded-full" style={{ width: `${profile.workCompletionRate}%` }} />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActivityMonitoring({ data }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="grid gap-4">
        <MetricCard icon={BriefcaseBusiness} label="Jobs Posted" value={number(data.jobsPosted)} trend="+15%" trendUp />
        <MetricCard icon={CheckCircle2} label="Jobs Completed" value={number(data.jobsCompleted)} trend="+22%" trendUp />
        <MetricCard icon={WalletCards} label="Payments Made" value={number(data.paymentsMade)} trend="+18%" trendUp />
        <MetricCard icon={Landmark} label="Loan Requests" value={number(data.loanRequests)} trend="+32%" trendUp />
      </div>
      <div className="space-y-4">
        <div className="rounded-xl bg-gradient-to-r from-red-50 to-orange-50 p-4 border border-red-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-red-600" />
            <h3 className="font-black text-red-800">Suspicious Activity</h3>
          </div>
          <div className="space-y-2">
            {data.suspiciousActivity.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg bg-white/80 p-3">
                <span className="text-sm font-medium">{item.label}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                  item.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-gray-50 p-4 border border-black/10">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={18} className="text-palm" />
            <h3 className="font-black">Recent Events</h3>
          </div>
          <div className="space-y-2">
            {data.recentEvents.map((event, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg bg-white p-3 text-sm">
                <div>
                  <span className="font-bold">{event.type}:</span> {event.title}
                  {event.city && <span className="text-black/50 ml-2">📍 {event.city}</span>}
                </div>
                <span className="text-xs text-black/40">
                  {event.amountKobo ? naira(event.amountKobo) : 'Just now'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketHeatmap({ data }) {
  const maxDemand = Math.max(1, ...data.map((item) => item.demand));
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="relative min-h-[400px] rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-4 border border-black/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(47,176,131,0.05)_0%,transparent_50%)]" />
        <div className="relative h-full">
          {data.map((item, index) => {
            const left = 10 + ((index * 23) % 70);
            const top = 10 + ((index * 31) % 80);
            const size = 50 + (item.demand / maxDemand) * 60;
            return (
              <div
                key={`${item.city}-${item.skill}`}
                className="absolute grid place-items-center rounded-full bg-gradient-to-br from-palm to-mint text-white shadow-lg cursor-pointer transition-transform hover:scale-105"
                style={{ left: `${left}%`, top: `${top}%`, width: size, height: size }}
                title={`${item.city}: ${item.skill} - ${item.demand} open jobs`}
              >
                <div className="text-center">
                  <p className="text-lg font-black">{item.demand}</p>
                  <p className="text-[9px] font-bold uppercase">{item.city.slice(0, 3)}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="absolute bottom-2 right-2 text-xs text-black/40">Bubble size = demand</div>
      </div>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={`${item.city}-${item.skill}`} className="rounded-xl border border-black/10 bg-gray-50 p-4 hover:shadow-md transition">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div>
                <p className="font-black text-lg">{item.city}</p>
                <p className="text-sm text-black/55">{item.skill}</p>
              </div>
              <span className="rounded-full bg-gradient-to-r from-palm to-mint px-3 py-1.5 text-xs font-black text-white">
                {item.demand} open
              </span>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-black/50">Market saturation</span>
                <span className="font-bold">{Math.round((item.demand / item.jobs) * 100)}% fill rate</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div className="h-full rounded-full bg-palm" style={{ width: `${Math.min(100, (item.demand / item.jobs) * 100)}%` }} />
              </div>
            </div>
            <p className="mt-3 text-xs text-black/50">{item.jobs} total jobs · {naira(item.valueKobo)} market value</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmploymentStats({ data }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="grid gap-4">
        <MetricCard icon={Users} label="Total Workers" value={number(data.totalWorkers)} trend="+8%" trendUp />
        <MetricCard icon={BriefcaseBusiness} label="Active Jobs" value={number(data.activeJobs)} trend="+12%" trendUp />
        <MetricCard icon={CheckCircle2} label="Completed Today" value={number(data.jobsCompletedToday)} trend="+24%" trendUp />
        <MetricCard icon={WalletCards} label="Avg Job Value" value={naira(data.averageJobValueKobo)} detail={`${data.workerEmploymentRate}% employed`} />
      </div>
      <div className="rounded-xl bg-gray-50 p-4 border border-black/10">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={18} className="text-palm" />
          <h3 className="font-black">Jobs Completed Trend</h3>
        </div>
        <div className="grid h-64 items-end gap-4" style={{ gridTemplateColumns: `repeat(${data.jobsCompletedPerDay.length}, minmax(50px, 1fr))` }}>
          {data.jobsCompletedPerDay.map((item) => {
            const max = Math.max(...data.jobsCompletedPerDay.map(d => d.count));
            const height = (item.count / max) * 100;
            return (
              <div key={item.date} className="flex h-full flex-col justify-end gap-2">
                <div className="relative group">
                  <div className="rounded-t-lg bg-gradient-to-t from-palm to-mint transition-all hover:opacity-80" style={{ height: `${Math.max(8, height)}%`, minHeight: '30px' }} />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-ink text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    {item.count} jobs
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold">{item.count}</p>
                  <p className="text-xs text-black/50">{item.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FinancialInclusion({ data }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard icon={WalletCards} label="Bank-linked Users" value={number(data.usersWithBankAccounts)} trend="+22%" trendUp detail="Virtual or physical account" />
      <MetricCard icon={Landmark} label="Loans Issued" value={number(data.loansIssued)} trend="+45%" trendUp detail="Credit-ready pool" />
      <MetricCard icon={CheckCircle2} label="Repayment Rate" value={`${data.loanRepaymentRate}%`} trend="+2%" trendUp detail="Trust-score proxy" />
      <MetricCard icon={PieChart} label="Savings Activity" value={naira(data.workerSavingsActivityKobo)} detail={`${data.savingsUsers} active savers`} />
    </div>
  );
}

function GovernmentPortal({ data }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="rounded-xl bg-gray-50 p-4 border border-black/10">
        <div className="flex items-center gap-2 mb-3">
          <PieChart size={18} className="text-palm" />
          <h3 className="font-black">Skill Distribution</h3>
        </div>
        <div className="space-y-3">
          {data.skillDistribution.map((item) => (
            <div key={item.skill}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium capitalize">{item.skill}</span>
                <span className="text-black/60">{item.count} workers</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-palm rounded-full" style={{ width: `${(item.count / Math.max(...data.skillDistribution.map(s => s.count))) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl bg-gray-50 p-4 border border-black/10">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={18} className="text-orange-600" />
          <h3 className="font-black">Labor Shortages</h3>
        </div>
        <div className="space-y-3">
          {data.laborShortages.map((item) => (
            <div key={item.skill} className="rounded-lg bg-white p-3">
              <div className="flex justify-between mb-2">
                <span className="font-bold capitalize">{item.skill}</span>
                <span className="text-orange-600 font-bold">{item.shortage} shortage</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Demand: {item.demand}</span>
                <span>Supply: {item.supply}</span>
              </div>
              <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(item.supply / item.demand) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BusinessIntelligence({ data }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <MetricCard icon={Users} label="Available Workers" value={number(data.availableWorkers)} trend="+7%" trendUp detail="Above risk threshold" />
      <div className="rounded-xl bg-gray-50 p-4 border border-black/10">
        <div className="flex items-center gap-2 mb-3">
          <Award size={18} className="text-palm" />
          <h3 className="font-black">Top Rated Workers</h3>
        </div>
        <div className="space-y-2">
          {data.workerRatings.map((worker) => (
            <div key={worker.name} className="flex justify-between items-center rounded-lg bg-white p-3">
              <div>
                <p className="font-bold">{worker.name}</p>
                <p className="text-xs text-black/50">{worker.city}</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-palm font-bold">{worker.trustScore}</span>
                <span className="text-yellow-500">★</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RiskMonitoring({ data }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="grid gap-4">
        <MetricCard icon={ShieldAlert} label="Fake Jobs" value={number(data.fakeJobs)} trend="-2%" trendDown detail="Budget/description checks" />
        <MetricCard icon={AlertTriangle} label="Fraud Attempts" value={number(data.fraudAttempts)} trend="-8%" trendDown detail="Failed proof signals" />
        <MetricCard icon={Users} label="Identity Issues" value={number(data.identityIssues)} trend="-5%" trendDown detail="Missing KYC linkage" />
        <MetricCard icon={Landmark} label="Loan Default Risks" value={number(data.loanDefaultRisks)} trend="+3%" trendUp detail="Low trust users" />
      </div>
      <div className="rounded-xl bg-gray-50 p-4 border border-black/10">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert size={18} className="text-red-600" />
          <h3 className="font-black">AI Risk Queue</h3>
        </div>
        <div className="space-y-2">
          {data.riskQueue.map((item) => (
            <div key={`${item.type}-${item.subject}`} className="rounded-lg bg-white p-3">
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="font-bold">{item.type}: {item.subject}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  item.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>{item.severity}</span>
              </div>
              <p className="text-sm text-black/60">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GrowthAnalytics({ data }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="grid gap-4">
        <MetricCard icon={Users} label="New Users (30d)" value={number(data.newUsers)} trend="+34%" trendUp />
        <MetricCard icon={Activity} label="Active Workers" value={number(data.activeWorkers)} trend="+12%" trendUp />
        <MetricCard icon={BriefcaseBusiness} label="Jobs Created" value={number(data.jobsCreated)} trend="+28%" trendUp />
        <MetricCard icon={WalletCards} label="Total Transaction Value" value={naira(data.totalTransactionValueKobo)} trend="+41%" trendUp />
      </div>
      <div className="rounded-xl bg-gray-50 p-4 border border-black/10">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-palm" />
          <h3 className="font-black">Platform Growth Trend</h3>
        </div>
        <div className="grid h-64 items-end gap-4" style={{ gridTemplateColumns: `repeat(${data.monthlyTrend.length}, minmax(50px, 1fr))` }}>
          {data.monthlyTrend.map((item) => {
            const max = Math.max(...data.monthlyTrend.map(d => d.count));
            const height = (item.count / max) * 100;
            return (
              <div key={item.date} className="flex h-full flex-col justify-end gap-2">
                <div className="rounded-t-lg bg-gradient-to-t from-palm to-mint transition-all" style={{ height: `${Math.max(8, height)}%`, minHeight: '30px' }} />
                <div className="text-center">
                  <p className="text-sm font-bold">{item.count}</p>
                  <p className="text-xs text-black/50">{item.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ReportsExport({ data }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.map((report) => (
        <article key={report.name} className="group rounded-xl border border-black/10 bg-gray-50 p-4 hover:shadow-md transition-all">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText size={18} className="text-palm" />
                <p className="font-black text-lg">{report.name}</p>
              </div>
              <p className="text-sm text-black/60">{report.rows.toLocaleString()} data rows · {report.format}</p>
            </div>
            <button className="grid h-10 w-10 place-items-center rounded-xl bg-white text-palm shadow-sm transition group-hover:bg-palm group-hover:text-white">
              <ArrowDownToLine size={18} />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, trend, trendUp, detail }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between mb-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-r from-mint to-palm/20 text-palm">
          <Icon size={19} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </div>
        )}
      </div>
      <p className="text-xs font-bold uppercase tracking-wide text-black/45">{label}</p>
      <p className="mt-1 text-2xl font-black tracking-tight">{value}</p>
      {detail && <p className="mt-1 text-xs text-black/55">{detail}</p>}
    </div>
  );
}

function number(value) {
  return Number(value || 0).toLocaleString('en-NG');
}

function naira(kobo = 0) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(Number(kobo || 0) / 100);
}
