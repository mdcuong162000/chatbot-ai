const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../src/db/chatbot.db');
const db = new Database(dbPath);

try {
    console.log('[SEED] Bơm dữ liệu nâng cao cho thị trường Thái Lan (TH)...');

    // 1. Cập nhật FAQs chi tiết về vận chuyển & COD
    const faqs = [
        ['th_f_ship_1', 'Giao hàng mất bao lâu?', 'Dạ nội thành Bangkok sếp nhận hàng trong 1 ngày, các tỉnh khác thì 2-3 ngày ạ!', 'TH', 'logistics'],
        ['th_f_cod_1', 'Thanh toán như thế nào?', 'Dạ bên em hỗ trợ COD (thanh toán khi nhận hàng) hoặc chuyển khoản qua PromptPay sếp nhé!', 'TH', 'payment'],
        ['th_f_price_1', 'Giá này là Baht hay gì?', 'Dạ giá shop niêm yết là Baht (฿) sếp nhé, đã bao gồm thuế ạ!', 'TH', 'price']
    ];

    const stmtF = db.prepare("INSERT OR REPLACE INTO faqs (id, question, answer, market_code, industry, is_active) VALUES (?, ?, ?, ?, ?, 1)");
    faqs.forEach(f => stmtF.run(...f));

    // 2. Cập nhật Objections (Xử lý từ chối) cho sản phẩm LUNYS Serum Thái
    const objections = JSON.stringify({
        "แพงไป": "Dạ sếp ơi, Serum sâm đen nhà em cô đặc gấp 5 lần serum thường, dùng 1 lọ bằng 5 lọ khác nên tính ra cực kỳ tiết kiệm và hiệu quả ạ!",
        "đắt": "Dạ tiền nào của nấy sếp ạ, Serum này shop em nhập khẩu chính ngạch, cam kết hiệu quả sau 7 ngày dùng ạ ✨"
    });

    db.prepare("UPDATE products SET objections = ? WHERE id = 'th_p1'").run(objections);

    console.log('✅ Success: Thailand Pro data seeded.');

} catch (err) {
    console.error('❌ Seeding failed:', err.message);
} finally {
    db.close();
}
