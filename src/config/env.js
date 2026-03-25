require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  openaiApiKey: process.env.OPENAI_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  groqApiKey: process.env.GROQ_API_KEY,
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  allowedUserId: process.env.ALLOWED_USER_ID,
  messengerPageAccessToken: process.env.MESSENGER_PAGE_ACCESS_TOKEN,
  messengerAppSecret: process.env.MESSENGER_APP_SECRET,
};
