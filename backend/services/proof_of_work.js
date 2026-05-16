import fs from 'node:fs';
import path from 'node:path';

let classifierPromise;

async function getClassifier() {
  if (!classifierPromise) {
    classifierPromise = import('@xenova/transformers')
      .then(({ pipeline, env }) => {
        env.allowRemoteModels = false;
        env.allowLocalModels = true;
        return pipeline('image-classification', 'Xenova/vit-base-patch16-224');
      })
      .catch(() => null);
  }
  return classifierPromise;
}

function normalizeTokens(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export async function classifyUploadedJobPhoto({ imagePath, expectedWorkType = '', minimumScore = 0.25 }) {
  if (!imagePath || !fs.existsSync(imagePath)) {
    return {
      verified: false,
      confidence: 0,
      labels: [],
      reason: 'Photo file was not found on the device.'
    };
  }

  const classifier = await getClassifier();
  if (classifier) {
    try {
      const labels = await classifier(imagePath);
      const expectedTokens = normalizeTokens(expectedWorkType);
      const bestMatch = labels.find((label) => {
        const labelTokens = normalizeTokens(label.label);
        return expectedTokens.some((token) => labelTokens.includes(token));
      });

      return {
        verified: Boolean(bestMatch && bestMatch.score >= minimumScore),
        confidence: Number((bestMatch?.score || labels[0]?.score || 0).toFixed(4)),
        labels,
        reason: bestMatch ? 'Computer vision label matched expected work type.' : 'No image label matched expected work type.'
      };
    } catch {
      // Fall through to deterministic offline check.
    }
  }

  const fileTokens = normalizeTokens(path.basename(imagePath));
  const expectedTokens = normalizeTokens(expectedWorkType);
  const overlap = expectedTokens.filter((token) => fileTokens.includes(token));
  const confidence = expectedTokens.length ? overlap.length / expectedTokens.length : 0.1;

  return {
    verified: confidence >= 0.35,
    confidence: Number(confidence.toFixed(4)),
    labels: fileTokens.map((token) => ({ label: token, score: 0.1 })),
    reason: classifier
      ? 'Computer vision failed; used local metadata fallback.'
      : 'Vision model unavailable offline; used local metadata fallback.'
  };
}
