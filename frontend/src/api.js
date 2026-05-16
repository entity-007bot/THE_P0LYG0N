const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Request failed. Check backend connectivity.');
  }
  return data;
}

export function onboardWorker(payload) {
  return request('/onboard', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function getDashboard(userId) {
  return request(`/dashboard/${userId}`);
}

export function getHealth() {
  return request('/health');
}

export function getJobs() {
  return request('/jobs');
}

export function createDeposit(jobId, userId) {
  return request(`/jobs/${jobId}/deposit`, {
    method: 'POST',
    body: JSON.stringify({ userId })
  });
}

export function createJob(payload) {
  return request('/jobs', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function mockPayment(userId, amount) {
  return request('/demo/mock-payment', {
    method: 'POST',
    body: JSON.stringify({ userId, amount })
  });
}

export function verifyCompletion({ jobId, userId, imagePath, expectedWorkType, bankCode }) {
  return request(`/jobs/${jobId}/verify-completion`, {
    method: 'POST',
    body: JSON.stringify({ userId, imagePath, expectedWorkType, bankCode })
  });
}

export function getAdminInsights() {
  return request('/admin/insights');
}

export function getImpact() {
  return request('/admin/impact');
}

export function getControlPanel() {
  return request('/admin/control-panel');
}

export function getLgaHeatmap(lga = 'otuoke') {
  const params = new URLSearchParams({ lga });
  return request(`/v1/intelligence/heatmap?${params.toString()}`);
}

export function getSquadStatus() {
  return request('/squad/status');
}

export function getEcosystemIntegrations() {
  return request('/ecosystem');
}

export function getToolWorkspace(toolId, { userId, query } = {}) {
  const params = new URLSearchParams();
  if (userId) params.set('userId', userId);
  if (query) params.set('q', query);
  const suffix = params.toString() ? `?${params.toString()}` : '';
  return request(`/tools/${encodeURIComponent(toolId)}${suffix}`);
}

export function runToolAction(toolId, payload) {
  return request(`/tools/${encodeURIComponent(toolId)}/actions`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function sendMatchFeedback({ jobId, userId, action, rating, notes }) {
  return request(`/matches/${jobId}/feedback`, {
    method: 'POST',
    body: JSON.stringify({ userId, action, rating, notes })
  });
}

export function processVoiceIntent(transcript, userId) {
  return request('/voice/callback', {
    method: 'POST',
    body: JSON.stringify({ transcript, userId })
  });
}

export function processVoiceText(transcript, userId) {
  return request('/voice/process', {
    method: 'POST',
    body: JSON.stringify({ transcript, userId })
  });
}

export function verifyBankDetails({ accountNumber, bankCode }) {
  return request('/squad/verify-account', {
    method: 'POST',
    body: JSON.stringify({ accountNumber, bankCode })
  });
}

export function verifySquadTransaction(transactionRef) {
  return request(`/squad/verify-transaction/${transactionRef}`);
}

export function reQueryTransfer(reference) {
  return request('/squad/re-query-transfer', {
    method: 'POST',
    body: JSON.stringify({ reference })
  });
}

export function createDynamicVirtualAccountPool(payload) {
  return request('/squad/dynamic-virtual-accounts/pool', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function initiateDynamicVirtualAccount(payload) {
  return request('/squad/dynamic-virtual-accounts/initiate', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateDynamicVirtualAccount(payload) {
  return request('/squad/dynamic-virtual-accounts', {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export function getDynamicVirtualAccountStatus(transactionRef) {
  return request(`/squad/dynamic-virtual-accounts/${transactionRef}`);
}

export function createSavingsGroup(payload) {
  return request('/savings-groups', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function createBatchPayout(payload) {
  return request('/batch-payouts', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
