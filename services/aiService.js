const { GoogleGenerativeAI } = require('../nodejs-app/node_modules/@google/generative-ai');

class AIService {
    constructor() {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            console.warn('⚠️  Gemini API key not configured. AI features will be disabled.');
            this.genAI = null;
            this.model = null;
        } else {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
        }
    }

    isConfigured() {
        return this.genAI !== null && this.model !== null;
    }

    async generateResponse(prompt) {
        if (!this.isConfigured()) {
            throw new Error('AI service not configured. Please add your Gemini API key to the .env file.');
        }

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('AI Service Error:', error);
            throw new Error('Failed to generate AI response');
        }
    }

    async getIngredientSubstitutions(ingredient, dietaryRestrictions = [], recipeContext = '') {
        // Input validation and sanitization
        if (!ingredient || typeof ingredient !== 'string') {
            throw new Error('Invalid ingredient provided');
        }
        
        const sanitizedIngredient = ingredient.replace(/[<>\"'&]/g, '').trim().substring(0, 100);
        const sanitizedContext = (recipeContext || '').replace(/[<>\"'&]/g, '').trim().substring(0, 200);
        const sanitizedRestrictions = Array.isArray(dietaryRestrictions) 
            ? dietaryRestrictions.filter(r => typeof r === 'string').map(r => r.replace(/[<>\"'&]/g, '').trim()).slice(0, 10)
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
                "notes": "any cooking adjustments needed"
            }
        ]
        
        Only return the JSON array, no additional text.
        `;

        try {
            const response = await this.generateResponse(prompt);
            return JSON.parse(response);
        } catch (error) {
            console.error('Ingredient substitution error:', error);
            // Fallback response
            return [{
                substitute: "Check recipe notes",
                ratio: "1:1",
                reason: "AI service temporarily unavailable",
                notes: "Please consult traditional cooking resources"
            }];
        }
    }

    async generateSmartShoppingList(recipes, preferences = {}) {
        const recipeList = recipes.map(r => `${r.name}: ${r.ingredients.join(', ')}`).join('\n');
        
        const prompt = `
        Create an optimized shopping list for these Chilean recipes:
        
        ${recipeList}
        
        Preferences:
        - Store layout preference: ${preferences.storeLayout || 'category-based'}
        - Budget consideration: ${preferences.budget || 'moderate'}
        - Dietary restrictions: ${preferences.dietaryRestrictions?.join(', ') || 'None'}
        
        Requirements:
        1. Consolidate duplicate ingredients and calculate total quantities
        2. Organize by store sections (Produce, Meat, Dairy, Pantry, etc.)
        3. Suggest bulk buying opportunities for cost savings
        4. Include estimated quantities for ${preferences.servings || 4} servings
        5. Add notes for ingredient quality tips (especially for Chilean specialties)
        
        Format as JSON:
        {
            "sections": [
                {
                    "name": "section name",
                    "items": [
                        {
                            "item": "ingredient name",
                            "quantity": "amount needed",
                            "notes": "quality tips or alternatives",
                            "estimated_cost": "price range"
                        }
                    ]
                }
            ],
            "total_estimated_cost": "price range",
            "money_saving_tips": ["tip1", "tip2"]
        }
        
        Only return the JSON, no additional text.
        `;

        try {
            const response = await this.generateResponse(prompt);
            return JSON.parse(response);
        } catch (error) {
            console.error('Shopping list generation error:', error);
            // Fallback response
            return {
                sections: [{
                    name: "All Items",
                    items: recipes.flatMap(r => r.ingredients.map(ing => ({
                        item: ing,
                        quantity: "As needed",
                        notes: "AI service temporarily unavailable",
                        estimated_cost: "Variable"
                    })))
                }],
                total_estimated_cost: "Variable",
                money_saving_tips: ["Check local markets for fresh ingredients"]
            };
        }
    }

    async createMealPlan(preferences = {}) {
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

        try {
            const response = await this.generateResponse(prompt);
            return JSON.parse(response);
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

    async smartSearch(query) {
        // Input validation and sanitization
        if (!query || typeof query !== 'string') {
            throw new Error('Invalid search query provided');
        }
        
        const sanitizedQuery = query.replace(/[<>\"'&]/g, '').trim().substring(0, 500);
        
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

        try {
            const response = await this.generateResponse(prompt);
            return JSON.parse(response);
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
}

module.exports = new AIService();
