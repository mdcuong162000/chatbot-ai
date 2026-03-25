const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production' 
  ? '/tmp/chatbot.db' 
  : path.join(__dirname, 'chatbot.db');
const schemaPath = path.join(__dirname, 'schema.sql');

console.log(`[DB] Khởi tạo database tại: ${dbPath}`);

// Khởi tạo kết nối DB
const db = new Database(dbPath);

// Hàm khởi tạo database
function initDatabase() {
  try {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
    console.log('✅ Database schema initialized successfully');
  } catch (err) {
    console.error('❌ Lỗi khởi tạo database schema:', err);
  }
}

// Chạy khởi tạo lúc import
initDatabase();

// Đảm bảo đóng DB khi app tắt
process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

module.exports = db;
