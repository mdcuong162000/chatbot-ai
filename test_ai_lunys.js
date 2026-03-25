const aiService = require('./src/services/ai.service');

async function testLunys() {
  console.log('--- TESTING AI WITH LUNYS SERUM ---');
  
  const testMessage = "Shop ơi, cái serum nhân sâm đen này có tác dụng gì và giá bao nhiêu vậy?";
  const conversationId = 'test_lunys_' + Date.now();
  
  try {
    const reply = await aiService.getChatResponse(testMessage, conversationId);
    console.log('\n[KHÁCH]:', testMessage);
    console.log('\n[AI]:', reply);
  } catch (err) {
    console.error('Test Error:', err.message);
  }
}

testLunys();
