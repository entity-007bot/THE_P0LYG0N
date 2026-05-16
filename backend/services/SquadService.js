import {
  buildSavingsSplit,
  buildSplitPaymentPayload,
  createPaymentLink,
  createSplitPayment,
  createBusinessVirtualAccount,
  createDynamicVirtualAccountPool,
  getCustomerVirtualAccountTransactions,
  getDynamicVirtualAccountStatus,
  getMerchantVirtualAccountTransactions,
  initiateDynamicVirtualAccount,
  updateDynamicVirtualAccount,
  createTransfer,
  createBatchTransfer,
  createRecurringPayment,
  createVirtualAccount,
  releaseEscrowToWorker,
  squadRequest,
  verifyAccount,
  verifyTransaction,
  reQueryTransfer,
  verifyWebhookSignature
} from './squad.js';

export class SquadService {
  request(path, options) {
    return squadRequest(path, options);
  }

  createVirtualAccount(user) {
    return createVirtualAccount(user);
  }

  createBusinessVirtualAccount(payload) {
    return createBusinessVirtualAccount(payload);
  }

  getCustomerVirtualAccountTransactions(identifier) {
    return getCustomerVirtualAccountTransactions(identifier);
  }

  getMerchantVirtualAccountTransactions() {
    return getMerchantVirtualAccountTransactions();
  }

  createDynamicVirtualAccountPool(payload) {
    return createDynamicVirtualAccountPool(payload);
  }

  initiateDynamicVirtualAccount(payload) {
    return initiateDynamicVirtualAccount(payload);
  }

  updateDynamicVirtualAccount(payload) {
    return updateDynamicVirtualAccount(payload);
  }

  getDynamicVirtualAccountStatus(transactionRef) {
    return getDynamicVirtualAccountStatus(transactionRef);
  }

  createPaymentLink(payload) {
    return createPaymentLink(payload);
  }

  buildSavingsSplit(amountKobo) {
    return buildSavingsSplit(amountKobo);
  }

  buildSplitPaymentPayload(payload) {
    return buildSplitPaymentPayload(payload);
  }

  createSplitPayment(payload) {
    return createSplitPayment(payload);
  }

  createTransfer(payload) {
    return createTransfer(payload);
  }

  createBatchTransfer(payload) {
    return createBatchTransfer(payload);
  }

  createRecurringPayment(payload) {
    return createRecurringPayment(payload);
  }

  releaseEscrowToWorker(payload) {
    return releaseEscrowToWorker(payload);
  }

  verifyWebhookSignature(payload, signature) {
    return verifyWebhookSignature(payload, signature);
  }
  
    verifyAccount(accountNumber, bankCode) {
    return verifyAccount(accountNumber, bankCode);
  }

  reQueryTransfer(reference) {
    return reQueryTransfer(reference);
  }

  verifyTransaction(transactionRef) {
    return verifyTransaction(transactionRef);
  }
  
}

export {
  buildSavingsSplit,
  buildSplitPaymentPayload,
  createPaymentLink,
  createSplitPayment,
  createBusinessVirtualAccount,
  createDynamicVirtualAccountPool,
  getCustomerVirtualAccountTransactions,
  getDynamicVirtualAccountStatus,
  getMerchantVirtualAccountTransactions,
  initiateDynamicVirtualAccount,
  updateDynamicVirtualAccount,
  createTransfer,
  createBatchTransfer,
  createRecurringPayment,
  createVirtualAccount,
  releaseEscrowToWorker,
  squadRequest,
  verifyWebhookSignature
};

export default new SquadService();
