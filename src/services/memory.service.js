const fs = require('fs');
const path = require('path');

const MEMORY_PATH = path.join(__dirname, '../../.agent/context/telegram-history.json');

/**
 * Ghi lại nhật ký hội thoại để Huy tại IDE có thể đọc và đồng bộ
 * @param {string} role - 'user' hoặc 'assistant'
 * @param {string} content - Nội dung tin nhắn
 */
function logToSharedMemory(role, content) {
  try {
    const dir = path.dirname(MEMORY_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let history = [];
    if (fs.existsSync(MEMORY_PATH)) {
      const data = fs.readFileSync(MEMORY_PATH, 'utf-8');
      history = JSON.parse(data);
    }

    history.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });

    // Chỉ giữ lại 50 tin gần nhất để tối ưu dung lượng
    if (history.length > 50) history.shift();

    fs.writeFileSync(MEMORY_PATH, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('Lỗi khi ghi Ký ức dùng chung:', error.message);
  }
}

module.exports = {
  logToSharedMemory,
  MEMORY_PATH
};
