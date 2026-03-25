const Groq = require('groq-sdk');
const config = require('../../config/env');
const db = require('../../db');
const socketService = require('../socket.service');
const memoryService = require('../memory.service');

const groq = new Groq({
  apiKey: config.groqApiKey || 'mock-key-truoc-khi-chay-that',
});

async function getSettings() {
  const rows = db.prepare('SELECT key, value FROM system_settings').all();
  const settings = {};
  rows.forEach(r => settings[r.key] = r.value);
  return settings;
}

async function getGroqResponse(message, history = [], knowledgeContext = '', customerMeta = null, options = {}, conversationId = null, customerId = null) {
  try {
    const settings = await getSettings();
    const persona = settings.ai_persona || "Mika - Chuyên viên tư vấn bán hàng";
    const temperature = parseFloat(settings.ai_temperature || "0.7");
    const threshold = parseInt(settings.escalate_threshold || "5000000");

    let systemInstruction = `# AI PERSONA: ${persona}\n`;
    let forceHuman = false;

    // BƯỚC 2 & 3: Khiếu nại
    const complaintKeywords = ['lỗi','hỏng','sai','thiếu','chưa nhận','mất hàng','hoàn tiền','trả hàng','kiện','luật sư','báo công an','đăng lên mạng','tức','bực','thất vọng','vỡ','móp','tệ','fake','nhái','lừa','không giống','ngứa','dị ứng','đỏ rát'];
    const hasComplaintKeyword = complaintKeywords.some(kw => message.toLowerCase().includes(kw));
    
    if (hasComplaintKeyword && (!customerMeta || !customerMeta.active_complaint)) {
      const finalCustomerId = customerId || 'guest_temp';
      memoryService.createComplaint(conversationId, finalCustomerId, message);
    }

    if ((customerMeta && customerMeta.active_complaint) || hasComplaintKeyword) {
      systemInstruction += `# PROMPT XỬ LÝ KHIẾU NẠI & THẮC MẮC
1. XÁC NHẬN CẢM XÚC. 2. HỎI ĐÚNG TRỌNG TÂM. 3. HƯỚNG XỬ LÝ. 4. XÁC NHẬN & ĐÓNG.`;
      if (message.toLowerCase().match(/kiện|công an|luật sư|luật pháp|lên mạng/)) {
        forceHuman = true;
      }
    } else if (customerMeta?.priority_level === 'VIP') {
      systemInstruction += `# ESCALATION VIP\nKhách hàng VIP: ${customerMeta.name}. Chuyển ngay cho Quản lý.`;
      forceHuman = true;
    } else {
      const segment = customerMeta?.status || 'new_lead';
      if (segment === 'existing_customer') {
        systemInstruction += `# PROMPT KHÁCH CŨ\nChào thân thiết. Sản phẩm đã mua: ${customerMeta.purchased_products}.`;
      } else if (segment === 'returning_prospect') {
        systemInstruction += `# PROMPT KHÁCH TIỀM NĂNG\nKhéo léo nhắc lại sự quan tâm cũ.`;
      } else {
        systemInstruction += `# PROMPT KHÁCH MỚI\nNgắn gọn. Kiến thức: ${knowledgeContext}`;
      }
    }

    if (options.currentOrderValue > threshold) {
      forceHuman = true;
    }

    if (forceHuman) {
      systemInstruction += "\n[LỆNH: GIAO CHO QUẢN LÝ] 'Để hỗ trợ tốt nhất, mình kết nối bạn với quản lý ngay nhé.'";
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemInstruction },
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: message }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: temperature
    });

    if (forceHuman && conversationId) {
       socketService.emitHandoverAlert(conversationId, 'Handover detected by Groq Neuron');
    }

    return { 
      reply: chatCompletion.choices[0].message.content, 
      forceHuman 
    };

  } catch (error) {
    console.error('Groq Neuron Error:', error.message);
    throw error;
  }
}

module.exports = { getGroqResponse };
