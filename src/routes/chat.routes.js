const express = require('express');
const router = express.Router();
const aiService = require('../services/ai.service');

/**
 * [POST] /api/chat
 * Endpoint xử lý chat
 */
router.post('/chat', async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const reply = await aiService.getChatResponse(message, history);
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
