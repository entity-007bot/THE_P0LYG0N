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

// 3. Now start the server
const port = process.env.PORT || 3000;

function startServer(port) {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Backend running on port ${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy — retrying in 3 seconds...`);
      setTimeout(() => {
        server.close();
        startServer(port);
      }, 3000);
    } else {
      throw err;
    }
  });

  return server;
}

const server = startServer(port);

process.on('SIGTERM', () => {
  console.log('SIGTERM received – closing server');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
app.get('/api-docs', (_req, res) => {
  res.type('html').send(`
    <h1>SquadFlow AI API</h1>
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
  console.log(`SquadFlow backend listening on http://localhost:${port}`);
});
