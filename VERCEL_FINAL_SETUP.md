# ✅ Финальная настройка Vercel

## 🎉 Что уже сделано:

1. ✅ Проект отправлен в GitHub: https://github.com/Gazprom100/GonkaOne
2. ✅ Vercel подключен к GitHub репозиторию
3. ✅ Проект создан: `kconsulting/gonkaone`

## ⚙️ Настройка через веб-интерфейс Vercel

Перейдите в настройки проекта: https://vercel.com/kconsulting/gonkaone/settings

### 1. Настройте Root Directory

1. Откройте **Settings** → **General**
2. Найдите раздел **Root Directory**
3. Установите: `client`
4. Сохраните изменения

### 2. Настройте Build & Development Settings

В разделе **Build & Development Settings**:

- **Framework Preset**: Create React App
- **Build Command**: `npm run build` (или оставьте автоматический)
- **Output Directory**: `build`
- **Install Command**: `npm install` (или оставьте автоматический)

### 3. Добавьте переменные окружения

В разделе **Environment Variables** добавьте:

```
REACT_APP_API_URL=https://your-backend-url.com/api
```

(Обновите после деплоя backend)

### 4. Запустите деплой

После настройки:
- Перейдите в **Deployments**
- Нажмите **Redeploy** на последнем деплое
- Или сделайте новый push в GitHub (автоматический деплой)

## 🔄 Альтернатива: Деплой через CLI после настройки

После настройки root directory через веб-интерфейс:

```bash
cd /Users/evgenikrasnov/Desktop/GitHub/GonkaOne
vercel --prod --yes
```

## 📝 Проверка деплоя

После успешного деплоя вы получите:
- **Production URL**: https://gonkaone-*.vercel.app
- **Preview URL**: для каждого коммита

## 🚀 Следующие шаги

1. ✅ Настройте Root Directory в Vercel (через веб-интерфейс)
2. ⏳ Деплойте backend на Render.com
3. ⏳ Обновите `REACT_APP_API_URL` в переменных окружения
4. ⏳ Настройте Telegram WebApp в @BotFather

## 🔗 Полезные ссылки

- **Vercel Dashboard**: https://vercel.com/kconsulting/gonkaone
- **GitHub Repo**: https://github.com/Gazprom100/GonkaOne
- **Deployments**: https://vercel.com/kconsulting/gonkaone/deployments

