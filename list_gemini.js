const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('AIzaSyDxjQ96FHf6tBVblqTs31Usjh2_symM9TM');

async function listModels() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Test test
    const response = await model.generateContent("Hi");
    console.log("Success with gemini-1.5-flash");
    console.log(response.response.text());
  } catch (error) {
    console.error("Error with gemini-1.5-flash:", error.message);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); 
    const response = await model.generateContent("Hi");
    console.log("Success with gemini-pro");
    console.log(response.response.text());
  } catch (error) {
    console.error("Error with gemini-pro:", error.message);
  }
}

listModels();
