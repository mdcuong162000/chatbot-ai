const express = require('express');
const router = express.Router();
const aiService = require('../services/ai.service');
const memoryService = require('../services/memory.service');
const outcomeService = require('../services/outcome.service');
const knowledgeService = require('../services/knowledge.service');

const VERIFY_TOKEN = 'huy_chatbot_v5_secret_hieu_chua_sep';

// Xác thực Webhook (Dành cho Facebook)
router.get('/facebook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook Verified');
      return res.status(200).send(challenge);
    }
  }
  res.sendStatus(403);
});

// Nhận tin nhắn từ Facebook Messenger
router.post('/facebook', async (req, res) => {
  const { body } = req;

  // Facebook yêu cầu phải trả về 200 OK ngay lập tức
  res.status(200).send('EVENT_RECEIVED');

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderPsid = webhookEvent.sender.id; // customer_id trên Facebook

      if (webhookEvent.message && webhookEvent.message.text) {
        const messageText = webhookEvent.message.text;

        // 1. Lấy/tạo hội thoại
        const conversationId = memoryService.getOrCreateConversation(senderPsid, 'facebook');
        
        // --- Demo Inject Product ID (Thực tế sẽ parse từ bài viết khách click hoặc link) ---
        const activeProducts = knowledgeService.getAllActiveProducts();
        const demoProductId = activeProducts.length > 0 ? activeProducts[0].id : null;

        // 2. Chặn Handover rules (Khách chữi, đòi người thật thì ngắt AI)
        if (demoProductId) {
          const handoverCheck = outcomeService.checkHandoverTriggers(conversationId, messageText, demoProductId);
          if (handoverCheck.handover) {
            console.warn(`[HANDOVER] Gọi người thật cho hội thoại ${conversationId}. Lý do: ${handoverCheck.reason}`);
            // Đánh dấu DB trạng thái
            const db = require('../db');
            db.prepare("UPDATE conversations SET status = 'human_takeover' WHERE id = ?").run(conversationId);
            
            // Bắn realtime Notification cho Admin qua Socket (Sẽ làm sau)
            
            continue; // Bỏ qua không gọi AI nữa
          }
        }

        // 3. Xử lý AI nếu ko vướng rule
        memoryService.logMessage(conversationId, 'user', messageText);
        
        try {
          const reply = await aiService.getChatResponse(messageText, conversationId);
          memoryService.logMessage(conversationId, 'assistant', reply);

          // (Gửi lệnh API tới Facebook Messenger - Đoạn này cần Fanpage Access Token)
          // Hiện tại chỉ log ra console
          console.log(`[FB REPLY sent to ${senderPsid}]: ${reply}`);
        } catch (err) {
          console.error('Lỗi khi xử lý FB Msg:', err);
        }
      }
    }
  }
});

module.exports = router;
