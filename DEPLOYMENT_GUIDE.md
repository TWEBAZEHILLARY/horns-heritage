# Horns & Heritage - Deployment Guide

## Overview
This project is configured for deployment on Cloudflare Workers with static asset serving.

## What Was Fixed

### The Error
```
X [ERROR] Could not detect a directory containing static files (e.g. html, css and js) for the project
```

### The Solution
1. **Created `wrangler.toml`** - Proper Cloudflare Workers configuration pointing to the `public/` folder
2. **Created `src/index.js`** - Worker entry point that serves static files
3. **Organized files** - All static assets (HTML, CSS, JS, images) are now in the `public/` folder
4. **Added `package.json`** - Node.js dependencies for Wrangler

## Project Structure
```
horns-heritage/
├── wrangler.toml          # Cloudflare Workers config
├── package.json           # Node dependencies
├── src/
│   └── index.js          # Worker entry point
└── public/               # All static files served here
    ├── index.html        # Main site (renamed from "Horns and Heritage.html")
    ├── hh-enhance.css
    ├── hh-redesign.css
    ├── hh-discover.css
    ├── tilt-3d.css
    ├── app.js
    ├── styles.css
    ├── assets/           # Images and media
    └── _ds/              # Design system files
```

## How to Deploy

### Prerequisites
- Node.js 16+ installed
- Wrangler CLI installed: `npm install -g wrangler`
- Cloudflare account

### Local Development
```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# This will run on http://localhost:8787
```

### Deploy to Cloudflare Workers
```bash
# Deploy to production
npm run deploy

# Or use wrangler directly
wrangler deploy
```

## GitHub Sync Instructions

### Push Changes to GitHub
```bash
# From your project directory
git add .
git commit -m "Fixed Wrangler deployment configuration"
git push origin master
```

### Directory Structure in GitHub
Make sure your GitHub repo has this structure:
```
horns-heritage/
├── wrangler.toml
├── package.json
├── src/
│   └── index.js
├── public/
│   ├── index.html
│   ├── *.css
│   ├── *.js
│   ├── assets/
│   └── _ds/
└── README.md
```

## Important Files

| File | Purpose |
|------|---------|
| `wrangler.toml` | Cloudflare Workers configuration |
| `package.json` | Node dependencies and scripts |
| `src/index.js` | Worker entry point |
| `public/index.html` | Main HTML file (was "Horns and Heritage.html") |

## Troubleshooting

### If you still get "static files not found"
1. Verify the `public/` folder exists and contains `index.html`
2. Check `wrangler.toml` has the `[sites]` section with `bucket = "./public"`
3. Run `wrangler publish --compatibility-date 2024-12-16`

### If CSS/JS files don't load
1. Verify all referenced files are in the `public/` folder
2. Check file paths are relative (no leading `/`)
3. Ensure asset imports use correct paths

## Next Steps
1. Commit and push this configuration to GitHub
2. Update your GitHub repository with the new structure
3. Run `npm run deploy` to publish to Cloudflare Workers
4. Monitor the deployment logs for any errors

## Support
For Cloudflare Workers documentation: https://developers.cloudflare.com/workers/
For Wrangler CLI docs: https://developers.cloudflare.com/workers/wrangler/install-and-update/
