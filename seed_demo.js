const db = require('./src/db');

console.log('--- SEEDING PRODUCTION DEMO DATA ---');

// 1. CLEAR OLD TEST DATA
db.pragma('foreign_keys = OFF');
db.prepare('DELETE FROM messages').run();
db.prepare('DELETE FROM complaints').run();
db.prepare('DELETE FROM outcomes').run();
db.prepare('DELETE FROM conversations').run();
db.prepare('DELETE FROM customers').run();
db.prepare('DELETE FROM products').run();
db.pragma('foreign_keys = ON');
console.log('✅ Cleaned up old data.');

// 2. SEED PRODUCTS
const products = [
    { id: 'lunys_serum', name: 'LUNYS Black Ginseng Serum', price: 399, fits: 'Da nhạy cảm, lão hóa', variants: '["1+1", "2+2", "5+5"]' },
    { id: 'lunys_cream', name: 'LUNYS Whitening Cream', price: 450, fits: 'Dưỡng trắng ban đêm', variants: '["Hũ 50g"]' },
    { id: 'juni_cleanser', name: 'JUNI Gentle Sữa Rửa Mặt', price: 199, fits: 'Làm sạch sâu', variants: '["Chai 150ml"]' },
    { id: 'sun_protector', name: 'JUNI Sun Screen SPF50+', price: 299, fits: 'Bảo vệ da dưới nắng', variants: '["Tuýp 50ml"]' }
];

const stmtProd = db.prepare('INSERT INTO products (id, name, price, fits_who, variants) VALUES (?, ?, ?, ?, ?)');
products.forEach(p => stmtProd.run(p.id, p.name, p.price, p.fits, p.variants));

// 3. SEED CUSTOMERS
const customers = [
    { id: 'c_01', name: 'Anh Cường Chủ Tịch', phone: '0901234567', status: 'existing_customer', priority: 'VIP', orders: 25 },
    { id: 'c_02', name: 'Chị Lan Mỹ Phẩm', phone: '0912345678', status: 'returning_prospect', priority: 'normal', orders: 0 },
    { id: 'c_03', name: 'Hùng Phá Shop', phone: '0988888888', status: 'blacklist', priority: 'normal', orders: 0 },
    { id: 'c_04', name: 'Bé Vy Cute', phone: '0377777777', status: 'new_lead', priority: 'normal', orders: 1 },
    { id: 'c_05', name: 'Trần Tâm', phone: '0356666666', status: 'existing_customer', priority: 'normal', orders: 2 }
];

const stmtCust = db.prepare('INSERT INTO customers (id, name, phone, status, priority_level, total_orders) VALUES (?, ?, ?, ?, ?, ?)');
customers.forEach(c => stmtCust.run(c.id, c.name, c.phone, c.status, c.priority, c.orders));

// 4. SEED CONVERSATIONS & MESSAGES
const convs = [
    { id: 'conv_01', cust: 'c_01', channel: 'facebook', status: 'open' },
    { id: 'conv_02', cust: 'c_04', channel: 'web', status: 'human_takeover' }, // Cần xử lý gấp
    { id: 'conv_03', cust: 'c_05', channel: 'zalo', status: 'open' }
];

const stmtConv = db.prepare('INSERT INTO conversations (id, customer_id, channel, status) VALUES (?, ?, ?, ?)');
convs.forEach(c => stmtConv.run(c.id, c.cust, c.channel, c.status));

const messages = [
    { conv: 'conv_01', role: 'user', text: 'Chào shop, anh Cường đây, lấy anh 10 combo sâm đen nhé.' },
    { conv: 'conv_01', role: 'assistant', text: 'Dạ chào sếp Cường ạ! Em lên đơn 10 combo 2+2 cho sếp ngay. Vẫn giao về địa chỉ cũ ở Quận 1 sếp nhỉ?' },
    { conv: 'conv_02', role: 'user', text: 'Em ơi tại sao hàng chị nhận bị vỡ nắp thế này? Cần giải quyết gấp!' },
    { conv: 'conv_03', role: 'user', text: 'Check giá sữa rửa mặt dùm mình' },
    { conv: 'conv_03', role: 'assistant', text: 'Dạ sữa rửa mặt JUNI bên em đang có giá 199k ạ. Mình mua 2 chai được FREESHIP sếp nha.' }
];

const stmtMsg = db.prepare('INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)');
messages.forEach((m, idx) => stmtMsg.run(`m_demo_${idx}`, m.conv, m.role, m.text));

// 5. SEED COMPLAINT
db.prepare(`
    INSERT INTO complaints (id, customer_id, conversation_id, type, content, status) 
    VALUES ('comp_demo_01', 'c_04', 'conv_02', 'giao_hang', 'Vỡ nắp khi nhận hàng', 'open')
`).run();

console.log('✅ SEEDING COMPLETE. Dashboard is ready for DEMO!');
process.exit(0);
