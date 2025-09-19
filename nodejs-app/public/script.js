// Chilean Recipe Collection - Interactive JavaScript

// Global variables
let allRecipes = [];
let favoriteRecipes = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const searchResults = document.getElementById('search-results');
const loading = document.getElementById('loading');
const difficultyFilter = document.getElementById('difficulty-filter');
const timeFilter = document.getElementById('time-filter');
const favoritesGrid = document.getElementById('favorites-grid');
const recipeModal = document.getElementById('recipe-modal');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.querySelector('.close-btn');
const favoriteCount = document.getElementById('favorite-count');
const recipeCount = document.getElementById('recipe-count');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadInitialRecipes();
    updateFavoriteCount();
});

// Initialize navigation and app state
function initializeApp() {
    // Set up navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Show home section by default
    showSection('home');
}

// Set up event listeners
function setupEventListeners() {
    // Search functionality
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Filter functionality
    difficultyFilter.addEventListener('change', performSearch);
    timeFilter.addEventListener('change', performSearch);

    // Modal functionality
    closeBtn.addEventListener('click', closeModal);
    recipeModal.addEventListener('click', function(e) {
        if (e.target === recipeModal) {
            closeModal();
        }
    });

    // Escape key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Show specific section
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Load section-specific content
    if (sectionId === 'favorites') {
        displayFavorites();
    } else if (sectionId === 'search') {
        loadInitialRecipes();
    }
}

// Load initial recipes
async function loadInitialRecipes() {
    try {
        showLoading(true);
        const response = await fetch('/api/recipes/search');
        const recipes = await response.json();
        allRecipes = recipes;
        displayRecipes(recipes);
        updateRecipeCount(recipes.length);
    } catch (error) {
        console.error('Error loading recipes:', error);
        showError('Failed to load recipes. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Perform search with filters
async function performSearch() {
    const query = searchInput.value.trim();
    const difficulty = difficultyFilter.value;
    const timeRange = timeFilter.value;

    try {
        showLoading(true);
        
        // Build query parameters
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        
        const response = await fetch(`/api/recipes/search?${params}`);
        let recipes = await response.json();

        // Apply client-side filters
        recipes = applyFilters(recipes, difficulty, timeRange);
        
        displayRecipes(recipes);
        
        // Show search feedback
        if (query && recipes.length === 0) {
            showSearchFeedback(`No recipes found for "${query}". Try a different search term.`);
        } else if (query) {
            showSearchFeedback(`Found ${recipes.length} recipe(s) for "${query}"`);
        }
        
    } catch (error) {
        console.error('Error searching recipes:', error);
        showError('Search failed. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Apply client-side filters
function applyFilters(recipes, difficulty, timeRange) {
    let filtered = recipes;

    // Filter by difficulty
    if (difficulty) {
        filtered = filtered.filter(recipe => recipe.difficulty === difficulty);
    }

    // Filter by cooking time
    if (timeRange) {
        filtered = filtered.filter(recipe => {
            const time = parseInt(recipe.cookingTime);
            switch (timeRange) {
                case 'quick':
                    return time < 30;
                case 'medium':
                    return time >= 30 && time <= 60;
                case 'long':
                    return time > 60;
                default:
                    return true;
            }
        });
    }

    return filtered;
}

// Display recipes in grid
function displayRecipes(recipes) {
    if (recipes.length === 0) {
        searchResults.innerHTML = `
            <div class="empty-state">
                <p>No recipes found. Try adjusting your search or filters.</p>
            </div>
        `;
        return;
    }

    const recipesHTML = recipes.map(recipe => createRecipeCard(recipe)).join('');
    searchResults.innerHTML = recipesHTML;

    // Add click listeners to recipe cards
    document.querySelectorAll('.recipe-card').forEach(card => {
        card.addEventListener('click', function() {
            const recipeId = this.getAttribute('data-recipe-id');
            openRecipeModal(recipeId);
        });
    });

    // Add favorite button listeners
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const recipeId = parseInt(this.getAttribute('data-recipe-id'));
            toggleFavorite(recipeId);
        });
    });
}

// Create recipe card HTML
function createRecipeCard(recipe) {
    const isFavorite = favoriteRecipes.includes(recipe.id);
    const difficultyClass = `difficulty-${recipe.difficulty.toLowerCase()}`;
    
    return `
        <div class="recipe-card" data-recipe-id="${recipe.id}">
            <div class="recipe-card-content">
                <h4>${recipe.name}</h4>
                <p>${recipe.description}</p>
                <div class="recipe-meta">
                    <span class="difficulty-badge ${difficultyClass}">${recipe.difficulty}</span>
                    <span class="cooking-time">⏱️ ${recipe.cookingTime}</span>
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-recipe-id="${recipe.id}">
                        ${isFavorite ? '❤️' : '🤍'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Toggle favorite status
function toggleFavorite(recipeId) {
    const index = favoriteRecipes.indexOf(recipeId);
    
    if (index > -1) {
        favoriteRecipes.splice(index, 1);
        showNotification('Recipe removed from favorites', 'info');
    } else {
        favoriteRecipes.push(recipeId);
        showNotification('Recipe added to favorites!', 'success');
    }
    
    // Save to localStorage
    localStorage.setItem('favoriteRecipes', JSON.stringify(favoriteRecipes));
    
    // Update UI
    updateFavoriteCount();
    
    // Refresh current view if needed
    const currentSection = document.querySelector('.section.active');
    if (currentSection.id === 'favorites') {
        displayFavorites();
    } else if (currentSection.id === 'search') {
        // Update favorite buttons in search results
        updateFavoriteButtons();
    }
}

// Update favorite buttons in current view
function updateFavoriteButtons() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const recipeId = parseInt(btn.getAttribute('data-recipe-id'));
        const isFavorite = favoriteRecipes.includes(recipeId);
        
        btn.classList.toggle('active', isFavorite);
        btn.textContent = isFavorite ? '❤️' : '🤍';
    });
}

// Display favorites
function displayFavorites() {
    if (favoriteRecipes.length === 0) {
        favoritesGrid.innerHTML = `
            <div class="empty-state">
                <p>No favorite recipes yet. Start exploring and add some recipes to your favorites!</p>
                <button class="cta-btn" onclick="showSection('search')">Browse Recipes</button>
            </div>
        `;
        return;
    }

    // Get favorite recipes from allRecipes
    const favoriteRecipeData = allRecipes.filter(recipe => 
        favoriteRecipes.includes(recipe.id)
    );

    const favoritesHTML = favoriteRecipeData.map(recipe => createRecipeCard(recipe)).join('');
    favoritesGrid.innerHTML = favoritesHTML;

    // Add event listeners
    document.querySelectorAll('#favorites-grid .recipe-card').forEach(card => {
        card.addEventListener('click', function() {
            const recipeId = this.getAttribute('data-recipe-id');
            openRecipeModal(recipeId);
        });
    });

    document.querySelectorAll('#favorites-grid .favorite-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const recipeId = parseInt(this.getAttribute('data-recipe-id'));
            toggleFavorite(recipeId);
        });
    });
}

// Open recipe modal with detailed information
async function openRecipeModal(recipeId) {
    try {
        showLoading(true);
        const response = await fetch(`/api/recipes/${recipeId}`);
        const recipe = await response.json();
        
        const isFavorite = favoriteRecipes.includes(recipe.id);
        
        modalBody.innerHTML = `
            <div class="recipe-detail">
                <div class="recipe-header">
                    <h2>${recipe.name}</h2>
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-recipe-id="${recipe.id}">
                        ${isFavorite ? '❤️' : '🤍'}
                    </button>
                </div>
                <p class="recipe-description">${recipe.description}</p>
                
                <div class="recipe-info">
                    <div class="info-item">
                        <strong>⏱️ Cooking Time:</strong> ${recipe.cookingTime}
                    </div>
                    <div class="info-item">
                        <strong>👨‍🍳 Difficulty:</strong> 
                        <span class="difficulty-badge difficulty-${recipe.difficulty.toLowerCase()}">${recipe.difficulty}</span>
                    </div>
                    <div class="info-item">
                        <strong>🍽️ Servings:</strong> ${recipe.servings || 'N/A'}
                    </div>
                </div>

                <div class="ingredients-section">
                    <h3>🥘 Ingredients</h3>
                    <ul class="ingredients-list">
                        ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                    </ul>
                </div>

                ${recipe.instructions ? `
                    <div class="instructions-section">
                        <h3>📝 Instructions</h3>
                        <ol class="instructions-list">
                            ${recipe.instructions.map(step => `<li>${step}</li>`).join('')}
                        </ol>
                    </div>
                ` : ''}
            </div>
        `;

        // Add favorite button listener in modal
        const modalFavoriteBtn = modalBody.querySelector('.favorite-btn');
        if (modalFavoriteBtn) {
            modalFavoriteBtn.addEventListener('click', function() {
                const recipeId = parseInt(this.getAttribute('data-recipe-id'));
                toggleFavorite(recipeId);
                
                // Update modal button
                const isFav = favoriteRecipes.includes(recipeId);
                this.classList.toggle('active', isFav);
                this.textContent = isFav ? '❤️' : '🤍';
            });
        }

        recipeModal.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading recipe details:', error);
        showError('Failed to load recipe details.');
    } finally {
        showLoading(false);
    }
}

// Close modal
function closeModal() {
    recipeModal.classList.add('hidden');
}

// Show/hide loading indicator
function showLoading(show) {
    loading.classList.toggle('hidden', !show);
}

// Show search feedback
function showSearchFeedback(message) {
    // Create or update feedback element
    let feedback = document.getElementById('search-feedback');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.id = 'search-feedback';
        feedback.style.cssText = `
            text-align: center;
            padding: 15px;
            margin: 20px 0;
            background-color: #e8dcc0;
            border-radius: 10px;
            color: #5d4e37;
            font-style: italic;
        `;
        searchResults.parentNode.insertBefore(feedback, searchResults);
    }
    
    feedback.textContent = message;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, 3000);
}

// Show error message
function showError(message) {
    showNotification(message, 'error');
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: bold;
        z-index: 1001;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#4CAF50';
            break;
        case 'error':
            notification.style.backgroundColor = '#F44336';
            break;
        case 'info':
        default:
            notification.style.backgroundColor = '#a0956b';
            break;
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 3000);
}

// Update favorite count display
function updateFavoriteCount() {
    if (favoriteCount) {
        favoriteCount.textContent = favoriteRecipes.length;
    }
}

// Update recipe count display
function updateRecipeCount(count) {
    if (recipeCount) {
        recipeCount.textContent = count;
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .recipe-detail .recipe-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #d4c4a0;
    }
    
    .recipe-detail .recipe-description {
        font-size: 1.1em;
        color: #6b5b47;
        margin-bottom: 25px;
        font-style: italic;
    }
    
    .recipe-info {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 25px;
        padding: 20px;
        background-color: #f9f6f0;
        border-radius: 10px;
    }
    
    .info-item {
        color: #5d4e37;
    }
    
    .ingredients-section, .instructions-section {
        margin-bottom: 25px;
    }
    
    .ingredients-section h3, .instructions-section h3 {
        color: #5d4e37;
        margin-bottom: 15px;
        font-size: 1.3em;
    }
    
    .ingredients-list, .instructions-list {
        padding-left: 20px;
    }
    
    .ingredients-list li, .instructions-list li {
        margin-bottom: 8px;
        color: #6b5b47;
    }
    
    .instructions-list li {
        margin-bottom: 12px;
        line-height: 1.6;
    }
`;
document.head.appendChild(style);

// Export functions for global access
window.showSection = showSection;
