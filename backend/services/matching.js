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
        // Inside getExtractor()
        env.localModelPath = './models/'; 
        env.allowRemoteModels = false;
        env.allowLocalModels = true;

        return pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      })
      .catch(() => null);
  }
  return extractorPromise;
}

export async function generateUserEmbedding(profileText) {
  const extractor = await getExtractor();
  if (!extractor) return fallbackVector(profileText);

  try {
    const output = await extractor(profileText, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  } catch {
    return fallbackVector(profileText);
  }
}

export async function generateJobEmbedding(job) {
  return generateUserEmbedding(`${job.title}. ${job.description}. ${job.city}. ${job.language || ''}. ${job.economic_context || ''}`);
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

export async function findJobMatches(workerVector, jobList) {
  const matches = [];

  for (const job of jobList) {
    const jobVector = await generateJobEmbedding(job);
    const score = cosineSimilarity(workerVector, jobVector);
    matches.push({
      ...job,
      match_score: Number(score.toFixed(4)),
      match_percent: Math.round(score * 100)
    });
  }

  return matches.sort((a, b) => b.match_score - a.match_score);
}

export async function rankJobsForWorker(worker, jobs) {
  // 1. Safety check: If worker is undefined or missing data, return unboosted matches or empty
  if (!worker) return [];

  const workerVector = worker.vector_data
    ? vectorFromBlob(worker.vector_data)
    : await generateUserEmbedding(`${worker.skills || ''}. ${worker.bio || ''}. ${worker.city || ''}.`);

  const ranked = await findJobMatches(workerVector, jobs);

  return ranked.map((job) => {
    // 2. Use optional chaining and fallbacks for worker.city
    const workerCity = String(worker.city || '').toLowerCase();
    const jobCity = String(job.city || '').toLowerCase();
    
    const cityBoost = (workerCity && jobCity && workerCity === jobCity) ? 0.08 : 0;

    const languageBoost = languageCompatible(worker.language, job.description) ? 0.03 : 0;
    const contextBoost = contextOverlap(worker.economic_context, `${job.title} ${job.description}`) ? 0.04 : 0;
    const boostedScore = Math.max(0, Math.min(0.99, job.match_score + cityBoost + languageBoost + contextBoost));

    return {
      ...job,
      match_score: Number(boostedScore.toFixed(4)),
      match_percent: Math.round(boostedScore * 100),
      reasons: buildReasons(worker, job, boostedScore, cityBoost, languageBoost, contextBoost)
    };
  }).sort((a, b) => b.match_score - a.match_score);
}

export function vectorToBlob(vector) {
  return Buffer.from(JSON.stringify(vector));
}

export function vectorFromBlob(blob) {
  if (!blob) return null;
  return JSON.parse(Buffer.from(blob).toString('utf8'));
}

function languageCompatible(language, jobText) {
  if (!language) return false;
  return normalize(jobText).includes(String(language).toLowerCase());
}

function contextOverlap(context, jobText) {
  const contextTerms = new Set(normalize(context));
  if (contextTerms.size === 0) return false;
  return normalize(jobText).some((term) => contextTerms.has(term));
}

function buildReasons(worker, job, score, cityBoost, languageBoost, contextBoost) {
  const workerTerms = new Set(normalize(worker.skills));
  const overlap = normalize(`${job.title} ${job.description}`).filter((term) => workerTerms.has(term));
  const reasons = [];

  if (overlap.length > 0) reasons.push(`Shared skill terms: ${[...new Set(overlap)].slice(0, 4).join(', ')}`);
  if (cityBoost) reasons.push(`Same-city opportunity in ${job.city}`);
  if (languageBoost) reasons.push(`Language fit for ${worker.language}`);
  if (contextBoost) reasons.push('Economic context fit');
  if (score >= 0.65) reasons.push('Strong semantic fit for the worker profile');
  if (reasons.length === 0) reasons.push('Semantic match based on related work meaning');

  return reasons.join('. ');
}
