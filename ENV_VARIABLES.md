# Переменные окружения для GonkaOne

## 🔐 Секретные переменные (для Backend на Render.com)

Эти переменные нужны для backend сервера:

```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
JWT_SECRET=your_jwt_secret_key_change_in_production
```

## 🌐 Публичные переменные (для Frontend на Vercel)

Эти переменные нужны для React приложения:

```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

## 📋 Полный список переменных

### Backend (Render.com)
- `PORT` - порт сервера (обычно 3000, Render устанавливает автоматически)
- `NODE_ENV` - окружение (production)
- `TELEGRAM_BOT_TOKEN` - токен Telegram бота (секрет)
- `TELEGRAM_BOT_USERNAME` - username бота (gonkaonebot)
- `DB_PATH` - путь к БД (./data/gonkaone.db)
- `JWT_SECRET` - секрет для JWT токенов (секрет)
- `REFERRAL_LEVEL_1_PERCENT` - 5
- `REFERRAL_LEVEL_2_PERCENT` - 3
- `REFERRAL_LEVEL_3_PERCENT` - 2
- `MIN_WITHDRAWAL_USDT` - 50
- `WITHDRAWAL_PROCESSING_HOURS` - 48
- `MIN_POOL_INVESTMENT` - 50
- `POOL_DURATION_DAYS` - 30

### Frontend (Vercel)
- `REACT_APP_API_URL` - URL backend API

## ⚠️ Важно

1. **Секретные переменные** (TELEGRAM_BOT_TOKEN, JWT_SECRET) НЕ должны быть в коде
2. **REACT_APP_API_URL** нужно обновить после деплоя backend
3. Все переменные с префиксом `REACT_APP_` доступны в React коде

