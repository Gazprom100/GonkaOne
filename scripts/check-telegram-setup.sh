#!/bin/bash

echo "🔍 Проверка настройки Telegram WebApp"
echo ""

# Проверка переменных в Vercel
echo "📋 Переменные окружения в Vercel:"
vercel env ls | grep TELEGRAM || echo "❌ Переменные не найдены"

echo ""
echo "🌐 Проверка доступности приложения:"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://gonkaone.vercel.app)
if [ "$STATUS" = "200" ]; then
  echo "✅ Приложение доступно: https://gonkaone.vercel.app"
else
  echo "❌ Приложение недоступно (код: $STATUS)"
fi

echo ""
echo "📱 Инструкция по настройке WebApp:"
echo ""
echo "1. Откройте @BotFather в Telegram"
echo "2. Отправьте: /newapp"
echo "3. Выберите вашего бота"
echo "4. Заполните:"
echo "   - Title: GonkaOne"
echo "   - Description: Коллективный майнинг-пул"
echo "   - Web App URL: https://gonkaone.vercel.app"
echo "   - Short name: gonkaone"
echo ""
echo "5. Настройте кнопку меню:"
echo "   - Отправьте: /setmenubutton"
echo "   - Выберите бота"
echo "   - Text: 🚀 Открыть"
echo "   - Web App: выберите созданное WebApp"
echo ""

