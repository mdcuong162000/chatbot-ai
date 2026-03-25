const express = require('express');
const router = express.Router();
const db = require('../db');

// Lấy danh sách toàn bộ các cuộc hội thoại (Kèm thông tin khách hàng)
router.get('/conversations', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT c.id, c.status, c.channel, c.started_at, 
             u.id as customer_id, u.name, u.stage 
      FROM conversations c
      JOIN customers u ON c.customer_id = u.id
      ORDER BY c.started_at DESC
    `);
    const conversations = stmt.all();
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lấy chi tiết tin nhắn của 1 hội thoại cụ thể
router.get('/conversations/:id/messages', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT role, content, created_at 
      FROM messages 
      WHERE conversation_id = ? 
      ORDER BY created_at ASC
    `);
    const messages = stmt.all(req.params.id);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
