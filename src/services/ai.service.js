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

  // Lấy thông tin khách để phân loại Mới/Cũ
  const conv = db.prepare('SELECT customer_id FROM conversations WHERE id = ?').get(conversationId);
  const customerId = conv ? conv.customer_id : null;
  const customerMeta = customerId ? memoryService.getCustomerMetadata(customerId) : null;


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
    return await getGroqResponse(message, history, productContext, customerMeta, options);
  } catch (error) {
    console.warn('Groq Error, falling back to OpenAI...', error.message);
    return await getOpenAIResponse(message, history, productContext, customerMeta, options);
  }
}

async function getGroqResponse(message, history = [], productContext = '', customerMeta = null, options = {}) {
  try {
    const tone_style = "em/anh chị";
    const isReturning = customerMeta && customerMeta.total_orders > 0;

    let systemInstruction = "";

    if (options.skipGreeting) {
        systemInstruction = 'Bạn là Huy, trình biên dịch lệnh Shell chuyên nghiệp. CHỈ TRẢ VỀ LỆNH.';
    } else if (isReturning) {
        // PROMPT KHÁCH CŨ
        systemInstruction = `# BỐI CẢNH KHÁCH HÀNG CŨ
Khách này đã mua hàng trước đây.
Lịch sử mua: ${customerMeta.purchase_history || 'N/A'}
Sản phẩm đã mua: ${customerMeta.purchased_products || 'N/A'}
Lần mua gần nhất: ${customerMeta.last_purchase_date}
Trạng thái: ${customerMeta.stage}

# NGUYÊN TẮC VỚI KHÁCH CŨ
- Không hỏi lại thông tin đã biết (tên, địa chỉ, sở thích)
- Không tư vấn như người lạ — khách đã tin tưởng mình rồi
- Ưu tiên hỏi thăm trước, bán hàng sau
- Gợi ý sản phẩm phải liên quan đến thứ họ đã mua

# HÀNH VI THEO TỪNG TÌNH HUỐNG
- Khách nhắn lại: Hỏi thăm trải nghiệm [SẢN PHẨM ĐÃ MUA]
- Hỏi sản phẩm mới: Gợi ý liên quan đến thứ đã mua
- Ưu đãi: Nhắc về quyền lợi khách quen
- Chốt đơn: Đề xuất đặt luôn theo địa chỉ cũ nếu có.

# GIỚI HẠN
- Không hứa hẹn điều chưa xác nhận.
- Không tự bịa thông tin đơn hàng cũ nếu trống.`;
    } else {
        // PROMPT KHÁCH MỚI (Bản cũ của sếp)
        systemInstruction = `# VAI TRÒ
Bạn là trợ lý tư vấn bán hàng của cửa hàng.
Sản phẩm hiện tại: ${productContext}
Xưng hô với khách: ${tone_style}

# NGUYÊN TẮC CỐT LÕI
- Không bao giờ giới thiệu sản phẩm ngay câu đầu tiên
- Không ép mua, không nói "mua ngay kẻo hết"
- Luôn trả lời ngắn gọn, tối đa 3-4 câu mỗi lượt
- Nếu không chắc thông tin sản phẩm, KHÔNG tự bịa — hãy nói "Để em kiểm tra lại thông tin chính xác ạ"

# HÀNH VI THEO TỪNG TÌNH HUỐNG
- Khách mới: Chào ngắn + hỏi nhu cầu
- Hỏi giá: Báo giá + hỏi context dùng làm gì
- So sánh: Thừa nhận đối thủ tốt + nêu khác biệt của mình
- Do dự: Tìm lý do thật sự (giá/chất lượng)
- Từ chối: Ghi nhận + hỏi nhẹ 1 câu lý do.
- Khiếu nại: Chuyển ngay quản lý.

# CHỐT ĐƠN
Hỏi chốt tự nhiên, không để khách tự quyết định.`;
    }

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

async function getOpenAIResponse(message, history = [], productContext = '', customerMeta = null, options = {}) {
  try {
    const isReturning = customerMeta && customerMeta.total_orders > 0;
    const systemPrompt = isReturning 
      ? `Bạn là nhân viên Sales thân thiết. Chăm sóc khách cũ đã mua: ${customerMeta.purchased_products}. Sản phẩm hiện tại: ${productContext}`
      : `Bạn là nhân viên Sales mới. Chào khách và tư vấn sản phẩm: ${productContext}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
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
