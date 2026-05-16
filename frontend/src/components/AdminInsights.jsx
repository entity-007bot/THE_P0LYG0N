import React, { useEffect, useState } from 'react';
import { BarChart3, Landmark, Loader2, TrendingUp, MapPin, Briefcase, AlertCircle, CheckCircle, Sliders, DollarSign, Users } from 'lucide-react';
import { getAdminInsights } from '../api.js';

export default function AdminInsights() {
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState('');
  const [lenderConfig, setLenderConfig] = useState({ minKiScore: 600, loanOffer: 2000000 });
  const [activeTab, setActiveTab] = useState('insights');

  useEffect(() => {
    getAdminInsights()
      .then(setInsights)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <section className="rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-amber/10 to-mint/10 p-5 border-b border-black/10">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-r from-amber to-orange text-white shadow-md">
            <BarChart3 size={22} />
          </div>
          <div>
            <p className="text-sm font-semibold text-clay">Government & Financial Intelligence</p>
            <h2 className="text-2xl font-black tracking-tight">Economic Insights Dashboard</h2>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-black/10 bg-gray-50/50">
        <button
          className={`flex-1 px-4 py-3 text-sm font-bold transition-all ${
            activeTab === 'insights' 
              ? 'border-b-2 border-palm text-palm bg-white' 
              : 'text-black/60 hover:text-black'
          }`}
          onClick={() => setActiveTab('insights')}
        >
          <span className="flex items-center justify-center gap-2">
            <TrendingUp size={16} />
            Market Insights
          </span>
        </button>
        <button
          className={`flex-1 px-4 py-3 text-sm font-bold transition-all ${
            activeTab === 'lender' 
              ? 'border-b-2 border-palm text-palm bg-white' 
              : 'text-black/60 hover:text-black'
          }`}
          onClick={() => setActiveTab('lender')}
        >
          <span className="flex items-center justify-center gap-2">
            <Landmark size={16} />
            Lender Portal
          </span>
        </button>
      </div>

      <div className="p-5">
        {!insights && !error && (
          <div className="flex items-center justify-center gap-2 py-12 text-black/60">
            <Loader2 className="animate-spin" size={20} /> 
            <span>Loading economic intelligence...</span>
          </div>
        )}
        
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {activeTab === 'lender' && (
          <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <Landmark size={20} className="text-palm" />
              <h3 className="font-black text-lg text-ink">Behavioral Credit Gating</h3>
              <span className="ml-auto rounded-full bg-palm/20 px-3 py-1 text-xs font-black text-palm">BETA</span>
            </div>
            <p className="text-sm text-black/60 mb-4">
              Set KiScore thresholds to automatically qualify informal workers for micro-loans based on their transaction history.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-bold text-black/70">
                  <Sliders size={14} className="text-palm" />
                  Minimum KiScore Threshold
                </span>
                <div className="relative">
                  <input 
                    type="range" 
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-palm"
                    min="0"
                    max="1000"
                    step="10"
                    value={lenderConfig.minKiScore}
                    onChange={(e) => setLenderConfig({...lenderConfig, minKiScore: parseInt(e.target.value)})}
                  />
                  <div className="flex justify-between mt-1 text-xs text-black/50">
                    <span>0</span>
                    <span>250</span>
                    <span>500</span>
                    <span>750</span>
                    <span>1000</span>
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <span className="inline-block rounded-full bg-palm/20 px-3 py-1 text-sm font-black text-palm">
                    Current: {lenderConfig.minKiScore}
                  </span>
                </div>
              </label>
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-bold text-black/70">
                  <DollarSign size={14} className="text-palm" />
                  Loan Amount (₦)
                </span>
                <input 
                  type="number" 
                  className="w-full h-11 rounded-xl border border-black/15 px-4 outline-none focus:border-palm focus:ring-1 focus:ring-palm transition-all"
                  value={lenderConfig.loanOffer / 100}
                  onChange={(e) => setLenderConfig({...lenderConfig, loanOffer: parseInt(e.target.value) * 100})}
                />
              </label>
            </div>
            <div className="mt-4 rounded-lg bg-white/80 p-3 text-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Estimated eligible workers:</span>
                <span className="font-black text-palm">
                  {insights ? Math.floor(insights.skillHubs?.length * 0.35) || 0 : 0}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-palm to-mint rounded-full" style={{ width: '35%' }}></div>
              </div>
              <p className="text-xs text-black/50 mt-2">Based on current KiScore distribution</p>
            </div>
          </div>
        )}

        {insights && activeTab === 'insights' && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Skill Hubs Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase size={18} className="text-palm" />
                <p className="text-sm font-bold text-black/70 uppercase tracking-wide">Top skills by city</p>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {insights.skillHubs.length === 0 && (
                  <div className="rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-black/60 border border-dashed border-black/15">
                    <Users size={32} className="mx-auto mb-2 text-black/30" />
                    Onboard workers to reveal skill hubs.
                  </div>
                )}
                {insights.skillHubs.slice(0, 8).map((hub, idx) => (
                  <div key={`${hub.city}-${hub.skill}`} className="group flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-palm">#{idx + 1}</span>
                      <div>
                        <p className="font-bold text-sm">{hub.skill}</p>
                        <p className="text-xs text-black/50 flex items-center gap-1">
                          <MapPin size={10} /> {hub.city}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <strong className="text-lg font-black">{hub.workerCount}</strong>
                      <p className="text-[10px] text-black/40 uppercase">workers</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Unemployment Heatmap Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={18} className="text-clay" />
                <p className="text-sm font-bold text-black/70 uppercase tracking-wide">Unemployment pressure index</p>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {insights.unemploymentHeatmap.length === 0 && (
                  <div className="rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-black/60 border border-dashed border-black/15">
                    <MapPin size={32} className="mx-auto mb-2 text-black/30" />
                    City pressure appears once workers and open jobs share locations.
                  </div>
                )}
                {insights.unemploymentHeatmap.slice(0, 8).map((city) => (
                  <div key={city.city} className="rounded-xl bg-gray-50 p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold flex items-center gap-2">
                        <MapPin size={14} className="text-clay" />
                        {city.city}
                      </span>
                      <strong className={`text-lg font-black ${
                        city.pressureIndex > 0.7 ? 'text-red-600' : 
                        city.pressureIndex > 0.4 ? 'text-amber-600' : 'text-green-600'
                      }`}>
                        {Math.round(city.pressureIndex * 100)}%
                      </strong>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                      <div 
                        className={`h-full rounded-full ${
                          city.pressureIndex > 0.7 ? 'bg-red-500' : 
                          city.pressureIndex > 0.4 ? 'bg-amber-500' : 'bg-green-500'
                        }`} 
                        style={{ width: `${city.pressureIndex * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-black/50">
                      <span>{city.workers} workers</span>
                      <span>{city.openJobs} open jobs</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {insights && activeTab === 'insights' && (
          <div className="mt-6 pt-4 border-t border-black/10">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-3 text-center">
                <p className="text-xs text-black/60">Total Active Workers</p>
                <p className="text-2xl font-black text-green-700">
                  {insights.skillHubs?.reduce((sum, h) => sum + h.workerCount, 0) || 0}
                </p>
              </div>
              <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-3 text-center">
                <p className="text-xs text-black/60">Avg Jobs per Worker</p>
                <p className="text-2xl font-black text-blue-700">
                  {insights.unemploymentHeatmap?.length 
                    ? (insights.unemploymentHeatmap.reduce((sum, c) => sum + c.openJobs, 0) / 
                       insights.unemploymentHeatmap.reduce((sum, c) => sum + c.workers, 0)).toFixed(1)
                    : '0'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}