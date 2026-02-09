# Инструкция по деплою GonkaOne

## Подготовка к деплою

### 1. Настройка переменных окружения

Создайте файл `.env` на основе `.env.example` и заполните все необходимые переменные:

```env
PORT=3000
NODE_ENV=production
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username
JWT_SECRET=your_secure_random_secret
DB_PATH=./data/gonkaone.db
```

### 2. Сборка проекта

```bash
# Установка зависимостей
npm run install-all

# Сборка frontend
cd client
npm run build
cd ..
```

## Деплой на Render.com

1. Подключите GitHub репозиторий к Render
2. Создайте новый Web Service
3. Настройки:
   - **Build Command**: `npm install && cd client && npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
4. Добавьте переменные окружения из `.env`
5. Деплой

## Деплой на Vercel

1. Установите Vercel CLI: `npm i -g vercel`
2. В корне проекта выполните: `vercel`
3. Настройте переменные окружения в панели Vercel
4. Для production: `vercel --prod`

**Важно**: Vercel лучше подходит для frontend. Для полноценной работы нужен отдельный backend на Render/Heroku.

## Деплой на Netlify

1. Подключите репозиторий к Netlify
2. Настройки сборки:
   - **Build command**: `cd client && npm install && npm run build`
   - **Publish directory**: `client/build`
3. Добавьте переменные окружения
4. Деплой

**Важно**: Netlify также лучше для frontend. Backend нужно деплоить отдельно.

## Рекомендуемая архитектура

### Вариант 1: Все на Render.com
- Frontend + Backend на одном сервисе
- Используйте `render.yaml` для автоматической настройки

### Вариант 2: Раздельный деплой
- **Frontend**: Vercel/Netlify (быстрый CDN)
- **Backend**: Render.com/Heroku (Node.js сервер)
- Настройте CORS на backend для работы с frontend доменом

## Настройка Telegram бота

1. Создайте бота через @BotFather
2. Получите токен
3. Настройте WebApp:
   - В BotFather: `/newapp` → выберите бота
   - Укажите название и описание
   - Добавьте URL вашего приложения
   - Получите WebApp URL

4. Добавьте кнопку меню в бота:
```
/setmenubutton
Выберите бота
Text: Открыть приложение
Web App: [ваш WebApp URL]
```

## Проверка после деплоя

1. Проверьте `/health` endpoint
2. Проверьте авторизацию через Telegram
3. Проверьте создание пулов
4. Проверьте реферальную систему

## Обновление базы данных

После первого деплоя выполните seed скрипт для создания тестовых пулов:

```bash
node scripts/seed.js
```

Или создайте пулы через админ-панель (если реализована).

## Мониторинг

- Проверяйте логи в панели Render/Vercel
- Настройте алерты на ошибки
- Мониторьте использование ресурсов

## Безопасность

- Никогда не коммитьте `.env` файл
- Используйте сильные JWT секреты
- Настройте HTTPS (автоматически на Render/Vercel)
- Ограничьте CORS только нужными доменами

