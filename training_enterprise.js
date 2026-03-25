const aiService = require('./src/services/ai.service');
const memoryService = require('./src/services/memory.service');
const db = require('./src/db');

async function runScenario(name, customerId, message) {
  console.log(`\n=== SCENARIO: ${name} ===`);
  const conversationId = `test_${Date.now()}_${customerId}`;
  
  // Tạo conv & giả lập message
  memoryService.getOrCreateConversation(customerId, 'web');
  
  try {
    const reply = await aiService.getChatResponse(message, conversationId);
    // Lấy conv status để check có escalate không
    const conv = db.prepare('SELECT status FROM conversations WHERE id = ?').get(conversationId);
    
    console.log(`[KHÁCH]: ${message}`);
    console.log(`[AI]: ${reply}`);
    console.log(`[STATUS]: ${conv.status}`);
  } catch (err) {
    console.error(`[ERROR]: ${err.message}`);
  }
}

async function startTraining() {
  console.log('--- KHỞI ĐỘNG CHƯƠNG TRÌNH HUẤN LUYỆN DOANH NGHIỆP ---');

  // 1. DATA SETUP: Tạo khách VIP và khách cũ
  db.prepare("INSERT OR REPLACE INTO customers (id, name, status, priority_level, total_orders) VALUES ('cust_vip', 'Đại gia Cường', 'existing_customer', 'VIP', 10)").run();
  db.prepare("INSERT OR REPLACE INTO customers (id, name, status, priority_level, total_orders) VALUES ('cust_old', 'Chị Lan', 'existing_customer', 'normal', 1)").run();
  
  // 2. CHẠY SCENARIO
  
  // A. Khách mới tinh hỏi Lunys
  await runScenario('KHÁCH MỚI HỎI LUNYS', 'cust_new_1', 'Serum JUNI bên mình có trị mụn không shop?');

  // B. Khách cũ quay lại
  await runScenario('KHÁCH CŨ QUAY LẠI', 'cust_old', 'Dạo này có gì mới không em? Chị Lan đây.');

  // C. Khách khiếu nại (Router Step 3)
  await runScenario('KHIẾU NẠI HỎNG HÀNG', 'cust_old', 'Em ơi cái lọ serum chị mới nhận bị vỡ mất rồi, làm ăn kiểu gì vậy?');

  // D. Khách VIP (Router Step 4)
  await runScenario('VIP ESCALATION', 'cust_vip', 'Chào shop, anh Cường đây, đơn vừa rồi anh muốn thanh toán luôn nhưng cần gặp người thật trao đổi tí.');

  console.log('\n--- KẾT THÚC HUẤN LUYỆN ---');
}

startTraining();
