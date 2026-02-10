const pool = require('../config/database');
const crypto = require('crypto');

class User {
  static generateReferralCode(telegramId) {
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `GONKA${telegramId}${random}`;
  }

  static async createOrUpdate(telegramData) {
    const client = await pool.connect();
    try {
      // Check if user exists
      const existing = await client.query(
        'SELECT * FROM users WHERE telegramId = $1',
        [telegramData.id]
      );

      if (existing.rows.length > 0) {
        // Update existing user
        await client.query(
          `UPDATE users SET 
            username = $1, 
            firstName = $2, 
            lastName = $3,
            updatedAt = CURRENT_TIMESTAMP
           WHERE telegramId = $4`,
          [
            telegramData.username,
            telegramData.first_name,
            telegramData.last_name || null,
            telegramData.id
          ]
        );
        return existing.rows[0];
      } else {
        // Create new user
        const referralCode = this.generateReferralCode(telegramData.id);
        const result = await client.query(
          `INSERT INTO users (telegramId, username, firstName, lastName, referralCode)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [
            telegramData.id,
            telegramData.username,
            telegramData.first_name,
            telegramData.last_name || null,
            referralCode
          ]
        );
        return result.rows[0];
      }
    } finally {
      client.release();
    }
  }

  static async findByTelegramId(telegramId) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE telegramId = $1',
        [telegramId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async findById(id) {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async findByReferralCode(referralCode) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE referralCode = $1',
        [referralCode]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async getReferralStats(userId) {
    const client = await pool.connect();
    try {
      // Get total referrals count
      const countResult = await client.query(
        'SELECT COUNT(*) as count FROM referrals WHERE referrerId = $1',
        [userId]
      );

      // Get total earnings
      const earningsResult = await client.query(
        `SELECT 
          COALESCE(SUM(CASE WHEN level = 1 THEN amount ELSE 0 END), 0) as level1Earnings,
          COALESCE(SUM(CASE WHEN level = 2 THEN amount ELSE 0 END), 0) as level2Earnings,
          COALESCE(SUM(CASE WHEN level = 3 THEN amount ELSE 0 END), 0) as level3Earnings,
          COALESCE(SUM(amount), 0) as totalEarnings
         FROM referral_earnings 
         WHERE userId = $1 AND status = 'completed'`,
        [userId]
      );

      // Get pending withdrawals
      const withdrawalResult = await client.query(
        `SELECT COALESCE(SUM(amount), 0) as pendingWithdrawals
         FROM withdrawals 
         WHERE userId = $1 AND status = 'pending'`,
        [userId]
      );

      return {
        totalReferrals: parseInt(countResult.rows[0].count),
        level1Earnings: parseFloat(earningsResult.rows[0].level1earnings || 0),
        level2Earnings: parseFloat(earningsResult.rows[0].level2earnings || 0),
        level3Earnings: parseFloat(earningsResult.rows[0].level3earnings || 0),
        totalEarnings: parseFloat(earningsResult.rows[0].totalearnings || 0),
        pendingWithdrawals: parseFloat(withdrawalResult.rows[0].pendingwithdrawals || 0)
      };
    } finally {
      client.release();
    }
  }
}

module.exports = User;
