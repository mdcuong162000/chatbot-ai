const express = require('express');
const router = express.Router();
const db = require('../../db');
const multer = require('multer');
const xlsx = require('xlsx');
const upload = multer({ dest: 'uploads/' });

// Lấy danh sách FAQ
router.get('/', (req, res) => {
  try {
    const faqs = db.prepare('SELECT * FROM faqs ORDER BY created_at DESC').all();
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Thêm/Cập nhật FAQ
router.post('/', (req, res) => {
  try {
    const { id, question, answer, market_code, industry } = req.body;
    const faqId = id || `faq_${Date.now()}`;
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO faqs (id, question, answer, market_code, industry)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(faqId, question, answer, market_code || 'TH', industry || 'general');
    res.json({ success: true, id: faqId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Xóa FAQ
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM faqs WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import FAQ từ Excel
router.post('/import', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Không tìm thấy file' });
    
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO faqs (id, question, answer, market_code, industry)
      VALUES (?, ?, ?, ?, ?)
    `);

    let count = 0;
    const transaction = db.transaction((items) => {
      for (const item of items) {
        const q = item.question || item['Câu hỏi'] || item.Question;
        const a = item.answer || item['Trả lời'] || item.Answer;
        const market = item.market_code || item['Thị trường'] || 'TH';
        
        if (q && a) {
          stmt.run(`faq_ex_${Date.now()}_${count}`, q, a, market, 'general');
          count++;
        }
      }
    });

    transaction(data);
    res.json({ success: true, imported: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
