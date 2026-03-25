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
        
        // 2. Xử lý AI qua Router Logic (Mục 8 - Giai đoạn Enterprise)
        // Router trong aiService sẽ tự động: detect Khiếu nại, VIP, Blacklist
        // và tự động cập nhật status hội thoại thành 'human_takeover' nếu cần.
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
