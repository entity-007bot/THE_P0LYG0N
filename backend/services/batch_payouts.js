import axios from 'axios';
import crypto from 'crypto';

class BatchPayoutService {
  constructor() {
    this.squadBaseUrl = process.env.SQUAD_BASE_URL || 'https://sandbox-api-d.squadco.com';
    this.apiKey = process.env.SQUAD_SECRET_KEY;
  }

  async batchPayWorkers(completions) {
    const batchId = `batch_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    
    const transactions = completions.map(job => ({
      amount: job.workerPayout,
      currency: 'NGN',
      recipient_account: job.squadVirtualAccountId,
      recipient_name: job.workerName,
      narration: `Payment for job ${job.jobId}`,
      reference: `${batchId}_${job.jobId}`
    }));

    try {
      // Squad batch transfer endpoint (adjust based on actual Squad API docs)
      const response = await axios.post(
        `${this.squadBaseUrl}/transaction/batch`,
        {
          batch_id: batchId,
          transactions: transactions,
          callback_url: `${process.env.BASE_URL}/api/webhooks/batch-callback`
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Log batch for reconciliation
      await this.logBatchTransaction(batchId, transactions, response.data);
      
      return {
        success: true,
        batchId: batchId,
        transactionCount: transactions.length,
        totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
        squadReference: response.data.reference
      };
    } catch (error) {
      console.error('Batch payout failed:', error.response?.data || error.message);
      throw new Error(`Batch payout failed: ${error.message}`);
    }
  }

  async logBatchTransaction(batchId, transactions, squadResponse) {
    const db = require('../db/database');
    await db.run(`
      INSERT INTO batch_payouts (batch_id, transaction_count, total_amount, squad_ref, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [batchId, transactions.length, transactions.reduce((s, t) => s + t.amount, 0), 
         squadResponse.reference, 'PENDING', Date.now()]);
  }

  async getBatchStatus(batchId) {
    const db = require('../db/database');
    const batch = await db.get(
      'SELECT * FROM batch_payouts WHERE batch_id = ?',
      [batchId]
    );
    
    const transactions = await db.all(
      'SELECT * FROM batch_transactions WHERE batch_id = ?',
      [batchId]
    );
    
    return { batch, transactions };
  }
}

export default new BatchPayoutService();