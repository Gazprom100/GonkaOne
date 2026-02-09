const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Create data directory if it doesn't exist
const dbDir = path.dirname(process.env.DB_PATH || './data/gonkaone.db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || './data/gonkaone.db';
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegramId INTEGER UNIQUE,
      username TEXT,
      firstName TEXT,
      lastName TEXT,
      email TEXT,
      referralCode TEXT UNIQUE NOT NULL,
      referredBy INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (referredBy) REFERENCES users(id)
    )
  `);

  // Wallets table
  db.run(`
    CREATE TABLE IF NOT EXISTS wallets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      gonkaAddress TEXT,
      bep20Address TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Pools table
  db.run(`
    CREATE TABLE IF NOT EXISTS pools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      poolNumber INTEGER UNIQUE NOT NULL,
      name TEXT NOT NULL,
      hardware TEXT,
      targetAmount REAL NOT NULL,
      currentAmount REAL DEFAULT 0,
      status TEXT DEFAULT 'collecting',
      startDate DATE,
      endDate DATE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Investments table
  db.run(`
    CREATE TABLE IF NOT EXISTS investments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      poolId INTEGER NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'active',
      expectedReward REAL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (poolId) REFERENCES pools(id)
    )
  `);

  // Referrals table (multi-level)
  db.run(`
    CREATE TABLE IF NOT EXISTS referrals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      referrerId INTEGER NOT NULL,
      referredId INTEGER NOT NULL,
      level INTEGER NOT NULL,
      totalEarnings REAL DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (referrerId) REFERENCES users(id),
      FOREIGN KEY (referredId) REFERENCES users(id)
    )
  `);

  // Referral earnings table
  db.run(`
    CREATE TABLE IF NOT EXISTS referral_earnings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      referralId INTEGER NOT NULL,
      level INTEGER NOT NULL,
      amount REAL NOT NULL,
      sourceType TEXT,
      sourceId INTEGER,
      status TEXT DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (referralId) REFERENCES referrals(id)
    )
  `);

  // Withdrawals table
  db.run(`
    CREATE TABLE IF NOT EXISTS withdrawals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      amount REAL NOT NULL,
      address TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      txHash TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      processedAt DATETIME,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Transactions table
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'USDT',
      status TEXT DEFAULT 'pending',
      txHash TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Create indexes
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegramId)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referralCode)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_investments_user ON investments(userId)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_investments_pool ON investments(poolId)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrerId)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referredId)`);
});

module.exports = db;

