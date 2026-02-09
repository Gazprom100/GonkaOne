const express = require('express');
const router = express.Router();
const User = require('../models/User');
const db = require('../config/database');
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
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        referralCode: user.referralCode,
        createdAt: user.createdAt
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

    db.run(
      'UPDATE users SET email = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [email, req.userId],
      function(err) {
        if (err) return next(err);
        res.json({ success: true, message: 'Profile updated' });
      }
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;

