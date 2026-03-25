const db = require('./src/db');

console.log('--- SEEDING 50 REAL-WORLD DEMO CASES ---');

// 1. CLEAR OLD DATA
db.pragma('foreign_keys = OFF');
db.prepare('DELETE FROM messages').run();
db.prepare('DELETE FROM complaints').run();
db.prepare('DELETE FROM outcomes').run();
db.prepare('DELETE FROM conversations').run();
db.prepare('DELETE FROM customers').run();
db.prepare('DELETE FROM products').run();
db.pragma('foreign_keys = ON');

// 2. PRODUCTS
const prods = [
    ['lunys_serum', 'LUNYS Black Ginseng Serum', 399, 'Da nhạy cảm, nám'],
    ['lunys_cream', 'LUNYS Whitening Cream', 450, 'Dưỡng trắng chuyên sâu'],
    ['juni_cleanser', 'JUNI Soft Cleanser', 199, 'Làm sạch dịu nhẹ'],
    ['sun_juni', 'JUNI Sun Screen', 299, 'Chống nắng phổ rộng']
];
const stmtP = db.prepare('INSERT INTO products (id, name, price, fits_who) VALUES (?, ?, ?, ?)');
prods.forEach(p => stmtP.run(...p));

// 3. GENERATORS
const names = ['Hùng', 'Lan', 'Minh', 'Vy', 'Tuấn', 'Hạnh', 'Cường', 'An', 'Linh', 'Dũng', 'Thảo', 'Quân', 'Oanh', 'Bình', 'Thủy'];
const channels = ['facebook', 'zalo', 'web'];
const statuses = ['new_lead', 'returning_prospect', 'existing_customer', 'existing_customer', 'existing_customer'];
const priorities = ['normal', 'normal', 'normal', 'normal', 'VIP'];

for (let i = 1; i <= 50; i++) {
    const id = `c_demo_${i}`;
    const name = names[i % names.length] + ' ' + (i > 15 ? 'Thị ' : 'Văn ') + i;
    const status = i === 1 ? 'existing_customer' : statuses[i % statuses.length];
    const priority = i === 1 ? 'VIP' : (i % 10 === 0 ? 'VIP' : 'normal');
    const orders = (status === 'existing_customer') ? Math.floor(Math.random() * 10) + 1 : 0;
    
    // Insert Customer
    db.prepare('INSERT INTO customers (id, name, status, priority_level, total_orders) VALUES (?, ?, ?, ?, ?)').run(
        id, i === 1 ? 'Anh Cường Chủ Tịch' : name, status, priority, orders
    );

    // Insert Conversation
    const convId = `conv_demo_${i}`;
    const convStatus = (i % 7 === 0) ? 'human_takeover' : 'open';
    db.prepare('INSERT INTO conversations (id, customer_id, channel, status) VALUES (?, ?, ?, ?)').run(
        convId, id, channels[i % channels.length], convStatus
    );

    // Insert Messages
    const msgRole = i % 2 === 0 ? 'user' : 'assistant';
    const msgTexts = [
        "Shop ơi tư vấn mình cái serum sâm đen",
        "Lấy cho mình 1 combo 399k nhé",
        "Dùng bao lâu thì hiệu quả vậy shop?",
        "Hàng này có chính hãng không bạn?",
        "Ship về Quận 7 bao lâu thì tới?",
        "Sao nhắn mãi không thấy ai trả lời thế?",
        "Sản phẩm dùng thích lắm, mình muốn mua thêm cho mẹ",
        "Bên mình có tuyển sỉ không ạ?",
        "Cho mình xem ảnh thật sản phẩm với",
        "Có được kiểm tra hàng trước khi thanh toán không?"
    ];
    
    db.prepare('INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)').run(
        `m_i_${i}`, convId, 'user', msgTexts[i % msgTexts.length]
    );

    if (convStatus === 'human_takeover') {
        db.prepare('INSERT INTO complaints (id, customer_id, conversation_id, type, content, status) VALUES (?, ?, ?, ?, ?, ?)').run(
            `comp_i_${i}`, id, convId, 'san_pham', 'Khách thắc mắc/khiếu nại cần hỗ trợ', 'open'
        );
    }
}

console.log('✅ SEEDED 50 DIVERSE SCENARIOS. Dashboard is fully populated!');
process.exit(0);
