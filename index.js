const app = require('./src/app');
const config = require('./src/config/env');
const http = require('http');
const socketService = require('./src/services/socket.service');

const server = http.createServer(app);
socketService.init(server);

server.listen(config.port, () => {
  console.log(`
  🚀---------------------------------------------------🚀
     Huy Chatbot AI v5.0 (Premium)
     URL: http://localhost:${config.port}
     Status: Trực chiến 🫡
  🚀---------------------------------------------------🚀
  `);
});
