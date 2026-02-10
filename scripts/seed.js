const pool = require('../config/database');

// Seed initial pools
const seedPools = async () => {
  const pools = [
    {
      poolNumber: 25,
      name: 'GonkaOne Pool #25',
      hardware: '8xH100',
      targetAmount: 11900,
      currentAmount: 4900,
      status: 'collecting',
      startDate: '2026-02-09'
    },
    {
      poolNumber: 26,
      name: 'GonkaOne Pool #26',
      hardware: '8xH100',
      targetAmount: 11900,
      currentAmount: 0,
      status: 'collecting',
      startDate: '2026-02-09'
    }
  ];

  const client = await pool.connect();
  try {
    for (const pool of pools) {
      await client.query(
        `INSERT INTO pools (poolNumber, name, hardware, targetAmount, currentAmount, status, startDate)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (poolNumber) DO NOTHING`,
        [
          pool.poolNumber,
          pool.name,
          pool.hardware,
          pool.targetAmount,
          pool.currentAmount,
          pool.status,
          pool.startDate
        ]
      );
      console.log(`✅ Pool #${pool.poolNumber} seeded`);
    }
  } catch (error) {
    console.error('❌ Error seeding pools:', error);
  } finally {
    client.release();
    process.exit(0);
  }
};

// Run seed
console.log('🌱 Seeding database...');
seedPools().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
