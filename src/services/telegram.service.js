const { Telegraf } = require('telegraf');
const config = require('../config/env');
const aiService = require('./ai.service');
const { logToSharedMemory } = require('./memory.service');
const { executeCommand } = require('./shell.service');
const fs = require('fs');
const path = require('path');

/**
 * Ghi nhật ký hành động để sếp nhìn thấy tại IDE
 */
function logToIdeStatus(action, details) {
  try {
    const statusPath = path.join(__dirname, '../../IDE_LIVE_STATUS.md');
    const timestamp = new Date().toLocaleString('vi-VN');
    const logEntry = `\n### ⚡ [${timestamp}] ${action}\n> ${details}\n---\n`;
    fs.appendFileSync(statusPath, logEntry);
  } catch (e) {
    console.error("Lỗi log IDE status:", e.message);
  }
}

const bot = new Telegraf(config.telegramBotToken);

/**
 * Middleware bảo mật: Chỉ cho phép sếp Cường
 */
bot.use(async (ctx, next) => {
  const userId = ctx.from.id.toString();
  
  if (userId !== config.allowedUserId) {
    console.log(`⚠️ Truy cập trái phép từ ID: ${userId}`);
    return ctx.reply("Xin lỗi, Huy chỉ nghe lệnh của sếp Cường thôi ạ! 🫡");
  }
  return next();
});

const SHELL_AI_PROMPT = `
  Dịch yêu cầu sau của sếp Cường sang lệnh shell linux để THỰC THI TRỰC TIẾP TRÊN DỰ ÁN. 
  - Thư mục gốc: chatbot-ai.
  - TUYỆT ĐỐI KHÔNG dùng lệnh tương tác: nano, vi, vim, emacs, less, top, ed.
  - Để viết code/tạo file: Dùng 'cat <<EOF > filename\n[nội dung code]\nEOF' (ghi đè) hoặc 'cat <<EOF >> filename\n[nội dung]\nEOF' (nối thêm).
  - Luôn tạo thư mục nếu cần (mkdir -p).
  - CHỈ TRẢ VỀ LỆNH, KHÔNG GIẢI THÍCH.
`;

/**
 * [COMMAND] /sh <lệnh>
 * Thực thi shell (tự động dịch nếu là Tiếng Việt)
 */
bot.command('sh', async (ctx) => {
  let command = ctx.message.text.split(' ').slice(1).join(' ');
  
  if (!command) {
    return ctx.reply("Sếp ơi, sếp gõ thêm lệnh đằng sau `/sh` nhé. Ví dụ: `/sh ls -la` 🫡");
  }

  await ctx.sendChatAction('typing');

  const isNaturalLanguage = /[àáạảãèéẹẻẽìíịỉĩòóọỏõùúụủũưứựửữỳýỵỷỹ]/.test(command) || !/^[a-zA-Z0-9\s._\-/\\*|]+$/.test(command);

  if (isNaturalLanguage) {
    const aiHint = await aiService.getChatResponse(`${SHELL_AI_PROMPT}\nYêu cầu: "${command}"`, [], { skipGreeting: true });
    command = aiHint.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim().split('\n')[0];
    await ctx.reply(`🧐 Huy đã dịch yêu cầu của sếp sang lệnh: \`${command}\``);
  }

  await ctx.reply(`⚙️ Đang thực thi: \`${command}\`...`);
  logToIdeStatus("GIAO VIỆC", `Đang chạy lệnh: \`${command}\``);
  const output = await executeCommand(command);
  logToIdeStatus("KẾT QUẢ", `Hoàn thành lệnh: \`${command}\` (Output: ${output.substring(0, 50)}...)`);
  
  const finalOutput = output.length > 3500 ? output.substring(0, 3500) + "\n... (Bị cắt tỉa cho gọn)" : output;
  ctx.reply(`\`\`\`\n${finalOutput}\n\`\`\``, { parse_mode: 'Markdown' });
});

/**
 * [COMMAND] /sh-ai <yêu cầu tự nhiên>
 * Dịch và thực thi NGAY LẬP TỨC
 */
bot.command('sh-ai', async (ctx) => {
  const request = ctx.message.text.split(' ').slice(1).join(' ');
  
  if (!request) {
    return ctx.reply("Sếp ơi, sếp gõ yêu cầu sau `/sh-ai` nhé. Ví dụ: `/sh-ai tạo file test.js` 🫡");
  }

  await ctx.sendChatAction('typing');
  const waitMsg = await ctx.reply(`🤖 Huy đang dịch và chuẩn bị thực thi yêu cầu: "${request}"...`);
  
  try {
    const aiHint = await aiService.getChatResponse(`${SHELL_AI_PROMPT}\nYêu cầu: "${request}"`, [], { skipGreeting: true });
    const command = aiHint.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim();
    
    await ctx.telegram.editMessageText(ctx.chat.id, waitMsg.message_id, null, `⚙️ Đang thực thi lệnh: \`${command}\`...`);
    logToIdeStatus("MAGIC COMMAND", `Sếp ra lệnh: "${request}" -> Dịch sang: \`${command}\``);
    
    const output = await executeCommand(command);
    logToIdeStatus("MAGIC RESULT", `Đã thực thi xong lệnh cho "${request}"`);
    const finalOutput = output.length > 3000 ? output.substring(0, 3000) + "\n... (Cắt tỉa)" : output;
    
    ctx.reply(`✅ Huy đã hoàn thành yêu cầu của sếp! 🫡\n\n**Kết quả:**\n\`\`\`\n${finalOutput}\n\`\`\``, { parse_mode: 'Markdown' });
  } catch (error) {
    ctx.reply(`Lỗi thực thi 'Magic Command' sếp ơi! 🤖\nLỗi: ${error.message}`);
  }
});

/**
 * [COMMAND] /status & /task
 */
bot.command('status', async (ctx) => {
  try {
    const taskPath = '/Users/trangle/.gemini/antigravity/brain/961532ef-8094-4f0e-b276-3968a36b7e81/task.md';
    const taskContent = fs.readFileSync(taskPath, 'utf-8');
    ctx.reply(`📊 **Tình hình dự án tại IDE:**\n\n${taskContent}`, { parse_mode: 'Markdown' });
  } catch (error) {
    ctx.reply("Huy chưa tìm thấy file task.md sếp ơi! 🤖");
  }
});

bot.command('task', async (ctx) => {
  const request = ctx.message.text.split(' ').slice(1).join(' ');
  if (!request) return ctx.reply("Sếp gõ yêu cầu sau `/task` nhé. 🫡");

  try {
    const taskPath = '/Users/trangle/.gemini/antigravity/brain/961532ef-8094-4f0e-b276-3968a36b7e81/task.md';
    fs.appendFileSync(taskPath, `\n- [ ] [REMOTE] ${request} (${new Date().toLocaleString('vi-VN')})`);
    ctx.reply(`✅ Huy đã ghi lại: "${request}" vào task.md! 🫡`);
  } catch (error) {
    ctx.reply("Không ghi được task sếp ơi! 🤖");
  }
});

/**
 * Xử lý tin nhắn văn bản & AI Interpreter
 */
bot.on('text', async (ctx) => {
  const message = ctx.message.text;
  logToSharedMemory('user', message);
  
  try {
    await ctx.sendChatAction('typing');
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.startsWith('huy') || lowerMsg.includes('hãy') || lowerMsg.includes('làm')) {
      const aiHint = await aiService.getChatResponse(`${SHELL_AI_PROMPT}\nYêu cầu: "${message}"`, [], { skipGreeting: true });
      const command = aiHint.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim();
      return ctx.reply(`Huy đã hiểu! Sếp muốn thực thi lệnh này đúng không ạ? 🫡\n\n\`${command}\`\n\n(Bấm để chạy: /sh ${command})`);
    }

    const reply = await aiService.getChatResponse(message);
    logToSharedMemory('assistant', reply);
    ctx.reply(reply);
  } catch (error) {
    ctx.reply("Có lỗi xảy ra sếp ơi! 🤖");
  }
});

function startTelegramBot() {
  if (!config.telegramBotToken) return;

  bot.telegram.deleteWebhook({ drop_pending_updates: true })
    .then(() => bot.launch())
    .then(() => console.log("✅ Telegram Bot của Huy đã sẵn sàng nhận lệnh! 🫡"))
    .catch((err) => console.error("❌ Lỗi Telegram Bot:", err.message));

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

module.exports = { startTelegramBot };
