const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const isConfigured = apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.length > 10;

    let message;
    if (!apiKey) {
      message = 'GEMINI_API_KEY environment variable not set in Netlify';
    } else if (apiKey === 'your_gemini_api_key_here') {
      message = 'Please replace placeholder API key with your actual Gemini API key';
    } else if (apiKey.length <= 10) {
      message = 'GEMINI_API_KEY appears to be invalid (too short)';
    } else {
      message = 'AI features are available';
    }

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        configured: isConfigured,
        message: message,
        debug: {
          hasApiKey: !!apiKey,
          keyLength: apiKey ? apiKey.length : 0,
          keyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : 'none'
        }
      }),
    };
  } catch (error) {
    console.error('AI Status Error:', error);
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        configured: false,
        message: 'AI service temporarily unavailable'
      }),
    };
  }
};
