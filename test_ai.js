const { getChatResponse } = require('./src/services/ai.service');

async function test() {
  console.log("Testing Technical Translation (skipGreeting: true)...");
  try {
    const res = await getChatResponse("tạo file test.txt", [], { skipGreeting: true });
    console.log("Result:", res);
  } catch (e) {
    console.error("Error:", e.message);
  }
}

test();
