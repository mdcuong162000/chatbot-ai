const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'chatbot.db');
const schemaPath = path.join(__dirname, 'schema.sql');

// Khởi tạo kết nối DB
const db = new Database(dbPath, { 
//  verbose: console.log // Uncomment để debug SQL
});

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
