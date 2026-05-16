import axios from 'axios';
import crypto from 'crypto';

class SavingsGroupService {
  constructor() {
    this.squadBaseUrl = process.env.SQUAD_BASE_URL || 'https://sandbox-api-d.squadco.com';
    this.apiKey = process.env.SQUAD_SECRET_KEY;
  }

  async createSavingsGroup(groupName, members, weeklyAmount, durationWeeks = 12) {
    const groupId = `VSLA_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    
    // Create group wallet (Squad virtual account for the pool)
    const groupWallet = await axios.post(
      `${this.squadBaseUrl}/virtual-account`,
      {
        name: `${groupName}_Pool`,
        email: `${groupId}@squadflow.ai`,
        metadata: {
          type: 'savings_pool',
          group_id: groupId,
          is_vsla: true
        }
      },
      {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      }
    );

    // Create recurring payment mandates for each member
    const mandates = await Promise.all(
      members.map(async (member) => {
        try {
          const mandate = await axios.post(
            `${this.squadBaseUrl}/recurring-payment/create`,
            {
              customer_id: member.squadCustomerId,
              amount: weeklyAmount,
              currency: 'NGN',
              frequency: 'WEEKLY',
              start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              end_date: new Date(Date.now() + durationWeeks * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              description: `${groupName} weekly savings contribution`,
              destination_account: groupWallet.data.account_number,
              callback_url: `${process.env.BASE_URL}/api/webhooks/savings-contribution`
            },
            {
              headers: { 'Authorization': `Bearer ${this.apiKey}` }
            }
          );
          
          return {
            memberId: member.userId,
            mandateId: mandate.data.mandate_id,
            status: 'ACTIVE'
          };
        } catch (error) {
          console.error(`Failed to create mandate for ${member.userId}:`, error.message);
          return {
            memberId: member.userId,
            error: error.message,
            status: 'FAILED'
          };
        }
      })
    );

    // Store group data
    await this.storeSavingsGroup(groupId, groupName, groupWallet.data, members, weeklyAmount, mandates);
    
    return {
      groupId,
      groupAccountNumber: groupWallet.data.account_number,
      mandates: mandates.filter(m => m.status === 'ACTIVE'),
      failedMandates: mandates.filter(m => m.status === 'FAILED'),
      totalWeeklyCollection: weeklyAmount * members.length
    };
  }

  async storeSavingsGroup(groupId, name, wallet, members, amount, mandates) {
    const db = require('../db/database');
    await db.run(`
      INSERT INTO savings_groups (group_id, name, account_number, weekly_amount, total_members, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [groupId, name, wallet.account_number, amount, members.length, 'ACTIVE', Date.now()]);
    
    for (const member of members) {
      const mandate = mandates.find(m => m.memberId === member.userId);
      await db.run(`
        INSERT INTO savings_group_members (group_id, user_id, squad_mandate_id, status, joined_at)
        VALUES (?, ?, ?, ?, ?)
      `, [groupId, member.userId, mandate?.mandateId || null, mandate?.status || 'PENDING', Date.now()]);
    }
  }

  async processPayout(groupId, payoutType = 'ROTATIONAL') {
    const db = require('../db/database');
    
    // Get group and members
    const group = await db.get('SELECT * FROM savings_groups WHERE group_id = ?', [groupId]);
    const members = await db.all(`
      SELECT sg.*, u.name, u.phone 
      FROM savings_group_members sg
      JOIN users u ON sg.user_id = u.id
      WHERE sg.group_id = ? AND sg.status = 'ACTIVE'
    `, [groupId]);
    
    if (payoutType === 'ROTATIONAL') {
      // Rotating savings: each member takes full pool in rotation
      const nextRecipient = members.find(m => !m.has_received_payout);
      if (!nextRecipient) {
        // Cycle complete, reset
        await db.run('UPDATE savings_group_members SET has_received_payout = 0 WHERE group_id = ?', [groupId]);
        const resetRecipient = members[0];
        return await this.distributePayout(group, resetRecipient, members.length);
      }
      return await this.distributePayout(group, nextRecipient, members.length);
    } else {
      // Equal share payout
      const shareAmount = Math.floor(group.total_savings / members.length);
      const payouts = await Promise.all(
        members.map(member => this.sendPayoutToMember(member, shareAmount))
      );
      return { type: 'EQUAL_SHARE', payouts };
    }
  }

  async distributePayout(group, recipient, totalMembers) {
    const payoutAmount = group.total_savings;
    const squadTransfer = await axios.post(
      `${this.squadBaseUrl}/transfer`,
      {
        amount: payoutAmount,
        currency: 'NGN',
        recipient_account: recipient.squad_account_id,
        narration: `VSLA ${group.name} payout to ${recipient.name}`,
        reference: `vsla_${group.group_id}_${Date.now()}`
      },
      {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      }
    );
    
    const db = require('../db/database');
    await db.run(`
      UPDATE savings_group_members SET has_received_payout = 1, last_payout_date = ?
      WHERE group_id = ? AND user_id = ?
    `, [Date.now(), group.group_id, recipient.userId]);
    
    return {
      recipient: recipient.name,
      amount: payoutAmount,
      transactionRef: squadTransfer.data.reference,
      remainingMembers: totalMembers - 1
    };
  }

  async sendPayoutToMember(member, amount) {
    const squadTransfer = await axios.post(
      `${this.squadBaseUrl}/transfer`,
      {
        amount: amount,
        currency: 'NGN',
        recipient_account: member.squad_account_id,
        narration: `Savings group payout`
      },
      {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      }
    );
    return { memberId: member.user_id, amount, reference: squadTransfer.data.reference };
  }
}

export default new SavingsGroupService();