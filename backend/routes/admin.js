import express from 'express';
import { getDb } from '../db/database.js';

const router = express.Router();

// backend/routes/admin.js
router.get('/control-panel', async (req, res) => {
  try {
    // 1. Fetch real counts from your SQLite/Postgres DB
    const totalWorkers = await db.count('users').where({ role: 'worker' });
    const jobsToday = await db.count('jobs').where('created_at', '>=', today);
    
    // 2. Calculate the total value of successful transactions via Squad
    const revenue = await db.sum('amount').from('payments').where({ status: 'success' });

    res.json({
      employmentStatistics: {
        totalWorkers,
        jobsCompletedToday: jobsToday,
        // ... rest of the data
      },
      platformGrowthAnalytics: {
        totalTransactionValueKobo: revenue || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch live metrics" });
  }
});

router.get('/api/admin/impact', async (req, res) => {
  const db = getDb();
  
  try {
    // Main metrics
    const metrics = await db.get(`
      SELECT 
        COUNT(DISTINCT u.id) as totalWorkers,
        COALESCE(SUM(st.amount), 0) as totalEarned,
        COALESCE(SUM(gv.balance), 0) as savingsPool,
        COUNT(DISTINCT j.id) as jobsCompleted,
        COALESCE(AVG(ks.score), 0) as kiScoreAverage
      FROM users u
      LEFT JOIN squad_transactions st ON u.id = st.user_id AND st.status = 'SUCCESS'
      LEFT JOIN growth_vault gv ON u.id = gv.user_id
      LEFT JOIN jobs j ON j.worker_id = u.id AND j.completed_at IS NOT NULL
      LEFT JOIN ki_scores ks ON ks.user_id = u.id
      WHERE u.role = 'worker' AND u.status = 'ACTIVE'
    `);
    
    // Weekly earnings history (last 4 weeks)
    const earningsHistory = await db.all(`
      SELECT 
        strftime('%W', datetime(created_at, 'unixepoch')) as week,
        SUM(amount) / 1000000.0 as amount
      FROM squad_transactions
      WHERE created_at > unixepoch('now', '-30 days')
        AND status = 'SUCCESS'
      GROUP BY week
      ORDER BY week DESC
      LIMIT 4
    `);
    
    // Skill gaps (demand vs supply from jobs and user skills)
    const skillGaps = await db.all(`
      WITH demand AS (
        SELECT jr.skill, COUNT(*) as demand_count
        FROM job_requirements jr
        GROUP BY jr.skill
      ),
      supply AS (
        SELECT us.skill, COUNT(DISTINCT us.user_id) as supply_count
        FROM user_skills us
        GROUP BY us.skill
      )
      SELECT 
        COALESCE(d.skill, s.skill) as skill,
        COALESCE(d.demand_count, 0) as demand,
        COALESCE(s.supply_count, 0) as supply,
        (COALESCE(d.demand_count, 0) - COALESCE(s.supply_count, 0)) / 
          NULLIF(COALESCE(d.demand_count, 1), 0) * 100 as gap
      FROM demand d
      FULL OUTER JOIN supply s ON d.skill = s.skill
      WHERE COALESCE(d.demand_count, 0) > 0
      ORDER BY gap DESC
      LIMIT 5
    `);
    
    // Age distribution
    const ageDistribution = await db.all(`
      SELECT 
        CASE 
          WHEN age BETWEEN 18 AND 25 THEN '18-25'
          WHEN age BETWEEN 26 AND 35 THEN '26-35'
          WHEN age BETWEEN 36 AND 50 THEN '36-50'
          ELSE '50+'
        END as age_group,
        COUNT(*) as count
      FROM users
      WHERE role = 'worker' AND age IS NOT NULL
      GROUP BY age_group
    `);
    
    // Geographic skill hubs
    const skillHubs = await db.all(`
      SELECT 
        location,
        COUNT(*) as userCount,
        AVG(activity_score) as activityScore,
        (
          SELECT skill 
          FROM user_skills us2 
          WHERE us2.user_id IN (SELECT id FROM users u2 WHERE u2.location = u.location)
          GROUP BY skill
          ORDER BY COUNT(*) DESC
          LIMIT 1
        ) as topSkill
      FROM users u
      WHERE role = 'worker' AND location IS NOT NULL
      GROUP BY location
      HAVING userCount > 10
      ORDER BY activityScore DESC
      LIMIT 20
    `);
    
    // Add approximate coordinates (in production, use geocoding)
    const hubsWithCoords = skillHubs.map(hub => ({
      ...hub,
      latitude: getLatitudeForLocation(hub.location),
      longitude: getLongitudeForLocation(hub.location)
    }));
    
    // Unemployment reduction (simulated with NBS/NDHS data correlation)
    const unemploymentReduction = 14.2; // Can be calculated from jobs placed vs baseline
    
    res.json({
      ...metrics,
      earningsHistory: earningsHistory.reverse(),
      skillGaps: skillGaps.map(s => ({ skill: s.skill, gap: Math.round(s.gap) })),
      ageDistribution: ageDistribution.map(a => a.count),
      skillHubs: hubsWithCoords,
      unemploymentReduction
    });
  } catch (error) {
    console.error('Impact dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch impact data' });
  }
});

// Helper functions for demo (replace with actual geocoding)
function getLatitudeForLocation(location) {
  const coords = {
    'Lagos': [6.5244, 3.3792],
    'Abuja': [9.0765, 7.3986],
    'Kano': [12.0022, 8.5919],
    'Ibadan': [7.3775, 3.9470],
    'Port Harcourt': [4.8156, 7.0498]
  };
  return coords[location]?.[0] || 9.0820;
}

function getLongitudeForLocation(location) {
  const coords = {
    'Lagos': [6.5244, 3.3792],
    'Abuja': [9.0765, 7.3986],
    'Kano': [12.0022, 8.5919],
    'Ibadan': [7.3775, 3.9470],
    'Port Harcourt': [4.8156, 7.0498]
  };
  return coords[location]?.[1] || 8.6753;
}

export default router;