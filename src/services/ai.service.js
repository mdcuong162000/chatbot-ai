const db = require('../db');
const config = require('../config/env');
const knowledgeService = require('./knowledge.service');
const memoryService = require('./memory.service');
const socketService = require('./socket.service');

// Neural Synapses (Provider Neurons)
const groqNeuron = require('./providers/groq');
const openaiNeuron = require('./providers/openai');

async function getSettings() {
  const rows = db.prepare('SELECT key, value FROM system_settings').all();
  const settings = {};
  rows.forEach(r => settings[r.key] = r.value);
  return settings;
}

let _cache = { products: null, faqs: null, expiry: 0 };
const CACHE_TTL = 30000; // 30 seconds

async function getChatResponse(message, conversationId, options = {}) {
  // Lấy lịch sử và metadata
  const history = memoryService.getHistory(conversationId);
  const conv = db.prepare('SELECT customer_id FROM conversations WHERE id = ?').get(conversationId);
  const customerId = conv ? conv.customer_id : null;
  const customerMeta = customerId ? memoryService.getCustomerMetadata(customerId) : null;

  // Cấu hình thị trường
  const settings = await getSettings();
  const marketCode = options.marketCode || settings.market_code || 'TH';
  const industry = options.industry || 'general';

  // Bơm kiến thức (Hybrid Knowledge with Cache optimization)
  const now = Date.now();
  if (!_cache.products || now > _cache.expiry) {
    _cache.products = knowledgeService.getAllActiveProducts(marketCode);
    _cache.faqs = knowledgeService.getAllActiveFaqs(marketCode, industry);
    _cache.expiry = now + CACHE_TTL;
  }
  
  const products = _cache.products;
  const faqs = _cache.faqs;
  
  const shopInventory = products.map(p => p.name).join(', ');
  const matchedProduct = products.find(p => message.toLowerCase().includes(p.name.toLowerCase()));
  const matchedFaq = faqs.find(f => message.toLowerCase().includes(f.question.toLowerCase()));
  
  // Lấy gợi ý Upsell/Cross-sell
  let recommendations = [];
  if (matchedProduct) {
    recommendations = knowledgeService.getRecommendations(matchedProduct.id);
  }

  let knowledgeContext = buildKnowledgeContext(matchedProduct, matchedFaq, marketCode, shopInventory, recommendations);

  // Orchestration & Delivery (Neural Routing)
  try {
    const aiResult = await groqNeuron.getGroqResponse(message, history, knowledgeContext, customerMeta, options, conversationId, customerId);
    
    if (aiResult.forceHuman) {
      memoryService.updateConversationStatus(conversationId, 'human_takeover');
    }
    return aiResult.reply;
  } catch (error) {
    console.warn('Groq Neuron error, routing to OpenAI synapse...', error.message);
    try {
      const reply = await openaiNeuron.getOpenAIResponse(message, history, knowledgeContext, customerMeta, options);
      return reply;
    } catch (oaError) {
      console.error('Critical Neural Failure:', oaError.message);
      return "Dạ, hiện tại Mika đang bận một chút, bạn đợi mình vài giây nhé! ✨";
    }
  }
}

function buildKnowledgeContext(matchedProduct, matchedFaq, marketCode, shopInventory, recommendations = []) {
  let context = `\n\n[SYSTEM INFO]: Market: ${marketCode}. Products Available: ${shopInventory}.`;
  
  if (matchedProduct) {
    context += `\n[MATCHED PRODUCT]: ${matchedProduct.name} - ${matchedProduct.price} - USP: ${matchedProduct.selling_points?.join(', ')}`;
    if (recommendations.length > 0) {
      context += `\n[STRATEGY: Upsell/Cross-sell]: Gợi ý kèm: ${recommendations.map(r => `${r.name} (${r.price})`).join(' HOẶC ')}.`;
    }
  } 
  
  if (matchedFaq) {
    context += `\n[MATCHED FAQ]: Q: ${matchedFaq.question} - A: ${matchedFaq.answer}`;
  }

  // Market Nuances (Thailand Alignment)
  if (marketCode === 'TH') {
    context += `\n[MARKET RULE: TH]: Always quote prices in Baht (฿). Mention COD (Cash on Delivery) is preferred for safety. Use "Ka/Krap" for ultimate politeness.`;
  }

  return context;
}

module.exports = {
  getChatResponse,
};
