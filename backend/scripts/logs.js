#!/usr/bin/env node

import { db } from '../db/index.js';

const rows = db.prepare(`
  SELECT transaction_ref, type, status, escrow_status, amount_kobo, updated_at
  FROM squad_transactions
  ORDER BY updated_at DESC
  LIMIT 20
`).all();

if (!rows.length) {
  console.log('No SquadFlow transaction logs yet.');
  process.exit(0);
}

console.table(rows.map((row) => ({
  reference: row.transaction_ref,
  type: row.type,
  status: row.status,
  escrow: row.escrow_status,
  amount: `NGN ${Math.round(Number(row.amount_kobo || 0) / 100).toLocaleString('en-NG')}`,
  updated: row.updated_at
})));
