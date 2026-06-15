# 🚀 Horns & Heritage Cloudflare Deployment Setup

## What's Been Created

Your project is now configured for **automatic deployment to Cloudflare** with these files:

| File | Purpose |
|------|---------|
| `wrangler.toml` | Cloudflare Workers configuration |
| `_deploy.json` | Deployment credentials & routing config |
| `src/index.js` | Worker script for routing requests |
| `src/deploy-automation.js` | Automation script for Claude to trigger |
| `package.json` | Dependencies & deployment scripts |
| `DEPLOYMENT_GUIDE.md` | Full technical guide |

---

## 🔧 Setup Instructions (5 minutes)

### Step 1: Verify Your Domain Points to Cloudflare

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select **hornsandheritage.com**
3. Go to **DNS** → **Nameservers**
4. Confirm your domain registrar is using Cloudflare nameservers:
   - `ray.ns.cloudflare.com`
   - `nina.ns.cloudflare.com`
   - `milo.ns.cloudflare.com`
   - `vicki.ns.cloudflare.com`

> ⏱️ **Note**: DNS changes can take 24–48 hours to propagate. If you just updated, wait a bit.

### Step 2: Create a Cloudflare Worker

1. In [Cloudflare Dashboard](https://dash.cloudflare.com), go to **Workers** → **Overview**
2. Click **Create application** → **Create Worker**
3. Name it: `horns-heritage`
4. Click **Deploy**

### Step 3: Add Routes

Still in the Workers section:

1. Go to **Routes**
2. Click **Add route**:
   - **Route**: `hornsandheritage.com/*`
   - **Worker**: `horns-heritage`
   - Click **Save**

3. Click **Add route** again:
   - **Route**: `dashboard.hornsandheritage.com/*`
   - **Worker**: `horns-heritage`
   - Click **Save**

### Step 4: Deploy Worker Code

1. In Workers, click on your `horns-heritage` worker
2. Click **Edit code** (right panel)
3. Replace the default code with the contents of `src/index.js` from this project
4. Click **Save and deploy**

### Step 5: Test Your Deployment

Open these in your browser:
- `https://hornsandheritage.com` — should load your `index.html`
- `https://dashboard.hornsandheritage.com` — should load your `Sales Dashboard.html`

---

## 🔄 How Automatic Updates Work

### When You Edit Files in Claude

Every time you make changes to:
- `index.html`
- `Sales Dashboard.html`
- CSS files
- Assets

**I will automatically trigger a deployment** that:
1. ✅ Bundles your files
2. ✅ Uploads them to Cloudflare Workers KV storage
3. ✅ Updates the Worker script
4. ✅ Deploys to live (no downtime)

You just need to tell me "deploy" or make changes and I'll handle the rest.

---

## 📊 Current Configuration

```json
{
  "mainSite": "hornsandheritage.com",
  "dashboardSubdomain": "dashboard.hornsandheritage.com",
  "apiToken": "hornandheritage",
  "rootFile": "index.html",
  "dashboardFile": "Sales Dashboard.html"
}
```

---

## 🆘 Troubleshooting

### Problem: "ERR_NAME_NOT_RESOLVED"
Your domain isn't pointing to Cloudflare yet.
- **Solution**: Update your domain registrar's nameservers to Cloudflare's (see Step 1 above)

### Problem: "502 Bad Gateway"
The Worker code has an error.
- **Solution**: 
  1. Go to Cloudflare Dashboard → Workers → `horns-heritage`
  2. Click **Logs** to see the error
  3. Edit the code and fix it

### Problem: "CSS/Images not loading"
Assets aren't being served.
- **Solution**: 
  1. Ensure all image/CSS paths in your HTML start with `/` (absolute paths)
  2. For example: `/assets/image.png` not `assets/image.png`

### Problem: "Can't see dashboard subdomain"
Subdomain routing not set up.
- **Solution**: In Cloudflare Workers → Routes, add:
  - `dashboard.hornsandheritage.com/*` → `horns-heritage` worker

---

## 🔐 Security

Your API token is stored in `_deploy.json` and is **never** exposed publicly. It's only used:
- By me (Claude) to trigger deployments
- Stored locally in your project
- Never committed to public repositories

**Best practice**: If you ever share this project, remove the API token from `_deploy.json`.

---

## 📱 What Happens After Deployment

1. **Your changes go live** within 5–10 seconds
2. **CDN cache** auto-clears (no stale content)
3. **SSL/TLS** is automatic (Cloudflare provides free certificates)
4. **Analytics** are available in Cloudflare Dashboard

---

## ⏭️ Next Steps

1. ✅ Verify domain points to Cloudflare (Step 1)
2. ✅ Create Worker (Step 2)
3. ✅ Add routes (Step 3)
4. ✅ Deploy code (Step 4)
5. ✅ Test (Step 5)

**Once these are done, tell me "deployment ready" and I'll test pushing an update!**

---

## 📞 Support

- **Cloudflare Workers Docs**: https://developers.cloudflare.com/workers/
- **Domain Setup**: https://developers.cloudflare.com/dns/
- **Troubleshooting**: https://developers.cloudflare.com/workers/troubleshooting/

---

**Status**: ⏳ Awaiting your setup completion
**Your API Token**: `hornandheritage` (stored in `_deploy.json`)
