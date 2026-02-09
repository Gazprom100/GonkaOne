const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    req.userId = decoded.userId;
    req.telegramId = decoded.telegramId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

