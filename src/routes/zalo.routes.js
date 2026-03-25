const express = require('express');
const router = express.Router();
const aiService = require('../services/ai.service');
const memoryService = require('../services/memory.service');
const outcomeService = require('../services/outcome.service');
const socketService = require('../services/socket.service');

// Xác thực Zalo Webhook
router.get('/', (req, res) => {
  res.send('Zalo Webhook OK');
});

// Nhận tin nhắn từ Zalo OA
router.post('/', async (req, res) => {
  const data = req.body;

  // Zalo yêu cầu trả ngay 200
  res.status(200).send('ok');

  if (data.event_name === 'user_send_text') {
    const senderId = data.sender.id;
    const messageText = data.message.text;

    const conversationId = memoryService.getOrCreateConversation(senderId, 'zalo');

    // Emit lên Admin Dashboard báo có tin mới
    socketService.emitNewMessage(conversationId, { role: 'user', content: messageText });

    // Kiểm tra Handover rules 
    // Demo ID sản phẩm cứng cho gọn, thực tế lọc db theo user state
    const handoverCheck = outcomeService.checkHandoverTriggers(conversationId, messageText, 'prod_bds_lumiere');
    
    if (handoverCheck.handover) {
      const db = require('../db');
      db.prepare("UPDATE conversations SET status = 'human_takeover' WHERE id = ?").run(conversationId);
      socketService.emitHandoverAlert(conversationId, handoverCheck.reason);
      return;
    }

    memoryService.logMessage(conversationId, 'user', messageText);

    try {
      const reply = await aiService.getChatResponse(messageText, conversationId);
      memoryService.logMessage(conversationId, 'assistant', reply);

      // Phát lên Admin Dashboard để theo dõi bot chat
      socketService.emitNewMessage(conversationId, { role: 'assistant', content: reply });

      // Gọi API gửi tin lại cho Zalo OA (Cần Access Token thật)
      console.log(`[ZALO REPLY to ${senderId}]: ${reply}`);
    } catch (err) {
      console.error('Lỗi khi xử lý Zalo Msg:', err);
    }
  }
});

module.exports = router;
