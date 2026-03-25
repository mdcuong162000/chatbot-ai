const knowledgeService = require('../services/knowledge.service');

const seedProducts = [
  {
    id: "prod_bds_lumiere",
    name: "Căn hộ Lumiere Boulevard",
    price: 3500000000,
    variants: ["1PN", "2PN", "3PN"],
    fits_who: "Người mua ở thực, gia đình trẻ, nhà đầu tư lâu dài",
    occasion: "Mua nhà đô thị cao cấp",
    selling_points: [
      "Kiến trúc xanh 3D lớn nhất TP.HCM",
      "Vay ngân hàng hỗ trợ lãi suất 0% trong 24 tháng",
      "Bàn giao nội thất liền tường cao cấp"
    ],
    objections: {
      "giá cao quá": "Dạ dự án thuộc phân khúc cao cấp, tiện ích khép kín và mảng xanh cực lớn. Tính ra giá trị sử dụng lâu dài rất xứng đáng ạ.",
      "xa trung tâm": "Dạ nhờ Vành Đai 3 thì đi lại vô cùng thuận tiện, chưa kể tiện ích nội khu đầy đủ không thiếu thứ gì ạ."
    },
    style_tip: "Hỏi khách về nhu cầu ở hay đầu tư trước. Nhấn mạnh vào chính sách vay ngân hàng không lãi suất (Hỗ trợ lãi suất 0% 24 tháng).",
    handover_rules: {
      price_threshold: 0,
      max_bot_turns: 8,
      keywords: ["xem nhà mẫu", "gặp sale", "chốt", "booking"]
    },
    is_active: 1
  }
];

console.log("🌱 Đang seed dữ liệu sản phẩm...");
try {
  for (const p of seedProducts) {
    knowledgeService.createProduct(p);
  }
  console.log("✅ Seed thành công!");
} catch (error) {
  if (error.message.includes('UNIQUE constraint')) {
    console.log("⚠️ Dữ liệu đã tồn tại, không cần seed lại.");
  } else {
    console.error("❌ Lỗi khi seed:", error.message);
  }
}
