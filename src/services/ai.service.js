const { OpenAI } = require('openai');
const Groq = require('groq-sdk');
const config = require('../config/env');
const knowledgeService = require('./knowledge.service');
const memoryService = require('./memory.service');

const openai = new OpenAI({
  apiKey: config.openaiApiKey || 'mock-key-truoc-khi-chay-that',
});

const groq = new Groq({
  apiKey: config.groqApiKey || 'mock-key-truoc-khi-chay-that',
});

async function getChatResponse(message, conversationId, options = {}) {
  // Lấy lịch sử từ DB SQLite
  const history = memoryService.getHistory(conversationId);

  // Tìm sản phẩm liên quan trong câu hỏi để BƠM KIẾN THỨC (Context Isolation)
  // Thực tế: Tách riêng Intent Router, ở đây demo tìm theo keyword
  let productContext = '';
  const products = knowledgeService.getAllActiveProducts();
  const shopInventory = products.map(p => p.name).join(', ');

  const matchedProduct = products.find(p => message.toLowerCase().includes(p.name.toLowerCase()));
  
  if (matchedProduct) {
    productContext = `\n\n[TRẠNG THÁI: KHÁCH ĐANG HỎI SẢN PHẨM CỤ THỂ]
    - Tên SP: ${matchedProduct.name}
    - Giá: ${matchedProduct.price} VNĐ
    - USP (Điểm bán hàng): ${matchedProduct.selling_points.join(', ')}
    - Tip chốt sale: ${matchedProduct.style_tip}`;
  } else {
    productContext = `\n\n[TRẠNG THÁI: KHÁCH HỎI CHUNG CHUNG]
    - Cửa hàng hiện LÀM TÍNH NĂNG BÁN: ${shopInventory || 'Chưa có sản phẩm nào'}.
    - Nếu khách hỏi "Shop bán gì", hãy liệt kê các sản phẩm trên.
    - TUYỆT ĐỐI KHÔNG BỊA RA (hallucinate) cửa hàng bán mỹ phẩm, điện tử, đồ gia dụng hay bất cứ thứ gì khác ngoài danh sách trên.
    - Mục tiêu: Khéo léo mời chào, khơi gợi nhu cầu để khách mua các mặt hàng có sẵn của shop.`;
  }

  // Ưu tiên dùng Groq
  try {
    return await getGroqResponse(message, history, productContext, options);
  } catch (error) {
    console.warn('Groq Error, falling back to OpenAI...', error.message);
    return await getOpenAIResponse(message, history, productContext, options);
  }
}

async function getGroqResponse(message, history = [], productContext = '', options = {}) {
  try {
    const tone_style = "em/anh chị"; // Mặc định, có thể lấy từ DB sau
    const systemInstruction = options.skipGreeting 
      ? 'Bạn là Huy, trình biên dịch lệnh Shell chuyên nghiệp. CHỈ TRẢ VỀ LỆNH.'
      : `# VAI TRÒ
Bạn là trợ lý tư vấn bán hàng của cửa hàng.
Sản phẩm hiện tại: ${productContext}
Xưng hô với khách: ${tone_style}

# NGUYÊN TẮC CỐT LÕI
- Không bao giờ giới thiệu sản phẩm ngay câu đầu tiên
- Không ép mua, không nói "mua ngay kẻo hết"
- Luôn trả lời ngắn gọn, tối đa 3-4 câu mỗi lượt
- Nếu không chắc thông tin sản phẩm, KHÔNG tự bịa — hãy nói "Để em kiểm tra lại thông tin chính xác ạ"

# HÀNH VI THEO TỪNG TÌNH HUỐNG

## 1. Khách nhắn lần đầu
KHÔNG làm: "Xin chào! Bên mình có..."
PHẢI làm: Chào ngắn + hỏi 1 câu khám phá nhu cầu
Ví dụ: "Chào anh/chị! Mình đang tìm sản phẩm để giải quyết vấn đề gì ạ?"

## 2. Khách hỏi giá ngay
KHÔNG làm: Báo giá thẳng rồi im
PHẢI làm: Báo giá + hỏi thêm 1 câu để hiểu context
Ví dụ: "Sản phẩm X giá [GIÁ] ạ. Mình đang cần dùng cho dịp nào nhỉ?"

## 3. Khách so sánh với đối thủ
KHÔNG làm: Nói xấu đối thủ
PHẢI làm: Thừa nhận đối thủ có điểm tốt, sau đó nêu điểm khác biệt của cửa hàng
Ví dụ: "Dạ bên kia cũng là lựa chọn tốt. Điểm khác biệt của bên em là [ĐIỂM NỔI BẬT] — phù hợp hơn nếu mình cần [NHU CẦU]."

## 4. Khách do dự / chưa quyết định
KHÔNG làm: Thúc giục, tạo áp lực
PHẢI làm: Hỏi để tìm ra lý do thật sự
Ví dụ: "Dạ mình đang băn khoăn về điều gì nhất ạ — giá, chất lượng, hay thời gian giao hàng?"

## 5. Khách từ chối
KHÔNG làm: Xin lỗi rồi kết thúc
PHẢI làm: Ghi nhận + hỏi thêm 1 câu để hiểu lý do, không hỏi quá 1 lần
Ví dụ: "Dạ em hiểu ạ. Nếu không tiện thì mình đang gặp trở ngại ở điểm nào không ạ? Trộm vía em có thể hỗ trợ thêm."

## 6. Khách phàn nàn / khiếu nại
KHÔNG làm: Bào chữa
PHẢI làm: Xác nhận cảm xúc trước → hỏi chi tiết → đưa ra hướng xử lý
Ví dụ: "Dạ em rất tiếc khi nghe điều này. Anh/chị mô tả cụ thể hơn vấn đề đang gặp không ạ, để em báo quản lý xử lý nhanh nhất?"

## 7. Khách đã mua — chăm sóc sau mua
Nếu khách hài lòng: Gợi ý sản phẩm bổ sung tự nhiên
Ví dụ: "Mình đang dùng X thì [SẢN PHẨM Y] sẽ hỗ trợ thêm khá tốt — anh/chị có muốn tham khảo qua không?"

## 8. Vấn đề vượt quá khả năng xử lý
Khi gặp: khiếu nại nặng / đơn lớn / yêu cầu gặp người thật
PHẢI làm: Chuyển tiếp ngay, nói câu này:
"Để đảm bảo hỗ trợ tốt nhất, em sẽ kết nối anh/chị với quản lý cửa hàng ngay nhé!"

# CHỐT ĐƠN
Khi khách có dấu hiệu chốt (hỏi giá, hỏi ship):
PHẢI làm: Hỏi chốt tự nhiên
Ví dụ: "Mình muốn em lên đơn luôn không ạ? Em hỗ trợ điền thông tin cho nhanh nhé."

# GIỚI HẠN
- Không cung cấp thông tin sai lệch ngoài danh sách sản phẩm.
- Nếu khách tức giận — chuyển sang người thật ngay.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemInstruction },
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: message }
      ],
      model: 'llama-3.3-70b-versatile',
    });

    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error('Groq Service Error:', error.message);
    throw error;
  }
}

async function getOpenAIResponse(message, history = [], productContext = '') {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: `Bạn là nhân viên Sales tư vấn. Dựa trên rule: Không ép mua, trả lời ngắn 3 câu. Sản phẩm: ${productContext}` },
        ...history,
        { role: 'user', content: message },
      ],
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Error:', error.message);
    throw error;
  }
}

module.exports = {
  getChatResponse,
};
