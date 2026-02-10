const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

// Get user wallets
router.get('/', auth, async (req, res, next) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM wallets WHERE userId = $1', [req.userId]);
      res.json({ wallet: result.rows[0] || null });
    } finally {
      client.release();
    }
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

    const client = await pool.connect();
    try {
      const existing = await client.query('SELECT * FROM wallets WHERE userId = $1', [req.userId]);

      if (existing.rows.length > 0) {
        await client.query(
          'UPDATE wallets SET gonkaAddress = $1, updatedAt = CURRENT_TIMESTAMP WHERE userId = $2',
          [address, req.userId]
        );
        res.json({ success: true, message: 'Gonka wallet updated' });
      } else {
        await client.query(
          'INSERT INTO wallets (userId, gonkaAddress) VALUES ($1, $2)',
          [req.userId, address]
        );
        res.json({ success: true, message: 'Gonka wallet saved' });
      }
    } finally {
      client.release();
    }
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

    const client = await pool.connect();
    try {
      const existing = await client.query('SELECT * FROM wallets WHERE userId = $1', [req.userId]);

      if (existing.rows.length > 0) {
        await client.query(
          'UPDATE wallets SET bep20Address = $1, updatedAt = CURRENT_TIMESTAMP WHERE userId = $2',
          [address, req.userId]
        );
        res.json({ success: true, message: 'BEP-20 wallet updated' });
      } else {
        await client.query(
          'INSERT INTO wallets (userId, bep20Address) VALUES ($1, $2)',
          [req.userId, address]
        );
        res.json({ success: true, message: 'BEP-20 wallet saved' });
      }
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
