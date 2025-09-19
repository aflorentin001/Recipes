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

async function getIngredientSubstitutions(ingredient, dietaryRestrictions = [], recipeContext = '') {
  // Input validation and sanitization
  if (!ingredient || typeof ingredient !== 'string') {
    throw new Error('Invalid ingredient provided');
  }
  
  const sanitizedIngredient = ingredient.replace(/[<>"'&]/g, '').trim().substring(0, 100);
  const sanitizedContext = (recipeContext || '').replace(/[<>"'&]/g, '').trim().substring(0, 200);
  const sanitizedRestrictions = Array.isArray(dietaryRestrictions) 
    ? dietaryRestrictions.filter(r => typeof r === 'string').map(r => r.replace(/[<>"'&]/g, '').trim()).slice(0, 10)
    : [];

  const prompt = `
  As a culinary expert, suggest 3-5 ingredient substitutions for "${sanitizedIngredient}" in Chilean cuisine.
  
  Context: ${sanitizedContext || 'General cooking'}
  Dietary restrictions: ${sanitizedRestrictions.length > 0 ? sanitizedRestrictions.join(', ') : 'None'}
  
  Consider:
  - Flavor profiles and how they complement Chilean dishes
  - Cooking chemistry and how substitutes behave when cooked
  - Availability and cost-effectiveness
  - Dietary restrictions provided
  - Traditional Chilean cooking methods
  
  Format your response as a JSON array with this structure:
  [
      {
          "substitute": "ingredient name",
          "ratio": "1:1 or specific ratio",
          "reason": "why this works well",
          "notes": "any special preparation notes"
      }
  ]
  
  Only return the JSON array, no additional text.
  `;

  if (!model) {
    throw new Error('AI service not configured');
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error('AI Service Error:', error);
    // Fallback response
    return [
      {
        substitute: "Basic substitute",
        ratio: "1:1",
        reason: "AI service temporarily unavailable",
        notes: "Please consult traditional Chilean cooking resources"
      }
    ];
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

    const { ingredient, dietaryRestrictions = [], recipeContext = '' } = JSON.parse(event.body || '{}');
    
    if (!ingredient) {
      return {
        statusCode: 400,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Ingredient is required' }),
      };
    }

    const substitutions = await getIngredientSubstitutions(ingredient, dietaryRestrictions, recipeContext);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ingredient,
        substitutions,
        generated_at: new Date().toISOString()
      }),
    };
  } catch (error) {
    console.error('Ingredient substitution error:', error);
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Failed to generate ingredient substitutions',
        message: error.message 
      }),
    };
  }
};
