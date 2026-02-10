#!/bin/bash

# Скрипт для добавления Telegram токена в Vercel

echo "🔐 Добавление Telegram Bot Token в Vercel"
echo ""
echo "Введите токен от @BotFather (формат: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz):"
read -s TOKEN

if [ -z "$TOKEN" ]; then
  echo "❌ Токен не может быть пустым"
  exit 1
fi

echo ""
echo "📤 Добавляю токен в Vercel..."

echo "$TOKEN" | vercel env add TELEGRAM_BOT_TOKEN production
echo "$TOKEN" | vercel env add TELEGRAM_BOT_TOKEN preview
echo "$TOKEN" | vercel env add TELEGRAM_BOT_TOKEN development

echo ""
echo "✅ Токен добавлен во все окружения!"
echo ""
echo "Проверка:"
vercel env ls | grep TELEGRAM_BOT_TOKEN

