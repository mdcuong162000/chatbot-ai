const express = require('express');
const chatRoutes = require('./routes/chat.routes');
const productRoutes = require('./routes/product.routes');
const webhookRoutes = require('./routes/webhook.routes');
const zaloRoutes = require('./routes/zalo.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

app.use(express.json());
app.use(express.static('src/public'));
app.use(express.static('.')); // Cho sếp test file tạo ở root

// Routes
app.use('/api', chatRoutes); // -> /api/chat
app.use('/api/products', productRoutes);
app.use('/api/webhook/facebook', webhookRoutes);
app.use('/api/webhook/zalo', zaloRoutes);
app.use('/api/admin', adminRoutes);

module.exports = app;
