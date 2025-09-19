const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize AI service
let genAI = null;
let model = null;

function initializeAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-pro" });
    return true;
  }
  return false;
}

async function smartSearch(query) {
  // Input validation and sanitization
  if (!query || typeof query !== 'string') {
    throw new Error('Invalid search query provided');
  }
  
  const sanitizedQuery = query.replace(/[<>"'&]/g, '').trim().substring(0, 500);
  
  const prompt = `
  As a Chilean cuisine expert, help solve this cooking problem: "${sanitizedQuery}"
  
  Provide practical, actionable suggestions that focus on Chilean dishes and cooking techniques.
  Consider:
  - Traditional Chilean recipes that match available ingredients
  - Cooking techniques suitable for the situation
  - Time constraints and skill level implied in the query
  - Seasonal availability of ingredients in Chile
  - Regional variations of Chilean dishes
  - Modern adaptations of traditional recipes
  
  Format your response as a JSON object:
  {
      "primary_suggestions": [
          {
              "dish_name": "recipe name",
              "description": "brief description",
              "ingredients_needed": ["additional ingredients if any"],
              "prep_time": "estimated time",
              "difficulty": "easy/medium/hard",
              "cooking_tips": "helpful tips specific to this situation"
          }
      ],
      "alternative_options": [
          {
              "option": "alternative approach",
              "explanation": "why this works"
          }
      ],
      "general_advice": "overall cooking advice for this situation"
  }
  
  Only return the JSON, no additional text.
  `;

  if (!model) {
    throw new Error('AI service not configured');
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error('Smart search error:', error);
    // Fallback response
    return {
      primary_suggestions: [
        {
          dish_name: "Basic Chilean Dish",
          description: "AI service temporarily unavailable",
          ingredients_needed: ["Check traditional recipes"],
          prep_time: "Variable",
          difficulty: "medium",
          cooking_tips: "Consult Chilean cooking resources"
        }
      ],
      alternative_options: [
        {
          option: "Traditional approach",
          explanation: "Use classic Chilean cooking methods"
        }
      ],
      general_advice: "AI service temporarily unavailable. Please consult traditional Chilean cooking resources."
    };
  }
}

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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Initialize AI service
    const isConfigured = initializeAI();
    if (!isConfigured) {
      return {
        statusCode: 503,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          error: 'AI service not configured',
          message: 'Please configure your Gemini API key'
        }),
      };
    }

    const { query } = JSON.parse(event.body || '{}');
    
    if (!query || !query.trim()) {
      return {
        statusCode: 400,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Search query is required' }),
      };
    }

    const suggestions = await smartSearch(query.trim());

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        suggestions,
        generated_at: new Date().toISOString()
      }),
    };
  } catch (error) {
    console.error('Smart search error:', error);
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Failed to generate smart suggestions',
        message: error.message 
      }),
    };
  }
};
