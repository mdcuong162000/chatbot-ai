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
  const matchedProduct = products.find(p => message.toLowerCase().includes(p.name.toLowerCase()));
  
  if (matchedProduct) {
    productContext = `\n\nKIẾN THỨC BẮT BUỘC DÙNG DỂ TƯ VẤN (Sản phẩm: ${matchedProduct.name}):
    - Giá: ${matchedProduct.price} VNĐ
    - USP (Điểm bán hàng): ${matchedProduct.selling_points.join(', ')}
    - Tip chốt sale: ${matchedProduct.style_tip}`;
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
    const systemInstruction = options.skipGreeting 
      ? 'Bạn là Huy, trình biên dịch lệnh Shell chuyên nghiệp. CHỈ TRẢ VỀ LỆNH.'
      : `Bạn là Huy, AI thay mặt Sales tư vấn khách hàng cực kỳ khéo léo và tự nhiên. 
         - Trả lời CHẮC CHẮN ngắn gọn (1-2 câu). Dùng ngôn ngữ bán hàng thân thiện.
         - KHÔNG nhận là AI. Xưng em/shop gọi khách là anh/chị.
         ${productContext}`;

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
        { role: 'system', content: `Bạn là nhân viên Sales tư vấn. Trả lời ngắn gọn. ${productContext}` },
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
