const express = require('express');
const router = express.Router();
const db = require('../../db');

// --- CUSTOMERS ---
router.get('/customers', (req, res) => {
  try {
    const customers = db.prepare('SELECT * FROM customers ORDER BY total_orders DESC').all();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
  try {
    const rows = db.prepare('SELECT * FROM system_settings').all();
    const settings = {};
    rows.forEach(r => settings[r.key] = r.value);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/settings/update', (req, res) => {
  try {
    const { key, value } = req.body;
    db.prepare('INSERT OR REPLACE INTO system_settings (key, value, updated_at) VALUES (?, ?, datetime("now"))')
      .run(key, value);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
