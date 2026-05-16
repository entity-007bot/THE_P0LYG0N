import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'squadflow.sqlite');
const schemaPath = path.join(__dirname, 'schema.sql');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');
db.exec(fs.readFileSync(schemaPath, 'utf8'));
ensureSchema();

function ensureSchema() {
  const columns = db.prepare('PRAGMA table_info(users)').all();
  const names = new Set(columns.map((column) => column.name));

  if (!names.has('vector_data')) {
    db.exec('ALTER TABLE users ADD COLUMN vector_data BLOB');
  }

  if (!names.has('squad_account_number')) {
    db.exec('ALTER TABLE users ADD COLUMN squad_account_number TEXT');
    db.exec('UPDATE users SET squad_account_number = virtual_account_number WHERE squad_account_number IS NULL');
  }

  if (!names.has('language')) {
    db.exec("ALTER TABLE users ADD COLUMN language TEXT NOT NULL DEFAULT 'English'");
  }

  if (!names.has('economic_context')) {
    db.exec("ALTER TABLE users ADD COLUMN economic_context TEXT DEFAULT ''");
  }

  if (!names.has('preferred_access_mode')) {
    db.exec("ALTER TABLE users ADD COLUMN preferred_access_mode TEXT NOT NULL DEFAULT 'app'");
  }

  if (!names.has('voice_notes')) {
    db.exec("ALTER TABLE users ADD COLUMN voice_notes TEXT DEFAULT ''");
  }

  const identityColumns = [
    ['identity_type', "TEXT DEFAULT ''"],
    ['identity_number_last4', "TEXT DEFAULT ''"],
    ['identity_provider', "TEXT DEFAULT ''"],
    ['identity_status', "TEXT NOT NULL DEFAULT 'unverified'"],
    ['identity_confidence', 'REAL NOT NULL DEFAULT 0'],
    ['verified_full_name', "TEXT DEFAULT ''"],
    ['verified_date_of_birth', "TEXT DEFAULT ''"],
    ['verified_photo_url', "TEXT DEFAULT ''"],
    ['identity_verified_at', 'TEXT']
  ];

  for (const [name, definition] of identityColumns) {
    if (!names.has(name)) {
      db.exec(`ALTER TABLE users ADD COLUMN ${name} ${definition}`);
    }
  }

  const txColumns = db.prepare('PRAGMA table_info(squad_transactions)').all();
  const txNames = new Set(txColumns.map((column) => column.name));

  if (!txNames.has('escrow_status')) {
    db.exec("ALTER TABLE squad_transactions ADD COLUMN escrow_status TEXT NOT NULL DEFAULT 'holding'");
  }

  const jobColumns = db.prepare('PRAGMA table_info(jobs)').all();
  const jobNames = new Set(jobColumns.map((column) => column.name));

  if (!jobNames.has('employer_id')) {
    db.exec('ALTER TABLE jobs ADD COLUMN employer_id TEXT REFERENCES users(id) ON DELETE SET NULL');
  }

  if (!jobNames.has('worker_id')) {
    db.exec('ALTER TABLE jobs ADD COLUMN worker_id TEXT REFERENCES users(id) ON DELETE SET NULL');
  }

  if (!jobNames.has('required_skill')) {
    db.exec("ALTER TABLE jobs ADD COLUMN required_skill TEXT DEFAULT ''");
  }

  if (!jobNames.has('completed_at')) {
    db.exec('ALTER TABLE jobs ADD COLUMN completed_at TEXT');
  }
}

export function transaction(fn) {
  return (...args) => {
    db.exec('BEGIN');
    try {
      const result = fn(...args);
      db.exec('COMMIT');
      return result;
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  };
}

export function seedJobs() {
  const insert = db.prepare(`
    INSERT INTO jobs (id, title, description, city, budget_kobo, required_skill)
    VALUES (@id, @title, @description, @city, @budget_kobo, @required_skill)
    ON CONFLICT(id) DO NOTHING
  `);

  const jobs = [
    {
      id: 'job_solar_kano',
      title: 'Solar inverter wiring assistant',
      description: 'Need an electrician who can install panels, run inverter cabling, test batteries, and explain maintenance to a small shop owner.',
      city: 'Kano',
      budget_kobo: 8500000,
      required_skill: 'solar inverter wiring'
    },
    {
      id: 'job_tailor_lagos',
      title: 'Uniform finishing for school launch',
      description: 'Experienced tailor needed for neat stitching, measurement corrections, button finishing, and fast delivery of school uniforms.',
      city: 'Lagos',
      budget_kobo: 6000000,
      required_skill: 'tailoring'
    },
    {
      id: 'job_plumber_abuja',
      title: 'Emergency bathroom leak repair',
      description: 'Plumber needed to detect a concealed pipe leak, replace fittings, seal tiles, and document before and after photos.',
      city: 'Abuja',
      budget_kobo: 4500000,
      required_skill: 'plumbing'
    },
    {
      id: 'job_carpenter_ibadan',
      title: 'Market stall shelving build',
      description: 'Carpenter needed for durable wooden shelves, measuring the stall, cutting boards, fitting brackets, and varnish finishing.',
      city: 'Ibadan',
      budget_kobo: 7000000,
      required_skill: 'carpentry'
    },
    {
      id: 'job_phone_repair_lagos',
      title: 'Phone repair desk support',
      description: 'Technician needed for screen replacement, battery swaps, charging-port checks, customer tickets, and payment reconciliation.',
      city: 'Lagos',
      budget_kobo: 5200000,
      required_skill: 'phone repair'
    },
    {
      id: 'job_market_inventory_onitsha',
      title: 'Market inventory digitization',
      description: 'Vendor assistant needed to catalogue stock, tag fast-moving items, reconcile daily sales, and train shop staff on mobile records.',
      city: 'Onitsha',
      budget_kobo: 3800000,
      required_skill: 'inventory'
    },
    {
      id: 'job_event_catering_lagos',
      title: 'Catering prep crew lead',
      description: 'Food vendor needed to coordinate prep workers, source market supplies, maintain hygiene logs, and deliver boxed meals.',
      city: 'Lagos',
      budget_kobo: 9500000,
      required_skill: 'catering'
    },
    {
      id: 'job_welder_portharcourt',
      title: 'Security door welding finish',
      description: 'Welder needed for measurements, hinge alignment, grinding, finishing, and verified photos before escrow release.',
      city: 'Port Harcourt',
      budget_kobo: 7800000,
      required_skill: 'welding'
    },
    {
      id: 'job_beauty_abuja',
      title: 'Salon braid team booking',
      description: 'Experienced stylist needed for team scheduling, clean braid finishing, customer care, and same-day Squad payment confirmation.',
      city: 'Abuja',
      budget_kobo: 4200000,
      required_skill: 'hair styling'
    }
  ];

  const tx = transaction((rows) => rows.forEach((job) => insert.run(job)));
  tx(jobs);
}
