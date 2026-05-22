import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { nanoid } from 'nanoid';
import { db, seedJobs, transaction } from './db/index.js';
import apiRouter from './routes/api.js';
import { buildSavingsSplit, createPaymentLink, createSplitPayment, createVirtualAccount, verifyWebhookSignature } from './services/squad.js';
import { generateUserEmbedding, rankJobsForWorker, vectorToBlob } from './services/matching.js';
import { getEconomicIdentity, handlePaymentSuccess, updateTrustScoreForUser } from './services/scoring.js';

seedJobs();



// 1. Create the Express app FIRST
const app = express();

// 2. Configure middleware and routes
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(morgan('tiny'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRouter);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'POLYGON backend (ARIA AI)' });
});

const port = process.env.PORT || 3000;

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Backend running on port ${port}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is in use – exiting so Render can retry`);
    process.exit(1);
  }
  throw err;
});

// Graceful shutdown – ensure the port is freed quickly
function shutdown() {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
  // Force exit after 5 seconds if server.close() hangs
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 5000);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);


app.get('/api-docs', (_req, res) => {
  res.type('html').send(`
    <h1>Aria AI API</h1>
    <ul>
      <li>POST /api/onboard</li>
      <li>GET /api/identity/:id</li>
      <li>GET /api/users/:id/dashboard</li>
      <li>GET /api/users/:id/matches</li>
      <li>POST /api/jobs</li>
      <li>POST /api/jobs/:id/deposit</li>
      <li>POST /api/jobs/:id/verify-completion</li>
      <li>POST /api/squad/webhook</li>
      <li>POST /api/batch-payouts</li>
      <li>POST /api/savings-groups</li>
      <li>GET /api/admin/impact</li>
    </ul>
  `);
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({
    error: error.message || 'Unexpected server error',
    details: error.details
  });
});

app.listen(port, () => {
  console.log(`P0LYG0N backend listening on http://localhost:${port}`);
});
