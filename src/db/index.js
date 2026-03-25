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

    // TỰ ĐỘNG BƠM DATA NẾU TRỐNG (Dành cho Railway /tmp)
    const customerCount = db.prepare('SELECT count(*) as count FROM customers').get().count;
    if (customerCount === 0) {
      console.log('[DB] Database trống, đang tự động bơm dữ liệu mẫu...');
      seedInitialData();
    }
  } catch (err) {
    console.error('❌ Lỗi khởi tạo database schema:', err);
  }
}

function seedInitialData() {
  // Thêm sản phẩm mẫu
  db.prepare("INSERT OR REPLACE INTO products (id, name, price, fits_who, is_active) VALUES ('p1', 'LUNYS Black Ginseng Serum', 399, 'Da lão hóa', 1)").run();
  
  // Thêm khách hàng VIP mẫu (Anh Cường)
  db.prepare("INSERT OR REPLACE INTO customers (id, name, status, priority_level, total_orders) VALUES ('c_sep', 'Sếp Cường (VIP)', 'existing_customer', 'VIP', 99)").run();
  
  // Thêm hội thoại mẫu
  db.prepare("INSERT OR REPLACE INTO conversations (id, customer_id, channel, status) VALUES ('conv_demo', 'c_sep', 'facebook', 'open')").run();
  db.prepare("INSERT OR REPLACE INTO messages (id, conversation_id, role, content) VALUES ('m1', 'conv_demo', 'user', 'Chào Huy, kiểm tra giúp mình kịch bản cho khách VIP nhé!')").run();
  db.prepare("INSERT OR REPLACE INTO messages (id, conversation_id, role, content) VALUES ('m2', 'conv_demo', 'assistant', 'Dạ chào sếp Cường! Em đã sẵn sàng trực chiến 24/7 ạ. Sếp muốn test kịch bản nào trước ạ? 🫡')").run();

  // Thêm 1 ca khiếu nại mẫu
  db.prepare("INSERT OR REPLACE INTO customers (id, name, status) VALUES ('c_bad', 'Khách Đang Giận', 'new_lead')").run();
  db.prepare("INSERT OR REPLACE INTO conversations (id, customer_id, channel, status) VALUES ('conv_hot', 'c_bad', 'web', 'human_takeover')").run();
  db.prepare("INSERT OR REPLACE INTO messages (id, conversation_id, role, content) VALUES ('m3', 'conv_hot', 'user', 'Hàng giao bị vỡ shop ơi!')").run();
  db.prepare("INSERT OR REPLACE INTO complaints (id, customer_id, conversation_id, type, content, status) VALUES ('comp1', 'c_bad', 'conv_hot', 'san_pham', 'Vỡ hàng', 'open')").run();
  
  console.log('✅ Đã bơm dữ liệu mẫu thành công.');
}

// Chạy khởi tạo lúc import
initDatabase();

// Đảm bảo đóng DB khi app tắt
process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

module.exports = db;
