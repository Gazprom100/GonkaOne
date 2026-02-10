const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

// Get user withdrawals
router.get('/', auth, async (req, res, next) => {
  try {
    const client = await pool.connect();
    try {
      const withdrawalsResult = await client.query(
        `SELECT * FROM withdrawals 
         WHERE userId = $1 
         ORDER BY createdAt DESC`,
        [req.userId]
      );

      const statsResult = await client.query(
        `SELECT 
          COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as totalWithdrawn,
          COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pendingAmount
         FROM withdrawals WHERE userId = $1`,
        [req.userId]
      );

      const earningsResult = await client.query(
        `SELECT 
          COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as totalEarnings
         FROM referral_earnings WHERE userId = $1`,
        [req.userId]
      );

      const stats = statsResult.rows[0];
      const earnings = earningsResult.rows[0];
      const availableBalance = parseFloat(earnings.totalearnings || 0) - 
                               parseFloat(stats.totalwithdrawn || 0) - 
                               parseFloat(stats.pendingamount || 0);

      res.json({
        withdrawals: withdrawalsResult.rows,
        balance: {
          available: availableBalance,
          pending: parseFloat(stats.pendingamount || 0),
          withdrawn: parseFloat(stats.totalwithdrawn || 0)
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});

// Create withdrawal request
router.post('/', auth, async (req, res, next) => {
  try {
    const { amount, address } = req.body;
    const minWithdrawal = parseFloat(process.env.MIN_WITHDRAWAL_USDT || 50);

    if (!amount || amount < minWithdrawal) {
      return res.status(400).json({
        error: `Minimum withdrawal is ${minWithdrawal} USDT`
      });
    }

    if (!address || !address.startsWith('0x') || address.length !== 42) {
      return res.status(400).json({ error: 'Invalid BEP-20 address format' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const earningsResult = await client.query(
        `SELECT 
          COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as totalEarnings
         FROM referral_earnings WHERE userId = $1`,
        [req.userId]
      );

      const withdrawalsResult = await client.query(
        `SELECT 
          COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as totalWithdrawn,
          COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pendingAmount
         FROM withdrawals WHERE userId = $1`,
        [req.userId]
      );

      const earnings = parseFloat(earningsResult.rows[0].totalearnings || 0);
      const withdrawals = withdrawalsResult.rows[0];
      const availableBalance = earnings - 
                               parseFloat(withdrawals.totalwithdrawn || 0) - 
                               parseFloat(withdrawals.pendingamount || 0);

      if (amount > availableBalance) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: 'Insufficient balance',
          available: availableBalance
        });
      }

      const result = await client.query(
        `INSERT INTO withdrawals (userId, amount, address, status)
         VALUES ($1, $2, $3, 'pending')
         RETURNING *`,
        [req.userId, amount, address]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        withdrawal: {
          ...result.rows[0],
          message: `Request will be processed within ${process.env.WITHDRAWAL_PROCESSING_HOURS || 48} hours`
        }
      });
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
