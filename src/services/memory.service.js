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

  /**
   * Lấy thông tin khách hàng (phục vụ Prompt Khách cũ)
   */
  /**
   * Lấy thông tin khách hàng (phục vụ Prompt Khách cũ & Router Logic)
   */
  getCustomerMetadata(customerId) {
    const customer = db.prepare('SELECT phone, stage, total_orders, status, priority_level FROM customers WHERE id = ?').get(customerId);
    if (!customer) return null;

    // Kiểm tra khiếu nại đang mở
    const activeComplaint = db.prepare("SELECT * FROM complaints WHERE customer_id = ? AND status = 'open' LIMIT 1").get(customerId);

    // Lấy lịch sử sản phẩm đã mua từ outcomes
    const purchases = db.prepare(`
      SELECT p.name, o.created_at 
      FROM outcomes o
      JOIN products p ON o.product_id = p.id
      WHERE o.customer_id = ? AND o.result = 'bought'
      ORDER BY o.created_at DESC
    `).all(customerId);

    return {
      phone: customer.phone,
      stage: customer.stage,
      status: customer.status, // new_lead, returning_prospect, existing_customer, blacklist
      priority_level: customer.priority_level, // normal, VIP
      total_orders: customer.total_orders,
      active_complaint: activeComplaint,
      purchased_products: purchases.map(p => p.name).join(', '),
      last_purchase_date: purchases.length > 0 ? purchases[0].created_at : 'Chưa có',
      purchase_history: purchases.map(p => `${p.name} (${p.created_at})`).join('; ')
    };
  }

  /**
   * Tạo khiếu nại mới (Mục 8 - Router Logic)
   */
  createComplaint(conversationId, customerId, content, type = 'chưa_phân_loại') {
    const id = `comp_${Date.now()}`;
    const stmt = db.prepare(`
      INSERT INTO complaints (id, customer_id, conversation_id, content, type) 
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, customerId, conversationId, content, type);
    return id;
  }
}

module.exports = new MemoryService();
