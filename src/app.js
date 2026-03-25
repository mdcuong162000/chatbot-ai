const express = require('express');
const chatRoutes = require('./routes/chat.routes');
const productRoutes = require('./routes/product.routes');
const webhookRoutes = require('./routes/webhook.routes');
const zaloRoutes = require('./routes/zalo.routes');
const adminRoutes = require('./routes/admin.routes');
const cron = require('node-cron');
const notificationService = require('./services/notification.service');

const app = express();

app.use(express.json());
app.use(express.static('src/public'));
app.use(express.static('.')); // Cho sếp test file tạo ở root

// Routes
app.use('/api/admin', adminRoutes); // Mount more specific routes FIRST
app.use('/api/products', productRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/webhook/zalo', zaloRoutes);
app.use('/api', chatRoutes); // Mount generic /api LAST

// Chạy Notification Engine mỗi 30 phút (Mục 7)
cron.schedule('*/30 * * * *', () => {
  notificationService.runAllTriggers().catch(err => console.error('Notification Error:', err));
});

module.exports = app;
