# Cloudflare Deployment — Option C (Modified)

Your site is too large to bundle into a single HTML file (30+ MB with videos). Instead, we'll use **Cloudflare's built-in file serving** with a slight modification.

## The Plan

1. **Optimize the index.html** — remove heavy videos from bundling (keep asset references)
2. **Deploy the ENTIRE folder** to Cloudflare (not a bundle)
3. **Cloudflare serves all files** — CSS, JS, images, videos at the root level
4. **No broken paths** — because everything is at the root

## Step-by-Step

### Step 1: Verify Folder Structure

Your current structure is already correct for Cloudflare:
```
project-root/
├── index.html
├── hh-enhance.css
├── hh-redesign.css
├── app.js
├── tilt-3d.js
├── assets/
│   ├── ankole-1.jpg
│   ├── cattle-video.mp4
│   └── ... (all images and videos)
├── _ds/
│   └── urbanloft-design-system-6db9302f-8fa0-4943-bea9-04c287185da1/
```

**Cloudflare will serve this exactly as-is.** Your relative paths will work.

### Step 2: Deploy to Cloudflare

#### Option A: Via Cloudflare Dashboard (Easiest)

1. **Go to** https://dash.cloudflare.com/
2. **Select your domain** → **Pages**
3. **Click "Create project"** → **"Upload files"**
4. **Drag your entire project folder** into Cloudflare (or select all files)
5. **Build settings:**
   - Framework: **None**
   - Build command: (leave empty)
   - Build output directory: **.**
6. **Deploy**

✅ **Done!** Cloudflare now serves all your files from the root.

#### Option B: Via Wrangler CLI (Terminal)

```bash
npm install -g wrangler
wrangler login
wrangler pages deploy . --project-name=horns-heritage
```

### Step 3: Verify Everything Works

1. Open your Cloudflare site (e.g., `horns-heritage.pages.dev`)
2. Press **F12** → **Network** tab
3. Reload the page
4. Check that:
   - ✅ `index.html` = 200
   - ✅ `hh-enhance.css` = 200
   - ✅ `assets/ankole-1.jpg` = 200
   - ✅ `assets/cattle-video.mp4` = 200
   - ✅ `_ds/...` files = 200

**If all show 200:** Your site is live with no broken paths!

**If any show 404:** Check that the file actually exists in your local folder structure.

## Why This Works

- Cloudflare Pages treats your **uploaded folder as the root** (`/`)
- When your HTML says `<img src="assets/ankole-1.jpg">`, Cloudflare serves it from `/assets/ankole-1.jpg`
- When your HTML says `<link rel="stylesheet" href="hh-enhance.css">`, Cloudflare serves it from `/hh-enhance.css`
- **No broken paths** because Cloudflare has all the files at the root level

## Tracking Your Edits

Since this is deployed as files (not a bundle), track edits via:

1. **Git + GitHub** (recommended):
   ```bash
   git add index.html hh-enhance.css assets/
   git commit -m "Update hero styling and add new hero images"
   git push
   ```
   Cloudflare auto-deploys. Git history shows all changes.

2. **EDIT_HISTORY.md** file:
   ```markdown
   ## 2026-06-13
   - Updated hero background color in index.html (line 456)
   - Added new cattle photos to assets/
   ```

3. **Code comments**:
   ```css
   /* CUSTOM EDIT: 2026-06-13 - Updated primary green */
   --primary-green: #3C6E54;
   ```

## Summary

✅ Your site is **30+ MB** → too large to bundle  
✅ **Solution:** Deploy entire folder to Cloudflare (not bundled)  
✅ **Result:** All files accessible at root, no broken paths  
✅ **Edits:** Track via Git or EDIT_HISTORY.md  

Ready? Go to https://dash.cloudflare.com/ and start uploading your project folder!
