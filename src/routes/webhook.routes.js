const express = require('express');
const router = express.Router();
const aiService = require('../services/ai.service');
const memoryService = require('../services/memory.service');
const db = require('../db');

const VERIFY_TOKEN = process.env.MESSENGER_VERIFY_TOKEN || 'huy_chatbot_v5_secret_hieu_chua_sep';

// Xác thực Webhook (Dành cho Facebook Setup)
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

  // 1. Trả về 200 OK ngay để Facebook không retry
  res.status(200).send('EVENT_RECEIVED');

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const pageId = entry.id; // Page ID nhận tin nhắn
      const webhookEvent = entry.messaging[0];
      const senderPsid = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const messageText = webhookEvent.message.text;

        // 2. Tìm Market & Token từ DB
        const mapping = db.prepare('SELECT market_code, access_token FROM market_page_mapping WHERE page_id = ?').get(pageId);
        const marketCode = mapping ? mapping.market_code : 'TH';
        const accessToken = mapping ? mapping.access_token : process.env.MESSENGER_PAGE_ACCESS_TOKEN;

        // 3. Xử lý qua Chatbot Engine
        const conversationId = memoryService.getOrCreateConversation(senderPsid, 'facebook');
        memoryService.logMessage(conversationId, 'user', messageText);

        try {
          // Gọi AI Router với market_code động
          const replyText = await aiService.getChatResponse(messageText, conversationId);
          memoryService.logMessage(conversationId, 'assistant', replyText);

          // 4. Gửi ngược lại cho Facebook qua native fetch
          const response = await fetch(`https://graph.facebook.com/v21.0/me/messages?access_token=${accessToken}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipient: { id: senderPsid },
              message: { text: replyText }
            })
          });

          const result = await response.json();
          if (result.error) {
            console.error('❌ Lỗi Facebook API:', result.error.message);
          } else {
            console.log(`✅ Đã rep khách ${senderPsid} (Market: ${marketCode})`);
          }
        } catch (err) {
          console.error('❌ Lỗi Webhook Flow:', err.message);
        }
      }
    }
  }
});

module.exports = router;
