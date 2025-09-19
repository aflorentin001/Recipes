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

async function createMealPlan(preferences = {}) {
  const prompt = `
  Create a balanced 7-day Chilean cuisine meal plan with the following preferences:
  
  - Cooking skill level: ${preferences.skillLevel || 'intermediate'}
  - Prep time preference: ${preferences.prepTime || 'moderate'} (quick: <30min, moderate: 30-60min, elaborate: >60min)
  - Dietary goals: ${preferences.dietaryGoals?.join(', ') || 'balanced nutrition'}
  - Dietary restrictions: ${preferences.dietaryRestrictions?.join(', ') || 'none'}
  - Budget: ${preferences.budget || 'moderate'}
  
  Requirements:
  1. Include traditional Chilean dishes with modern variations
  2. Balance prep times throughout the week
  3. Minimize ingredient waste by reusing ingredients across meals
  4. Progress cooking skills from simple to more complex dishes
  5. Include prep-ahead tips for busy days
  6. Balance nutrition across the week
  7. Consider seasonal Chilean ingredients
  
  Format as JSON:
  {
      "week_plan": [
          {
              "day": "Monday",
              "breakfast": {
                  "dish": "dish name",
                  "prep_time": "time in minutes",
                  "difficulty": "easy/medium/hard",
                  "key_ingredients": ["ingredient1", "ingredient2"]
              },
              "lunch": { ... },
              "dinner": { ... },
              "prep_notes": "what to prepare ahead"
          }
      ],
      "shopping_strategy": {
          "ingredient_overlap": ["ingredients used multiple times"],
          "prep_ahead_items": ["items to prep in advance"],
          "skill_progression": "how skills build through the week"
      },
      "weekly_nutrition_balance": "summary of nutritional considerations",
      "estimated_total_cost": "weekly budget estimate"
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
    console.error('Meal plan generation error:', error);
    // Fallback response
    return {
      week_plan: [
        {
          day: "Monday",
          breakfast: {
            dish: "Traditional Chilean Breakfast",
            prep_time: "15 minutes",
            difficulty: "easy",
            key_ingredients: ["bread", "avocado", "tomato"]
          },
          lunch: {
            dish: "Simple Empanadas",
            prep_time: "45 minutes",
            difficulty: "medium",
            key_ingredients: ["ground beef", "onions", "empanada dough"]
          },
          dinner: {
            dish: "Cazuela",
            prep_time: "90 minutes",
            difficulty: "medium",
            key_ingredients: ["beef", "pumpkin", "corn", "potatoes"]
          },
          prep_notes: "AI service temporarily unavailable - using basic meal suggestions"
        }
      ],
      shopping_strategy: {
        ingredient_overlap: ["Basic ingredients"],
        prep_ahead_items: ["Prepare vegetables in advance"],
        skill_progression: "Start with simple dishes"
      },
      weekly_nutrition_balance: "Aim for balanced meals with proteins, vegetables, and grains",
      estimated_total_cost: "Moderate budget required"
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

    const { preferences = {} } = JSON.parse(event.body || '{}');
    const mealPlan = await createMealPlan(preferences);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        meal_plan: mealPlan,
        preferences_used: preferences,
        generated_at: new Date().toISOString()
      }),
    };
  } catch (error) {
    console.error('Meal plan generation error:', error);
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Failed to generate meal plan',
        message: error.message 
      }),
    };
  }
};
