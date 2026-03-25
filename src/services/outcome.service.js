const db = require('../db');
const knowledgeService = require('./knowledge.service');
const memoryService = require('./memory.service');

class OutcomeService {
  /**
   * Ghi nhận kết quả của một cuộc hội thoại (Chốt đơn/Thất bại)
   */
  logOutcome(data) {
    const id = `out_${Date.now()}`;
    const stmt = db.prepare(`
      INSERT INTO outcomes (id, conversation_id, product_id, customer_id, customer_segment, customer_stage, style_used, result, reason_no_buy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.conversationId,
      data.productId,
      data.customerId,
      data.customerSegment || null,
      data.customerStage || 'danh_gia',
      data.styleUsed || 'neutral',
      data.result, // 'bought' | 'no_buy'
      data.reasonNoBuy || null
    );

    // Nếu MUA -> Update Funnel stage của khách thành 'da_mua' và tăng order count
    if (data.result === 'bought') {
      db.prepare(`
        UPDATE customers 
        SET stage = 'da_mua', 
            total_orders = total_orders + 1, 
            status = 'active_customer',
            stage_updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(data.customerId);

      // Tự động nâng cấp VIP nếu đạt mốc (Phase 13)
      const customer = db.prepare('SELECT total_orders FROM customers WHERE id = ?').get(data.customerId);
      if (customer && customer.total_orders >= 5) {
        db.prepare("UPDATE customers SET priority_level = 'high' WHERE id = ?").run(data.customerId);
      }
    } else if (data.result === 'no_buy') {
      // Gắn nhãn tiềm năng nếu khách hỏi nhiều nhưng chưa mua (Phase 13)
      db.prepare("UPDATE customers SET status = 'warm_lead' WHERE id = ? AND total_orders = 0").run(data.customerId);
    }
    
    return { success: true, outcomeId: id };
  }

  /**
   * Kiểm tra xem hội thoại có cần chuyển cho người thật không (The 4 Handover Rules)
   * Trả về { handover: true/false, reason: 'string' }
   */
  checkHandoverTriggers(conversationId, customerMessage, productId) {
    // 1. Kiểm tra "Gặp người thật"
    const lowerMsg = customerMessage.toLowerCase();
    if (lowerMsg.includes('người thật') || lowerMsg.includes('nhân viên') || lowerMsg.includes('cho gặp') || lowerMsg.includes('tư vấn viên')) {
      return { handover: true, reason: 'Khách yêu cầu gặp nhân viên' };
    }

    // Load Rules từ Thẻ Sản phẩm
    const product = knowledgeService.getProductById(productId);
    if (!product || !product.handover_rules) return { handover: false };

    const rules = product.handover_rules;

    // 2. Rule: Hỏi giá > Ngưỡng rủi ro cao (thường SP đắt mới handover ngay)
    if (rules.price_threshold && rules.price_threshold > 0 && product.price >= rules.price_threshold) {
      if (lowerMsg.includes('giá') || lowerMsg.includes('bao nhiêu')) {
        return { handover: true, reason: `Hỏi giá SP đắt > ${rules.price_threshold}` };
      }
    }

    // 3. Rule: Keywords nhạy cảm (khiếu nại, lỗi)
    if (rules.keywords && Array.isArray(rules.keywords)) {
      for (const kw of rules.keywords) {
        if (lowerMsg.includes(kw.toLowerCase())) {
          return { handover: true, reason: `Chứa keyword nhạy cảm: ${kw}` };
        }
      }
    }

    // 4. Rule: Max Bot Turns (Bot đã chat quá n lần nhưng chưa chốt)
    if (rules.max_bot_turns) {
      const history = memoryService.getHistory(conversationId, 100);
      const botMessages = history.filter(h => h.role === 'assistant');
      if (botMessages.length >= rules.max_bot_turns) {
        return { handover: true, reason: `Vượt quá giới hạn ${rules.max_bot_turns} tin nhắn AI` };
      }
    }

    return { handover: false };
  }
}

module.exports = new OutcomeService();
