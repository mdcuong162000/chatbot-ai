const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../src/db/chatbot.db');
const db = new Database(dbPath);

try {
    console.log('Seeding Thailand (TH) market data...');

    // 1. Seed Thailand Products
    const products = [
        ['th_p1', 'LUNYS Black Ginseng Serum (Thai)', 1500, 'Anti-aging, sensitive skin', 'TH', 'cosmetics'],
        ['th_p2', 'JUNI Soft Cleanser (Thai)', 550, 'Gentle cleansing', 'TH', 'cosmetics']
    ];
    const stmtP = db.prepare("INSERT OR REPLACE INTO products (id, name, price, fits_who, market_code, industry, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)");
    products.forEach(p => stmtP.run(...p));

    // 2. Seed Thailand FAQs
    const faqs = [
        ['th_f1', 'Shop ở đâu?', 'Shop có chi nhánh tại Bangkok và Chiang Mai ạ!', 'TH', 'general'],
        ['th_f2', 'Phí ship Thái Lan?', 'Nội thành Bangkok miễn phí, các tỉnh khác 50 Baht ạ.', 'TH', 'general'],
        ['th_f3', 'Có COD không?', 'Dạ shop có hỗ trợ thanh toán khi nhận hàng (COD) toàn Thái Lan ạ.', 'TH', 'general']
    ];
    const stmtF = db.prepare("INSERT OR REPLACE INTO faqs (id, question, answer, market_code, industry, is_active) VALUES (?, ?, ?, ?, ?, 1)");
    faqs.forEach(f => stmtF.run(...f));

    console.log('✅ Thailand data seeded successfully!');
} catch (err) {
    console.error('Seeding failed:', err.message);
} finally {
    db.close();
}
