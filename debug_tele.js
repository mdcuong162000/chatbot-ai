const { Telegraf } = require('telegraf');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const bot = new Telegraf('8636510262:AAFX3cDuGrag-njA40xEU8R5cvbSpH1_fZk');

bot.start((ctx) => {
  console.log('Bot started by:', ctx.from.id);
  ctx.reply('Huy nghe đây sếp! 🫡');
});

console.log('DEBUG: Launching bot...');
bot.launch()
  .then(() => console.log('DEBUG: Bot launched successfully!'))
  .catch((err) => console.error('DEBUG: Bot launch failed:', err.message));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
