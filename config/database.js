const { Pool } = require('pg');

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? { rejectUnauthorized: false } : false
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

// Initialize database tables
const initDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        telegramId INTEGER UNIQUE,
        username TEXT,
        firstName TEXT,
        lastName TEXT,
        email TEXT,
        referralCode TEXT UNIQUE NOT NULL,
        referredBy INTEGER REFERENCES users(id),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Wallets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id SERIAL PRIMARY KEY,
        userId INTEGER NOT NULL REFERENCES users(id),
        gonkaAddress TEXT,
        bep20Address TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Pools table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pools (
        id SERIAL PRIMARY KEY,
        poolNumber INTEGER UNIQUE NOT NULL,
        name TEXT NOT NULL,
        hardware TEXT,
        targetAmount DECIMAL(18, 2) NOT NULL,
        currentAmount DECIMAL(18, 2) DEFAULT 0,
        status TEXT DEFAULT 'collecting',
        startDate DATE,
        endDate DATE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Investments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS investments (
        id SERIAL PRIMARY KEY,
        userId INTEGER NOT NULL REFERENCES users(id),
        poolId INTEGER NOT NULL REFERENCES pools(id),
        amount DECIMAL(18, 2) NOT NULL,
        status TEXT DEFAULT 'active',
        expectedReward DECIMAL(18, 2),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Referrals table (multi-level)
    await client.query(`
      CREATE TABLE IF NOT EXISTS referrals (
        id SERIAL PRIMARY KEY,
        referrerId INTEGER NOT NULL REFERENCES users(id),
        referredId INTEGER NOT NULL REFERENCES users(id),
        level INTEGER NOT NULL,
        totalEarnings DECIMAL(18, 2) DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Referral earnings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS referral_earnings (
        id SERIAL PRIMARY KEY,
        userId INTEGER NOT NULL REFERENCES users(id),
        referralId INTEGER NOT NULL REFERENCES referrals(id),
        level INTEGER NOT NULL,
        amount DECIMAL(18, 2) NOT NULL,
        sourceType TEXT,
        sourceId INTEGER,
        status TEXT DEFAULT 'pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Withdrawals table
    await client.query(`
      CREATE TABLE IF NOT EXISTS withdrawals (
        id SERIAL PRIMARY KEY,
        userId INTEGER NOT NULL REFERENCES users(id),
        amount DECIMAL(18, 2) NOT NULL,
        address TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        txHash TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processedAt TIMESTAMP
      )
    `);

    // Transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        userId INTEGER NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,
        amount DECIMAL(18, 2) NOT NULL,
        currency TEXT DEFAULT 'USDT',
        status TEXT DEFAULT 'pending',
        txHash TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegramId)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referralCode)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_investments_user ON investments(userId)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_investments_pool ON investments(poolId)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrerId)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referredId)`);

    await client.query('COMMIT');
    console.log('✅ Database tables initialized');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Initialize on module load
initDatabase().catch(console.error);

module.exports = pool;
