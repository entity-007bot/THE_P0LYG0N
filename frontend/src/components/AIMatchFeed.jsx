import React from 'react';
import { ArrowUpRight, Banknote, BriefcaseBusiness, MapPin, ThumbsDown, ThumbsUp, Sparkles, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { createDeposit, sendMatchFeedback } from '../api.js';

const formatNaira = (kobo = 0) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(kobo / 100);

export default function AIMatchFeed({ matches, userId, onDeposit }) {
  const [busyJob, setBusyJob] = useState('');
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
const [checkoutUrl, setCheckoutUrl] = useState('');

 async function deposit(job) {
  setBusyJob(job.id);
  setMessage('');
  setCheckoutUrl(''); // Clear previous link
  setShowSuccess(false);
  try {
    const result = await createDeposit(job.id, userId);
    
    // Check if the backend returned the Aria checkout_url
    if (result.checkoutUrl) {
      setCheckoutUrl(result.checkoutUrl); 
      setMessage(`✅ Payment link created! Click to complete deposit.`);
    } else {
      setMessage('Deposit created. Checkout URL pending from ARIA.');
    }
    
    setShowSuccess(true);
    onDeposit?.();
  } catch (err) {
    setMessage(`❌ ${err.message}`);
  } finally {
    setBusyJob('');
  }
}

  async function feedback(job, action, rating) {
    setMessage('');
    try {
      await sendMatchFeedback({ jobId: job.id, userId, action, rating });
      setMessage(action === 'accepted' ? '👍 Match feedback saved! This improves future recommendations.' : '👎 Thanks for helping us learn.');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  }

  return (
    <section className="rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-mint/20 to-palm/10 p-5 border-b border-black/10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-r from-palm to-mint text-white shadow-md">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-clay">Local Semantic AI</p>
              <h2 className="text-2xl font-black tracking-tight">Recommended Gigs</h2>
            </div>
          </div>
          <span className="rounded-full bg-gradient-to-r from-palm/20 to-mint/20 px-4 py-2 text-sm font-black text-palm shadow-sm">
            {matches.length} matches
          </span>
        </div>
      </div>

      <div className="p-5">
{message && (
  <div className={`mb-4 rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${
    showSuccess 
      ? 'bg-green-50 border border-green-200 text-green-700' 
      : message.includes('❌') 
        ? 'bg-red-50 border border-red-200 text-red-700'
        : 'bg-blue-50 border border-blue-200 text-blue-700'
  }`}>
    {showSuccess ? <CheckCircle size={16} /> : message.includes('❌') ? <AlertCircle size={16} /> : <Sparkles size={16} />}
    
    {/* Turn text into a link if we have a checkoutUrl */}
    {checkoutUrl ? (
      <a 
        href={checkoutUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="font-bold underline decoration-2 underline-offset-2 hover:text-green-900 transition-colors"
      >
        {message}
      </a>
    ) : (
      <span>{message}</span>
    )}
  </div>
)}

        {!matches.length && (
          <div className="rounded-xl border-2 border-dashed border-black/15 bg-gradient-to-br from-gray-50 to-white p-8 text-center">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-gray-100">
              <BriefcaseBusiness size={28} className="text-black/40" />
            </div>
            <p className="text-xl font-black mb-2">No Ranked Gigs Yet</p>
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-black/60">
              Complete onboarding or refresh after the backend seeds jobs. The matching engine ranks opportunities by skills, city, language, and economic context.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {matches.map((job, idx) => (
            <article key={job.id} className="group rounded-xl border border-black/10 bg-white p-4 hover:shadow-md transition-all duration-200">
              {/* Match badge and rank */}
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-palm/20 to-mint/20 text-sm font-black text-palm">
                    #{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">{job.title}</h3>
                    <div className="mt-1 flex flex-wrap gap-3 text-sm text-black/55">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={14} /> {job.city}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Banknote size={14} /> {formatNaira(job.budget_kobo)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={14} /> Urgent
                      </span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-gradient-to-br from-palm to-mint text-white shadow-lg">
                    <p className="text-xl font-black">{job.match_percent}%</p>
                    <p className="text-[9px] font-bold uppercase tracking-tight">match</p>
                  </div>
                  <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                </div>
              </div>

              <p className="mb-3 text-sm leading-relaxed text-black/70">{job.description}</p>
              
              {/* AI Reasons Chip */}
              <div className="mb-4 rounded-xl bg-gradient-to-r from-amber/5 to-orange/5 px-3 py-2 border border-amber/20">
                <p className="text-xs font-semibold text-amber-800 mb-1">🤖 AI Match Reasoning</p>
                <p className="text-xs leading-relaxed text-black/60">{job.reasons}</p>
              </div>

              <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                <button
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-ink to-gray-800 px-4 font-bold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-60"
                  onClick={() => deposit(job)}
                  disabled={busyJob === job.id}
                >
                  {busyJob === job.id ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      Create escrow deposit
                      <ArrowUpRight size={17} />
                    </>
                  )}
                </button>
                <button
                  className="grid h-11 w-11 place-items-center rounded-xl border border-green-200 bg-green-50 text-green-600 hover:bg-green-100 hover:scale-105 transition-all"
                  onClick={() => feedback(job, 'accepted', 5)}
                  title="Good match"
                >
                  <ThumbsUp size={18} />
                </button>
                <button
                  className="grid h-11 w-11 place-items-center rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:scale-105 transition-all"
                  onClick={() => feedback(job, 'rejected', 1)}
                  title="Poor match"
                >
                  <ThumbsDown size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}