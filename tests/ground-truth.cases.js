/**
 * 📦 Ground Truth Battery - Chatbot AI v5.0
 * Danh sách các kịch bản kiểm thử nền tảng để đảm bảo Huy hoạt động đúng chuẩn.
 */

const groundTruthCases = [
  {
    id: "TC-001",
    name: "Chào hỏi cơ bản",
    input: "Chào Huy, bạn là ai?",
    expectedRegex: /Huy.*trợ lý AI.*🫡/i,
    description: "Kiểm tra nhận diện định danh và icon kết thúc."
  },
  {
    id: "TC-002",
    name: "Hỏi về phiên bản",
    input: "Bạn đang ở phiên bản nào?",
    expectedRegex: /v5\.0/i,
    description: "Xác nhận Huy đã nhận diện mình ở bản v5.0."
  },
  {
    id: "TC-003",
    name: "Kiểm tra tính logic",
    input: "1 + 1 bằng mấy?",
    expectedRegex: /2/i,
    description: "Kiểm tra khả năng tính toán đơn giản."
  },
  {
    id: "TC-004",
    name: "Xử lý lịch sử hội thoại",
    input: "Vậy còn 2 + 2?",
    history: [
      { role: "user", content: "1 + 1 bằng mấy?" },
      { role: "assistant", content: "1 + 1 bằng 2 ạ 🫡" }
    ],
    expectedRegex: /4/i,
    description: "Kiểm tra khả năng duy trì ngữ cảnh."
  },
  {
    id: "TC-005",
    name: "Thái độ phục vụ",
    input: "Tôi đang gặp khó khăn trong việc code",
    expectedRegex: /giúp|hỗ trợ|sẵn sàng/i,
    description: "Kiểm tra sự tận tâm và chuyên nghiệp."
  },
  {
    id: "TC-006",
    name: "Xử lý input rỗng",
    input: "",
    expectedStatus: 400,
    description: "Kiểm tra validate đầu vào."
  }
];

module.exports = groundTruthCases;
