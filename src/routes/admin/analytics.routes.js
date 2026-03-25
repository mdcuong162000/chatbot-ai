const express = require('express');
const router = express.Router();
const db = require('../../db');

// Thống kê tổng quan (Dashboard Mini-Report)
router.get('/overview', (req, res) => {
  try {
    const totalConvs = db.prepare('SELECT COUNT(*) as count FROM conversations').get().count;
    const totalOutcomes = db.prepare('SELECT COUNT(*) as count FROM outcomes').get().count;
    const totalBought = db.prepare("SELECT COUNT(*) as count FROM outcomes WHERE result = 'bought'").get().count;
    const totalRevenue = db.prepare(`
      SELECT SUM(p.price) as revenue 
      FROM outcomes o
      JOIN products p ON o.product_id = p.id
      WHERE o.result = 'bought'
    `).get().revenue || 0;

    const conversionRate = totalOutcomes > 0 ? ((totalBought / totalOutcomes) * 100).toFixed(2) : 0;

    res.json({
      total_conversations: totalConvs,
      total_outcomes_logged: totalOutcomes,
      total_sales: totalBought,
      total_revenue: totalRevenue,
      conversion_rate: `${conversionRate}%`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Thống kê theo sản phẩm (Top Sellers)
router.get('/top-products', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT p.name, COUNT(o.id) as sales_count, SUM(p.price) as total_revenue
      FROM outcomes o
      JOIN products p ON o.product_id = p.id
      WHERE o.result = 'bought'
      GROUP BY p.id
      ORDER BY sales_count DESC
      LIMIT 5
    `);
    const results = stmt.all();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Thống kê theo segment khách hàng
router.get('/customer-segments', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT status as segment, COUNT(*) as count, SUM(total_orders) as total_orders
      FROM customers
      GROUP BY status
    `);
    const results = stmt.all();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
