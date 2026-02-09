# 🔐 Настройка переменных окружения

## ✅ Список всех переменных

### 🌐 Frontend (Vercel) - 1 переменная

| Переменная | Тип | Значение | Статус |
|-----------|-----|---------|--------|
| `REACT_APP_API_URL` | Публичная | `https://your-backend-url.onrender.com/api` | ⏳ Добавить после деплоя backend |

### 🔐 Backend (Render.com) - Секретные (2)

| Переменная | Тип | Значение | Как получить |
|-----------|-----|---------|--------------|
| `TELEGRAM_BOT_TOKEN` | 🔒 Секрет | Токен от @BotFather | `/newbot` в @BotFather |
| `JWT_SECRET` | 🔒 Секрет | Случайная строка 32+ символов | См. ниже |

### 📝 Backend (Render.com) - Публичные (10)

| Переменная | Значение по умолчанию |
|-----------|----------------------|
| `TELEGRAM_BOT_USERNAME` | `gonkaonebot` |
| `DB_PATH` | `./data/gonkaone.db` |
| `NODE_ENV` | `production` |
| `REFERRAL_LEVEL_1_PERCENT` | `5` |
| `REFERRAL_LEVEL_2_PERCENT` | `3` |
| `REFERRAL_LEVEL_3_PERCENT` | `2` |
| `MIN_WITHDRAWAL_USDT` | `50` |
| `WITHDRAWAL_PROCESSING_HOURS` | `48` |
| `MIN_POOL_INVESTMENT` | `50` |
| `POOL_DURATION_DAYS` | `30` |

---

## 🚀 Инструкция по добавлению

### Vercel (Frontend)

**Через CLI:**
```bash
vercel env add REACT_APP_API_URL production
# Введите: https://your-backend-url.onrender.com/api
```

**Через веб-интерфейс:**
1. Откройте: https://vercel.com/kconsulting/gonkaone/settings/environment-variables
2. Нажмите **Add New**
3. Name: `REACT_APP_API_URL`
4. Value: `https://your-backend-url.onrender.com/api` (обновить после деплоя backend)
5. Environment: Production, Preview, Development
6. Save

### Render (Backend)

**Через веб-интерфейс:**
1. Откройте ваш сервис на Render
2. Settings → Environment Variables
3. Добавьте все переменные из таблицы выше

**Секретные переменные:**
- `TELEGRAM_BOT_TOKEN` - получите от @BotFather
- `JWT_SECRET` - сгенерируйте командой ниже

---

## 🔑 Генерация JWT_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Пример сгенерированного:**
```
65622bed682262f2f3d5ee4ef365dcd0029a955a184638fa0f015b4c5bb32119
```

---

## 📋 Чеклист настройки

### Frontend (Vercel)
- [ ] Добавить `REACT_APP_API_URL` (после деплоя backend)

### Backend (Render)
- [ ] Добавить `TELEGRAM_BOT_TOKEN` (секрет)
- [ ] Добавить `JWT_SECRET` (секрет, сгенерировать)
- [ ] Добавить `TELEGRAM_BOT_USERNAME`
- [ ] Добавить остальные публичные переменные (опционально, есть значения по умолчанию)

---

## ⚠️ Важно

1. **REACT_APP_API_URL** обновить после получения URL backend на Render
2. **JWT_SECRET** должен быть уникальным и безопасным
3. **TELEGRAM_BOT_TOKEN** получается только от @BotFather
4. Все переменные с `REACT_APP_` доступны в React коде
5. Секреты НИКОГДА не коммитьте в Git

