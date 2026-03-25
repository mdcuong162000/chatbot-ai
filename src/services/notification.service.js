const db = require('../db');
const aiService = require('./ai.service');

class NotificationService {
  /**
   * Chạy toàn bộ các trigger (Mục 7)
   */
  async runAllTriggers() {
    console.log('[NOTIFICATION] Khởi động đợt quét trigger định kỳ...');
    
    // Đọc setting xem có bật auto không
    const settings = await this.getSettings();
    if (settings.enable_auto_notifications === '0') {
      console.log('[NOTIFICATION] Tự động thông báo đang TẮT.');
      return;
    }

    // 1. Nhắc thanh toán (Trigger 1)
    await this.triggerPaymentReminders();
    
    // 2. Cập nhật đơn hàng (Trigger 2 - Giả lập qua outcomes)
    await this.triggerOrderUpdates();

    // 3. Hỏi review (Trigger 3)
    await this.triggerReviewRequests();

    // 4. Follow-up khách chưa mua (Trigger 4)
    await this.triggerFollowUps();
    
    // 5. Upsell cho khách cũ (Trigger 5)
    await this.triggerUpsells();

    // 6. Tái kích hoạt (Trigger 6)
    await this.triggerReactivations();

    // 7. Sinh nhật (Trigger 7)
    await this.triggerBirthdayGreetings();

    console.log('[NOTIFICATION] Hoàn tất đợt quét.');
  }

  async getSettings() {
    const rows = db.prepare('SELECT key, value FROM system_settings').all();
    const settings = {};
    rows.forEach(r => settings[r.key] = r.value);
    return settings;
  }

  /**
   * TRIGGER 2: Cập nhật đơn hàng (Thường bắn real-time, ở đây demo quét định kỳ)
   */
  async triggerOrderUpdates() {
    // Demo: Tìm đơn hàng mới tạo trong 30p qua chưa báo
    const newOrders = db.prepare(`
      SELECT o.*, c.name FROM outcomes o 
      JOIN customers c ON o.customer_id = c.id
      WHERE o.result = 'bought' AND o.created_at >= datetime('now', '-30 minutes')
    `).all();
    for (const o of newOrders) {
        this.sendOutbound(o.customer_id, `Xác nhận: Đơn hàng cho ${o.name} đã được hệ thống ghi nhận!`, 'order_update');
    }
  }

  /**
   * TRIGGER 3: Hỏi review (3 ngày sau giao)
   */
  async triggerReviewRequests() {
    const shippedOrders = db.prepare(`
        SELECT o.*, c.name FROM outcomes o
        JOIN customers c ON o.customer_id = c.id
        WHERE o.result = 'bought' AND o.created_at <= datetime('now', '-3 days')
        AND o.created_at >= datetime('now', '-4 days')
    `).all();
    for (const o of shippedOrders) {
        if (this.canSendNotification(o.customer_id)) {
            this.sendOutbound(o.customer_id, `Chào ${o.name}! Bạn dùng sản phẩm 3 ngày rồi, cảm giác thế nào ạ? Cho shop xin review nhé!`, 'review_request');
        }
    }
  }

  /**
   * TRIGGER 6: Tái kích hoạt (30 ngày không tương tác)
   */
  async triggerReactivations() {
    const idleCustomers = db.prepare(`
        SELECT id, name FROM customers 
        WHERE last_notification_at <= datetime('now', '-30 days')
        OR (last_notification_at IS NULL AND created_at <= datetime('now', '-30 days'))
    `).all();
    for (const c of idleCustomers) {
        if (this.canSendNotification(c.id)) {
            this.sendOutbound(c.id, `Lâu rồi không gặp ${c.name}! Shop có vài thứ mới, không biết mình có quan tâm không ạ?`, 'reactivation');
        }
    }
  }

  /**
   * TRIGGER 7: Sinh nhật
   */
  async triggerBirthdayGreetings() {
    // Format birthday: 'MM-DD' hoặc 'YYYY-MM-DD'
    const today = new Date().toISOString().slice(5, 10); // 'MM-DD'
    const bdayCustomers = db.prepare(`
        SELECT id, name FROM customers WHERE birthday LIKE ?
    `).all(`%${today}`);
    for (const c of bdayCustomers) {
        if (this.canSendNotification(c.id)) {
            this.sendOutbound(c.id, `Chúc mừng sinh nhật ${c.name}! Shop có món quà nhỏ dành riêng cho bạn hôm nay ạ.`, 'birthday');
        }
    }
  }

  // ... (Keep existing triggerPaymentReminders, triggerFollowUps, triggerUpsells) ...

  canSendNotification(customerId) {
    const customer = db.prepare('SELECT status, last_notification_at FROM customers WHERE id = ?').get(customerId);
    if (!customer) return false;
    
    // LỚP 1: Chống gửi quá 1 tin/ngày
    if (customer.last_notification_at && new Date(customer.last_notification_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
        return false;
    }

    // LỚP 2: Blacklist
    if (customer.status === 'blacklist') return false;

    // LỚP 3: Khiếu nại đang mở (Mục 7 - Lớp 2 DOC)
    const activeComplaint = db.prepare("SELECT id FROM complaints WHERE customer_id = ? AND status = 'open'").get(customerId);
    if (activeComplaint) return false;

    // LỚP 4: Opt-out (Giả lập)
    return true;
  }

  /**
   * Gửi tin nhắn ra ngoài (Mock gửi đi các kênh)
   */
  sendOutbound(customerId, text, type) {
    console.log(`[OUTBOUND] Gửi tin ${type} tới Khách ${customerId}: ${text}`);
    
    // Cập nhật log gửi để chống spam
    db.prepare('UPDATE customers SET last_notification_at = CURRENT_TIMESTAMP WHERE id = ?').run(customerId);
    
    // Thực tế sẽ gọi API FB/Zalo tại đây.
  }
}

module.exports = new NotificationService();
