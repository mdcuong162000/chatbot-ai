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
  console.log('[DB] Đang khởi tạo 100 kịch bản thực tế...');
  
  // 1. Sản phẩm (Đa thị trường: VN & TH)
  const products = [
    ['p1', 'LUNYS Black Ginseng Serum', 399, 'Da lão hóa, nhạy cảm', 'VN', 'cosmetics'],
    ['p2', 'LUNYS Whitening Cream', 450, 'Dưỡng trắng ban đêm', 'VN', 'cosmetics'],
    ['th_p1', 'LUNYS Black Ginseng Serum (Thai)', 1500, 'Anti-aging, sensitive skin', 'TH', 'cosmetics'],
    ['th_p2', 'JUNI Soft Cleanser (Thai)', 550, 'Gentle cleansing', 'TH', 'cosmetics']
  ];
  const stmtP = db.prepare("INSERT OR REPLACE INTO products (id, name, price, fits_who, market_code, industry, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)");
  products.forEach(p => stmtP.run(...p));

  // 1.1 Khởi tạo FAQs mẫu (Thái Lan) [PHASE 7]
  const faqs = [
    ['th_f1', 'Shop ở đâu?', 'Shop có chi nhánh tại Bangkok và Chiang Mai ạ!', 'TH', 'general'],
    ['th_f2', 'Phí ship Thái Lan?', 'Nội thành Bangkok miễn phí, các tỉnh khác 50 Baht ạ.', 'TH', 'general'],
    ['th_f3', 'Có COD không?', 'Dạ shop có hỗ trợ thanh toán khi nhận hàng (COD) toàn Thái Lan ạ.', 'TH', 'general']
  ];
  const stmtF = db.prepare("INSERT OR REPLACE INTO faqs (id, question, answer, market_code, industry, is_active) VALUES (?, ?, ?, ?, ?, 1)");
  faqs.forEach(f => stmtF.run(...f));

  // 1.2 Tag Định nghĩa mẫu [PHASE 7]
  const tagDefs = [
    ['tag_vip', 'Khách VIP', '#facc15', '[]'],
    ['tag_bad', 'Spam/Bom hàng', '#ef4444', '[]']
  ];
  const stmtT = db.prepare("INSERT OR REPLACE INTO tag_definitions (id, name, color, fields_json, is_active) VALUES (?, ?, ?, ?, 1)");
  tagDefs.forEach(t => stmtT.run(...t));

  // 2. 100 Khách hàng & Hội thoại
  const names = ['Hùng', 'Lan', 'Minh', 'Vy', 'Tuấn', 'Hạnh', 'An', 'Linh', 'Dũng', 'Thảo', 'Quân', 'Oanh', 'Bình', 'Thủy', 'Sơn', 'Hà', 'Nam', 'Trang', 'Đức', 'Phượng'];
  const channels = ['facebook', 'zalo', 'web'];
  const msgPool = [
      "Shop ơi tư vấn mình cái serum sâm đen",
      "Lấy cho mình 1 combo 399k nhé",
      "Dùng bao lâu thì hiệu quả vậy shop?",
      "Hàng này có chính hãng không bạn?",
      "Ship về Quận 7 bao lâu thì tới?",
      "Sao nhắn mãi không thấy ai trả lời thế?",
      "Sản phẩm dùng thích lắm, mình muốn mua thêm cho mẹ",
      "Bên mình có tuyển sỉ không ạ?",
      "Cho mình xem ảnh thật sản phẩm với",
      "Chào shop"
  ];

  for (let i = 1; i <= 100; i++) {
    const cid = `c_${i}`;
    let name = names[i % names.length] + ' ' + (i > 20 ? 'Thị ' : 'Văn ') + i;
    let status = 'new_lead';
    let priority = 'normal';
    let orders = 0;

    if (i === 1) {
        name = 'Sếp Cường (VIP)';
        priority = 'VIP';
        status = 'existing_customer';
        orders = 99;
    } else if (i % 10 === 0) {
        priority = 'VIP';
        status = 'existing_customer';
        orders = Math.floor(Math.random() * 20) + 2;
    } else if (i % 3 === 0) {
        status = 'returning_prospect';
        orders = 1;
    }

    db.prepare("INSERT OR REPLACE INTO customers (id, name, status, priority_level, total_orders) VALUES (?, ?, ?, ?, ?)").run(cid, name, status, priority, orders);

    const convId = `conv_${i}`;
    const convStatus = (i % 8 === 0) ? 'human_takeover' : 'open';
    db.prepare("INSERT OR REPLACE INTO conversations (id, customer_id, channel, status) VALUES (?, ?, ?, ?)").run(convId, cid, channels[i % channels.length], convStatus);

    // Messages
    const userMsg = (i % 8 === 0) ? "Hàng giao bị vỡ shop ơi! Làm ăn kiểu gì vậy?" : msgPool[i % msgPool.length];
    db.prepare("INSERT OR REPLACE INTO messages (id, conversation_id, role, content) VALUES (?, ?, 'user', ?)").run(`m_${i}_1`, convId, userMsg);
    
    if (convStatus === 'open') {
        db.prepare("INSERT OR REPLACE INTO messages (id, conversation_id, role, content) VALUES (?, ?, 'assistant', ?)").run(`m_${i}_2`, convId, "Dạ em chào anh chị! Em là trợ lý AI của shop. Em có thể hỗ trợ gì cho mình ạ?");
    } else {
        db.prepare("INSERT OR REPLACE INTO complaints (id, customer_id, conversation_id, type, content, status) VALUES (?, ?, ?, 'san_pham', 'Khách báo vỡ hàng/cần hỗ trợ gấp', 'open')").run(`comp_${i}`, cid, convId);
    }
  }
  
  console.log('✅ Đã bơm 100 dữ liệu mẫu thành công.');
}

// Chạy khởi tạo lúc import
initDatabase();

// Đảm bảo đóng DB khi app tắt
process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

module.exports = db;
