const app = require('./src/app');
const config = require('./src/config/env');
const { startTelegramBot } = require('./src/services/telegram.service');

// Cấu hình tạm thời để Fix lỗi SSL Certificate khi gọi Telegram API (sh: nodemon: command not found)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Khởi chạy Telegram Bot
startTelegramBot();

app.listen(config.port, () => {
  console.log(`
  🚀---------------------------------------------------🚀
     Huy Chatbot AI v5.0 (Premium)
     URL: http://localhost:${config.port}
     Status: Trực chiến 🫡
  🚀---------------------------------------------------🚀
  `);
});
