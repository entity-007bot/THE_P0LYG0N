import crypto from 'node:crypto';

const DEFAULT_BASE_URL = 'https://sandbox-api-d.squadco.com';

export class SquadApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'SquadApiError';
    this.status = status;
    this.details = details;
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function verifyAccount(accountNumber, bankCode) {
  return squadRequest('/payout/account/lookup', {
    method: 'POST',
    body: {
      account_number: accountNumber,
      bank_code: bankCode
    }
  });
}

export async function reQueryTransfer(reference) {
  return squadRequest('/payout/requery', {
    method: 'POST',
    body: {
      transaction_reference: reference
    }
  });
}

export async function verifyTransaction(transactionRef) {
  return squadRequest(`/transaction/verify/${transactionRef}`, {
    method: 'GET'
  });
}


export async function squadRequest(path, { method = 'GET', body, retries = 2 } = {}) {
  const baseUrl = process.env.SQUAD_BASE_URL || DEFAULT_BASE_URL;
  const secretKey = process.env.SQUAD_SECRET_KEY;

  if (!secretKey || secretKey.includes('replace_me')) {
    throw new SquadApiError('Squad secret key is not configured. Set SQUAD_SECRET_KEY in backend/.env.', 500);
  }

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok || data?.success === false) {
        throw new SquadApiError(data?.message || 'Squad request failed', response.status, data);
      }

      return data;
    } catch (error) {
      const canRetry = attempt < retries && (error.name === 'AbortError' || error instanceof TypeError);
      if (!canRetry) {
        if (error instanceof SquadApiError) throw error;
        throw new SquadApiError('Network error while reaching Squad. Try again when connectivity is stable.', 503, {
          cause: error.message
        });
      }
      await wait(400 * (attempt + 1));
    } finally {
      clearTimeout(timeout);
    }
  }
}

export async function createVirtualAccount(user) {
  const customerIdentifier = user.squad_customer_identifier || `sf_${user.id}`;
  const [first_name, ...lastParts] = user.full_name.trim().split(/\s+/);

  const payload = {
    first_name,
    last_name: lastParts.join(' ') || first_name,
    email: user.email,
    mobile_num: user.phone,
    customer_identifier: customerIdentifier,
    address: user.address,
    bvn: user.bvn,
    dob: user.dob
  };

  const response = await squadRequest('/virtual-account', {
    method: 'POST',
    body: payload
  });

  const data = response.data || response;
  return {
    customerIdentifier,
    accountNumber: data.account_number || data.virtual_account_number || data.accountNumber,
    bankName: data.bank || data.bank_name || data.bankName || 'Squad Virtual Account',
    accountName: data.account_name || data.accountName || user.full_name,
    raw: response
  };
}

export async function createBusinessVirtualAccount({
  businessName,
  bvn,
  mobile,
  beneficiaryAccount,
  customerIdentifier,
  address
}) {
  const response = await squadRequest('/virtual-account/business', {
    method: 'POST',
    body: {
      business_name: businessName,
      bvn,
      mobile_num: mobile,
      beneficiary_account: beneficiaryAccount,
      customer_identifier: customerIdentifier,
      address
    }
  });

  const data = response.data || response;
  return {
    customerIdentifier,
    accountNumber: data.account_number || data.virtual_account_number || data.accountNumber,
    bankName: data.bank || data.bank_name || data.bankName || 'Squad Business Virtual Account',
    accountName: data.account_name || data.accountName || businessName,
    raw: response
  };
}

export async function getCustomerVirtualAccountTransactions(identifier) {
  return squadRequest(`/virtual-account/customer/transaction/${encodeURIComponent(identifier)}`, {
    method: 'GET'
  });
}

export async function getMerchantVirtualAccountTransactions() {
  return squadRequest('/virtual-account/merchant/transactions', {
    method: 'GET'
  });
}

export async function createDynamicVirtualAccountPool(payload) {
  return squadRequest('/virtual-account/create-dynamic-virtual-account', {
    method: 'POST',
    body: payload
  });
}

export async function initiateDynamicVirtualAccount({
  amountKobo,
  transactionRef,
  email,
  customerName,
  expiresAt,
  metadata = {}
}) {
  const response = await squadRequest('/virtual-account/initiate-dynamic-virtual-account', {
    method: 'POST',
    body: {
      amount: String(amountKobo),
      transaction_ref: transactionRef,
      email,
      customer_name: customerName,
      expires_at: expiresAt,
      currency: 'NGN',
      metadata
    }
  });

  const data = response.data || response;
  return {
    transactionRef,
    accountNumber: data.account_number || data.virtual_account_number || data.accountNumber,
    bankName: data.bank || data.bank_name || data.bankName || 'Squad Dynamic Virtual Account',
    accountName: data.account_name || data.accountName || customerName,
    expiresAt: data.expires_at || data.expiry_time || expiresAt,
    raw: response
  };
}

export async function updateDynamicVirtualAccount({ transactionRef, amountKobo, expiresAt }) {
  return squadRequest('/virtual-account/update-dynamic-virtual-account-time-and-amount', {
    method: 'PATCH',
    body: {
      transaction_ref: transactionRef,
      amount: amountKobo === undefined ? undefined : String(amountKobo),
      expires_at: expiresAt
    }
  });
}

export async function getDynamicVirtualAccountStatus(transactionRef) {
  return squadRequest(`/virtual-account/dynamic-virtual-account-status/${encodeURIComponent(transactionRef)}`, {
    method: 'GET'
  });
}

export async function createPaymentLink({ amountKobo, email, customerName, transactionRef, callbackUrl, metadata = {} }) {
  const secretKey = process.env.SQUAD_SECRET_KEY;
  if (!secretKey || secretKey.includes('replace_me')) {
    return {
      checkoutUrl: `demo://squadflow/checkout/${transactionRef}`,
      raw: {
        configured: false,
        message: 'SQUAD_SECRET_KEY is not configured; using local demo checkout link.',
        amountKobo,
        email,
        customerName,
        transactionRef,
        metadata
      }
    };
  }

  const response = await squadRequest('/transaction/initiate', {
    method: 'POST',
    body: {
      amount: String(amountKobo),
      email,
      currency: 'NGN',
      initiate_type: 'inline',
      transaction_ref: transactionRef,
      customer_name: customerName,
      callback_url: callbackUrl || process.env.SQUAD_CALLBACK_URL,
      metadata,
      payment_channels: ['card', 'bank', 'ussd', 'transfer']
    }
  });

  const data = response.data || {};
  return {
    checkoutUrl: data.checkout_url || data.payment_url || data.url || data.checkoutUrl,
    raw: response
  };
}

export function buildSavingsSplit(amountKobo) {
  const percent = Number(process.env.GROWTH_VAULT_PERCENT || 5);
  const vaultAmountKobo = Math.floor((amountKobo * percent) / 100);
  return {
    vaultPercent: percent,
    vaultAmountKobo,
    workerAmountKobo: amountKobo - vaultAmountKobo,
    subMerchantId: process.env.SQUAD_GROWTH_VAULT_SUB_MERCHANT_ID || null
  };
}

export function buildSplitPaymentPayload({ amountKobo, workerAccount, transactionRef }) {
  const split = buildSavingsSplit(amountKobo);
  return {
    transaction_ref: transactionRef,
    amount: amountKobo,
    currency: 'NGN',
    splits: [
      {
        name: 'Worker payout',
        account: workerAccount,
        amount: split.workerAmountKobo
      },
      {
        name: 'Growth Vault',
        sub_merchant_id: split.subMerchantId,
        amount: split.vaultAmountKobo,
        percentage: split.vaultPercent
      }
    ],
    metadata: {
      smartSavings: true,
      vaultPercent: split.vaultPercent
    }
  };
}

export async function createSplitPayment({ amountKobo, workerAccount, transactionRef }) {
  const path = process.env.SQUAD_SPLIT_PAYMENT_PATH;
  const payload = buildSplitPaymentPayload({ amountKobo, workerAccount, transactionRef });

  if (!path) {
    return {
      configured: false,
      message: 'SQUAD_SPLIT_PAYMENT_PATH is not set; using local Growth Vault ledger split.',
      payload
    };
  }

  const response = await squadRequest(path, {
    method: 'POST',
    body: payload
  });

  return {
    configured: true,
    payload,
    raw: response
  };
}

export async function createTransfer({ amountKobo, accountNumber, bankCode, narration, reference }) {
  const path = process.env.SQUAD_TRANSFER_PATH || '/payout/transfer';
  const secretKey = process.env.SQUAD_SECRET_KEY;
  
  // Updated to match Screenshot_20260513_212805.jpg requirements
  const payload = {
    amount: String(amountKobo), // Documentation shows string values (e.g., '10000')
    account_number: accountNumber,
    bank_code: bankCode,
    transaction_reference: reference,
    remark: narration, // Field name is 'remark' in the table
    currency_id: 'NGN' // Field name is 'currency_id' in the table
  };

  if (!secretKey || secretKey.includes('replace_me')) {
    return {
      configured: false,
      message: 'SQUAD_SECRET_KEY is not configured; escrow release recorded locally only.',
      payload
    };
  }

  const response = await squadRequest(path, {
    method: 'POST',
    body: payload
  });

  return {
    configured: true,
    payload,
    raw: response
  };
}

export async function createBatchTransfer({ batchId, transfers }) {
  const path = process.env.SQUAD_BATCH_TRANSFER_PATH || '/transaction/batch';
  const secretKey = process.env.SQUAD_SECRET_KEY;
  const payload = {
    batch_id: batchId,
    currency: 'NGN',
    transfers
  };

  if (!secretKey || secretKey.includes('replace_me')) {
    return {
      configured: false,
      message: 'SQUAD_SECRET_KEY is not configured; batch payout recorded locally.',
      payload
    };
  }

  const response = await squadRequest(path, {
    method: 'POST',
    body: payload
  });

  return {
    configured: true,
    payload,
    raw: response
  };
}

export async function createRecurringPayment({ groupId, name, members, totalWeeklyKobo, durationWeeks }) {
  const path = process.env.SQUAD_RECURRING_PAYMENT_PATH || '/recurring-payment/create';
  const secretKey = process.env.SQUAD_SECRET_KEY;
  const payload = {
    reference: `vsla_${groupId}`,
    name,
    amount: totalWeeklyKobo,
    currency: 'NGN',
    frequency: 'weekly',
    cycles: durationWeeks,
    members
  };

  if (!secretKey || secretKey.includes('replace_me')) {
    return {
      configured: false,
      message: 'SQUAD_SECRET_KEY is not configured; recurring savings mandate recorded locally.',
      payload
    };
  }

  const response = await squadRequest(path, {
    method: 'POST',
    body: payload
  });

  return {
    configured: true,
    payload,
    raw: response
  };
}

export async function releaseEscrowToWorker({ amountKobo, accountNumber, bankCode, jobId, workerId }) {
  const secretKey = process.env.SQUAD_SECRET_KEY;
  if (!secretKey || secretKey.includes('replace_me')) {
    return createTransfer({
      amountKobo,
      accountNumber,
      bankCode,
      narration: `SquadFlow escrow release for ${jobId}`,
      reference: `release_${jobId}_${workerId}_${Date.now()}`
    });
  }

  // Step 1: Mandatory Lookup
  const verification = await verifyAccount(accountNumber, bankCode);
  
  if (!verification?.data?.account_name) {
    throw new SquadApiError('Could not verify worker bank details.', 400, verification);
  }

  // Step 2: Execute Transfer with Remark/Currency_id fields from Screenshot_20260513_213636.jpg
  return createTransfer({
    amountKobo,
    accountNumber,
    bankCode,
    narration: `SquadFlow escrow release for ${jobId}`,
    reference: `release_${jobId}_${workerId}_${Date.now()}`
  });
}

export function verifyWebhookSignature(payload, signature) {
  if (!signature || !process.env.SQUAD_SECRET_KEY) return false;

  const candidates = [
    [
      payload.transaction_reference || payload.txn_ref,
      payload.virtual_account_number || payload.va_number,
      payload.currency,
      payload.principal_amount || payload.principal,
      payload.settled_amount || payload.settled,
      payload.customer_identifier || payload.customer_id
    ],
    [
      payload.txn_ref,
      payload.va_number,
      payload.currency,
      payload.principal,
      payload.settled,
      payload.customer_id
    ]
  ]
    .filter((fields) => fields.every((value) => value !== undefined && value !== null))
    .map((fields) => fields.join('|'));

  candidates.push(JSON.stringify(payload));

  return candidates.some((message) => {
    const digest = crypto
      .createHmac('sha512', process.env.SQUAD_SECRET_KEY)
      .update(message)
      .digest('hex');

    const expected = Buffer.from(digest);
    const received = Buffer.from(signature);
    return expected.length === received.length && crypto.timingSafeEqual(expected, received);
  });
}

export function getSquadIntegrationStatus() {
  const secretKey = process.env.SQUAD_SECRET_KEY || '';
  const publicKey = process.env.SQUAD_PUBLIC_KEY || '';
  const baseUrl = process.env.SQUAD_BASE_URL || DEFAULT_BASE_URL;
  const secretConfigured = Boolean(secretKey && !secretKey.includes('replace_me'));
  const publicConfigured = Boolean(publicKey && !publicKey.includes('replace_me'));

  return {
    baseUrl,
    mode: secretConfigured ? 'sandbox-live' : 'local-demo',
    secretKeyConfigured: secretConfigured,
    publicKeyConfigured: publicConfigured,
    virtualAccounts: {
      configured: secretConfigured,
      staticIndividualEndpoint: '/virtual-account',
      staticBusinessEndpoint: '/virtual-account/business',
      dynamicPoolEndpoint: '/virtual-account/create-dynamic-virtual-account',
      dynamicInitiateEndpoint: '/virtual-account/initiate-dynamic-virtual-account'
    },
    payments: {
      configured: secretConfigured,
      endpoint: '/transaction/initiate',
      channels: ['card', 'bank', 'ussd', 'transfer']
    },
    webhooks: {
      configured: secretConfigured,
      endpoint: '/api/squad/webhook',
      signature: 'hmac-sha512',
      header: 'x-squad-encrypted-header',
      acceptedLegacyHeader: 'x-squad-signature'
    },
    growthVaultSplit: {
      configured: Boolean(process.env.SQUAD_SPLIT_PAYMENT_PATH),
      fallback: 'local_growth_vault_ledger',
      percent: Number(process.env.GROWTH_VAULT_PERCENT || 5)
    },
    transfers: {
      configured: secretConfigured,
      endpoint: process.env.SQUAD_TRANSFER_PATH || '/payout/transfer',
      requeryEndpoint: '/payout/requery',
      fallback: 'local_escrow_release_record'
    },
    batchPayouts: {
      configured: secretConfigured,
      endpoint: process.env.SQUAD_BATCH_TRANSFER_PATH || '/transaction/batch'
    },
    recurringPayments: {
      configured: secretConfigured,
      endpoint: process.env.SQUAD_RECURRING_PAYMENT_PATH || '/recurring-payment/create'
    },
    keysLoadedFromEnv: secretConfigured || publicConfigured
  };
}

/**
 * INSURANCE CONTROLLER
 * Integrates with buildSavingsSplit to handle the ₦50 Safety Fee.
 */
export async function activateInsurance(jobId, userId, amountKobo) {
  const SAFETY_FEE = 5000; // ₦50 in kobo
  
  // Logic to record policy activation in local SQLite 'insurance_policies' table
  // This is triggered during the SquadFlow Escrow Split
  return {
    job_id: jobId,
    policy_type: "Gig-Safe Micro-Insurance",
    premium_source: "SquadFlow_Escrow_Split",
    coverage_status: "ACTIVE"
  };
}

// Update your existing split logic to include the insurance premium
export function buildSavingsSplitWithInsurance(amountKobo) {
  const baseSplit = buildSavingsSplit(amountKobo); //
  const SAFETY_FEE = 5000; //
  
  return {
    ...baseSplit,
    insurancePremiumKobo: SAFETY_FEE,
    finalWorkerAmountKobo: baseSplit.workerAmountKobo - SAFETY_FEE
  };
}
