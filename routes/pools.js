const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// Get all pools
router.get('/', async (req, res, next) => {
  try {
    db.all(
      `SELECT * FROM pools ORDER BY poolNumber DESC`,
      [],
      (err, pools) => {
        if (err) return next(err);
        res.json({ pools });
      }
    );
  } catch (error) {
    next(error);
  }
});

// Get pool by ID
router.get('/:id', async (req, res, next) => {
  try {
    db.get(
      `SELECT * FROM pools WHERE id = ?`,
      [req.params.id],
      (err, pool) => {
        if (err) return next(err);
        if (!pool) {
          return res.status(404).json({ error: 'Pool not found' });
        }
        res.json({ pool });
      }
    );
  } catch (error) {
    next(error);
  }
});

// Get user's investments
router.get('/my/investments', auth, async (req, res, next) => {
  try {
    db.all(
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
       WHERE i.userId = ?
       ORDER BY i.createdAt DESC`,
      [req.userId],
      (err, investments) => {
        if (err) return next(err);

        // Calculate total invested
        db.get(
          `SELECT COALESCE(SUM(amount), 0) as totalInvested
           FROM investments WHERE userId = ?`,
          [req.userId],
          (err, totalRow) => {
            if (err) return next(err);
            res.json({
              investments,
              totalInvested: totalRow.totalInvested
            });
          }
        );
      }
    );
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

    // Get pool
    db.get('SELECT * FROM pools WHERE id = ?', [poolId], (err, pool) => {
      if (err) return next(err);
      if (!pool) {
        return res.status(404).json({ error: 'Pool not found' });
      }

      if (pool.status !== 'collecting') {
        return res.status(400).json({ error: 'Pool is not accepting investments' });
      }

      // Create investment
      db.run(
        `INSERT INTO investments (userId, poolId, amount, status)
         VALUES (?, ?, ?, 'active')`,
        [req.userId, poolId, amount],
        function(investErr) {
          if (investErr) return next(investErr);

          // Update pool current amount
          db.run(
            `UPDATE pools SET 
              currentAmount = currentAmount + ?,
              updatedAt = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [amount, poolId],
            (updateErr) => {
              if (updateErr) return next(updateErr);

              // Check if pool is fully funded
              db.get('SELECT * FROM pools WHERE id = ?', [poolId], (err, updatedPool) => {
                if (err) return next(err);

                if (updatedPool.currentAmount >= updatedPool.targetAmount) {
                  db.run(
                    `UPDATE pools SET status = 'funded' WHERE id = ?`,
                    [poolId]
                  );
                }

                res.json({
                  success: true,
                  investment: {
                    id: this.lastID,
                    poolId,
                    amount,
                    status: 'active'
                  }
                });
              });
            }
          );
        }
      );
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

