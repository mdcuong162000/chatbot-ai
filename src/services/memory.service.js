const db = require('../db');

class MemoryService {
  /**
   * Tạo cuộc hội thoại mới nếu chưa có
   */
  getOrCreateConversation(customerId, channel = 'web') {
    // Tìm hội thoại đang mở
    const stmtFind = db.prepare(`
      SELECT id FROM conversations 
      WHERE customer_id = ? AND channel = ? AND status = 'open'
    `);
    let conv = stmtFind.get(customerId, channel);

    if (!conv) {
      const newId = `conv_${Date.now()}`;
      
      // Đảm bảo khách hàng tồn tại trước
      const stmtCustomer = db.prepare('INSERT OR IGNORE INTO customers (id, name) VALUES (?, ?)');
      stmtCustomer.run(customerId, `Guest_${customerId.substring(0, 4)}`);

      // Tạo conversation
      const stmtCreate = db.prepare(`
        INSERT INTO conversations (id, customer_id, channel, status) VALUES (?, ?, ?, ?)
      `);
      stmtCreate.run(newId, customerId, channel, 'open');
      return newId;
    }
    return conv.id;
  }

  /**
   * Lưu tin nhắn vào DB
   */
  logMessage(conversationId, role, content) {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const stmt = db.prepare(`
      INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, conversationId, role, content);
  }

  /**
   * Lấy lịch sử (- N tin gần nhất)
   */
  getHistory(conversationId, limit = 20) {
    const stmt = db.prepare(`
      SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT ?
    `);
    return stmt.all(conversationId, limit);
  }
}

module.exports = new MemoryService();
