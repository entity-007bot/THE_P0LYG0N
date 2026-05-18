# SquadFlow AI

SquadFlow AI is a mobile-first economic operating system for Nigeria's informal workers, traders, youth, SMEs, and local institutions. It links a React frontend to an Express/SQLite backend that handles onboarding, NIN/BVN identity checks, AI job matching, Squad-powered payment flows, Growth Vault savings, KiScore identity signals, USSD access, proof-of-work verification, impact intelligence dashboards, and the POLYGON Control Panel for admin-grade economic intelligence.

The project is designed to run locally in demo mode without live Squad keys, then switch to Squad sandbox/live integrations by adding credentials in `backend/.env`.

## Project Structure

```text
SquadFlow/
  backend/    Express API, SQLite database, Squad services, USSD, demo scripts
  frontend/   React + Vite mobile dashboard, impact dashboard, and POLYGON control panel
  docs/       POLYGON brief and scaling notes
```

## What Is Integrated

For the product, ecosystem, architecture, scaling, revenue, and compliance narrative, see [docs/POLYGON_BRIEF.md](docs/POLYGON_BRIEF.md).

### Worker and SME Flow

1. A worker onboards with name, phone, city, skills, preferred access mode, and NIN or BVN.
2. The backend verifies the identity through the Dojah/Smile ID adapter, or uses local demo verification when keys are absent.
3. The backend creates or locally records a Squad virtual account for collections.
4. AI matching ranks open gigs from the local job database.
5. Employers create escrow-style deposits through Squad payment links or demo checkout records.
6. Proof-of-work verification releases payout logic to banks or wallets.
7. Payments are split into worker wallet balance and Growth Vault savings.
8. KiScore updates from identity status, Squad transaction frequency, job completions, ratings, and savings behavior.

### Backend and Frontend Link

The frontend reads `VITE_API_BASE` and defaults to:

```text
http://localhost:3000/api
```

The backend exposes the endpoints consumed by the frontend, including:

```text
GET  /api/health
POST /api/onboard
GET  /api/dashboard/:userId
GET  /api/identity/:userId
GET  /api/users/:userId/matches
POST /api/jobs/:jobId/deposit
POST /api/jobs/:jobId/verify-completion
POST /api/demo/mock-payment
GET  /api/admin/insights
GET  /api/admin/impact
GET  /api/admin/control-panel
GET  /api/squad/status
POST /api/squad/verify-account
GET  /api/squad/verify-transaction/:transactionRef
POST /api/squad/re-query-transfer
GET  /api/ecosystem
POST /api/ussd
POST /api/voice/callback
```

## Ecosystem Integration

SquadFlow is built as a shared operating layer for these partners:

| Sector | Integrated Use Cases | Product Surface |
| --- | --- | --- |
| Banks | Behavioral lending, SME financing, digital savings | KiScore, Growth Vault, wallet history, lender gating |
| Identity Providers | NIN/BVN verification, profile confidence, NDPR-aligned identity checks | Dojah/Smile ID adapter, verification ledger, trust-score baseline |
| Government | Youth employment programs, economic intelligence dashboards, policy planning | `/impact`, `/admin`, LGA heatmaps, skill gaps, employment pressure |
| Telecoms | USSD onboarding, mobile money, SIM-based verification | `/api/ussd`, phone-first identity, wallet access |
| Insurance | Microinsurance, health and business protection, embedded risk coverage | Proof-of-work, escrow split logic, policy ledger |

The frontend dashboard renders these integrations from `GET /api/ecosystem`, so the ecosystem is part of the running product and not only documentation.

## Core Features

- Worker onboarding with app, USSD, and voice-ready access modes.
- NIN/BVN identity verification through Dojah or Smile ID, with demo fallback for local runs.
- Squad virtual-account setup with local fallback when keys are not configured.
- AI job matching using local scoring and optional Transformers.js embeddings.
- Escrow deposit creation through Squad payment links or demo checkout URLs.
- Proof-of-work verification for completed jobs.
- 95/5 worker payout and Growth Vault savings split.
- KiScore economic identity and lender-readiness signals.
- Batch payout and VSLA recurring savings service functions.
- Impact dashboard for jobs, transaction volume, savings, skill gaps, and LGA activity.
- POLYGON Control Panel at `/admin` and `/control-panel` for user intelligence, activity monitoring, market heatmaps, employment statistics, financial inclusion data, government data, business intelligence, fraud risk, growth analytics, and report exports.
- Squad verification endpoints for account lookup, transaction verification, and transfer re-query.
- Squad Dynamic Virtual Account endpoints for account-pool creation, one-time account initiation, amount/expiry updates, and status checks.

## Requirements

- Node.js 20+ recommended
- npm
- Termux is supported for Android demo deployments

Optional:

- Squad sandbox keys for live payment API calls
- Africa's Talking sandbox for USSD testing

## Setup

Install backend dependencies:

```bash
cd backend
npm install
cp .env.example .env
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

Configure `backend/.env`:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
SQUAD_BASE_URL=https://sandbox-api-d.squadco.com
SQUAD_SECRET_KEY=replace_me
SQUAD_PUBLIC_KEY=replace_me
IDENTITY_PROVIDER=dojah
IDENTITY_PROVIDER_API_KEY=replace_me
DOJAH_APP_ID=replace_me
GROWTH_VAULT_PERCENT=5
```

When `SQUAD_SECRET_KEY` or `IDENTITY_PROVIDER_API_KEY` is missing or set to `replace_me`, the app runs in local demo mode for that integration.

## Run Locally

Start the backend:

```bash
cd backend
npm run start
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:5173
```

Impact dashboard:

```text
http://localhost:5173/impact
```

POLYGON Control Panel:

```text
http://localhost:5173/admin
http://localhost:5173/control-panel
```

Backend health check:

```text
http://localhost:3000/api/health
```

API docs page:

```text
http://localhost:3000/api-docs
```

## Demo Commands

Run the backend scripted demo:

```bash
cd backend
npm run demo
```

Watch logs:

```bash
cd backend
npm run logs
```

Build the frontend:

```bash
cd frontend
npm run build

npm run dev
```

## USSD Demo

The backend mounts USSD at:

```text
POST /api/ussd
```

For Africa's Talking sandbox testing, expose the backend with a tunnel and set the callback URL to:

```text
https://your-tunnel-url/api/ussd
```

## Squad API Notes

The code includes Squad service functions for:

- Virtual accounts: `/virtual-account`
- Business virtual accounts: `/virtual-account/business`
- Dynamic virtual accounts: `/virtual-account/create-dynamic-virtual-account`, `/virtual-account/initiate-dynamic-virtual-account`, `/virtual-account/update-dynamic-virtual-account-time-and-amount`
- Payment initiation: `/transaction/initiate`
- Transaction verification: `/transaction/verify/:ref`
- Account lookup: `/payout/account/lookup`
- Transfer re-query: `/payout/requery`
- Batch transfers: `/transaction/batch`
- Recurring savings: `/recurring-payment/create`
- Webhook handling: `/api/squad/webhook`

Live calls require valid keys in `backend/.env`. Demo mode records local ledger activity so judges or testers can use the product without external credentials.

## Verification

Current local checks:

```bash
cd backend && node --check index.js
cd backend && node --check routes/api.js
cd frontend && npm run build
```
Checking Access
