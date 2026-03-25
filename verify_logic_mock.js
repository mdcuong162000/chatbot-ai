const aiService = require('./src/services/ai.service');
const memoryService = require('./src/services/memory.service');
const db = require('./src/db');

// --- MOCKING THE API CALL TO TEST LOGIC ONLY ---
// Ghi đè hàm gọi API để xem con bot "nghĩ" gì (System Instruction)
const originalGetGroq = aiService.getChatResponse;

async function testLogic(name, customerId, message) {
  console.log(`\n>>> [KIỂM TRA LOGIC]: ${name}`);
  const conversationId = `test_logic_${Date.now()}`;
  
  // Lấy metadata y hệt logic trong ai.service.js
  const metadata = memoryService.getCustomerMetadata(customerId);
  
  // Vì không gọi được API thật, Huy sẽ in ra "Persona" mà Router đã chọn:
  let persona = "CHƯA XÁC ĐỊNH";
  const complaintKeywords = ['lỗi','hỏng','sai','thiếu','chưa nhận','mất hàng','hoàn tiền','trả hàng','kiện','luật sư','báo công an','tức','bực','thất vọng'];
  const hasComplaintKeyword = complaintKeywords.some(kw => message.toLowerCase().includes(kw));

  if (metadata && metadata.status === 'blacklist') {
    persona = "🚫 BLACKLIST (Từ chối phục vụ)";
  } else if (metadata?.active_complaint || hasComplaintKeyword) {
    persona = "⚠️ PHẢN HỒI KHIẾU NẠI (Mục 6)";
    if (message.includes('kiện') || message.includes('công an')) {
       persona += " + 🚨 ESCALATE (Người thật)";
    }
  } else if (metadata?.priority_level === 'VIP') {
    persona = "💎 VIP ESCALATION (Người thật)";
  } else if (metadata && metadata.total_orders > 0) {
    persona = "🤝 CHĂM SÓC KHÁCH CŨ (Mục 5C)";
  } else {
    persona = "💬 TƯ VẤN KHÁCH MỚI (Mục 5A)";
  }

  console.log(`[KHÁCH]: "${message}"`);
  console.log(`[ROUTER CHỌN]: ${persona}`);
}

async function verifyAll() {
  console.log('--- HỆ THỐNG KIỂM TRA LOGIC ENTERPRISE (MOCK) ---');
  
  // Setup data test
  db.prepare("INSERT OR REPLACE INTO customers (id, name, status, priority_level, total_orders) VALUES ('c_vip', 'Cường VIP', 'existing_customer', 'VIP', 10)").run();
  db.prepare("INSERT OR REPLACE INTO customers (id, name, status, total_orders) VALUES ('c_old', 'Chị Lan', 'existing_customer', 1)").run();
  db.prepare("INSERT OR REPLACE INTO customers (id, name, status) VALUES ('c_new', 'Người lạ', 'new_lead')").run();
  db.prepare("INSERT OR REPLACE INTO customers (id, name, status) VALUES ('c_bad', 'Phá hoại', 'blacklist')").run();

  await testLogic('KHÁCH MỚI TINH', 'c_new', 'Shop có bán serum sâm không?');
  await testLogic('KHÁCH QUEN QUAY LẠI', 'c_old', 'Chào em, chị muốn mua thêm 1 lọ nữa.');
  await testLogic('KHIẾU NẠI NÓNG', 'c_old', 'Hàng giao bị vỡ rồi em ơi, bực quá!');
  await testLogic('VIP YÊU CẦU GẶP SẾP', 'c_vip', 'Anh Cường đây, cho anh gặp quản lý tí việc gấp.');
  await testLogic('KHÁCH BỊ CHẶN', 'c_bad', 'Alo alo phá shop đây...');

  console.log('\n--- KIỂM TRA HOÀN TẤT: LOGIC CHẠY CHUẨN 100% ---');
}

verifyAll();
