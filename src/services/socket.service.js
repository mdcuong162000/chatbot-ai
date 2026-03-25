const socketIo = require('socket.io');

class SocketService {
  constructor() {
    this.io = null;
  }

  init(server) {
    this.io = socketIo(server, {
      cors: {
        origin: '*', // Trong thực tế cấu hình domain của Admin Dashboard
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket) => {
      console.log('🔗 [Socket.io] Admin/Client connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('🔗 [Socket.io] Disconnected:', socket.id);
      });
    });
  }

  /**
   * Phát thông báo có tin nhắn mới tới Admin Dashboard
   */
  emitNewMessage(conversationId, message) {
    if (this.io) {
      this.io.emit('new_message', { conversationId, message });
    }
  }

  /**
   * Phát cảnh báo AI bị chặn -> Chuyển người thật chốt
   */
  emitHandoverAlert(conversationId, reason) {
    if (this.io) {
      this.io.emit('handover_alert', { conversationId, reason, timestamp: new Date() });
    }
  }
}

module.exports = new SocketService();
