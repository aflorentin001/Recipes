# Chilean Recipe Collection - AI-Powered Node.js App

A beautiful and interactive Node.js web application showcasing traditional Chilean recipes with modern AI-powered features and responsive design.

## Features

- 🇨🇱 **Authentic Chilean Theme**: Warm color palette inspired by Chilean culture
- 🤖 **AI-Powered Features**: Gemini AI integration for intelligent cooking assistance
- 🔄 **Ingredient Substitution**: Smart alternatives for missing ingredients
- 📅 **Weekly Meal Planning**: AI-generated meal plans with Chilean cuisine
- 🔍 **Smart Search**: Solve cooking problems with AI suggestions
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- ❤️ **Favorites System**: Save your favorite recipes with local storage
- 🎯 **Smart Filtering**: Filter by difficulty level and cooking time
- 📖 **Detailed Recipe Views**: Modal windows with complete recipe information
- 🚀 **Express Server**: Fast and efficient Node.js backend
- 🔒 **Security**: Input validation and API key protection

## Technology Stack

- **Backend**: Node.js with Express.js
- **AI Integration**: Google Gemini AI for intelligent features
- **Frontend**: Vanilla HTML5, CSS3, and JavaScript
- **Styling**: Custom CSS with Chilean-inspired design
- **Data Storage**: Local storage for favorites, mock API for recipes
- **Security**: Input sanitization and environment variable protection

## Installation & Setup

1. **Navigate to the nodejs-app directory:**
   ```bash
   cd nodejs-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure AI Features (Optional):**
   - Copy `.env.example` to `.env` (if available)
   - Add your Gemini API key to `.env`:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   - Get your API key from: https://makersuite.google.com/app/apikey

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   Or for production:
   ```bash
   npm start
   ```

5. **Open your browser and visit:**
   ```
   http://localhost:3000
   ```

## Netlify Deployment

This app is ready for deployment on Netlify with serverless functions for AI features.

### Quick Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/aflorentin001/Recipes)

### Manual Deployment

1. **Fork/Clone this repository**
2. **Connect to Netlify**: Link your GitHub repository
3. **Configure build settings**:
   - Build command: `npm install && cd nodejs-app && npm install && cp ../*.png public/`
   - Publish directory: `nodejs-app/public`
   - Functions directory: `netlify/functions`
4. **Set environment variables**:
   - `GEMINI_API_KEY`: Your Google Gemini API key
5. **Deploy**: Netlify will automatically build and deploy

📖 **Detailed deployment guide**: See [DEPLOYMENT.md](DEPLOYMENT.md)

## Project Structure

```
CAP3321_Assignment_Alejandra Florentin/
├── README.md                    # Project documentation
├── DEPLOYMENT.md               # Netlify deployment guide
├── package.json                # Top-level dependencies for Netlify
├── netlify.toml                # Netlify configuration
├── .gitignore                  # Git ignore rules
├── *.png                       # Recipe images served from root
├── screenshots/                # Project screenshots
├── services/                   # Business logic services (local dev)
│   └── aiService.js           # Gemini AI integration
├── netlify/                   # Netlify serverless functions
│   └── functions/             # AI API endpoints
│       ├── package.json       # Function dependencies
│       ├── ai-status.js       # AI service status
│       ├── ai-ingredient-substitution.js
│       ├── ai-meal-plan.js    # Meal planning
│       └── ai-smart-search.js # Smart cooking search
└── nodejs-app/                # Web application
    ├── package.json           # Local development dependencies
    ├── server.js              # Express server (local dev)
    ├── .env                   # Environment variables (gitignored)
    ├── .gitignore            # Local git ignore rules
    └── public/               # Static files (deployed to Netlify)
        ├── index.html        # Main HTML file with AI features
        ├── styles.css        # Chilean-themed CSS styles
        └── script.js         # Interactive JavaScript functionality
```

## API Endpoints

### Web Application
- `GET /` - Serves the main application
- `GET /api/recipes/search?q={query}` - Search recipes by query
- `GET /api/recipes/:id` - Get detailed recipe information

### AI-Powered Features
- `GET /api/ai/status` - Check AI service configuration status
- `POST /api/ai/ingredient-substitution` - Get ingredient substitutions
- `POST /api/ai/meal-plan` - Generate weekly meal plans
- `POST /api/ai/smart-search` - AI-powered cooking problem solving

## Features Overview

### 🤖 AI-Powered Features
- **Ingredient Substitution**: Get smart alternatives for missing ingredients with dietary restrictions support
- **Weekly Meal Planning**: AI-generated meal plans tailored to skill level and time preferences
- **Smart Search**: Solve cooking problems like "I have ingredients but don't know what to cook"

### 🏠 Home Section
- Welcome message with Chilean culinary heritage information
- Statistics dashboard showing recipe count and favorites
- Beautiful gradient design with Chilean flag colors

### 🔍 Search Section
- Real-time recipe search functionality
- Advanced filtering by difficulty and cooking time
- Interactive recipe cards with hover effects
- Favorite button for each recipe

### ❤️ Favorites Section
- Personal collection of saved recipes
- Persistent storage using localStorage
- Easy management of favorite recipes

### ℹ️ About Section
- Information about Chilean cuisine
- Cultural context and regional specialties
- Feature highlights with icons

## Recipe Data

The application includes authentic Chilean recipes such as:
- **Empanadas de Pino** - Traditional meat pastries
- **Pastel de Choclo** - Corn casserole with meat layers
- **Cazuela** - Hearty traditional stew
- **Completo Italiano** - Chilean-style hot dog
- **Sopaipillas** - Fried pastries with pumpkin

## Security Features

- 🔒 **API Key Protection**: Gemini API key secured in `.env` file and gitignored
- 🛡️ **Input Sanitization**: All AI inputs are validated and sanitized to prevent XSS attacks
- 📝 **Type Validation**: Strict type checking for all user inputs
- 🚫 **Error Boundaries**: Sensitive information never exposed in error responses
- 🔍 **Dependency Security**: Regular vulnerability scanning with `npm audit`

## Customization

### Adding New Recipes
Edit the `recipes` array in `server.js` to add new recipes with the following structure:

```javascript
{
    id: 6,
    name: "Recipe Name",
    description: "Recipe description",
    ingredients: ["ingredient1", "ingredient2"],
    cookingTime: "30 minutes",
    difficulty: "Easy"
}
```

### Configuring AI Features
The AI service can be customized in `services/aiService.js`:
- Modify prompts for different cuisine styles
- Adjust input validation rules
- Add new AI-powered features

### Styling Modifications
The Chilean color palette is defined in `styles.css`:
- Primary: `#d4c4a0` (warm beige)
- Secondary: `#c9b896` (light brown)
- Accent: `#a0956b` (olive green)
- Text: `#5d4e37` (dark brown)

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Development Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (placeholder)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for educational purposes.

## Author

Created by Alejandra Florentin for CAP3321C Assignment

---

¡Buen provecho! Enjoy exploring the rich flavors of Chilean cuisine! 🇨🇱
