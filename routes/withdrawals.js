const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// Get user withdrawals
router.get('/', auth, async (req, res, next) => {
  try {
    db.all(
      `SELECT * FROM withdrawals 
       WHERE userId = ? 
       ORDER BY createdAt DESC`,
      [req.userId],
      (err, withdrawals) => {
        if (err) return next(err);

        // Get balance stats
        db.get(
          `SELECT 
            COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as totalWithdrawn,
            COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pendingAmount
           FROM withdrawals WHERE userId = ?`,
          [req.userId],
          (err, stats) => {
            if (err) return next(err);

            // Get available balance (from referral earnings)
            db.get(
              `SELECT 
                COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as totalEarnings
               FROM referral_earnings WHERE userId = ?`,
              [req.userId],
              (err, earnings) => {
                if (err) return next(err);

                const availableBalance = earnings.totalEarnings - stats.totalWithdrawn - stats.pendingAmount;

                res.json({
                  withdrawals,
                  balance: {
                    available: availableBalance,
                    pending: stats.pendingAmount,
                    withdrawn: stats.totalWithdrawn
                  }
                });
              }
            );
          }
        );
      }
    );
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

    // Check available balance
    db.get(
      `SELECT 
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as totalEarnings
       FROM referral_earnings WHERE userId = ?`,
      [req.userId],
      (err, earnings) => {
        if (err) return next(err);

        db.get(
          `SELECT 
            COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as totalWithdrawn,
            COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pendingAmount
           FROM withdrawals WHERE userId = ?`,
          [req.userId],
          (err, withdrawals) => {
            if (err) return next(err);

            const availableBalance = earnings.totalEarnings - withdrawals.totalWithdrawn - withdrawals.pendingAmount;

            if (amount > availableBalance) {
              return res.status(400).json({
                error: 'Insufficient balance',
                available: availableBalance
              });
            }

            // Create withdrawal request
            db.run(
              `INSERT INTO withdrawals (userId, amount, address, status)
               VALUES (?, ?, ?, 'pending')`,
              [req.userId, amount, address],
              function(err) {
                if (err) return next(err);

                res.json({
                  success: true,
                  withdrawal: {
                    id: this.lastID,
                    amount,
                    address,
                    status: 'pending',
                    message: `Request will be processed within ${process.env.WITHDRAWAL_PROCESSING_HOURS || 48} hours`
                  }
                });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;

