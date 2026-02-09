const db = require('../config/database');

// Seed initial pools
const seedPools = () => {
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

  pools.forEach((pool) => {
    db.run(
      `INSERT OR IGNORE INTO pools (poolNumber, name, hardware, targetAmount, currentAmount, status, startDate)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        pool.poolNumber,
        pool.name,
        pool.hardware,
        pool.targetAmount,
        pool.currentAmount,
        pool.status,
        pool.startDate
      ],
      (err) => {
        if (err) {
          console.error('Error seeding pool:', err);
        } else {
          console.log(`Pool #${pool.poolNumber} seeded`);
        }
      }
    );
  });
};

// Run seed
console.log('Seeding database...');
seedPools();

setTimeout(() => {
  console.log('Seeding completed!');
  process.exit(0);
}, 2000);

