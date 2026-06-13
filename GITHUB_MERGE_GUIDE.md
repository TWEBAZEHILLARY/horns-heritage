# 🔄 Merge & Sync Instructions

## Current Situation
- ✅ Local project (in this workspace) is fully configured
- ⏳ GitHub repo (TWEBAZEHILLARY/horns-heritage) needs to be updated
- 🔧 Need to set up continuous deployment

## 3-Part Process

### Part 1: Merge Files into GitHub Root (FROM project/ → ROOT)

Your GitHub repo currently has everything in a `project/` subfolder. We need to move it to the root level.

**Option A: Using GitHub Web Interface**

1. Go to https://github.com/TWEBAZEHILLARY/horns-heritage
2. Click "Add file" → "Upload files"
3. Drag these NEW files to upload:
   ```
   - wrangler.toml
   - package.json
   - .gitignore
   - setup.sh
   - setup.bat
   - CI_CD_SETUP_GUIDE.md
   - DEPLOYMENT_GUIDE.md
   - QUICK_REFERENCE.md
   - WRANGLER_FIX_SUMMARY.md
   - README_DEPLOYMENT.md
   - DEPLOYMENT_CHECKLIST.html
   - FINAL_SUMMARY.html
   - CI_CD_VISUAL_GUIDE.html
   ```
4. Create folder `src/` and upload `src/index.js`
5. Create folder `.github/workflows/` and upload `.github/workflows/deploy.yml`

**Option B: Using Git Command Line**

```bash
# Clone your repo
git clone https://github.com/TWEBAZEHILLARY/horns-heritage.git
cd horns-heritage

# Copy files from project/ to root
cp -r project/* .

# Move design system files
mkdir -p _ds
cp -r project/_ds/* _ds/

# Move assets
mkdir -p assets
cp -r project/assets/* assets/

# Stage and commit
git add .
git commit -m "Merge: Move project files to root and add deployment configuration

- Moved all HTML, CSS, JS files from project/ to root
- Moved assets and design system files to root
- Added wrangler.toml for Cloudflare Workers
- Added GitHub Actions workflow for CI/CD
- Added comprehensive documentation"

git push origin master
```

### Part 2: Add GitHub Secrets (For CI/CD)

1. Get credentials from Cloudflare (see CI_CD_VISUAL_GUIDE.html)
2. Go to https://github.com/TWEBAZEHILLARY/horns-heritage/settings/secrets/actions
3. Click "New repository secret"
4. Add two secrets:
   - `CLOUDFLARE_API_TOKEN` = your API token
   - `CLOUDFLARE_ACCOUNT_ID` = your account ID

### Part 3: Test the Pipeline

1. Make a small change to a file
2. Push to GitHub:
   ```bash
   git add .
   git commit -m "Test: CI/CD pipeline"
   git push origin master
   ```
3. Go to Actions tab and watch deployment happen automatically

## File Structure After Merge

Your GitHub repo will look like this:
```
horns-heritage/
├── wrangler.toml                    ← NEW
├── package.json                     ← NEW
├── .gitignore                       ← NEW
├── .github/                         ← NEW
│   └── workflows/
│       └── deploy.yml
├── src/                             ← NEW
│   └── index.js
├── public/                          ← NEW (from project/)
│   ├── index.html
│   ├── *.css
│   ├── app.js
│   ├── assets/
│   └── _ds/
├── README.md                        ← EXISTING
├── project/                         ← CAN DELETE (old structure)
├── CI_CD_SETUP_GUIDE.md             ← NEW
├── CI_CD_VISUAL_GUIDE.html          ← NEW
├── DEPLOYMENT_GUIDE.md              ← NEW
├── DEPLOYMENT_CHECKLIST.html        ← NEW
├── FINAL_SUMMARY.html               ← NEW
├── QUICK_REFERENCE.md               ← NEW
├── README_DEPLOYMENT.md             ← NEW
└── WRANGLER_FIX_SUMMARY.md          ← NEW
```

## After Merge Complete

### Your New Workflow:
```
1. Make changes locally or in GitHub web editor
2. Push to GitHub: git push origin master
3. GitHub Actions automatically:
   - Runs npm install
   - Runs npm run deploy
   - Deploys to Cloudflare Workers
4. Site is live!
```

### No More Manual Deployment:
- ❌ Don't need to run `npm run deploy` manually
- ❌ Don't need to log into Cloudflare
- ✅ Just push code to GitHub
- ✅ Automatic deployment happens

## Commands Summary

```bash
# Step 1: Clone and navigate
git clone https://github.com/TWEBAZEHILLARY/horns-heritage.git
cd horns-heritage

# Step 2: Copy files (if using Option B)
cp -r ../horns-heritage-workspace/* .
git add .

# Step 3: Commit and push
git commit -m "Merge: Configure deployment and CI/CD"
git push origin master

# Step 4: Set GitHub secrets manually in web interface
# (Go to Settings > Secrets and variables > Actions)

# Step 5: Test
echo "Make a small change and push to test CI/CD"
```

## Verify Everything Works

1. ✅ Check GitHub repo at https://github.com/TWEBAZEHILLARY/horns-heritage
2. ✅ Verify files are at root level (not in project/ subfolder)
3. ✅ Check Settings > Secrets and variables > Actions has 2 secrets
4. ✅ Check Actions tab shows successful deployment
5. ✅ Visit https://horns-heritage.workers.dev to see live site

## Troubleshooting

### Files still in project/ folder?
- Use GitHub's file move feature or delete project/ folder after merging

### GitHub Actions fails?
- Check secrets are set correctly
- Check `.github/workflows/deploy.yml` exists
- See error logs in Actions tab

### Site not deploying?
- Verify `wrangler.toml` has correct configuration
- Check `package.json` has deploy script
- Verify secrets are set in GitHub

## Next: Continuous Updates

Once CI/CD is set up, you can update your site anytime:

```bash
# Local edit
git add .
git commit -m "Feature: Update hero section"
git push origin master
# ↑ That's it! Automatic deployment happens

# Or edit directly in GitHub web editor
# Changes automatically deploy!
```

## Quick Links

- 📖 CI/CD Setup Guide: CI_CD_SETUP_GUIDE.md
- 🌐 Visual Setup Guide: CI_CD_VISUAL_GUIDE.html
- 🚀 Deployment Guide: DEPLOYMENT_GUIDE.md
- ⚡ Quick Commands: QUICK_REFERENCE.md

---

**Status**: Ready to merge and deploy ✅  
**Estimated time**: 15 minutes  
**Result**: Automatic deployments every push!
