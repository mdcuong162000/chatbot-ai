const express = require('express');
const router = express.Router();
const aiService = require('../services/ai.service');
const memoryService = require('../services/memory.service');

// Queue Manager chống dội bom LLM (Điểm 4)
const { default: PQueue } = require('p-queue');
const chatQueue = new PQueue({ concurrency: 1, interval: 1000, intervalCap: 1 }); // Xử lý 1 req/s cực an toàn


/**
 * [POST] /api/chat
 * Endpoint xử lý chat
 */
router.post('/chat', async (req, res) => {
  const { message, customerId } = req.body;
  
  // Lấy IP làm customer_id tạm thời nếu UI chưa gửi
  const cid = customerId || req.ip.replace(/[^a-zA-Z0-9]/g, '') || 'guest_1';

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // 1. Lấy hoặc tạo hội thoại
    const conversationId = memoryService.getOrCreateConversation(cid, 'web');
    
    // 2. Lưu tin nhắn của khách
    memoryService.logMessage(conversationId, 'user', message);

    // Xếp hàng đợi vào Queue để chống Rate Limit của GROQ API
    const reply = await chatQueue.add(async () => {
      console.log(`[QUEUE] Đang xử lý tin nhắn cho ${cid}... (Queue size: ${chatQueue.size})`);
      // 3. Xin phản hồi từ AI (kèm lịch sử & context)
      return await aiService.getChatResponse(message, conversationId);
    });

    // 4. Lưu tin nhắn của AI
    memoryService.logMessage(conversationId, 'assistant', reply);

    res.json({ reply, conversationId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
