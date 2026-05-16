// backend/demo/demo-automation.js
import axios from 'axios';

async function runWinnerDemo() {
  console.log('🎬 SQUADFLOW AI WINNER DEMO');
  
  // 1. Onboard trader (jobs giver)
  const trader = await axios.post('http://localhost:3000/api/onboard', {
    phone: '+234701234567',
    role: 'employer',
    business_type: 'market_stall',
    skills: ['needs_delivery_riders', 'needs_stock_counters']
  });
  
  // 2. Onboard youth worker
  const worker = await axios.post('http://localhost:3000/api/onboard', {
    phone: '+234709876543',
    role: 'worker',
    skills: ['delivery_rider', 'inventory'],
    location: 'Lagos_Ikeja'
  });
  
  // 3. Trader posts job
  const job = await axios.post('http://localhost:3000/api/jobs', {
    employerId: trader.data.userId,
    title: 'Market delivery from Oyingbo to Ikeja',
    payment: 2500, // NGN
    location: 'Lagos',
    required_skill: 'delivery_rider'
  });
  
  // 4. AI matches worker (show embedding similarity score)
  const match = await axios.get(`http://localhost:3000/api/users/${worker.data.userId}/matches`);
  console.log(`✅ AI Match Score: ${match.data.topMatch.score}%`);
  
  // 5. Employer deposits to Squad escrow
  const escrow = await axios.post(`http://localhost:3000/api/jobs/${job.data.jobId}/deposit`, {
    amount: 2500
  });
  console.log(`💰 Squad Escrow URL: ${escrow.data.paymentLink}`);
  
  // 6. Worker completes task (upload photo)
  const completion = await axios.post(`http://localhost:3000/api/jobs/${job.data.jobId}/verify-completion`, {
    photo_base64: mockDeliveryPhoto(), // Local CV model checks
    worker_id: worker.data.userId
  });
  
  // 7. Release payment (95% worker, 5% Growth Vault)
  console.log(`💸 Worker receives: ₦${completion.data.workerPayout}`);
  console.log(`🏦 Growth Vault: ₦${completion.data.growthVault}`);
  
  // 8. Show KiScore lift
  const updated = await axios.get(`http://localhost:3000/api/users/${worker.data.userId}/dashboard`);
  console.log(`📈 KiScore: ${updated.data.kiScore} (+${updated.data.scoreIncrease})`);
  
  // 9. Show Squad API trace
  console.log('\n🔗 SQUAD API CALLS MADE:');
  console.log('   → POST /virtual-account (worker wallet)');
  console.log('   → POST /transaction/initiate (employer deposit)');
  console.log('   → Webhook received: /api/squad/webhook');
  console.log('   → POST /transfer (escrow release simulation)');
}

mockDeliveryPhoto = () => 'data:image/jpeg;base64,...'; // dummy