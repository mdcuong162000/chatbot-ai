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

// Lấy đầy đủ metadata khách hàng cho 1 hội thoại (Phục vụ Panel Phải - CRM)
router.get('/conversations/:id/metadata', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT u.* 
      FROM customers u
      JOIN conversations c ON u.id = c.customer_id
      WHERE c.id = ?
    `);
    const metadata = stmt.get(req.params.id);
    res.json(metadata);
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

// Dừng AI (Take-over)
router.post('/conversations/:id/takeover', (req, res) => {
  try {
    db.prepare("UPDATE conversations SET status = 'human_takeover' WHERE id = ?").run(req.params.id);
    res.json({ success: true, message: 'Đã cướp cờ từ AI' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gửi tin nhắn từ Nhân viên (Người thật)
router.post('/conversations/:id/messages', (req, res) => {
  try {
    const { content } = req.body;
    db.prepare(`
      INSERT INTO messages (conversation_id, role, content) 
      VALUES (?, 'system_human', ?)
    `).run(req.params.id, content);
    
    // Thực tế nếu có endpoint Gửi về FB/Zalo thì móc vào đây!
    // Gửi qua socket.io cho Web client (Chatbot Index)
    const socketService = require('../services/socket.service');
    socketService.emitNewMessage(req.params.id, { role: 'assistant', content });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gắn Tag Outcome (Chốt đơn / Trượt)
router.post('/conversations/:id/outcome', (req, res) => {
  try {
    const { has_purchased, notes } = req.body;
    const outcomeService = require('../services/outcome.service');
    outcomeService.logOutcome(req.params.id, has_purchased, notes || 'Manual Tagging');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- MỚI: QUẢN LÝ SẢN PHẨM (KNOWLEDGE BASE) ---

// Lấy danh sách sản phẩm
router.get('/products', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Thêm/Cập nhật sản phẩm
router.post('/products', (req, res) => {
  try {
    const { id, name, price, variants, fits_who, occasion, selling_points, style_tip } = req.body;
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO products (id, name, price, variants, fits_who, occasion, selling_points, style_tip)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, name, price, JSON.stringify(variants), fits_who, occasion, JSON.stringify(selling_points), style_tip);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Xóa sản phẩm
router.delete('/products/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- MỚI: QUẢN LÝ KHÁCH HÀNG (CRM) ---

// Lấy danh sách khách hàng
router.get('/customers', (req, res) => {
  try {
    const customers = db.prepare('SELECT * FROM customers ORDER BY total_orders DESC').all();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cập nhật trạng thái khách hàng (VIP/Blacklist)
router.post('/customers/:id/status', (req, res) => {
  try {
    const { status, priority_level } = req.body;
    if (status) db.prepare('UPDATE customers SET status = ? WHERE id = ?').run(status, req.params.id);
    if (priority_level) db.prepare('UPDATE customers SET priority_level = ? WHERE id = ?').run(priority_level, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// --- SETTINGS ---
router.get('/settings', (req, res) => {
    const rows = db.prepare('SELECT * FROM system_settings').all();
    const settings = {};
    rows.forEach(r => settings[r.key] = r.value);
    res.json(settings);
});

router.post('/settings/update', (req, res) => {
    const { key, value } = req.body;
    db.prepare('INSERT OR REPLACE INTO system_settings (key, value, updated_at) VALUES (?, ?, datetime("now"))')
      .run(key, value);
    res.json({ success: true });
});

module.exports = router;
