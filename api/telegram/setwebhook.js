// Vercel Serverless Function to set Telegram webhook
const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const webhookUrl = req.body.url || `https://gonkaone.vercel.app/api/telegram/webhook`;
    
    const response = await axios.post(`${TELEGRAM_API}/setWebhook`, {
      url: webhookUrl
    });

    return res.json({
      success: true,
      webhook: response.data
    });
  } catch (error) {
    console.error('Set webhook error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

