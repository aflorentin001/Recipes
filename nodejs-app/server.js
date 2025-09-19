require('dotenv').config();
const express = require('express');
const path = require('path');
const aiService = require('../services/aiService');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve images from the root directory
app.use('/images', express.static(path.join(__dirname, '..')));

// Parse JSON bodies
app.use(express.json());

// AI Configuration Check
app.get('/api/ai/status', (req, res) => {
    res.json({
        configured: aiService.isConfigured(),
        message: aiService.isConfigured() 
            ? 'AI features are available' 
            : 'Please configure your Gemini API key in the .env file'
    });
});

// AI Feature: Ingredient Substitution
app.post('/api/ai/ingredient-substitution', async (req, res) => {
    try {
        const { ingredient, dietaryRestrictions = [], recipeContext = '' } = req.body;
        
        if (!ingredient) {
            return res.status(400).json({ error: 'Ingredient is required' });
        }

        const substitutions = await aiService.getIngredientSubstitutions(
            ingredient, 
            dietaryRestrictions, 
            recipeContext
        );

        res.json({
            ingredient,
            substitutions,
            generated_at: new Date().toISOString()
        });
    } catch (error) {
        console.error('Ingredient substitution error:', error);
        res.status(500).json({ 
            error: 'Failed to generate ingredient substitutions',
            message: error.message 
        });
    }
});

// AI Feature: Smart Shopping List
app.post('/api/ai/shopping-list', async (req, res) => {
    try {
        const { recipes, preferences = {} } = req.body;
        
        if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
            return res.status(400).json({ error: 'At least one recipe is required' });
        }

        const shoppingList = await aiService.generateSmartShoppingList(recipes, preferences);

        res.json({
            shopping_list: shoppingList,
            recipe_count: recipes.length,
            generated_at: new Date().toISOString()
        });
    } catch (error) {
        console.error('Shopping list generation error:', error);
        res.status(500).json({ 
            error: 'Failed to generate shopping list',
            message: error.message 
        });
    }
});

// AI Feature: Meal Planning
app.post('/api/ai/meal-plan', async (req, res) => {
    try {
        const { preferences = {} } = req.body;

        const mealPlan = await aiService.createMealPlan(preferences);

        res.json({
            meal_plan: mealPlan,
            preferences_used: preferences,
            generated_at: new Date().toISOString()
        });
    } catch (error) {
        console.error('Meal plan generation error:', error);
        res.status(500).json({ 
            error: 'Failed to generate meal plan',
            message: error.message 
        });
    }
});

// AI Feature: Smart Search
app.post('/api/ai/smart-search', async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query || !query.trim()) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const suggestions = await aiService.smartSearch(query.trim());

        res.json({
            query,
            suggestions,
            generated_at: new Date().toISOString()
        });
    } catch (error) {
        console.error('Smart search error:', error);
        res.status(500).json({ 
            error: 'Failed to generate smart suggestions',
            message: error.message 
        });
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint for recipe search (mock functionality)
app.get('/api/recipes/search', (req, res) => {
    const query = req.query.q || '';
    
    // Mock recipe data
    const recipes = [
        {
            id: 1,
            name: 'Empanadas de Pino',
            description: 'Traditional Chilean pastries filled with seasoned ground beef, onions, hard-boiled eggs, black olives, and raisins.',
            ingredients: ['Ground beef', 'Onions', 'Hard-boiled eggs', 'Black olives', 'Raisins', 'Pastry dough'],
            cookingTime: '45 minutes',
            difficulty: 'Medium'
        },
        {
            id: 2,
            name: 'Pastel de Choclo',
            description: 'A beloved corn casserole featuring layers of seasoned ground meat, chicken, hard-boiled eggs, and olives.',
            ingredients: ['Corn', 'Ground meat', 'Chicken', 'Hard-boiled eggs', 'Olives', 'Milk', 'Butter'],
            cookingTime: '60 minutes',
            difficulty: 'Medium'
        },
        {
            id: 3,
            name: 'Cazuela',
            description: 'A traditional Chilean stew with meat, vegetables, and potatoes, slow-cooked to perfection.',
            ingredients: ['Beef or chicken', 'Potatoes', 'Pumpkin', 'Corn', 'Green beans', 'Rice'],
            cookingTime: '90 minutes',
            difficulty: 'Easy'
        },
        {
            id: 4,
            name: 'Completo Italiano',
            description: 'Chilean hot dog topped with avocado, tomato, and mayonnaise, representing the Italian flag colors.',
            ingredients: ['Hot dog', 'Bread', 'Avocado', 'Tomato', 'Mayonnaise'],
            cookingTime: '10 minutes',
            difficulty: 'Easy'
        },
        {
            id: 5,
            name: 'Sopaipillas',
            description: 'Traditional Chilean fried pastries, perfect with pebre or honey.',
            ingredients: ['Flour', 'Pumpkin puree', 'Oil', 'Salt', 'Baking powder'],
            cookingTime: '30 minutes',
            difficulty: 'Easy'
        }
    ];

    // Filter recipes based on search query
    const filteredRecipes = recipes.filter(recipe => 
        recipe.name.toLowerCase().includes(query.toLowerCase()) ||
        recipe.description.toLowerCase().includes(query.toLowerCase()) ||
        recipe.ingredients.some(ingredient => 
            ingredient.toLowerCase().includes(query.toLowerCase())
        )
    );

    res.json(filteredRecipes);
});

// API endpoint to get a specific recipe
app.get('/api/recipes/:id', (req, res) => {
    const recipeId = parseInt(req.params.id);
    
    // Mock recipe details (in a real app, this would come from a database)
    const recipeDetails = {
        1: {
            id: 1,
            name: 'Empanadas de Pino',
            description: 'Traditional Chilean pastries filled with seasoned ground beef, onions, hard-boiled eggs, black olives, and raisins.',
            ingredients: [
                '500g ground beef',
                '2 large onions, diced',
                '4 hard-boiled eggs, chopped',
                '1 cup black olives, pitted',
                '1/2 cup raisins',
                '2 packages empanada dough',
                'Salt, pepper, cumin to taste'
            ],
            instructions: [
                'Sauté onions until golden brown',
                'Add ground beef and cook until browned',
                'Season with salt, pepper, and cumin',
                'Let mixture cool, then add eggs, olives, and raisins',
                'Fill empanada dough with mixture',
                'Seal edges and brush with egg wash',
                'Bake at 375°F for 25-30 minutes until golden'
            ],
            cookingTime: '45 minutes',
            difficulty: 'Medium',
            servings: 12
        }
    };

    const recipe = recipeDetails[recipeId];
    if (recipe) {
        res.json(recipe);
    } else {
        res.status(404).json({ error: 'Recipe not found' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🇨🇱 Chilean Recipe Server running on http://localhost:${PORT}`);
    console.log('Serving delicious Chilean cuisine recipes!');
});

module.exports = app;
