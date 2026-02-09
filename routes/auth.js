const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Telegram authentication
router.post('/telegram', async (req, res, next) => {
  try {
    const { id, first_name, last_name, username, photo_url, auth_date, hash } = req.body;

    // In production, verify Telegram hash for security
    // For now, we'll trust the data from Telegram WebApp

    const telegramData = {
      id,
      first_name,
      last_name,
      username,
      photo_url
    };

    // Create or update user
    const user = await User.createOrUpdate(telegramData);
    const fullUser = await User.findByTelegramId(id);

    // Generate JWT token
    const token = jwt.sign(
      { userId: fullUser.id, telegramId: id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: fullUser.id,
        telegramId: fullUser.telegramId,
        username: fullUser.username,
        firstName: fullUser.firstName,
        referralCode: fullUser.referralCode
      }
    });
  } catch (error) {
    next(error);
  }
});

// Verify token
router.get('/verify', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        referralCode: user.referralCode
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

module.exports = router;

