const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

// Get all pools
router.get('/', async (req, res, next) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM pools ORDER BY poolNumber DESC');
      res.json({ pools: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});

// Get pool by ID
router.get('/:id', async (req, res, next) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM pools WHERE id = $1', [req.params.id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Pool not found' });
      }
      res.json({ pool: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});

// Get user's investments
router.get('/my/investments', auth, async (req, res, next) => {
  try {
    const client = await pool.connect();
    try {
      const investmentsResult = await client.query(
        `SELECT 
          i.*,
          p.name as poolName,
          p.poolNumber,
          p.status as poolStatus,
          p.hardware,
          p.startDate,
          p.endDate
         FROM investments i
         JOIN pools p ON i.poolId = p.id
         WHERE i.userId = $1
         ORDER BY i.createdAt DESC`,
        [req.userId]
      );

      const totalResult = await client.query(
        'SELECT COALESCE(SUM(amount), 0) as totalInvested FROM investments WHERE userId = $1',
        [req.userId]
      );

      res.json({
        investments: investmentsResult.rows,
        totalInvested: parseFloat(totalResult.rows[0].totalinvested || 0)
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});

// Create investment
router.post('/:id/invest', auth, async (req, res, next) => {
  try {
    const { amount } = req.body;
    const poolId = req.params.id;

    if (!amount || amount < (process.env.MIN_POOL_INVESTMENT || 50)) {
      return res.status(400).json({
        error: `Minimum investment is ${process.env.MIN_POOL_INVESTMENT || 50} USDT`
      });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get pool
      const poolResult = await client.query('SELECT * FROM pools WHERE id = $1', [poolId]);
      if (poolResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Pool not found' });
      }

      const pool = poolResult.rows[0];
      if (pool.status !== 'collecting') {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Pool is not accepting investments' });
      }

      // Create investment
      const investmentResult = await client.query(
        `INSERT INTO investments (userId, poolId, amount, status)
         VALUES ($1, $2, $3, 'active')
         RETURNING *`,
        [req.userId, poolId, amount]
      );

      // Update pool current amount
      await client.query(
        `UPDATE pools SET 
          currentAmount = currentAmount + $1,
          updatedAt = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [amount, poolId]
      );

      // Check if pool is fully funded
      const updatedPoolResult = await client.query('SELECT * FROM pools WHERE id = $1', [poolId]);
      const updatedPool = updatedPoolResult.rows[0];

      if (parseFloat(updatedPool.currentamount) >= parseFloat(updatedPool.targetamount)) {
        await client.query('UPDATE pools SET status = $1 WHERE id = $2', ['funded', poolId]);
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        investment: investmentResult.rows[0]
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
