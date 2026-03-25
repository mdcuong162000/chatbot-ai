const db = require('../db');
const aiService = require('./ai.service');

class NotificationService {
  /**
   * Chạy toàn bộ các trigger (Mục 7)
   */
  async runAllTriggers() {
    console.log('[NOTIFICATION] Khởi động đợt quét trigger định kỳ...');
    
    // 1. Nhắc thanh toán (Trigger 1)
    await this.triggerPaymentReminders();
    
    // 2. Follow-up khách chưa mua (Trigger 4)
    await this.triggerFollowUps();
    
    // 3. Upsell cho khách cũ (Trigger 5)
    await this.triggerUpsells();

    console.log('[NOTIFICATION] Hoàn tất đợt quét.');
  }

  /**
   * TRIGGER 1: Nhắc thanh toán (2h sau khi tạo đơn)
   */
  async triggerPaymentReminders() {
    // Demo logic: Tìm các outcome 'pending' (chưa thanh toán) tạo cách đây > 2h
    const pendingOrders = db.prepare(`
      SELECT o.*, c.name as customer_name, c.phone 
      FROM outcomes o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.result = 'pending' 
      AND o.created_at <= datetime('now', '-2 hours')
      AND o.created_at >= datetime('now', '-24 hours')
    `).all();

    for (const order of pendingOrders) {
      if (this.canSendNotification(order.customer_id)) {
        const message = `Chào ${order.customer_name}! Đơn hàng của mình vẫn đang chờ thanh toán ạ. Bạn có cần em hỗ trợ gì thêm để giữ đơn không ạ?`;
        this.sendOutbound(order.customer_id, message, 'payment_reminder');
      }
    }
  }

  /**
   * TRIGGER 4: Follow-up chưa mua (48h sau hội thoại)
   */
  async triggerFollowUps() {
    const prospects = db.prepare(`
      SELECT c.id as customer_id, c.name, conv.id as conv_id
      FROM customers c
      JOIN conversations conv ON c.id = conv.customer_id
      WHERE c.total_orders = 0 
      AND conv.status = 'open'
      AND conv.started_at <= datetime('now', '-48 hours')
    `).all();

    for (const p of prospects) {
      if (this.canSendNotification(p.customer_id)) {
        const message = `Dạ hôm trước mình có hỏi thăm về sản phẩm bên em, không biết anh/chị còn băn khoăn điểm nào không ạ? Để em giải đáp thêm cho mình nhé!`;
        this.sendOutbound(p.customer_id, message, 'follow_up');
      }
    }
  }

  /**
   * KIỂM TRA 4 LỚP CHỐNG SPAM (Mục 7 - Lớp kiểm tra)
   */
  canSendNotification(customerId) {
    const customer = db.prepare('SELECT status, last_notification_at FROM customers WHERE id = ?').get(customerId);
    
    if (!customer) return false;
    if (customer.status === 'blacklist') return false;
    
    // Đã gửi trong vòng 24h qua chưa?
    if (customer.last_notification_at && new Date(customer.last_notification_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      return false;
    }

    // Kiểm tra khiếu nại đang mở (Lớp 2)
    const activeComplaint = db.prepare("SELECT id FROM complaints WHERE customer_id = ? AND status = 'open'").get(customerId);
    if (activeComplaint) return false;

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
