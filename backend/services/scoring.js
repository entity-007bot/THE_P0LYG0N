import { db } from '../db/index.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export function detectFraudulentActivity(userId) {
  const velocityCheck = db.prepare(`
    SELECT COUNT(*) as count FROM squad_transactions 
    WHERE user_id = ? AND status = 'success' 
    AND created_at > datetime('now', '-1 hour')
  `).get(userId);

  return {
    isCircular: false,
    isHighVelocity: velocityCheck.count > 5, // More than 5 successful jobs/hour is suspicious
    fraudPenalty: velocityCheck.count > 5 ? 30 : 0
  };
}
export function calculateTrustScore(signals) {
  const {
    lastPaymentAt,
    successfulTransactions,
    totalVolumeKobo,
    verifiedCompletions = 0,
    growthVaultKobo = 0,
    identityVerified = false,
    identityConfidence = 0,
    userId
  } = signals;

  const now = Date.now();
  const lastPaymentTime = lastPaymentAt ? new Date(lastPaymentAt).getTime() : 0;
  const daysSinceLastPayment = lastPaymentTime ? Math.max(0, Math.floor((now - lastPaymentTime) / DAY_MS)) : null;

  // BASE SCORING LOGIC
  const recencyScore = daysSinceLastPayment === null ? 0 : Math.max(0, 30 - Math.min(30, daysSinceLastPayment));
  const consistencyScore = Math.min(35, successfulTransactions * 5);
  const volumeScore = Math.min(20, Math.floor(totalVolumeKobo / 1000000));
  const socialTrustScore = Math.min(10, verifiedCompletions * 2);
  const savingsScore = Math.min(10, Math.floor(growthVaultKobo / 500000));
  const identityScore = identityVerified ? Math.min(15, 8 + Math.round(Number(identityConfidence || 0) * 7)) : 0;
  const baseScore = 35;

  let total = baseScore + identityScore + recencyScore + consistencyScore + volumeScore + socialTrustScore + savingsScore;

  // APPLY FRAUD PENALTY
  if (userId) {
    const fraud = detectFraudulentActivity(userId);
    total -= fraud.fraudPenalty;
  }

  return Number(Math.min(100, Math.max(0, total)).toFixed(2));
}

export function calculateAiCreditScore(signals = {}) {
  const trustScore = Number(signals.trustScore || 0);
  const successfulTransactions = Number(signals.successfulTransactions || 0);
  const totalVolumeKobo = Number(signals.totalVolumeKobo || 0);
  const verifiedCompletions = Number(signals.verifiedCompletions || 0);
  const growthVaultKobo = Number(signals.growthVaultKobo || 0);
  const identityLift = signals.identityVerified ? 80 : 0;

  const base = 220;
  const trustLift = trustScore * 6;
  const activityLift = Math.min(180, successfulTransactions * 14);
  const volumeLift = Math.min(160, Math.floor(totalVolumeKobo / 250000));
  const verificationLift = Math.min(120, verifiedCompletions * 22);
  const savingsLift = Math.min(120, Math.floor(growthVaultKobo / 250000));

  return Math.max(1, Math.min(1000, Math.round(base + identityLift + trustLift + activityLift + volumeLift + verificationLift + savingsLift)));
}

export function buildSkillGraph(user) {
  const skillSet = new Set(
    String(user.skills || '')
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean)
  );

  if (user.language) skillSet.add(String(user.language).trim());
  if (user.preferred_access_mode) skillSet.add(String(user.preferred_access_mode).trim());
  if (user.city) skillSet.add(String(user.city).trim());

  return [...skillSet].filter(Boolean);
}

export function getEconomicIdentity(userId) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) return null;

  const economicSignals = getUserEconomicSignals(userId);
  const trustScore = calculateTrustScore(economicSignals);
  const aiCreditScore = calculateAiCreditScore({ ...economicSignals, trustScore });
  const verifiedCompletions = db.prepare('SELECT COALESCE(SUM(verified), 0) AS count FROM proof_of_work_verifications WHERE user_id = ?').get(userId).count;
  const feedbackStats = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN action = 'accepted' THEN 1 ELSE 0 END), 0) AS accepted,
      COALESCE(SUM(CASE WHEN action = 'rejected' THEN 1 ELSE 0 END), 0) AS rejected
    FROM match_feedback
    WHERE user_id = ?
  `).get(userId);

  const totalFeedback = Number(feedbackStats.accepted || 0) + Number(feedbackStats.rejected || 0);
  const reputationRatio = totalFeedback ? Number((Number(feedbackStats.accepted || 0) / totalFeedback).toFixed(2)) : 0;
  const riskTier = aiCreditScore >= 700 ? 'low' : aiCreditScore >= 500 ? 'moderate' : 'elevated';

  return {
    wallet: {
      balanceKobo: Number(user.wallet_balance_kobo || 0),
      growthVaultKobo: Number(user.growth_vault_kobo || 0)
    },
    aiCreditScore,
    workHistory: {
      completedJobs: Number(user.completed_jobs || 0),
      successfulPayments: Number(user.successful_payments || 0),
      lastPaymentAt: economicSignals.lastPaymentAt,
      totalVolumeKobo: economicSignals.totalVolumeKobo,
      verifiedCompletions: Number(verifiedCompletions || 0)
    },
    skillGraph: buildSkillGraph(user),
    reputationGraph: {
      acceptedMatches: Number(feedbackStats.accepted || 0),
      rejectedMatches: Number(feedbackStats.rejected || 0),
      reputationRatio
    },
    aiTrustProfile: {
      trustScore,
      riskTier,
      identityStatus: user.identity_status || 'unverified',
      identityProvider: user.identity_provider || '',
      identityConfidence: Number(user.identity_confidence || 0),
      offlineReady: true,
      multilingual: Boolean(user.language),
      accessMode: user.preferred_access_mode || 'app',
      language: user.language || 'English'
    }
  };
}

export function getUserEconomicSignals(userId) {
  const transactions = db.prepare(`
    SELECT
      MAX(updated_at) AS lastPaymentAt,
      COUNT(*) AS successfulTransactions,
      COALESCE(SUM(amount_kobo), 0) AS totalVolumeKobo
    FROM squad_transactions
    WHERE user_id = ? AND status = 'success'
  `).get(userId);
  const trust = db.prepare(`
    SELECT
      COALESCE(SUM(verified), 0) AS verifiedCompletions,
      COALESCE((SELECT growth_vault_kobo FROM users WHERE id = ?), 0) AS growthVaultKobo,
      COALESCE((SELECT identity_status FROM users WHERE id = ?), 'unverified') AS identityStatus,
      COALESCE((SELECT identity_confidence FROM users WHERE id = ?), 0) AS identityConfidence
    FROM proof_of_work_verifications
    WHERE user_id = ?
  `).get(userId, userId, userId, userId);

  return {
    userId,
    lastPaymentAt: transactions.lastPaymentAt,
    successfulTransactions: Number(transactions.successfulTransactions || 0),
    totalVolumeKobo: Number(transactions.totalVolumeKobo || 0),
    verifiedCompletions: Number(trust.verifiedCompletions || 0),
    growthVaultKobo: Number(trust.growthVaultKobo || 0),
    identityVerified: String(trust.identityStatus || '').toLowerCase() === 'verified',
    identityStatus: trust.identityStatus || 'unverified',
    identityConfidence: Number(trust.identityConfidence || 0)
  };
}

export function updateTrustScoreForUser(userId) {
  const signals = getUserEconomicSignals(userId);
  const trustScore = calculateTrustScore(signals);

  db.prepare('UPDATE users SET trust_score = ? WHERE id = ?').run(trustScore, userId);

  return {
    trustScore,
    signals
  };
}

export function handlePaymentSuccess({ userId }) {
  if (!userId) return null;
  return updateTrustScoreForUser(userId);
}
