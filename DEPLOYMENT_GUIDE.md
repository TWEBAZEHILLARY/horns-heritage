# Horns & Heritage Cloudflare Deployment Guide

## Overview

Your website is configured to deploy to Cloudflare Workers with automatic routing:
- **hornsandheritage.com** → `index.html`
- **dashboard.hornsandheritage.com** → `Sales Dashboard.html`

---

## Prerequisites

1. **Cloudflare Account** with your domain `hornsandheritage.com` already pointed to Cloudflare nameservers
2. **API Token**: `hornandheritage` (stored in `_deploy.json`)
3. **Local Setup**:
   ```bash
   npm install -g wrangler
   npm install
   ```

---

## Initial Deployment

### Option A: Using Wrangler CLI (Recommended)

1. **Authenticate with Cloudflare**:
   ```bash
   wrangler login
   # Paste your API token when prompted
   ```

2. **Deploy the Worker**:
   ```bash
   wrangler publish --env production
   ```

3. **Verify**:
   - Visit `https://hornsandheritage.com` → should see your index.html
   - Visit `https://dashboard.hornsandheritage.com` → should see Sales Dashboard.html

### Option B: Using Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your domain `hornsandheritage.com`
3. Click **Workers** → **Create Worker**
4. Copy the code from `src/index.js`
5. Deploy and add custom routes:
   - `hornsandheritage.com/*` → Your Worker
   - `dashboard.hornsandheritage.com/*` → Your Worker

---

## Making Changes & Auto-Deployment

### After Editing `index.html` or `Sales Dashboard.html`:

**Option 1: Manual Deploy**
```bash
./deploy.sh
# or
wrangler publish --env production
```

**Option 2: Automated Deploy (CI/CD)**

I can set up a GitHub Actions workflow that auto-deploys on every change. Would you like me to do this?

---

## Troubleshooting

### Issue: "Domain not pointing to Cloudflare"
**Solution**: In Cloudflare Dashboard, ensure your domain's nameservers are:
- `ray.ns.cloudflare.com`
- `nina.ns.cloudflare.com`

### Issue: "Worker not serving the right file"
**Solution**: Check your domain routing in Cloudflare Dashboard:
1. Workers → Routes
2. Verify `hornsandheritage.com/*` and `dashboard.hornsandheritage.com/*` are mapped

### Issue: "CSS/Images not loading"
**Solution**: Ensure all asset paths in your HTML are **absolute paths** or **relative to the root**:
- ✅ `/assets/image.png`
- ✅ `./styles.css`
- ❌ `../styles.css`

---

## Environment Variables

If you need to add secrets (API keys, etc), store them in Cloudflare KV:

```bash
wrangler kv:namespace create "SECRETS"
wrangler secret put API_KEY
```

Then access in `src/index.js`:
```javascript
const apiKey = await env.SECRETS.get('API_KEY');
```

---

## Rollback

To revert to a previous version:
```bash
wrangler rollback --env production
```

---

## Support

For Cloudflare Workers docs: https://developers.cloudflare.com/workers/
For domain setup: https://developers.cloudflare.com/dns/

---

**Status**: ✅ Ready to deploy
**Next Step**: Run `wrangler publish --env production`
