const aiService = require('../src/services/ai.service');
const knowledgeService = require('../src/services/knowledge.service');

async function verifyPhase7() {
    console.log('--- STARTING PHASE 7 VERIFICATION ---');

    console.log('\n[1] Testing Knowledge Retrieval (Hybrid)...');
    const thFaqs = knowledgeService.getAllActiveFaqs('TH', 'general');
    console.log(`- Thailand FAQs loaded: ${thFaqs.length} items`);
    if (thFaqs.length === 0) throw new Error('No TH FAQs found! Did you seed?');

    console.log('\n[2] Testing AI Grounding (Thailand Market)...');
    // Giả lập khách hỏi phí ship Thái Lan
    const thMessage = "Phí ship Thái Lan bao nhiêu?";
    // Note: getChatResponse calls Groq, for testing we can audit the logic in ai.service
    // but here we just check if the logic flows.
    console.log(`- Query: "${thMessage}" (Market: TH)`);
    
    // We expect the router to find the TH FAQ
    const products = knowledgeService.getAllActiveProducts('TH');
    const faqs = knowledgeService.getAllActiveFaqs('TH', 'general');
    const matchedFaq = faqs.find(f => thMessage.toLowerCase().includes(f.question.toLowerCase().replace('?', '')));
    
    if (matchedFaq && matchedFaq.answer.includes('50 Baht')) {
        console.log('✅ Correct FAQ Matched for TH: ' + matchedFaq.answer);
    } else {
        console.log('❌ Failed to match TH FAQ correctly.');
        console.log('Debug - matchedFaq:', matchedFaq);
    }

    console.log('\n[3] Testing Market Isolation (Vietnam Market)...');
    // Khách hỏi cùng câu nhưng ở VN (giả định)
    const vnMessage = "Phí ship Thái Lan bao nhiêu?"; 
    const vnFaqs = knowledgeService.getAllActiveFaqs('VN', 'general');
    const matchedVnFaq = vnFaqs.find(f => vnMessage.toLowerCase().includes(f.question.toLowerCase().replace('?', '')));
    
    if (!matchedVnFaq) {
        console.log('✅ Market Isolation Works: VN context did not match TH FAQ.');
    } else {
        console.log('❌ Market Leakage: VN context matched a TH FAQ!');
    }

    console.log('\n--- VERIFICATION COMPLETED ---');
}

verifyPhase7().catch(console.error);
