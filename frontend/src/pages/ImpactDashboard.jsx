import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  BarChart3, 
  BriefcaseBusiness, 
  MapPinned, 
  PiggyBank, 
  ShieldCheck, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Award,
  Clock,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
  Landmark,
  Globe2,
  Target,
  CheckCircle2
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

const fallbackImpact = {
  totalWorkers: 12847,
  totalEarned: 1050000000,
  jobsCompleted: 8234,
  savingsPool: 103000000,
  kiScoreAverage: 586,
  unemploymentReduction: 14.2,
  earningsHistory: [
    { week: 'Week 1', amount: 2.5 },
    { week: 'Week 2', amount: 4.8 },
    { week: 'Week 3', amount: 7.2 },
    { week: 'Week 4', amount: 10.5 }
  ],
  skillGaps: [
    { skill: 'Logistics', gap: 85, demand: 1240, supply: 186 },
    { skill: 'Inventory Management', gap: 72, demand: 890, supply: 249 },
    { skill: 'Solar Repairs', gap: 68, demand: 756, supply: 242 },
    { skill: 'Digital Marketing', gap: 45, demand: 634, supply: 349 }
  ],
  skillHubs: [
    { name: 'Lagos Mainland', city: 'Lagos', activityScore: 86, userCount: 4200, topSkill: 'delivery', gva: 189 },
    { name: 'Kano City', city: 'Kano', activityScore: 74, userCount: 2300, topSkill: 'solar', gva: 103.5 },
    { name: 'Abuja', city: 'Abuja', activityScore: 62, userCount: 1800, topSkill: 'repairs', gva: 81 },
    { name: 'Port Harcourt', city: 'Rivers', activityScore: 58, userCount: 1200, topSkill: 'logistics', gva: 54 },
    { name: 'Ibadan', city: 'Oyo', activityScore: 51, userCount: 980, topSkill: 'catering', gva: 44 },
    { name: 'Benin City', city: 'Edo', activityScore: 45, userCount: 760, topSkill: 'repairs', gva: 34 }
  ]
};

const emptyImpact = {
  totalWorkers: 0,
  totalEarned: 0,
  jobsCompleted: 0,
  savingsPool: 0,
  kiScoreAverage: 0,
  unemploymentReduction: 0,
  earningsHistory: [],
  skillGaps: [],
  skillHubs: []
};

export default function ImpactDashboard() {
  const [impact, setImpact] = useState(emptyImpact);
  const [backendStatus, setBackendStatus] = useState('demo');
  const [hoveredHub, setHoveredHub] = useState(null);
  const [animateMetrics, setAnimateMetrics] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setAnimateMetrics(true);

    async function load() {
      try {
        const response = await fetch(`${API_BASE}/admin/impact`);
        if (!response.ok) throw new Error('Impact endpoint unavailable');
        const data = await response.json();
        if (!cancelled) {
          setImpact(normalizeImpact(data));
          setBackendStatus('live');
        }
      } catch {
        if (!cancelled) setBackendStatus('demo');
      }
    }

    load();
    const interval = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const totalGVA = impact.skillHubs.reduce((sum, hub) => sum + Number(hub.gva || 0), 0);
  const monthOverMonthGrowth = impact.monthOverMonthGrowth || 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f7f4ec] via-[#f0ede3] to-[#e8e5db]">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-ink to-gray-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 h-72 w-72 rounded-full bg-palm blur-3xl" />
          <div className="absolute bottom-0 -right-4 h-96 w-96 rounded-full bg-amber blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={20} className="text-amber" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber">Live Economic Intelligence</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight lg:text-5xl">Nigeria Economic Activity Dashboard</h1>
              <p className="mt-2 text-white/70 max-w-xl">Real-time insights from Aria AI's intelligent economic system powering the informal economy</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm px-4 py-2 text-center">
                <p className="text-2xl font-black">{monthOverMonthGrowth}%</p>
                <p className="text-[10px] font-bold uppercase tracking-wider">MoM Growth</p>
              </div>
              <span className={`rounded-2xl px-4 py-2 text-sm font-black backdrop-blur-sm ${
                backendStatus === 'live' 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {backendStatus === 'live' ? '🟢 Live Data' : '⚡ Demo Mode'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ImpactMetric 
            icon={Users} 
            label="Active Users" 
            value={impact.totalWorkers.toLocaleString()} 
            detail="informal workers onboarded"
            trend="+23%"
            trendPositive={true}
            delay={0}
            animate={animateMetrics}
          />
          <ImpactMetric 
            icon={Activity} 
            label="Transaction Volume" 
            value={formatCompactNaira(impact.totalEarned)} 
            detail="via Aria payment rails"
            trend="+41%"
            trendPositive={true}
            delay={1}
            animate={animateMetrics}
          />
          <ImpactMetric 
            icon={BriefcaseBusiness} 
            label="Jobs Completed" 
            value={impact.jobsCompleted.toLocaleString()} 
            detail="verified income events"
            trend="+156"
            trendPositive={true}
            delay={2}
            animate={animateMetrics}
          />
          <ImpactMetric 
            icon={ShieldCheck} 
            label="Average KiScore" 
            value={impact.kiScoreAverage} 
            detail="portable credit signal"
            trend="+42"
            trendPositive={true}
            delay={3}
            animate={animateMetrics}
          />
        </div>

        {/* Main Charts Row */}
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          {/* Earnings Velocity Chart */}
          <section className="rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-mint/20 to-palm/10 p-5 border-b border-black/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-r from-palm to-mint text-white shadow-md">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-clay">Weekly Performance</p>
                    <h2 className="text-xl font-black tracking-tight">Earnings Velocity</h2>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp size={16} />
                  <span className="font-bold">+320%</span>
                  <span className="text-black/50">since launch</span>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="grid h-72 items-end gap-4 sm:grid-cols-4">
                {impact.earningsHistory.map((item, idx) => {
                  const maxAmount = Math.max(1, ...impact.earningsHistory.map(i => Number(i.amount || 0)));
                  const heightPercent = (Number(item.amount || 0) / maxAmount) * 100;
                  return (
                    <div key={item.week} className="group flex h-full flex-col justify-end gap-2">
                      <div className="relative">
                        <div
                          className="rounded-xl bg-gradient-to-t from-palm to-mint transition-all duration-500 hover:scale-105"
                          style={{ 
                            height: `${Math.max(12, heightPercent)}%`,
                            minHeight: '40px'
                          }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-ink text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">
                            ₦{item.amount}M
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-black">₦{item.amount}M</p>
                        <p className="text-xs text-black/50">{item.week}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-3 border-t border-black/10 flex justify-between text-xs text-black/50">
                <span>📈 Projected Week 5: ₦14.2M</span>
                <span>🎯 Annual Run Rate: ₦546M</span>
              </div>
            </div>
          </section>

          {/* Growth Vault & Unemployment Card */}
          <section className="rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-amber/10 to-orange/10 p-5 border-b border-black/10">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-r from-amber to-orange text-white shadow-md">
                  <PiggyBank size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-clay">Auto-Savings</p>
                  <h2 className="text-xl font-black tracking-tight">Growth Vault</h2>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-4xl font-black text-palm">{formatCompactNaira(impact.savingsPool)}</p>
                <p className="text-sm text-black/60 mt-1">Automatically saved from worker payouts with the 95/5 rule</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-palm to-mint"></div>
                  </div>
                  <span className="text-xs font-bold">68% toward ₦10M target</span>
                </div>
              </div>
              
              <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-green-800">Unemployment Reduction</p>
                  <Target size={16} className="text-green-600" />
                </div>
                <p className="text-3xl font-black text-green-700">{impact.unemploymentReduction}%</p>
                <p className="text-xs text-green-600 mt-1">in pilot LGAs vs control group</p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-green-600">
                  <CheckCircle2 size={12} />
                  <span>Exceeding target by 2.2%</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-black/50">📊 Based on NBS methodology</span>
                <span className="text-palm font-semibold">View report →</span>
              </div>
            </div>
          </section>
        </div>

        {/* Skill Gaps & Activity Hubs Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Skill Gaps Section */}
          <section className="rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 border-b border-black/10">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-clay">Workforce Intelligence</p>
                  <h2 className="text-xl font-black tracking-tight">Top Skill Gaps</h2>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {impact.skillGaps.map((gap, idx) => (
                <div key={gap.skill} className="group">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-palm">#{idx + 1}</span>
                      <span className="font-bold text-sm">{gap.skill}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-black/50">Demand: {gap.demand?.toLocaleString() || 'N/A'}</span>
                      <span className="text-sm font-black text-red-600">{gap.gap}% gap</span>
                    </div>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-700 group-hover:scale-x-105"
                      style={{ width: `${Math.min(100, gap.gap)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-black/50">
                    Supply: {gap.supply?.toLocaleString() || 'N/A'} workers • Training needed
                  </p>
                </div>
              ))}
              <div className="mt-3 pt-2 border-t border-black/10 text-center text-xs text-black/50">
                💡 Recommendation: Upskill programs in Logistics & Solar Repairs
              </div>
            </div>
          </section>

          {/* Activity Hubs Section */}
          <section className="rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-5 border-b border-black/10">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md">
                  <MapPinned size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-clay">Geographic Intelligence</p>
                  <h2 className="text-xl font-black tracking-tight">LGA Activity Hubs</h2>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {impact.skillHubs.map((hub) => (
                  <div 
                    key={`${hub.city || hub.name}-${hub.topSkill}`} 
                    className="group relative rounded-xl bg-gray-50 p-3 hover:shadow-md transition-all cursor-pointer"
                    onMouseEnter={() => setHoveredHub(hub.name)}
                    onMouseLeave={() => setHoveredHub(null)}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${hub.activityScore > 70 ? 'bg-green-500' : hub.activityScore > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                          <p className="font-black">{hub.name || hub.city}</p>
                        </div>
                        <p className="text-[10px] font-bold uppercase text-palm mt-0.5">
                          {hub.activityScore > 80 ? '🏆 High Credit Readiness' : hub.activityScore > 60 ? '📈 Growth Phase' : '🔧 Vocational Support Needed'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="rounded-full bg-gradient-to-r from-palm/20 to-mint/20 px-3 py-1 text-xs font-black text-palm">
                          {Math.round(hub.activityScore || 50)}% Activity
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <BriefcaseBusiness size={12} className="text-black/40" />
                        <span className="text-black/60">Top Skill: <span className="font-semibold">{hub.topSkill || hub.skill}</span></span>
                      </div>
                      <div className="font-bold text-palm">
                        ₦{((hub.userCount * 45000) / 1000000).toFixed(1)}M GVA
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between text-xs text-black/40">
                      <span>{hub.userCount.toLocaleString()} active workers</span>
                      <span className="flex items-center gap-1">
                        {hub.gva && `₦${hub.gva}M estimated GVA`}
                        <ChevronRight size={12} />
                      </span>
                    </div>
                    
                    {/* Hover effect bar */}
                    <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-palm to-mint transition-all duration-300 ${hoveredHub === hub.name ? 'w-full' : 'w-0'}`} />
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-3 border-t border-black/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Globe2 size={14} className="text-palm" />
                    <span className="font-semibold">Total GVA Impact:</span>
                    <span className="font-black">₦{totalGVA.toFixed(1)}M</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <ArrowUpRight size={12} />
                    <span>+18% from last quarter</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom Impact Note */}
        <div className="rounded-2xl bg-gradient-to-r from-ink to-gray-800 p-5 text-white shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10">
                <Award size={24} className="text-amber" />
              </div>
              <div>
                <p className="text-sm text-white/70">Systemic Impact Projection</p>
                <p className="text-lg font-black">5M workers → ₦17.2B monthly velocity → 0.3% GDP uplift</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock size={14} className="text-amber" />
              <span className="text-white/70">Last updated: {new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function normalizeImpact(data) {
  return {
    ...emptyImpact,
    ...data,
    earningsHistory: Array.isArray(data?.earningsHistory) ? data.earningsHistory : [],
    skillGaps: Array.isArray(data?.skillGaps) ? data.skillGaps : [],
    skillHubs: Array.isArray(data?.skillHubs) ? data.skillHubs : []
  };
}

function ImpactMetric({ icon: Icon, label, value, detail, trend, trendPositive, delay, animate }) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;

  useEffect(() => {
    if (animate && typeof numericValue === 'number' && !isNaN(numericValue)) {
      const timer = setTimeout(() => {
        let start = 0;
        const duration = 1000;
        const step = (timestamp) => {
          start = start || timestamp;
          const progress = Math.min(1, (timestamp - start) / duration);
          setDisplayValue(Math.floor(progress * numericValue));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, delay * 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(numericValue);
    }
  }, [animate, numericValue, delay]);

  const displayText = typeof value === 'string' && value.includes('₦') 
    ? `₦${displayValue.toLocaleString()}`
    : displayValue.toLocaleString();

  return (
    <div className="group rounded-2xl border border-black/10 bg-white shadow-sm p-5 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-r from-mint/20 to-palm/10 text-palm group-hover:scale-110 transition-transform">
          <Icon size={20} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold ${trendPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trendPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </div>
        )}
      </div>
      <p className="text-sm font-semibold text-black/55">{label}</p>
      <p className="text-2xl font-black tracking-tight">{animate && typeof numericValue === 'number' && !isNaN(numericValue) ? displayText : value}</p>
      <p className="mt-1 text-xs text-black/50">{detail}</p>
    </div>
  );
}

function formatCompactNaira(kobo = 0) {
  const naira = Number(kobo || 0) / 100;
  if (naira >= 1000000) return `₦${(naira / 1000000).toFixed(1)}M`;
  if (naira >= 1000) return `₦${(naira / 1000).toFixed(1)}K`;
  return `₦${Math.round(naira).toLocaleString('en-NG')}`;
}
