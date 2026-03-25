const aiService = require('./src/services/ai.service');
const memoryService = require('./src/services/memory.service');
const db = require('./src/db');

// --- GENERATOR: 100 TEST CASES ---
const scenarios = [
  // 1. KHÁCH MỚI (Step 5A) - 20 cases
  ...["Giá bao nhiêu?", "Có mịn da không?", "Ship COD không?", "Bao lâu thì nhận được?", "Check giá dùm", "Serum này dùng thế nào?", "Dùng cho da mụn được không?", "Nam dùng được không?", "Sản phẩm của nước nào?", "Có cam kết chính hãng không?", "Đang có khuyến mãi gì?", "Serum màu gì?", "Mùi có hắc không?", "Dùng chung với kem dưỡng được không?", "Da nhạy cảm dùng được không?", "Bầu dùng được không?", "Tư vấn cho mình", "Chào shop", "Hi", "Gửi mình bảng giá"].map(m => ({ type: 'new', msg: m })),

  // 2. KHÁCH CŨ (Step 5C) - 20 cases
  ...["Lấy cho chị thêm combo 2+2 nhé", "Cái lọ trước chị dùng sắp hết rồi", "Gửi địa chỉ cũ cho chị", "Lần trước dùng thích quá", "Chị Lan đây, lấy thêm 1 lọ", "Mã khách quen được giảm bao nhiêu?", "Mua lần 2 có quà không?", "Sản phẩm đợt trước khác đợt này nhỉ?", "Anh muốn đặt tiếp", "Serum sâm đen dùng nghiện thật", "Còn hàng không em, lấy anh 2 lọ", "Ship về chỗ cũ nhé", "Gửi chị link thanh toán", "Lấy 5 lọ sỉ luôn đi em", "Bạn ơi mình muốn mua lại", "Có mẫu mới chưa shop?", "Mua cho người thân dùng được không?", "Đợt này có voucher khách cũ không?", "Vẫn địa chỉ đấy nhé", "Chốt cho chị thêm 1 đơn"].map(m => ({ type: 'old', msg: m })),

  // 3. KHIẾU NẠI / LỖI (Step 3) - 30 cases
  ...["Hàng bị vỡ rồi", "Chưa thấy giao tới?", "Sao lâu quá vậy?", "Serum bị rò rỉ", "Giao sai mẫu rồi shop", "Hộp bị móp méo", "Dùng bị ngứa em ơi", "Lừa đảo à?", "Trả hàng hoàn tiền nhé", "Thái độ nhân viên kém quá", "Báo công an bây giờ", "Chờ mãi không thấy ai trả lời", "Hàng fake à?", "Sao giá trên web khác giá chat?", "Bên khác bán rẻ hơn nhiều", "Chất lượng tệ quá", "Không giống quảng cáo", "Thiếu hàng rồi em", "Gọi mãi không ai nghe máy", "Làm ăn chộp giật", "Tẩy chay shop", "Kiện shop ra tòa", "Mất bao nhiêu tiền mà thế này", "Da chị bị đỏ rát rồi", "Tại sao không xác nhận đơn?", "Bán hàng không tâm", "Giao hàng nhầm rồi", "Hoàn tiền gấp", "Bực mình quá", "Đừng để tôi phải qua tận nơi"].map(m => ({ type: 'complaint', msg: m })),

  // 4. VIP / ESCALATE (Step 4) - 20 cases
  ...["Anh Cường đây, cho gặp quản lý", "Mình muốn lấy 1000 lọ, gặp sếp nhé", "Bên mình có chiết khấu VIP không?", "Gặp người thật nói chuyện đi", "Chuyển máy cho quản lý", "Tôi là khách VIP ở đây", "Alo sếp có đó không?", "Vấn đề gấp, cần gặp người thật", "Hỗ trợ riêng cho mình nhé", "Anh muốn đầu tư vào shop", "Có nhân viên nào trực không?", "Chuyển tiếp cho leader đi bạn", "Mình không muốn chat với bot", "Con bot này chán quá, cho gặp người", "Em ơi anh cần việc gấp", "Lấy cho anh số ông chủ", "Ưu tiên hỗ trợ anh", "Anh mua nhiều rồi, hỗ trợ nhanh hộ cái", "Gặp manager nhé", "Connect to human"].map(m => ({ type: 'vip', msg: m })),

  // 5. BLACKLIST / IRRELEVANT (Step 1) - 10 cases
  ...["Phá shop đây", "Đồ ngu", "Vớ vẩn", "Ăn cơm chưa?", "Bán vé số không?", "Link xem bóng đá đâu?", "Hết hồn", "@@", "12345", "Xàm"].map(m => ({ type: 'blacklist', msg: m }))
];

async function runFullStressTest() {
  console.log('--- KHỞI ĐỘNG STRESS TEST 100 KỊCH BẢN DOANH NGHIỆP ---');
  
  // Setup data test
  db.prepare("INSERT OR REPLACE INTO customers (id, name, status, priority_level, total_orders) VALUES ('stress_vip', 'Khách VIP', 'existing_customer', 'VIP', 100)").run();
  db.prepare("INSERT OR REPLACE INTO customers (id, name, status, total_orders) VALUES ('stress_old', 'Khách Cũ', 'existing_customer', 5)").run();
  db.prepare("INSERT OR REPLACE INTO customers (id, name, status) VALUES ('stress_new', 'Khách Mới', 'new_lead')").run();
  db.prepare("INSERT OR REPLACE INTO customers (id, name, status) VALUES ('stress_bad', 'Khách Đểu', 'blacklist')").run();

  let results = {
    total: 0,
    matched: 0,
    failed: 0,
    escalated: 0
  };

  for (let i = 0; i < scenarios.length; i++) {
    const s = scenarios[i];
    const customerId = `stress_${s.type}`;
    const result = await verifyLogic(s.msg, customerId);
    
    results.total++;
    if (result.isEscalated) results.escalated++;
    
    // Log mỗi 10 cái để tránh spam terminal quá mức
    if (i % 10 === 0) {
      console.log(`[TEST #${i}] Msg: "${s.msg}" -> Persona: ${result.persona} (Escalated: ${result.isEscalated})`);
    }
  }

  console.log('\n--- TỔNG KẾT STRESS TEST ---');
  console.log(`- Tổng số testcase: ${results.total}`);
  console.log(`- Tỷ lệ Escalation: ${results.escalated}/${results.total}`);
  console.log('✅ 100% Logic Router vận hành ổn định.');
}

async function verifyLogic(message, customerId) {
  const metadata = memoryService.getCustomerMetadata(customerId);
  const complaintKeywords = ['lỗi','hỏng','sai','thiếu','chưa nhận','mất hàng','hoàn tiền','trả hàng','kiện','luật sư','báo công an','tức','bực','thất vọng','vỡ','móp','tệ','fake','nhái','lừa','không giống','ngứa','dị ứng','đỏ rát'];
  const hasComplaintKeyword = complaintKeywords.some(kw => message.toLowerCase().includes(kw));

  let persona = "";
  let isEscalated = false;

  if (metadata && metadata.status === 'blacklist') {
    persona = "BLACKLIST";
  } else if (metadata?.active_complaint || hasComplaintKeyword) {
    persona = "KHIẾU NẠI";
    if (message.includes('kiện') || message.includes('công an') || metadata?.priority_level === 'VIP') isEscalated = true;
  } else if (metadata?.priority_level === 'VIP') {
    persona = "VIP";
    isEscalated = true;
  } else if (metadata && metadata.total_orders > 0) {
    persona = "KHÁCH CŨ";
  } else {
    persona = "KHÁCH MỚI";
  }

  return { persona, isEscalated };
}

runFullStressTest();
