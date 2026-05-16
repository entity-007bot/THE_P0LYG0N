import React, { useState } from 'react';
import { Hammer, Loader2, Sparkles, User, Mail, Phone, MapPin, Globe, Shield, CreditCard, Calendar, Home as HomeIcon, Mic, Briefcase } from 'lucide-react';
import { onboardWorker } from '../api.js';

const initial = {
  fullName: '',
  email: '',
  phone: '',
  skills: '',
  identityType: 'bvn',
  identityNumber: '',
  bvn: '',
  dob: '',
  address: '',
  city: 'Lagos',
  language: 'English',
  preferredAccessMode: 'app',
  voiceNotes: '',
  economicContext: '',
  bio: ''
};

export default function OnboardingForm({ onComplete }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await onboardWorker(form);
      onComplete(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function loadDemoProfile() {
    setForm({
      fullName: 'Amina Okonkwo',
      email: `amina.${Date.now()}@squadflow.demo`,
      phone: '08034567890',
      skills: 'solar inverter wiring, battery testing, shop repairs',
      city: 'Kano',
      language: 'Hausa',
      preferredAccessMode: 'ussd',
      voiceNotes: 'Prefers Hausa prompts and low-data job alerts',
      economicContext: 'youth technician, market energy repairs, apprentice mentor',
      bio: 'Three years supporting solar installers, inverter troubleshooting, wiring, battery maintenance, and customer education for small shops.',
      identityType: 'bvn',
      identityNumber: '12345678901',
      bvn: '12345678901',
      dob: '15051998',
      address: 'No. 12, Ahmadu Bello Way, Kano'
    });
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-black/10 bg-white shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-palm to-mint p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/20 backdrop-blur-sm text-white">
            <Hammer size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Worker onboarding</h2>
            <p className="text-sm text-white/80">Verify identity, create a profile, and request a Squad virtual NUBAN</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 px-4 py-3 font-bold text-amber-800 hover:shadow-md transition-all"
          onClick={loadDemoProfile}
        >
          <Sparkles size={18} />
          🏆 Load Winning Demo Profile
        </button>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            ⚠️ {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Field 
            icon={User}
            label="Full name" 
            value={form.fullName} 
            onChange={(value) => update('fullName', value)} 
            required 
            focused={focusedField === 'fullName'}
            onFocus={() => setFocusedField('fullName')}
            onBlur={() => setFocusedField(null)}
          />
          <Field 
            icon={Mail}
            label="Email" 
            type="email" 
            value={form.email} 
            onChange={(value) => update('email', value)} 
            required 
            focused={focusedField === 'email'}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field 
            icon={Phone}
            label="Phone" 
            value={form.phone} 
            onChange={(value) => update('phone', value)} 
            required 
            focused={focusedField === 'phone'}
            onFocus={() => setFocusedField('phone')}
            onBlur={() => setFocusedField(null)}
          />
          <Field 
            icon={MapPin}
            label="City" 
            value={form.city} 
            onChange={(value) => update('city', value)} 
            required 
            focused={focusedField === 'city'}
            onFocus={() => setFocusedField('city')}
            onBlur={() => setFocusedField(null)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field 
            icon={Globe}
            label="Language" 
            value={form.language} 
            onChange={(value) => update('language', value)} 
            placeholder="English, Hausa, Yoruba, Igbo, Pidgin" 
            required 
            focused={focusedField === 'language'}
            onFocus={() => setFocusedField('language')}
            onBlur={() => setFocusedField(null)}
          />
          <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Shield size={14} className="text-palm" />
                ID type
              </span>
              <select
                className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 outline-none focus:border-palm focus:ring-1 focus:ring-palm transition-all"
                value={form.identityType}
                onChange={(event) => {
                  update('identityType', event.target.value);
                  update('identityNumber', '');
                  update('bvn', '');
                }}
              >
                <option value="bvn">BVN</option>
                <option value="nin">NIN</option>
              </select>
            </label>
            <Field 
              icon={CreditCard}
              label={`${form.identityType.toUpperCase()} for identity check`}
              value={form.identityNumber}
              onChange={(v) => {
                update('identityNumber', v);
                if (form.identityType === 'bvn') update('bvn', v);
              }}
              maxLength="11"
              placeholder="11 digits"
              focused={focusedField === 'identityNumber'}
              onFocus={() => setFocusedField('identityNumber')}
              onBlur={() => setFocusedField(null)}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field 
            icon={Calendar}
            label="Date of Birth (DDMMYYYY)" 
            value={form.dob} 
            onChange={(v) => update('dob', v)} 
            placeholder="15051998"
            focused={focusedField === 'dob'}
            onFocus={() => setFocusedField('dob')}
            onBlur={() => setFocusedField(null)}
          />
          <Field 
            icon={HomeIcon}
            label="Address" 
            value={form.address} 
            onChange={(v) => update('address', v)} 
            placeholder="Street address"
            focused={focusedField === 'address'}
            onFocus={() => setFocusedField('address')}
            onBlur={() => setFocusedField(null)}
          />
        </div>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Shield size={14} className="text-palm" />
            Preferred access mode
          </span>
          <select
            className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 outline-none focus:border-palm focus:ring-1 focus:ring-palm transition-all"
            value={form.preferredAccessMode}
            onChange={(event) => update('preferredAccessMode', event.target.value)}
          >
            <option value="app">📱 Mobile app (Full features)</option>
            <option value="ussd">📞 USSD (*347#) - Low data mode</option>
            <option value="sms">💬 SMS fallback - Basic alerts</option>
            <option value="voice">🎙️ Voice onboarding - Local language</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Mic size={14} className="text-palm" />
            Voice or local-language note
          </span>
          <textarea
            className="min-h-24 w-full rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-palm focus:ring-1 focus:ring-palm transition-all"
            value={form.voiceNotes}
            onChange={(event) => update('voiceNotes', event.target.value)}
            placeholder="Short spoken summary, dialect note, or local-language context..."
          />
        </label>

        <Field 
          icon={Briefcase}
          label="Economic context" 
          value={form.economicContext} 
          onChange={(value) => update('economicContext', value)} 
          placeholder="market trader, youth apprentice, roadside vendor"
          focused={focusedField === 'economicContext'}
          onFocus={() => setFocusedField('economicContext')}
          onBlur={() => setFocusedField(null)}
        />

        <Field 
          icon={Hammer}
          label="Skills (comma-separated)" 
          value={form.skills} 
          onChange={(value) => update('skills', value)} 
          placeholder="electrician, inverter wiring, repairs, customer service" 
          required 
          focused={focusedField === 'skills'}
          onFocus={() => setFocusedField('skills')}
          onBlur={() => setFocusedField(null)}
        />

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <User size={14} className="text-palm" />
            Work bio
          </span>
          <textarea
            className="min-h-28 w-full rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-palm focus:ring-1 focus:ring-palm transition-all"
            value={form.bio}
            onChange={(event) => update('bio', event.target.value)}
            placeholder="Short proof of experience, tools, preferred gigs, and certifications..."
          />
        </label>

        <button
          className="w-full flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-palm to-mint px-4 font-bold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-60"
          disabled={loading}
        >
          {loading && <Loader2 className="animate-spin" size={18} />}
          {loading ? 'Creating your Squad wallet...' : '🚀 Launch SquadFlow Wallet'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, type = 'text', value, onChange, icon: Icon, focused, onFocus, onBlur, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-semibold">
        {Icon && <Icon size={14} className="text-palm" />}
        {label}
      </span>
      <input
        className={`h-12 w-full rounded-xl border px-4 outline-none transition-all ${
          focused 
            ? 'border-palm ring-1 ring-palm' 
            : 'border-black/15 hover:border-black/30'
        }`}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        {...props}
      />
    </label>
  );
}
