import { nanoid } from 'nanoid';
import { db } from '../db/index.js';

function normalizeIdentityType(value) {
  const type = String(value || '').trim().toLowerCase();
  if (type === 'nin') return 'nin';
  return 'bvn';
}

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function maskIdentityNumber(value) {
  const digits = onlyDigits(value);
  return digits ? digits.slice(-4).padStart(Math.min(4, digits.length), '*') : '';
}

function isDemoMode() {
  return !process.env.IDENTITY_PROVIDER_API_KEY || process.env.IDENTITY_PROVIDER_API_KEY.includes('replace_me');
}

function buildDemoVerification({ identityType, identityNumber, fullName, dob }) {
  const digits = onlyDigits(identityNumber);
  const validLength = identityType === 'nin' ? digits.length === 11 : digits.length === 11;
  const status = validLength ? 'verified' : identityNumber ? 'review' : 'unverified';

  return {
    provider: process.env.IDENTITY_PROVIDER || 'demo-dojah',
    identityType,
    identityNumberLast4: maskIdentityNumber(identityNumber),
    status,
    confidence: status === 'verified' ? 0.92 : status === 'review' ? 0.45 : 0,
    verifiedFullName: status === 'verified' ? fullName : '',
    verifiedDateOfBirth: status === 'verified' ? dob : '',
    verifiedPhotoUrl: '',
    raw: {
      configured: false,
      message: 'Identity provider keys are not configured; local demo verification was used.'
    }
  };
}

async function dojahRequest({ identityType, identityNumber }) {
  const baseUrl = process.env.IDENTITY_PROVIDER_BASE_URL || 'https://api.dojah.io';
  const appId = process.env.DOJAH_APP_ID;
  const apiKey = process.env.IDENTITY_PROVIDER_API_KEY;
  const path = identityType === 'nin' ? '/api/v1/kyc/nin' : '/api/v1/kyc/bvn/full';
  const param = identityType === 'nin' ? 'nin' : 'bvn';
  const url = `${baseUrl}${path}?${param}=${encodeURIComponent(identityNumber)}`;

  const response = await fetch(url, {
    headers: {
      AppId: appId || '',
      Authorization: apiKey
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.entity === null) {
    const error = new Error(data?.message || 'Identity verification failed.');
    error.status = response.status;
    error.details = data;
    throw error;
  }

  const entity = data.entity || data;
  return {
    provider: 'dojah',
    identityType,
    identityNumberLast4: maskIdentityNumber(identityNumber),
    status: 'verified',
    confidence: 0.98,
    verifiedFullName: [entity.first_name, entity.middle_name, entity.last_name].filter(Boolean).join(' ') || entity.full_name || '',
    verifiedDateOfBirth: entity.date_of_birth || entity.dob || '',
    verifiedPhotoUrl: entity.photo || entity.image || '',
    raw: data
  };
}

async function smileRequest({ identityType, identityNumber, fullName, dob }) {
  const baseUrl = process.env.IDENTITY_PROVIDER_BASE_URL || 'https://api.smileidentity.com/v1';
  const apiKey = process.env.IDENTITY_PROVIDER_API_KEY;
  const partnerId = process.env.SMILE_PARTNER_ID;

  const response = await fetch(`${baseUrl}/id_verification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      partner_id: partnerId,
      api_key: apiKey,
      country: 'NG',
      id_type: identityType.toUpperCase(),
      id_number: identityNumber,
      first_name: String(fullName || '').split(/\s+/)[0] || '',
      last_name: String(fullName || '').split(/\s+/).slice(1).join(' '),
      dob
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.ResultCode === '1013') {
    const error = new Error(data?.ResultText || 'Identity verification failed.');
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return {
    provider: 'smile-id',
    identityType,
    identityNumberLast4: maskIdentityNumber(identityNumber),
    status: data?.ResultCode === '1012' || data?.ResultCode === '1011' ? 'verified' : 'review',
    confidence: data?.ResultCode === '1012' || data?.ResultCode === '1011' ? 0.96 : 0.62,
    verifiedFullName: data?.FullName || fullName || '',
    verifiedDateOfBirth: data?.DOB || dob || '',
    verifiedPhotoUrl: data?.Photo || '',
    raw: data
  };
}

export function recordIdentityVerification(userId, result) {
  if (!userId || !result) return null;

  db.prepare(`
    INSERT INTO identity_verifications (
      id, user_id, provider, identity_type, identity_number_last4, status, confidence,
      verified_full_name, verified_date_of_birth, verified_photo_url, raw_payload
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    nanoid(12),
    userId,
    result.provider,
    result.identityType,
    result.identityNumberLast4,
    result.status,
    result.confidence,
    result.verifiedFullName,
    result.verifiedDateOfBirth,
    result.verifiedPhotoUrl,
    JSON.stringify(result.raw || {})
  );

  return result;
}

export async function verifyIdentity({ userId, fullName, identityType, identityNumber, dob }) {
  const normalizedType = normalizeIdentityType(identityType);
  const normalizedNumber = onlyDigits(identityNumber);
  const provider = String(process.env.IDENTITY_PROVIDER || 'dojah').toLowerCase();

  let result;
  if (!normalizedNumber) {
    result = buildDemoVerification({ identityType: normalizedType, identityNumber: '', fullName, dob });
  } else if (isDemoMode()) {
    result = buildDemoVerification({ identityType: normalizedType, identityNumber: normalizedNumber, fullName, dob });
  } else if (provider.includes('smile')) {
    result = await smileRequest({ identityType: normalizedType, identityNumber: normalizedNumber, fullName, dob });
  } else {
    result = await dojahRequest({ identityType: normalizedType, identityNumber: normalizedNumber });
  }

  if (userId) recordIdentityVerification(userId, result);

  return result;
}

export function isIdentityVerified(user) {
  return String(user?.identity_status || '').toLowerCase() === 'verified';
}
