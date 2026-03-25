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
const socketService = require('./socket.service');

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

async function getSettings() {
  const rows = db.prepare('SELECT key, value FROM system_settings').all();
  const settings = {};
  rows.forEach(r => settings[r.key] = r.value);
  return settings;
}

async function getGroqResponse(message, history = [], productContext = '', customerMeta = null, options = {}, conversationId = null) {
  try {
    const settings = await getSettings();
    const persona = settings.ai_persona || "Huy - Trợ lý bán hàng";
    const temperature = parseFloat(settings.ai_temperature || "0.7");
    const threshold = parseInt(settings.escalate_threshold || "5000000");

    // --- MỤC 8: ROUTER LOGIC (8 BƯỚC THEO DOC) ---
    
    // BƯỚC 1: Blacklist
    if (customerMeta && customerMeta.status === 'blacklist') {
      return { reply: "Dạ, hiện tại Shop không thể hỗ trợ mình qua kênh này. Cảm ơn ạ.", forceHuman: false };
    }

    let systemInstruction = `# AI PERSONA: ${persona}\n`;
    let forceHuman = false;

    // BƯỚC 2 & 3: Khiếu nại (Open hoặc Tìm thấy từ khóa)
    const complaintKeywords = ['lỗi','hỏng','sai','thiếu','chưa nhận','mất hàng','hoàn tiền','trả hàng','kiện','luật sư','báo công an','đăng lên mạng','tức','bực','thất vọng','vỡ','móp','tệ','fake','nhái','lừa','không giống','ngứa','dị ứng','đỏ rát'];
    const hasComplaintKeyword = complaintKeywords.some(kw => message.toLowerCase().includes(kw));
    
    if (hasComplaintKeyword && !customerMeta?.active_complaint) {
      memoryService.createComplaint(conversationId, customerMeta.id, message);
    }

    if (customerMeta?.active_complaint || hasComplaintKeyword) {
      systemInstruction += `# PROMPT KHIẾU NẠI (Mục 6 - DOC)
1. XÁC NHẬN CẢM XÚC: Thấu hiểu, không dùng "Dạ em xin lỗi ạ" máy móc.
2. HỎI ĐÚNG TRỌNG TÂM: Lỗi lúc nào? Gặp vấn đề gì cụ thể?
3. HƯỚNG XỬ LÝ: Đưa ra 2 lựa chọn (Đổi trả/Hoàn tiền).
4. XÁC NHẬN & ĐÓNG.`;

      // Escalation nóng (Mục 6 - Escalation logic)
      if (message.toLowerCase().match(/kiện|công an|luật sư|luật pháp|lên mạng/)) {
        forceHuman = true;
      }
    } else if (customerMeta?.priority_level === 'VIP') {
      // BƯỚC 4: VIP
      systemInstruction += `# ESCALATION VIP
Khách hàng VIP: ${customerMeta.name}. Chào mừng nồng nhiệt và chuyển ngay cho Quản lý.`;
      forceHuman = true;
    } else {
      // BƯỚC 5: Phân loại Lead/Prospect/Existing
      const segment = customerMeta?.status || 'new_lead';
      
      if (segment === 'existing_customer') {
        systemInstruction += `# PROMPT KHÁCH CŨ (Mục 5C - DOC)
Chào thân thiết, ưu tiên hỏi thăm trải nghiệm cũ. Sản phẩm đã mua: ${customerMeta.purchased_products}.`;
      } else if (segment === 'returning_prospect') {
        systemInstruction += `# PROMPT KHÁCH TIỀM NĂNG (Mục 5B - DOC)
Khéo léo nhắc lại sự quan tâm cũ, tập trung chốt đơn đầu tiên.`;
      } else {
        systemInstruction += `# PROMPT KHÁCH MỚI (Mục 5A - DOC)
Ngắn gọn (max 3 câu), tập trung khám phá nhu cầu. Sản phẩm: ${productContext}`;
      }
    }

    // Checking Threshold (Mục 6 - Escalation logic)
    // Giả lập check giá trị đơn hàng hiện tại nếu có thông tin (ở đây demo qua option)
    if (options.currentOrderValue > threshold) {
      forceHuman = true;
    }

    if (forceHuman) {
      systemInstruction += "\n[LỆNH: GIAO CHO QUẢN LÝ] Dùng câu chuyển tiếp: 'Để hỗ trợ tốt nhất, mình kết nối bạn với quản lý ngay nhé.'";
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
       socketService.emitHandoverAlert(conversationId, 'Phát hiện khiếu nại nóng hoặc Khách hàng VIP cần hỗ trợ');
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
