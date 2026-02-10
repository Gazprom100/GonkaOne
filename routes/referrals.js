const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get referral stats
router.get('/stats', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    const stats = await User.getReferralStats(req.userId);

    const client = await pool.connect();
    try {
      // Get referrals by level
      const levelStatsResult = await client.query(
        `SELECT 
          r.level,
          COUNT(DISTINCT r.referredId) as count,
          COALESCE(SUM(CASE WHEN re.status = 'completed' THEN re.amount ELSE 0 END), 0) as earnings
         FROM referrals r
         LEFT JOIN referral_earnings re ON r.id = re.referralId
         WHERE r.referrerId = $1
         GROUP BY r.level
         ORDER BY r.level`,
        [req.userId]
      );

      // Get total withdrawn
      const withdrawnResult = await client.query(
        `SELECT COALESCE(SUM(amount), 0) as totalWithdrawn
         FROM withdrawals 
         WHERE userId = $1 AND status = 'completed'`,
        [req.userId]
      );

      res.json({
        referralCode: user.referralcode,
        referralLink: `https://t.me/${process.env.TELEGRAM_BOT_USERNAME || 'gonkaonebot'}?start=${user.referralcode}`,
        stats: {
          ...stats,
          totalWithdrawn: parseFloat(withdrawnResult.rows[0].totalwithdrawn || 0),
          levels: levelStatsResult.rows.map(row => ({
            level: row.level,
            count: parseInt(row.count),
            earnings: parseFloat(row.earnings || 0)
          }))
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});

// Get referrals by level
router.get('/level/:level', auth, async (req, res, next) => {
  try {
    const level = parseInt(req.params.level);
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT 
          u.id,
          u.username,
          u.firstName,
          u.createdAt as registeredAt,
          r.createdAt as referralDate,
          COALESCE(SUM(CASE WHEN re.status = 'completed' THEN re.amount ELSE 0 END), 0) as totalEarnings,
          (SELECT COALESCE(SUM(amount), 0) FROM investments WHERE userId = u.id) as totalInvestments
         FROM referrals r
         JOIN users u ON r.referredId = u.id
         LEFT JOIN referral_earnings re ON r.id = re.referralId
         WHERE r.referrerId = $1 AND r.level = $2
         GROUP BY u.id, u.username, u.firstName, u.createdAt, r.createdAt
         ORDER BY r.createdAt DESC`,
        [req.userId, level]
      );

      res.json({
        referrals: result.rows.map(row => ({
          id: row.id,
          username: row.username,
          firstName: row.firstname,
          registeredAt: row.registeredat,
          referralDate: row.referraldate,
          totalEarnings: parseFloat(row.totalearnings || 0),
          totalInvestments: parseFloat(row.totalinvestments || 0)
        }))
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});

// Handle referral registration
router.post('/register', async (req, res, next) => {
  try {
    const { userId, referralCode } = req.body;

    if (!userId || !referralCode) {
      return res.status(400).json({ error: 'Missing userId or referralCode' });
    }

    const referrer = await User.findByReferralCode(referralCode);
    if (!referrer || referrer.id === userId) {
      return res.status(400).json({ error: 'Invalid referral code' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if already referred
      const existingResult = await client.query(
        'SELECT * FROM users WHERE id = $1 AND referredBy IS NOT NULL',
        [userId]
      );

      if (existingResult.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.json({ success: false, message: 'User already has a referrer' });
      }

      // Set referrer
      await client.query('UPDATE users SET referredBy = $1 WHERE id = $2', [referrer.id, userId]);

      // Create referral records for multi-level system
      const createReferralChain = async (referrerId, referredId, level) => {
        if (level > 3) return;

        await client.query(
          `INSERT INTO referrals (referrerId, referredId, level)
           VALUES ($1, $2, $3)`,
          [referrerId, referredId, level]
        );

        // Get parent referrer for next level
        const parentResult = await client.query(
          'SELECT referredBy FROM users WHERE id = $1',
          [referrerId]
        );

        if (parentResult.rows.length > 0 && parentResult.rows[0].referredby) {
          await createReferralChain(parentResult.rows[0].referredby, referredId, level + 1);
        }
      };

      await createReferralChain(referrer.id, userId, 1);
      await client.query('COMMIT');

      res.json({ success: true, message: 'Referral registered' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
