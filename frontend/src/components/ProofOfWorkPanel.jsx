import React, { useEffect, useState } from 'react';
import { Camera, Loader2, Upload, CheckCircle, AlertCircle, Briefcase, Banknote, Shield } from 'lucide-react';
import { verifyCompletion, verifyBankDetails } from '../api.js';

export default function ProofOfWorkPanel({ userId, matches = [] }) {
  const [jobId, setJobId] = useState(matches[0]?.id || '');
  const [imageData, setImageData] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [expectedWorkType, setExpectedWorkType] = useState(matches[0]?.title || '');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountValidated, setAccountValidated] = useState(false);
const [checkoutUrl, setCheckoutUrl] = useState('');

  useEffect(() => {
    if (!jobId && matches.length) {
      setJobId(matches[0].id);
      setExpectedWorkType(matches[0].title);
    }
  }, [jobId, matches]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageData(reader.result);
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  async function validateBankAccount() {
    if (!accountNumber || accountNumber.length !== 10) {
      setError('Please enter a valid 10-digit account number');
      return;
    }
    setLoading(true);
    try {
      const validation = await verifyBankDetails({ accountNumber, bankCode });
      if (validation.valid) {
        setAccountValidated(true);
        setError('');
      } else {
        setError('Account validation failed. Please check details.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    if (!jobId || !imageData || !bankCode || !accountValidated) {
      setError('Please complete all required fields and validate your account');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const verificationResult = await verifyCompletion({ 
        jobId, 
        userId, 
        imagePath: imageData, 
        expectedWorkType,
        bankCode,
        accountNumber
      });
      setResult(verificationResult);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function chooseJob(value) {
    const job = matches.find((item) => item.id === value);
    setJobId(value);
    if (job) setExpectedWorkType(job.title);
    setResult(null); // Reset result when job changes
  }

  return (
    <section className="rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 border-b border-black/10">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md">
            <Camera size={22} />
          </div>
          <div>
            <p className="text-sm font-semibold text-clay">AI-Powered Verification</p>
            <h2 className="text-2xl font-black tracking-tight">Proof of Work</h2>
          </div>
        </div>
      </div>

      <div className="p-5">
        <form onSubmit={submit} className="space-y-4">
          {/* Bank Details Section */}
          <div className="rounded-xl bg-blue-50 p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={18} className="text-blue-600" />
              <p className="text-sm font-bold text-blue-800">Payout Destination</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-black/60 mb-1">Bank Code</label>
                <input 
                  className="h-11 w-full rounded-xl border border-black/15 px-4 outline-none focus:border-palm focus:ring-1 focus:ring-palm transition-all"
                  placeholder="e.g., 058 (GTB), 011 (First Bank)"
                  value={bankCode}
                  onChange={(e) => {
                    setBankCode(e.target.value);
                    setAccountValidated(false);
                  }}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-black/60 mb-1">Account Number</label>
                <div className="flex gap-2">
                  <input 
                    className="flex-1 h-11 rounded-xl border border-black/15 px-4 outline-none focus:border-palm focus:ring-1 focus:ring-palm transition-all"
                    placeholder="10-digit account number"
                    value={accountNumber}
                    onChange={(e) => {
                      setAccountNumber(e.target.value);
                      setAccountValidated(false);
                    }}
                    maxLength="10"
                    required
                  />
                  <button
                    type="button"
                    className="px-4 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all"
                    onClick={validateBankAccount}
                    disabled={loading || !accountNumber}
                  >
                    Verify
                  </button>
                </div>
              </div>
            </div>
            {accountValidated && (
              <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
                <CheckCircle size={14} />
                Account verified successfully
              </div>
            )}
          </div>

          {/* Job Selection */}
          <div>
            <label className="block text-sm font-bold text-black/70 mb-2 flex items-center gap-2">
              <Briefcase size={14} className="text-palm" />
              Select Completed Gig
            </label>
            <select
              className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 outline-none focus:border-palm focus:ring-1 focus:ring-palm transition-all"
              value={jobId}
              onChange={(event) => chooseJob(event.target.value)}
              disabled={!matches.length}
            >
              {!matches.length && <option value="">No matched gigs yet</option>}
              {matches.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} - {formatNaira(job.budget_kobo)}
                </option>
              ))}
            </select>
          </div>
          
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-bold text-black/70 mb-2 flex items-center gap-2">
              <Camera size={14} className="text-palm" />
              Photo Evidence of Completed Work
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                required
              />
              <div className="flex h-12 w-full items-center justify-between rounded-xl border border-black/15 bg-gray-50 px-4 outline-none hover:border-palm transition-all">
                <span className="text-sm text-gray-500">
                  {imageData ? "✓ Image selected" : "Choose a photo..."}
                </span>
                <Upload size={18} className="text-clay" />
              </div>
            </div>
          </div>
          
          {/* Image Preview */}
          {imagePreview && (
            <div className="mt-2 rounded-xl overflow-hidden border border-black/10">
              <img src={imagePreview} alt="Work completion preview" className="h-48 w-full object-cover" />
            </div>
          )}

          {/* Submit Button */}
          <button
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-palm to-mint px-4 font-bold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-60"
            disabled={loading || !matches.length || !imageData || !accountValidated}
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {loading ? 'Verifying with AI...' : '🔍 Verify & Release Escrow'}
          </button>
        </form>

        {/* Error Display */}
        {error && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* No Jobs Message */}
        {!matches.length && (
          <div className="mt-4 rounded-xl bg-gray-50 border border-dashed border-black/15 px-4 py-6 text-center">
            <Briefcase size={32} className="mx-auto mb-2 text-black/30" />
            <p className="text-sm leading-relaxed text-black/60">
              Proof-of-work activates after the AI feed has at least one matched gig.
            </p>
          </div>
        )}

        {/* Verification Result */}
        {result && (
          <div className={`mt-4 rounded-xl p-4 ${
            result.verification.verified 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {result.verification.verified ? (
                <CheckCircle size={20} className="text-green-600" />
              ) : (
                <AlertCircle size={20} className="text-red-600" />
              )}
              <p className={`font-bold ${
                result.verification.verified ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.verification.verified ? '✓ Work Verified!' : '✗ Verification Failed'}
              </p>
            </div>
            <p className="text-sm mb-2">{result.verification.reason}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-black/60">AI Confidence</span>
              <div className="flex-1 mx-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${result.verification.verified ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${result.verification.confidence * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold">
                {Math.round(result.verification.confidence * 100)}%
              </span>
            </div>
            {result.verification.verified && result.payoutStatus && (
              <div className="mt-3 pt-2 border-t border-green-200 text-sm">
                <p className="text-green-700">💰 {result.payoutStatus}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function formatNaira(kobo = 0) {
  return new Intl.NumberFormat('en-NG', { 
    style: 'currency', 
    currency: 'NGN', 
    maximumFractionDigits: 0 
  }).format(kobo / 100);
}