const db = require('../config/database');
const crypto = require('crypto');

class User {
  static generateReferralCode(telegramId) {
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `GONKA${telegramId}${random}`;
  }

  static async createOrUpdate(telegramData) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE telegramId = ?',
        [telegramData.id],
        async (err, row) => {
          if (err) return reject(err);

          if (row) {
            // Update existing user
            db.run(
              `UPDATE users SET 
                username = ?, 
                firstName = ?, 
                lastName = ?,
                updatedAt = CURRENT_TIMESTAMP
               WHERE telegramId = ?`,
              [
                telegramData.username,
                telegramData.first_name,
                telegramData.last_name || null,
                telegramData.id
              ],
              (err) => {
                if (err) return reject(err);
                resolve(row);
              }
            );
          } else {
            // Create new user
            const referralCode = this.generateReferralCode(telegramData.id);
            db.run(
              `INSERT INTO users (telegramId, username, firstName, lastName, referralCode)
               VALUES (?, ?, ?, ?, ?)`,
              [
                telegramData.id,
                telegramData.username,
                telegramData.first_name,
                telegramData.last_name || null,
                referralCode
              ],
              function(err) {
                if (err) return reject(err);
                resolve({
                  id: this.lastID,
                  telegramId: telegramData.id,
                  referralCode
                });
              }
            );
          }
        }
      );
    });
  }

  static async findByTelegramId(telegramId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE telegramId = ?', [telegramId], (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  }

  static async findByReferralCode(referralCode) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE referralCode = ?', [referralCode], (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  }

  static async getReferralStats(userId) {
    return new Promise((resolve, reject) => {
      // Get total referrals count
      db.get(
        `SELECT COUNT(*) as count FROM referrals WHERE referrerId = ?`,
        [userId],
        (err, countRow) => {
          if (err) return reject(err);

          // Get total earnings
          db.get(
            `SELECT 
              COALESCE(SUM(CASE WHEN level = 1 THEN amount ELSE 0 END), 0) as level1Earnings,
              COALESCE(SUM(CASE WHEN level = 2 THEN amount ELSE 0 END), 0) as level2Earnings,
              COALESCE(SUM(CASE WHEN level = 3 THEN amount ELSE 0 END), 0) as level3Earnings,
              COALESCE(SUM(amount), 0) as totalEarnings
             FROM referral_earnings 
             WHERE userId = ? AND status = 'completed'`,
            [userId],
            (err, earningsRow) => {
              if (err) return reject(err);

              // Get pending withdrawals
              db.get(
                `SELECT COALESCE(SUM(amount), 0) as pendingWithdrawals
                 FROM withdrawals 
                 WHERE userId = ? AND status = 'pending'`,
                [userId],
                (err, withdrawalRow) => {
                  if (err) return reject(err);

                  resolve({
                    totalReferrals: countRow.count,
                    level1Earnings: earningsRow.level1Earnings,
                    level2Earnings: earningsRow.level2Earnings,
                    level3Earnings: earningsRow.level3Earnings,
                    totalEarnings: earningsRow.totalEarnings,
                    pendingWithdrawals: withdrawalRow.pendingWithdrawals
                  });
                }
              );
            }
          );
        }
      );
    });
  }
}

module.exports = User;

