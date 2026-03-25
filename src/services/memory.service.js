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
   * Truy vết và Gộp khách hàng (Cross-Channel Identity)
   */
  extractAndMergeCustomer(conversationId, content) {
    // Regex tìm SĐT VN (Ví dụ: 0901234567, 038...)
    const phoneRegex = /(0[3|5|7|8|9])+([0-9]{8})\b/g;
    const match = content.match(phoneRegex);
    if (!match) return;
    
    const phone = match[0];
    
    // Lấy customer_id hiện tại từ conversationId
    const conv = db.prepare('SELECT customer_id FROM conversations WHERE id = ?').get(conversationId);
    if (!conv) return;
    const currentCustId = conv.customer_id;
    
    // Kiểm tra xem SĐT này đã có ai (kênh khác) đăng ký chưa
    const existingCust = db.prepare('SELECT id FROM customers WHERE phone = ? AND id != ?').get(phone, currentCustId);
    
    if (existingCust) {
      const targetId = existingCust.id;
      // Gộp data: Chuyển toàn bộ hội thoại và lịch sử chốt đơn sang targetId
      db.prepare('UPDATE conversations SET customer_id = ? WHERE customer_id = ?').run(targetId, currentCustId);
      
      // Bảng outcomes có thể chưa có customer_id, nhưng update an toàn (nếu scheme có sẵn)
      try {
        db.prepare('UPDATE outcomes SET customer_id = ? WHERE customer_id = ?').run(targetId, currentCustId);
      } catch (e) { /* ignore nếu schema cũ chưa có customer_id */ }
      
      // Xóa profile ảo hiện tại
      db.prepare('DELETE FROM customers WHERE id = ?').run(currentCustId);
      console.log(`[MERGE IDENTITY] Đã gộp lịch sử Khách ${currentCustId} vào ${targetId} qua SĐT ${phone}`);
    } else {
      // Lưu lại SĐT cho user hiện tại nếu chưa có
      db.prepare('UPDATE customers SET phone = ? WHERE id = ? AND phone IS NULL').run(phone, currentCustId);
    }
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

    // Kích hoạt Định danh Xuyên kênh khi User nhắn
    if (role === 'user') {
      try {
        this.extractAndMergeCustomer(conversationId, content);
      } catch (err) {
        console.error('Lỗi khi Merge Identity:', err);
      }
    }
  }

  /**
   * Lấy lịch sử (- N tin gần nhất: Context Window Manager)
   * Giới hạn 10 tin để tránh vỡ Token LLM
   */
  getHistory(conversationId, limit = 10) {
    // Phải lấy tin mới nhất (ORDER BY DESC) sau đó đảo ngược dòng thời gian lại để LLM hiểu
    const stmt = db.prepare(`
      SELECT role, content FROM (
        SELECT role, content, created_at 
        FROM messages 
        WHERE conversation_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      ) ORDER BY created_at ASC
    `);
    return stmt.all(conversationId, limit);
  }
}

module.exports = new MemoryService();
