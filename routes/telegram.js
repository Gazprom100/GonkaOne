const express = require('express');
const router = express.Router();
const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || 'gonkaonebot';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://gonkaone.vercel.app';

// Telegram Bot API base URL
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Send message to Telegram
const sendMessage = async (chatId, text, options = {}) => {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN not set');
    return;
  }

  try {
    const response = await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      ...options
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
    throw error;
  }
};

// Webhook endpoint for Telegram
router.post('/webhook', async (req, res) => {
  try {
    const update = req.body;

    // Handle message
    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      const username = update.message.from?.username;
      const firstName = update.message.from?.first_name;

      // Handle /start command
      if (text === '/start' || text?.startsWith('/start')) {
        const referralCode = text.split(' ')[1]; // Get referral code from /start CODE
        
        const message = `👋 Добро пожаловать в <b>GonkaOne</b>!\n\n` +
          `🚀 Коллективный майнинг-пул токенов GNK\n\n` +
          `Нажмите кнопку ниже, чтобы открыть приложение:`;

        const keyboard = {
          inline_keyboard: [[
            {
              text: '🚀 Открыть приложение',
              web_app: { url: referralCode ? `${WEBAPP_URL}?start=${referralCode}` : WEBAPP_URL }
            }
          ]]
        };

        await sendMessage(chatId, message, {
          reply_markup: keyboard
        });
      }
      // Handle /help command
      else if (text === '/help') {
        const message = `📖 <b>Помощь по GonkaOne</b>\n\n` +
          `🔹 <b>/start</b> - Открыть приложение\n` +
          `🔹 <b>/help</b> - Показать эту справку\n` +
          `🔹 <b>/invite</b> - Получить реферальную ссылку\n\n` +
          `Нажмите кнопку меню внизу экрана для быстрого доступа к приложению.`;

        await sendMessage(chatId, message);
      }
      // Handle /invite command
      else if (text === '/invite') {
        // This will be handled by the user's referral code from the database
        // For now, send a generic message
        const message = `🔗 <b>Реферальная программа</b>\n\n` +
          `Откройте приложение, чтобы получить вашу уникальную реферальную ссылку и начать зарабатывать!`;

        const keyboard = {
          inline_keyboard: [[
            {
              text: '🚀 Открыть приложение',
              web_app: { url: WEBAPP_URL }
            }
          ]]
        };

        await sendMessage(chatId, message, {
          reply_markup: keyboard
        });
      }
      // Handle unknown commands
      else if (text?.startsWith('/')) {
        await sendMessage(chatId, 
          `❓ Неизвестная команда. Используйте /help для справки.`
        );
      }
    }

    // Handle callback queries (button clicks)
    if (update.callback_query) {
      const chatId = update.callback_query.message.chat.id;
      const data = update.callback_query.data;

      // Answer callback query
      await axios.post(`${TELEGRAM_API}/answerCallbackQuery`, {
        callback_query_id: update.callback_query.id
      });

      // Handle different callback data if needed
      if (data === 'open_app') {
        const keyboard = {
          inline_keyboard: [[
            {
              text: '🚀 Открыть приложение',
              web_app: { url: WEBAPP_URL }
            }
          ]]
        };

        await sendMessage(chatId, 'Нажмите кнопку ниже, чтобы открыть приложение:', {
          reply_markup: keyboard
        });
      }
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({ ok: false, error: error.message });
  }
});

// Set webhook (for initial setup)
router.post('/setwebhook', async (req, res) => {
  try {
    const webhookUrl = req.body.url || `${WEBAPP_URL.replace('gonkaone.vercel.app', 'api')}/telegram/webhook`;
    
    const response = await axios.post(`${TELEGRAM_API}/setWebhook`, {
      url: webhookUrl
    });

    res.json({
      success: true,
      webhook: response.data
    });
  } catch (error) {
    console.error('Set webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get webhook info
router.get('/webhook-info', async (req, res) => {
  try {
    const response = await axios.get(`${TELEGRAM_API}/getWebhookInfo`);
    res.json({
      success: true,
      webhook: response.data
    });
  } catch (error) {
    console.error('Get webhook info error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

