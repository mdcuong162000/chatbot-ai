const { OpenAI } = require('openai');
const config = require('../../config/env');

const openai = new OpenAI({
  apiKey: config.openaiApiKey || 'mock-key-truoc-khi-chay-that',
});

async function getOpenAIResponse(message, history = [], knowledgeContext = '', customerMeta = null, options = {}) {
  try {
    const isReturning = customerMeta && customerMeta.total_orders > 0;
    const systemPrompt = isReturning 
      ? `Bạn là nhân viên Sales thân thiết. Chăm sóc khách cũ. Kiến thức: ${knowledgeContext}`
      : `Bạn là nhân viên Sales mới. Tư vấn sản phẩm: ${knowledgeContext}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: message },
      ],
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Neuron Error:', error.message);
    throw error;
  }
}

module.exports = { getOpenAIResponse };
