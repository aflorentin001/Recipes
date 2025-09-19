# Netlify Deployment Guide

This guide will help you deploy your Chilean Recipe App with AI features to Netlify.

## Prerequisites

1. **GitHub Repository**: Your code should be pushed to GitHub (already done)
2. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
3. **Gemini API Key**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Deployment Steps

### 1. Connect to Netlify

1. Log in to your Netlify account
2. Click "New site from Git"
3. Choose "GitHub" as your Git provider
4. Select your repository: `aflorentin001/Recipes`
5. Configure build settings:
   - **Base directory**: Leave empty (root)
   - **Build command**: `npm install && cd nodejs-app && npm install`
   - **Publish directory**: `nodejs-app/public`
   - **Functions directory**: `netlify/functions`

### 2. Configure Environment Variables

In your Netlify site dashboard:

1. Go to **Site settings** → **Environment variables**
2. Add the following variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key from Google AI Studio

### 3. Deploy

1. Click "Deploy site"
2. Netlify will automatically build and deploy your site
3. Your site will be available at a URL like: `https://amazing-site-name.netlify.app`

## Configuration Files

The following files have been created for Netlify deployment:

- `netlify.toml` - Main configuration file
- `netlify/functions/` - Serverless functions for AI features
- `.gitignore` - Ensures sensitive files aren't deployed

## API Endpoints (After Deployment)

Your deployed site will have these endpoints:

- `GET /api/ai/status` - Check AI service status
- `POST /api/ai/ingredient-substitution` - Get ingredient substitutions
- `POST /api/ai/meal-plan` - Generate meal plans
- `POST /api/ai/smart-search` - AI-powered cooking assistance

## Troubleshooting

### Common Issues:

1. **AI Features Not Working**
   - Check that `GEMINI_API_KEY` is set in environment variables
   - Verify the API key is valid and has proper permissions

2. **Build Failures**
   - Check the build logs in Netlify dashboard
   - Ensure all dependencies are properly listed in `package.json`

3. **Function Errors**
   - Check function logs in Netlify dashboard
   - Verify CORS headers are properly set

### Build Settings

If you need to manually configure build settings:

```
Base directory: (leave empty)
Build command: npm install && cd nodejs-app && npm install
Publish directory: nodejs-app/public
Functions directory: netlify/functions
```

## Custom Domain (Optional)

To use a custom domain:

1. Go to **Site settings** → **Domain management**
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

## Security Notes

- The `.env` file is automatically excluded from deployment
- API keys are securely stored in Netlify environment variables
- All functions include CORS headers for security
- Input validation is implemented in all AI functions

## Support

If you encounter issues:

1. Check Netlify's build and function logs
2. Verify environment variables are set correctly
3. Test API endpoints using the browser developer tools
4. Consult Netlify's documentation for advanced configuration

Your Chilean Recipe App with AI features is now ready for production! 🇨🇱✨
