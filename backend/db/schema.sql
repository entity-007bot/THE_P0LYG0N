PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  skills TEXT NOT NULL,
  city TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'English',
  preferred_access_mode TEXT NOT NULL DEFAULT 'app',
  voice_notes TEXT DEFAULT '',
  economic_context TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  vector_data BLOB,
  identity_type TEXT DEFAULT '',
  identity_number_last4 TEXT DEFAULT '',
  identity_provider TEXT DEFAULT '',
  identity_status TEXT NOT NULL DEFAULT 'unverified',
  identity_confidence REAL NOT NULL DEFAULT 0,
  verified_full_name TEXT DEFAULT '',
  verified_date_of_birth TEXT DEFAULT '',
  verified_photo_url TEXT DEFAULT '',
  identity_verified_at TEXT,
  squad_customer_identifier TEXT UNIQUE,
  squad_account_number TEXT,
  virtual_account_number TEXT,
  virtual_account_bank TEXT,
  virtual_account_name TEXT,
  wallet_balance_kobo INTEGER NOT NULL DEFAULT 0,
  trust_score FLOAT NOT NULL DEFAULT 42,
  completed_jobs INTEGER NOT NULL DEFAULT 0,
  successful_payments INTEGER NOT NULL DEFAULT 0,
  growth_vault_kobo INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  employer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  worker_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  city TEXT NOT NULL,
  budget_kobo INTEGER NOT NULL,
  required_skill TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  match_score REAL NOT NULL,
  reasons TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, job_id)
);

CREATE TABLE IF NOT EXISTS squad_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  job_id TEXT REFERENCES jobs(id) ON DELETE SET NULL,
  transaction_ref TEXT NOT NULL UNIQUE,
  squad_reference TEXT,
  amount_kobo INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  escrow_status TEXT NOT NULL DEFAULT 'holding',
  type TEXT NOT NULL,
  checkout_url TEXT,
  raw_payload TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS savings_ledger (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_id TEXT REFERENCES squad_transactions(id) ON DELETE SET NULL,
  gross_amount_kobo INTEGER NOT NULL,
  vault_amount_kobo INTEGER NOT NULL,
  worker_amount_kobo INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS proof_of_work_verifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  expected_work_type TEXT NOT NULL,
  verified INTEGER NOT NULL DEFAULT 0,
  confidence REAL NOT NULL DEFAULT 0,
  labels TEXT NOT NULL DEFAULT '[]',
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS match_feedback (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  rating INTEGER,
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_transactions_ref ON squad_transactions(transaction_ref);
CREATE INDEX IF NOT EXISTS idx_pow_user_job ON proof_of_work_verifications(user_id, job_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_job ON match_feedback(user_id, job_id);

CREATE TABLE IF NOT EXISTS identity_verifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  identity_type TEXT NOT NULL,
  identity_number_last4 TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  confidence REAL NOT NULL DEFAULT 0,
  verified_full_name TEXT DEFAULT '',
  verified_date_of_birth TEXT DEFAULT '',
  verified_photo_url TEXT DEFAULT '',
  raw_payload TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_identity_user ON identity_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_identity_status ON identity_verifications(status);

CREATE TABLE IF NOT EXISTS batch_payouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  batch_id TEXT UNIQUE NOT NULL,
  transaction_count INTEGER,
  total_amount INTEGER,
  squad_ref TEXT,
  status TEXT DEFAULT 'PENDING',
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS batch_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  batch_id TEXT NOT NULL,
  job_id INTEGER,
  worker_id INTEGER,
  amount INTEGER,
  status TEXT DEFAULT 'PENDING',
  squad_ref TEXT,
  FOREIGN KEY (batch_id) REFERENCES batch_payouts(batch_id),
  FOREIGN KEY (worker_id) REFERENCES users(id),
  FOREIGN KEY (job_id) REFERENCES jobs(id)
);

CREATE TABLE IF NOT EXISTS savings_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  total_weekly_kobo INTEGER NOT NULL DEFAULT 0,
  duration_weeks INTEGER NOT NULL DEFAULT 12,
  payout_type TEXT NOT NULL DEFAULT 'ROTATIONAL',
  squad_reference TEXT,
  account_number TEXT,
  raw_payload TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lender_offers (
  id TEXT PRIMARY KEY,
  lender_name TEXT NOT NULL,
  min_kiscore INTEGER NOT NULL DEFAULT 500,
  max_loan_kobo INTEGER NOT NULL,
  interest_rate_percent REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS insurance_policies (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  policy_number TEXT UNIQUE,
  premium_kobo INTEGER NOT NULL DEFAULT 5000, -- ₦50 Safety Fee
  status TEXT NOT NULL DEFAULT 'INACTIVE',
  activated_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lga_intelligence (
  lga_name TEXT PRIMARY KEY,
  state TEXT NOT NULL DEFAULT 'Bayelsa',
  skill_gap_category TEXT, -- e.g., 'Solar Tech', 'Agri-Logistics'
  active_worker_count INTEGER DEFAULT 0,
  avg_kiscore REAL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
