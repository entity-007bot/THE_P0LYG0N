let extractorPromise;

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function fallbackVector(text) {
  const vector = new Array(128).fill(0);
  for (const token of normalize(text)) {
    let hash = 0;
    for (let i = 0; i < token.length; i += 1) {
      hash = (hash * 31 + token.charCodeAt(i)) >>> 0;
    }
    vector[hash % vector.length] += 1;
  }
  return vector;
}

async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = import('@xenova/transformers')
      .then(({ pipeline, env }) => {
        env.allowRemoteModels = false;
        env.allowLocalModels = true;
        return pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      })
      .catch(() => null);
  }
  return extractorPromise;
}

export async function embedText(text) {
  const extractor = await getExtractor();
  if (!extractor) return fallbackVector(text);

  try {
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  } catch {
    return fallbackVector(text);
  }
}

export function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function rankJobsForWorker(worker, jobs) {
  const workerProfile = `${worker.skills}. ${worker.bio}. ${worker.city}`;
  const workerEmbedding = await embedText(workerProfile);

  const ranked = [];
  for (const job of jobs) {
    const jobEmbedding = await embedText(`${job.title}. ${job.description}. ${job.city}`);
    const semanticScore = cosineSimilarity(workerEmbedding, jobEmbedding);
    const cityBoost = worker.city.toLowerCase() === job.city.toLowerCase() ? 0.08 : 0;
    const matchScore = Math.max(0, Math.min(0.99, semanticScore + cityBoost));
    ranked.push({
      ...job,
      match_score: Number(matchScore.toFixed(4)),
      match_percent: Math.round(matchScore * 100),
      reasons: buildReasons(worker, job, matchScore, cityBoost)
    });
  }

  return ranked.sort((a, b) => b.match_score - a.match_score);
}

function buildReasons(worker, job, score, cityBoost) {
  const workerTerms = new Set(normalize(worker.skills));
  const overlap = normalize(`${job.title} ${job.description}`).filter((term) => workerTerms.has(term));
  const reasons = [];

  if (overlap.length > 0) reasons.push(`Shared skill terms: ${[...new Set(overlap)].slice(0, 4).join(', ')}`);
  if (cityBoost) reasons.push(`Same-city opportunity in ${job.city}`);
  if (score >= 0.65) reasons.push('Strong semantic fit for the worker profile');
  if (reasons.length === 0) reasons.push('Exploratory match based on related work description');

  return reasons.join('. ');
}

export function calculateKiScore(user, latestPaymentKobo = 0) {
  const paymentPoints = Math.min(24, user.successful_payments * 4);
  const jobPoints = Math.min(20, user.completed_jobs * 5);
  const vaultPoints = Math.min(16, Math.floor(user.growth_vault_kobo / 500000));
  const latestPaymentPoints = Math.min(8, Math.floor(latestPaymentKobo / 1000000));
  return Math.max(35, Math.min(96, 42 + paymentPoints + jobPoints + vaultPoints + latestPaymentPoints));
}
