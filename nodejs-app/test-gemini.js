require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    console.log('🔑 API Key exists:', !!process.env.GEMINI_API_KEY);
    console.log('🔑 API Key is not default:', process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
        console.log('❌ API key not configured properly');
        return;
    }

    try {
        console.log('🤖 Initializing Gemini AI...');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        console.log('📤 Sending test request...');
        const result = await model.generateContent("Say hello in one word");
        const response = await result.response;
        const text = response.text();
        
        console.log('✅ Success! Response:', text);
    } catch (error) {
        console.log('❌ Error:', error.message);
        console.log('Full error:', error);
    }
}

testGemini();
