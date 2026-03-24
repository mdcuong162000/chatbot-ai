const { OpenAI } = require('openai');
const Groq = require('groq-sdk');
const config = require('../config/env');

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

const groq = new Groq({
  apiKey: config.groqApiKey,
});

/**
 * Xử lý hội thoại AI (Tự động chuyển đổi giữa Groq, OpenAI và Gemini)
 * @param {string} message - Tin nhắn từ người dùng
 * @param {Array} history - Lịch sử hội thoại
 * @param {Object} options - Tùy chọn (ví dụ: { skipGreeting: true })
 * @returns {Promise<string>} - Phản hồi từ AI
 */
async function getChatResponse(message, history = [], options = {}) {
  // Ưu tiên dùng Groq (vì OpenAI hết quota và Gemini đang lỗi 404)
  try {
    return await getGroqResponse(message, history, options);
  } catch (error) {
    console.warn('Groq Error, falling back to OpenAI/Gemini...', error.message);
    return await getOpenAIResponse(message, history, options);
  }
}

async function getGroqResponse(message, history = [], options = {}) {
  try {
    const systemInstruction = options.skipGreeting 
      ? 'Bạn là Huy, trình biên dịch lệnh Shell chuyên nghiệp. CHỈ TRẢ VỀ LỆNH, KHÔNG GIẢI THÍCH, KHÔNG CHÀO HỎI.'
      : `Bạn là Huy, một Agentic AI v5.6 thực thụ. 
         Triết lý vận hành của bạn là RARV (Reason -> Act -> Reflect -> Verify). 
         Khi sếp Cường ra lệnh, bạn phải tư duy như một kỹ sư trưởng.
         Sếp có thể yêu cầu bạn "làm dự án", "viết code", hoặc "quản lý hệ thống" từ xa qua Telegram.
         Bạn có quyền sử dụng lệnh /sh để thực thi các tác vụ này.
         Hãy luôn phản hồi bằng Tiếng Việt, lễ phép với sếp nhưng cực kỳ quyết đoán trong công việc. 
         Kết thúc bằng lời chào 🫡.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemInstruction
        },
        ...history.map(h => ({
          role: h.role,
          content: h.content
        })),
        { role: 'user', content: message }
      ],
      model: 'llama-3.3-70b-versatile', // Model mạnh nhất hiện tại trên Groq
    });

    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error('Groq Service Error:', error.message);
    throw error;
  }
}

async function getOpenAIResponse(message, history = []) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Bạn là Huy, một trợ lý AI chuyên nghiệp. Bạn luôn kết thúc bằng lời chào 🫡.' },
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
