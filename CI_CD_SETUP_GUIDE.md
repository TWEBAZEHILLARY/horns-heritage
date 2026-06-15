# 🚀 Continuous Deployment Setup Guide

## What is Continuous Deployment (CD)?
Automatically deploy your site to Cloudflare Workers **every time you push to GitHub**. No manual deployment needed!

## How It Works

```
You push code to GitHub
         ↓
GitHub Actions detects the push
         ↓
Automatically runs: npm install
         ↓
Automatically runs: npm run deploy
         ↓
Your site is LIVE on Cloudflare Workers
```

## Setup Instructions

### Step 1: Get Your Cloudflare Credentials

#### Get your Account ID:
1. Go to https://dash.cloudflare.com/
2. Log in to your Cloudflare account
3. In the top right, click your profile
4. Select "My Profile"
5. In the left menu, click "API Tokens"
6. Look for your **Account ID** on the page (or scroll down to "Account ID")
7. Copy this value

#### Create an API Token:
1. Still in https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Select "Get started" next to "Create Custom Token"
4. Configure these permissions:
   - **Permissions**: 
     - Account > Cloudflare Workers > Edit
     - Account > Cloudflare Workers Scripts > Edit
   - **Account Resources**: All accounts
5. Click "Continue to summary"
6. Click "Create Token"
7. Copy the token (you'll only see it once!)

### Step 2: Add Secrets to GitHub

1. Go to your GitHub repo: https://github.com/TWEBAZEHILLARY/horns-heritage
2. Click "Settings" (in the repo, not your profile)
3. In the left menu, click "Secrets and variables" > "Actions"
4. Click "New repository secret"
5. Add these two secrets:

**Secret 1:**
- Name: `CLOUDFLARE_API_TOKEN`
- Value: Paste the API token you copied above
- Click "Add secret"

**Secret 2:**
- Name: `CLOUDFLARE_ACCOUNT_ID`
- Value: Paste your Account ID
- Click "Add secret"

### Step 3: Update Your Wrangler Configuration

Edit your `wrangler.toml` file and add these lines:

```toml
account_id = "YOUR_ACCOUNT_ID_HERE"
```

Or leave it empty - wrangler will use the environment variable.

### Step 4: Verify Your Setup

1. Make a small change to a file (e.g., edit `public/index.html`)
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Test: CI/CD pipeline"
   git push origin master
   ```
3. Go to your GitHub repo
4. Click the "Actions" tab
5. You should see a workflow running called "Deploy to Cloudflare Workers"
6. Wait for it to complete (usually 2-3 minutes)
7. Once it shows ✅, your changes are live!

## File Structure for CI/CD

```
horns-heritage/
├── .github/
│   └── workflows/
│       └── deploy.yml              ← GitHub Actions workflow (NEW)
├── wrangler.toml
├── package.json
├── src/
│   └── index.js
├── public/
│   ├── index.html
│   ├── *.css
│   ├── assets/
│   └── _ds/
└── README.md
```

## Now Your Workflow Is:

### Before (Manual Deployment)
```bash
# Every time you wanted to deploy:
git push origin master
npm run deploy          ← You had to do this manually
```

### After (Automatic Deployment)
```bash
# Just push - that's it!
git push origin master
# GitHub Actions automatically deploys! ✅
```

## Monitoring Deployments

### Check Deployment Status:
1. Go to https://github.com/TWEBAZEHILLARY/horns-heritage
2. Click "Actions" tab
3. See all past and current deployments

### View Deployment Logs:
1. Click on any workflow run
2. Click "deploy" job
3. See detailed logs of the deployment

### Get Notified of Failures:
GitHub will send you email notifications if a deployment fails.

## Troubleshooting

### Deployment fails with "API token invalid"
- Check that you copied the token correctly
- Make sure you set the right secret name: `CLOUDFLARE_API_TOKEN`
- Generate a new token and update the secret

### Deployment fails with "Account ID not found"
- Verify your Account ID is correct
- Check the secret name: `CLOUDFLARE_ACCOUNT_ID`

### Workflow doesn't run after push
- Make sure `.github/workflows/deploy.yml` exists in your repo
- Check it's in the correct folder structure
- Try pushing to `main` instead of `master` if that's your default branch

## Environment Variables Used

The workflow uses these secrets automatically:
- `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

These are injected into the environment when the workflow runs.

## Manual Deployment (Still Available)

If you ever need to deploy manually:
```bash
npm run deploy
```

This still works anytime!

## Security Notes

✅ Your secrets are encrypted and not visible in logs  
✅ Tokens are never exposed in public repositories  
✅ You can rotate tokens anytime (just update the secret)  
✅ GitHub Actions runs on secure servers  

## Next Steps

1. ✅ Get your Cloudflare credentials (API token + Account ID)
2. ✅ Add secrets to GitHub repository
3. ✅ Push this workflow file to GitHub: `.github/workflows/deploy.yml`
4. ✅ Test with a small change
5. ✅ Enjoy automatic deployments!

## Files Changed/Added

| File | Status | Purpose |
|------|--------|---------|
| `.github/workflows/deploy.yml` | NEW | Automated deployment workflow |
| All other files | UNCHANGED | No changes needed |

## Questions?

- **GitHub Actions docs**: https://docs.github.com/en/actions
- **Cloudflare Workers docs**: https://developers.cloudflare.com/workers/
- **Wrangler docs**: https://developers.cloudflare.com/workers/wrangler/

---

**Status**: ✅ Ready to set up  
**Time to setup**: ~5 minutes  
**Benefit**: No more manual deployments!
