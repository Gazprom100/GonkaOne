#!/bin/bash

echo "🔧 Настройка Telegram Webhook для GonkaOne"
echo ""

# Get bot token from Vercel
echo "📋 Получаем TELEGRAM_BOT_TOKEN из Vercel..."
TOKEN=$(vercel env pull .env.local 2>/dev/null && grep TELEGRAM_BOT_TOKEN .env.local | cut -d '=' -f2 | tr -d '"' || echo "")

if [ -z "$TOKEN" ]; then
  echo "❌ TELEGRAM_BOT_TOKEN не найден в Vercel"
  echo "💡 Добавьте токен через: vercel env add TELEGRAM_BOT_TOKEN production"
  exit 1
fi

echo "✅ Токен найден"
echo ""

# Webhook URL
WEBHOOK_URL="https://gonkaone.vercel.app/api/telegram/webhook"

echo "🌐 Настраиваем webhook: $WEBHOOK_URL"
echo ""

# Set webhook via Telegram API
RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot${TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"${WEBHOOK_URL}\"}")

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

# Check webhook info
echo "🔍 Проверяем информацию о webhook..."
WEBHOOK_INFO=$(curl -s "https://api.telegram.org/bot${TOKEN}/getWebhookInfo")
echo "$WEBHOOK_INFO" | python3 -m json.tool 2>/dev/null || echo "$WEBHOOK_INFO"
echo ""

echo "✅ Готово!"
echo ""
echo "📱 Теперь бот будет отвечать на команды:"
echo "   • /start - Открыть приложение"
echo "   • /help - Справка"
echo "   • /invite - Реферальная ссылка"

