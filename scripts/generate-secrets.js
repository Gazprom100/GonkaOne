#!/usr/bin/env node

const crypto = require('crypto');

console.log('\n🔐 Генерация секретов для GonkaOne\n');
console.log('═'.repeat(60));

// Генерация JWT_SECRET
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('\n✅ JWT_SECRET:');
console.log(jwtSecret);
console.log('\n📋 Скопируйте это значение для переменной JWT_SECRET в Render.com');

// Генерация дополнительных секретов (если понадобятся)
const apiSecret = crypto.randomBytes(24).toString('hex');
console.log('\n✅ Дополнительный API_SECRET (опционально):');
console.log(apiSecret);

console.log('\n═'.repeat(60));
console.log('\n⚠️  ВАЖНО:');
console.log('1. Сохраните эти значения в безопасном месте');
console.log('2. НЕ коммитьте их в Git');
console.log('3. Добавьте в Environment Variables на Render.com');
console.log('4. Используйте тип "Secret" для этих переменных\n');

