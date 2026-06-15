#!/bin/bash
# Horns & Heritage - Quick Deploy Script
# Copy and paste commands from here to deploy your site

# ========================================
# STEP 1: Sync with GitHub
# ========================================
echo "Step 1: Committing changes to Git..."
git add .
git commit -m "Fix: Configure Wrangler deployment with proper static file structure

- Added wrangler.toml with public folder configuration
- Created src/index.js Worker entry point
- Organized all static files in public/ directory
- Added package.json with deployment scripts
- All CSS, JS, images, and design system files in place"

echo "Pushing to GitHub..."
git push origin master

# ========================================
# STEP 2: Install Dependencies
# ========================================
echo "Installing dependencies..."
npm install

# ========================================
# STEP 3: Authenticate with Cloudflare (first time only)
# ========================================
echo "Authenticating with Cloudflare..."
wrangler login

# ========================================
# STEP 4: Deploy to Cloudflare Workers
# ========================================
echo "Deploying to Cloudflare Workers..."
npm run deploy

# ========================================
# DONE!
# ========================================
echo "✅ Deployment complete!"
echo "Your site is now live on Cloudflare Workers"
echo ""
echo "For local testing in the future, run:"
echo "  npm run dev"
echo ""
echo "To deploy updates, run:"
echo "  npm run deploy"
