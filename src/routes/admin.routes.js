const express = require('express');
const router = express.Router();

const conversationRoutes = require('./admin/conversation.routes');
const faqRoutes = require('./admin/faq.routes');
const productRoutes = require('./admin/product.routes');
const systemRoutes = require('./admin/system.routes');
const analyticsRoutes = require('./admin/analytics.routes');

// Mount Neural Nodes
router.use('/conversations', conversationRoutes);
router.use('/faqs', faqRoutes);
router.use('/products', productRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/', systemRoutes); // Mount system (CRM/Settings) at the root level of /api/admin

module.exports = router;
