const express = require('express');
const chatRoutes = require('./routes/chat.routes');

const app = express();

app.use(express.json());
app.use(express.static('src/public'));
app.use(express.static('.')); // Cho sếp test file tạo ở root

// Routes
app.use('/api', chatRoutes);

module.exports = app;
