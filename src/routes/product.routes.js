const express = require('express');
const router = express.Router();
const knowledgeService = require('../services/knowledge.service');

// Lấy danh sách sản phẩm
router.get('/', (req, res) => {
  try {
    const products = knowledgeService.getAllActiveProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tìm kiếm sản phẩm
router.get('/search', (req, res) => {
  try {
    const query = req.query.q || '';
    const products = knowledgeService.searchProducts(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Thêm sản phẩm
router.post('/', (req, res) => {
  try {
    const newProduct = knowledgeService.createProduct(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Cập nhật sản phẩm
router.put('/:id', (req, res) => {
  try {
    const updated = knowledgeService.updateProduct(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Xóa (ẩn) sản phẩm
router.delete('/:id', (req, res) => {
  try {
    knowledgeService.deleteProduct(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
