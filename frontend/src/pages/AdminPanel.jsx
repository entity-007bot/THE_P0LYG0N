import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Map, TrendingUp, Briefcase,
  Building2, AlertTriangle, BrainCircuit, Settings,
  LogOut, BarChart3, Shield, Activity, CreditCard,
  Zap, Landmark, Umbrella, FileText, Globe, Clock, History
} from 'lucide-react';
import {
  getAdminInsights,
  getImpact,
  getLgaHeatmap,
  getHealth
} from '../api.js'; // adjust path if needed

const MODULES = [
  { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'User & Identity', icon: Users },
  { id: 'geo', label: 'Geographic Intelligence', icon: Map },
  { id: 'economic', label: 'Economic Data', icon: TrendingUp },
  { id: 'registry', label: 'Business Registry', icon: Briefcase },
  { id: 'infra', label: 'Infrastructure Planning', icon: Building2 },
  { id: 'transactions', label: 'Financial Monitoring', icon: BarChart3 },
  { id: 'ai', label: 'AI Analytics Engine', icon: BrainCircuit },
  { id: 'policy', label: 'Policy Simulation', icon: Globe },
  { id: 'data', label: 'Data Export', icon: FileText },
  { id: 'statistics', label: 'National Statistics', icon: Activity },
  { id: 'security', label: 'Security & Governance', icon: Shield },
  { id: 'alerts', label: 'Alerts & Monitoring', icon: AlertTriangle },
  { id: 'public', label: 'Public Service Integration', icon: Building2 },
  { id: 'api', label: 'API Ecosystem', icon: Zap },
  { id: 'viz', label: 'Data Visualization Lab', icon: BarChart3 },
  { id: 'decision', label: 'Government Decision Dashboard', icon: Landmark },
  { id: 'archive', label: 'Historical Data Archive', icon: History },
];

export default function AdminPanel() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [adminData, setAdminData] = useState({
    impact: null,
    insights: null,
    heatmap: null,
    health: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all available admin data endpoints
    const fetchData = async () => {
      const [impact, insights, health] = await Promise.allSettled([
        getImpact(),
        getAdminInsights(),
        getHealth()
      ]);
      setAdminData({
        impact: impact.status === 'fulfilled' ? impact.value : null,
        insights: insights.status === 'fulfilled' ? insights.value : null,
        health: health.status === 'fulfilled',
      });
      setLoading(false);
    };
    fetchData();
  }, []);

  const renderModule = () => {
    if (loading) {
      return <div className="admin-card p-12 text-center text-clay">Loading admin data...</div>;
    }

    switch (activeModule) {
      case 'dashboard':
        return <MainDashboard data={adminData} />;
      case 'users':
        return <UserIdentityModule />;
      case 'geo':
        return <GeographicIntelligence />;
      default:
        return <PlaceholderModule title={MODULES.find(m => m.id === activeModule)?.label || 'Module'} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F5F7FA]">
      {/* Sidebar */}
      <aside className="w-64 bg-steel text-white flex flex-col overflow-y-auto">
        <div className="p-6 border-b border-clay/30">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-palm">P</span>OLYGON
          </h1>
          <p className="text-xs text-clay-300 mt-1">Admin Control Panel</p>
        </div>
        <nav className="flex-1 py-4">
          {MODULES.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                activeModule === mod.id
                  ? 'bg-palm/20 text-palm border-l-4 border-palm'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <mod.icon size={18} />
              {mod.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-clay/30">
          <button className="flex items-center gap-2 text-gray-400 hover:text-white text-sm">
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">
        {renderModule()}
      </main>
    </div>
  );
}

// ---- Modules ----

function MainDashboard({ data }) {
  const impact = data.impact || {};
  const insights = data.insights || {};
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-ink">Main Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="Total Workers" value={impact.totalWorkers || 0} />
        <MetricCard label="Total Earned (₦)" value={(impact.totalEarned || 0).toLocaleString()} />
        <MetricCard label="Savings Pool (₦)" value={(impact.savingsPool || 0).toLocaleString()} />
        <MetricCard label="Jobs Completed" value={impact.jobsCompleted || 0} />
        <MetricCard label="Avg KI Score" value={(impact.kiScoreAverage || 0).toFixed(1)} />
        <MetricCard label="Unemployment Reduction" value={`${impact.unemploymentReduction || 0}%`} />
      </div>
      {/* You can add charts here later using recharts */}
    </div>
  );
}

function UserIdentityModule() {
  return <PlaceholderModule title="User & Identity Management" />;
}

function GeographicIntelligence() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-ink">Geographic Intelligence (Heat Maps)</h2>
      <div className="admin-card p-8">
        <p className="text-clay">Heatmap visualizations will load here using the LGA heatmap API endpoint.</p>
        <p className="text-sm mt-2">Data endpoint: <code>/api/admin/lga-heatmap/:lga</code></p>
      </div>
    </div>
  );
}

function PlaceholderModule({ title }) {
  return (
    <div className="admin-card p-12 text-center">
      <Shield className="mx-auto mb-4 text-palm" size={48} />
      <h3 className="text-xl font-semibold text-ink mb-2">{title}</h3>
      <p className="text-clay">Module under development. Data integrations will appear here.</p>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="admin-card p-4">
      <p className="text-sm text-clay">{label}</p>
      <p className="text-2xl font-bold text-ink mt-1">{value}</p>
    </div>
  );
}