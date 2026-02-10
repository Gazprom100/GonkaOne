const express = require('express');
const router = express.Router();
const User = require('../models/User');
const pool = require('../config/database');
const auth = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const stats = await User.getReferralStats(user.id);

    res.json({
      user: {
        id: user.id,
        telegramId: user.telegramid,
        username: user.username,
        firstName: user.firstname,
        lastName: user.lastname,
        email: user.email,
        referralCode: user.referralcode,
        createdAt: user.createdat
      },
      stats
    });
  } catch (error) {
    next(error);
  }
});

// Update user email
router.put('/profile', auth, async (req, res, next) => {
  try {
    const { email } = req.body;
    const client = await pool.connect();
    try {
      await client.query(
        'UPDATE users SET email = $1, updatedAt = CURRENT_TIMESTAMP WHERE id = $2',
        [email, req.userId]
      );
      res.json({ success: true, message: 'Profile updated' });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
