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

const db = require('../db');

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
    const aiResult = await getGroqResponse(message, history, productContext, customerMeta, options, conversationId);
    
    // Nếu AI phát tín hiệu cần người thật -> cập nhật DB ngay
    if (aiResult.forceHuman) {
      memoryService.updateConversationStatus(conversationId, 'human_takeover');
    }

    return aiResult.reply;
  } catch (error) {
    console.warn('Groq Error, falling back to OpenAI...', error.message);
    const aiResult = await getOpenAIResponse(message, history, productContext, customerMeta, options);
    return aiResult; // OpenAI hiện chưa có logic forceHuman phức tạp
  }
}

async function getGroqResponse(message, history = [], productContext = '', customerMeta = null, options = {}, conversationId = null) {
  try {
    const tone_style = "em/anh chị";
    
    // --- MỤC 8: ROUTER LOGIC (8 BƯỚC) ---
    
    // BƯỚC 1: Blacklist
    if (customerMeta && customerMeta.status === 'blacklist') {
      return "Dạ, hiện tại Shop không thể hỗ trợ mình qua kênh này. Cảm ơn ạ.";
    }

    let systemInstruction = "";
    let forceHuman = false;

    // BƯỚC 3: Phát hiện từ khóa khiếu nại (Mục 8 - Bước 3)
    const complaintKeywords = ['lỗi','hỏng','sai','thiếu','chưa nhận','mất hàng','hoàn tiền','trả hàng','kiện','luật sư','báo công an','tức','bực','thất vọng','vỡ','móp','tệ','fake','nhái','lừa','không giống','ngứa','dị ứng','đỏ rát'];
    const hasComplaintKeyword = complaintKeywords.some(kw => message.toLowerCase().includes(kw));
    
    if (hasComplaintKeyword && !customerMeta?.active_complaint) {
      // Tự động tạo record khiếu nại nếu chưa có
      memoryService.createComplaint(conversationId, customerMeta.id, message);
    }

    // BƯỚC 2 & 3: Khiếu nại đang mở hoặc mới phát sinh
    if (customerMeta?.active_complaint || hasComplaintKeyword) {
        systemInstruction = `# PROMPT KHIẾU NẠI (Mục 6)
Bạn là chuyên viên xử lý khiếu nại.
BƯỚC 1: Xác nhận cảm xúc (Dạ em rất tiếc/em hiểu mình đang bực ạ). TUYỆT ĐỐI không dùng "Dạ em xin lỗi ạ" (nghe máy móc).
BƯỚC 2: Hỏi đúng trọng tâm (Lỗi lúc nào? Đã dùng bao lâu?).
BƯỚC 3: Đưa hướng xử lý (Bên em có thể đổi mới hoặc hoàn tiền - mình muốn hướng nào?).
BƯỚC 4: Xác nhận & Đóng.
Mục tiêu: Xoa dịu + Giải quyết.`;
        
        // Phát hiện thêm từ khóa escalate nóng
        if (message.toLowerCase().includes('kiện') || message.toLowerCase().includes('công an')) {
           forceHuman = true;
        }
    } else if (customerMeta?.priority_level === 'VIP') {
        // BƯỚC 4: VIP (Mục 8 - Bước 4) - Luôn ưu tiên người thật cho VIP
        systemInstruction = `# CHẾ ĐỘ VIP
Khách hàng VIP: ${customerMeta.name}.
Hệ thống sẽ chuyển cho quản lý ngay. Hãy chào đón nồng nhiệt và nói câu chuyển tiếp.`;
        forceHuman = true;
    } else {
        // BƯỚC 5: Phân loại Mới/Tiềm năng/Cũ (Mục 8 - Bước 5)
        const isBought = customerMeta && customerMeta.total_orders > 0;
        const isProspect = !isBought && history.length > 2; // Nhắn hơn 2 câu là tiềm năng

        if (isBought) {
            // PROMPT KHÁCH CŨ (Mục 5C)
            systemInstruction = `# BỐI CẢNH KHÁCH CŨ (Existing Customer)
Khách đã mua: ${customerMeta.purchased_products}.
Lần cuối: ${customerMeta.last_purchase_date}.
- Không hỏi lại thông tin đã biết.
- Ưu tiên hỏi thăm trải nghiệm cũ trước khi bán mới.
- Chốt nhanh: Đề xuất ship theo địa chỉ cũ.`;
        } else if (isProspect) {
            // PROMPT KHÁCH TIỀM NĂNG (Mục 5B)
            systemInstruction = `# KHÁCH TIỀM NĂNG (Returning Prospect)
Khách đã quan tâm nhưng chưa chốt.
- Inject lịch sử: Khách từng hỏi về sản phẩm trước đó.
- Tập trung xử lý từ chối (giá/ship).
- Thúc đẩy chốt thử đơn đầu tiên.`;
        } else {
            // PROMPT KHÁCH MỚI (Mục 5A)
            systemInstruction = `# VAI TRÒ KHÁCH MỚI (New Lead)
Chào ngắn + Hỏi 1 câu khám phá nhu cầu.
- Không giới thiệu ngay câu đầu.
- Trả lời ngắn 3 câu.
- Sản phẩm: ${productContext}`;
        }
    }

    // Nếu phải escalate (người thật)
    if (forceHuman) {
      systemInstruction += "\n[LỆNH: GIAO CHO NGƯỜI THẬT] Hãy nói câu chuyển tiếp tự nhiên và kết thúc.";
    }

    if (options.skipGreeting) {
        systemInstruction = 'Bạn là Huy, trình biên dịch lệnh Shell chuyên nghiệp. CHỈ TRẢ VỀ LỆNH.';
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemInstruction },
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: message }
      ],
      model: 'llama-3.3-70b-versatile',
    });

    if (forceHuman) {
       // Phát tín hiệu cho Dashboard qua Socket (đã có logic ở app.js xử lý status hội thoại)
    }

    return { 
      reply: chatCompletion.choices[0].message.content, 
      forceHuman 
    };

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

// Bổ sung helper để check ID khách hàng (dùng cho router)
function getCustomerIdFromConv(conversationId) {
    const db = require('../db');
    const conv = db.prepare('SELECT customer_id FROM conversations WHERE id = ?').get(conversationId);
    return conv ? conv.customer_id : null;
}

module.exports = {
  getChatResponse,
};
