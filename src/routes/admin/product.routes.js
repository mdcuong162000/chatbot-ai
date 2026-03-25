const express = require('express');
const router = express.Router();
const db = require('../../db');

// Lấy danh sách sản phẩm
router.get('/', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Thêm/Cập nhật sản phẩm
router.post('/', (req, res) => {
  try {
    const { id, name, price, variants, fits_who, occasion, selling_points, style_tip, market_code, industry } = req.body;
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO products (id, name, price, variants, fits_who, occasion, selling_points, style_tip, market_code, industry)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, name, price, JSON.stringify(variants), fits_who, occasion, JSON.stringify(selling_points), style_tip, market_code || 'TH', industry || 'general');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Xóa sản phẩm
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
