const express = require('express');
const router = express.Router();
const db = require('../config/database');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get referral stats
router.get('/stats', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    const stats = await User.getReferralStats(req.userId);

    // Get referrals by level
    db.all(
      `SELECT 
        r.level,
        COUNT(DISTINCT r.referredId) as count,
        COALESCE(SUM(CASE WHEN re.status = 'completed' THEN re.amount ELSE 0 END), 0) as earnings
       FROM referrals r
       LEFT JOIN referral_earnings re ON r.id = re.referralId
       WHERE r.referrerId = ?
       GROUP BY r.level
       ORDER BY r.level`,
      [req.userId],
      (err, levelStats) => {
        if (err) return next(err);

        // Get total withdrawn
        db.get(
          `SELECT COALESCE(SUM(amount), 0) as totalWithdrawn
           FROM withdrawals 
           WHERE userId = ? AND status = 'completed'`,
          [req.userId],
          (err, withdrawnRow) => {
            if (err) return next(err);

            res.json({
              referralCode: user.referralCode,
              referralLink: `https://t.me/${process.env.TELEGRAM_BOT_USERNAME || 'gonkaonebot'}?start=${user.referralCode}`,
              stats: {
                ...stats,
                totalWithdrawn: withdrawnRow.totalWithdrawn,
                levels: levelStats
              }
            });
          }
        );
      }
    );
  } catch (error) {
    next(error);
  }
});

// Get referrals by level
router.get('/level/:level', auth, async (req, res, next) => {
  try {
    const level = parseInt(req.params.level);

    db.all(
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
       WHERE r.referrerId = ? AND r.level = ?
       GROUP BY u.id
       ORDER BY r.createdAt DESC`,
      [req.userId, level],
      (err, referrals) => {
        if (err) return next(err);
        res.json({ referrals });
      }
    );
  } catch (error) {
    next(error);
  }
});

// Handle referral registration (called when user registers with referral code)
router.post('/register', async (req, res, next) => {
  try {
    const { userId, referralCode } = req.body;

    if (!userId || !referralCode) {
      return res.status(400).json({ error: 'Missing userId or referralCode' });
    }

    // Find referrer
    const referrer = await User.findByReferralCode(referralCode);
    if (!referrer || referrer.id === userId) {
      return res.status(400).json({ error: 'Invalid referral code' });
    }

    // Check if already referred
    db.get(
      'SELECT * FROM users WHERE id = ? AND referredBy IS NOT NULL',
      [userId],
      (err, existing) => {
        if (err) return next(err);
        if (existing) {
          return res.json({ success: false, message: 'User already has a referrer' });
        }

        // Set referrer
        db.run(
          'UPDATE users SET referredBy = ? WHERE id = ?',
          [referrer.id, userId],
          (err) => {
            if (err) return next(err);

            // Create referral records for multi-level system
            const createReferralChain = (referrerId, referredId, level) => {
              return new Promise((resolve, reject) => {
                if (level > 3) return resolve();

                db.run(
                  `INSERT INTO referrals (referrerId, referredId, level)
                   VALUES (?, ?, ?)`,
                  [referrerId, referredId, level],
                  function(err) {
                    if (err) return reject(err);

                    // Get parent referrer for next level
                    db.get(
                      'SELECT referredBy FROM users WHERE id = ?',
                      [referrerId],
                      (err, parent) => {
                        if (err || !parent || !parent.referredBy) {
                          return resolve();
                        }
                        createReferralChain(parent.referredBy, referredId, level + 1)
                          .then(resolve)
                          .catch(reject);
                      }
                    );
                  }
                );
              });
            };

            createReferralChain(referrer.id, userId, 1)
              .then(() => {
                res.json({ success: true, message: 'Referral registered' });
              })
              .catch(next);
          }
        );
      }
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;

