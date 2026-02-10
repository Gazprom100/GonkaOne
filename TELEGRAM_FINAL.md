# 🎯 Финальная настройка Telegram - Готово к использованию!

## ✅ Текущий статус Vercel

- **Аккаунт**: krasnovinvest-2942 ✅
- **Проект**: kconsulting/gonkaone ✅
- **Статус**: Ready (успешно задеплоено) ✅
- **Production URL**: https://gonkaone-i2zojzoj3-kconsulting.vercel.app
- **Алиасы**:
  - https://gonkaone.vercel.app
  - https://gonkaone-kconsulting.vercel.app
  - https://gonkaone-git-main-kconsulting.vercel.app

## 📱 Настройка Telegram бота

### Шаг 1: Создайте бота

1. Откройте Telegram → **@BotFather**
2. Отправьте: `/newbot`
3. Название: `GonkaOne`
4. Username: `gonkaonebot` (или другой)
5. **Скопируйте токен!**

### Шаг 2: Добавьте токен в Vercel

**Вариант A - Через скрипт (проще):**
```bash
cd /Users/evgenikrasnov/Desktop/GitHub/GonkaOne
./scripts/add-telegram-token.sh
# Введите токен когда попросит
```

**Вариант B - Вручную:**
```bash
echo "ВАШ_ТОКЕН_ОТ_BOTFATHER" | vercel env add TELEGRAM_BOT_TOKEN production
echo "ВАШ_ТОКЕН_ОТ_BOTFATHER" | vercel env add TELEGRAM_BOT_TOKEN preview
echo "ВАШ_ТОКЕН_ОТ_BOTFATHER" | vercel env add TELEGRAM_BOT_TOKEN development
```

**Вариант C - Через веб-интерфейс:**
1. Откройте: https://vercel.com/kconsulting/gonkaone/settings/environment-variables
2. Нажмите **Add New**
3. Name: `TELEGRAM_BOT_TOKEN`
4. Value: вставьте токен
5. Environment: Production, Preview, Development
6. Save

### Шаг 3: Создайте WebApp

1. В @BotFather отправьте: `/newapp`
2. Выберите вашего бота
3. Заполните:
   - **Title**: `GonkaOne`
   - **Description**: `Коллективный майнинг-пул с реферальной программой`
   - **Web App URL**: `https://gonkaone.vercel.app` (используйте алиас)
   - **Short name**: `gonkaone`
4. Сохраните

### Шаг 4: Настройте кнопку меню

1. В @BotFather: `/setmenubutton`
2. Выберите бота
3. **Text**: `🚀 Открыть` или `Начать`
4. **Web App**: выберите созданное WebApp

## ✅ Проверка

1. Найдите бота в Telegram
2. Нажмите кнопку меню
3. Должно открыться приложение GonkaOne

## 🔗 Полезные ссылки

- **Vercel Dashboard**: https://vercel.com/kconsulting/gonkaone
- **Deployments**: https://vercel.com/kconsulting/gonkaone/deployments
- **Environment Variables**: https://vercel.com/kconsulting/gonkaone/settings/environment-variables
- **Production URL**: https://gonkaone.vercel.app

## 📝 Текущие переменные

Проверить:
```bash
vercel env ls
```

Требуется:
- ✅ `TELEGRAM_BOT_USERNAME` - есть
- ⏳ `TELEGRAM_BOT_TOKEN` - добавить после создания бота

## 🎉 Готово!

После выполнения всех шагов ваш Telegram бот будет полностью настроен и готов к работе!

