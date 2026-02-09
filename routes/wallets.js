const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// Get user wallets
router.get('/', auth, async (req, res, next) => {
  try {
    db.get(
      'SELECT * FROM wallets WHERE userId = ?',
      [req.userId],
      (err, wallet) => {
        if (err) return next(err);
        res.json({ wallet: wallet || null });
      }
    );
  } catch (error) {
    next(error);
  }
});

// Update Gonka wallet address
router.put('/gonka', auth, async (req, res, next) => {
  try {
    const { address } = req.body;

    if (!address || !address.startsWith('gonka')) {
      return res.status(400).json({ error: 'Invalid Gonka address format' });
    }

    db.get('SELECT * FROM wallets WHERE userId = ?', [req.userId], (err, wallet) => {
      if (err) return next(err);

      if (wallet) {
        db.run(
          `UPDATE wallets SET gonkaAddress = ?, updatedAt = CURRENT_TIMESTAMP WHERE userId = ?`,
          [address, req.userId],
          (err) => {
            if (err) return next(err);
            res.json({ success: true, message: 'Gonka wallet updated' });
          }
        );
      } else {
        db.run(
          `INSERT INTO wallets (userId, gonkaAddress) VALUES (?, ?)`,
          [req.userId, address],
          (err) => {
            if (err) return next(err);
            res.json({ success: true, message: 'Gonka wallet saved' });
          }
        );
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update BEP-20 wallet address
router.put('/bep20', auth, async (req, res, next) => {
  try {
    const { address } = req.body;

    if (!address || !address.startsWith('0x') || address.length !== 42) {
      return res.status(400).json({ error: 'Invalid BEP-20 address format' });
    }

    db.get('SELECT * FROM wallets WHERE userId = ?', [req.userId], (err, wallet) => {
      if (err) return next(err);

      if (wallet) {
        db.run(
          `UPDATE wallets SET bep20Address = ?, updatedAt = CURRENT_TIMESTAMP WHERE userId = ?`,
          [address, req.userId],
          (err) => {
            if (err) return next(err);
            res.json({ success: true, message: 'BEP-20 wallet updated' });
          }
        );
      } else {
        db.run(
          `INSERT INTO wallets (userId, bep20Address) VALUES (?, ?)`,
          [req.userId, address],
          (err) => {
            if (err) return next(err);
            res.json({ success: true, message: 'BEP-20 wallet saved' });
          }
        );
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

