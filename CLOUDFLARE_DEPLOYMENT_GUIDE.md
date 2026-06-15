# Cloudflare Deployment Guide for Horns & Heritage

## Problem: Why Assets Don't Show

Your `index.html` references files like:
```html
<link rel="stylesheet" href="hh-enhance.css" />
<link rel="stylesheet" href="tilt-3d.css" />
<script src="app.js"></script>
```

**Cloudflare Pages serves ALL files from the root folder.** If your folder structure is:
```
project/
├── index.html
├── hh-enhance.css
├── app.js
├── assets/
├── _ds/
```

Cloudflare will serve them correctly. **But if your files are nested (e.g., in `src/`, `public/`), the relative paths break.**

---

## Step 1: Prepare Your Files for Cloudflare

### Option A: Simple Flat Structure (Recommended)
Cloudflare Pages expects a **single root folder** with all assets accessible from `/`. 

**What to do:**
1. Copy **all files from `public/`, `src/`, and root** into ONE folder
2. Update any nested paths in your HTML
3. Deploy that folder to Cloudflare

### Option B: Use `wrangler.toml` (For Monorepo)
If you have a complex structure, configure Cloudflare to serve from a specific directory.

Edit/create `wrangler.toml`:
```toml
[env.production]
routes = [
  { pattern = "horns-heritage.com/*", zone_name = "horns-heritage.com" }
]

[build]
command = "npm run build"
cwd = "."

[build.upload]
main = "index.html"
```

---

## Step 2: Export Your Site as Self-Contained HTML

**Best approach:** Bundle everything into ONE HTML file so **all assets are inline** and no relative paths break.

Use the "Save as standalone HTML" skill to create a self-contained file:
```bash
# This bundles ALL CSS, JS, images, fonts into ONE .html file
# No external file references needed
```

---

## Step 3: Deploy to Cloudflare Pages

### Via Cloudflare Dashboard (No Git Required)

1. **Go to** `https://dash.cloudflare.com/`
2. **Select your domain** → **Pages** (or create a new project)
3. **Upload files** → Drag-and-drop your prepared folder (or single bundled HTML)
4. **Set build settings:**
   - Framework: None
   - Build command: (leave empty)
   - Build output directory: `.` (current directory, or the folder you're uploading)
5. **Deploy**

### Via Git + GitHub Actions (Recommended for Updates)

1. **Push your project to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOU/horns-heritage.git
   git push -u origin main
   ```

2. **Connect to Cloudflare Pages:**
   - Go to `https://dash.cloudflare.com/`
   - **Pages** → **Connect to Git**
   - Authorize GitHub, select `horns-heritage` repo
   - **Build settings:**
     - Framework: None
     - Build command: (empty)
     - Build output: `.` (or `public/` if all files are there)
   - **Save and deploy**

3. **Future updates:** Push to GitHub → Cloudflare auto-deploys

---

## Step 4: Preserve Your Edits in Version Control

### A. Track Your Edits in Git

1. **Create a `.gitignore`:**
   ```
   node_modules/
   .DS_Store
   .env.local
   *.log
   ```

2. **Commit everything you've edited:**
   ```bash
   git add index.html hh-enhance.css hh-redesign.js ...
   git commit -m "Add custom edits and styling"
   ```

3. **Link edits via comments or branches:**
   - Each commit message is a record: `git log` shows what changed and when
   - For major versions: `git tag -a v1.0 -m "Live version on Cloudflare"`

### B. Document Edits in a CHANGELOG

Create `EDIT_HISTORY.md`:
```markdown
# Edits to Horns & Heritage

## 2026-06-13
- **index.html**: Updated hero section background color to `#3C6E54`
  - Line 456: Changed `--primary-green` from `#5A8970` to `#3C6E54`
- **hh-enhance.css**: Added new card hover effect
  - Line 234-240: New `.card:hover { transform: translateY(-2px); }`

## 2026-06-12
- **app.js**: Fixed cart calculation bug
  - Line 145: Changed `total += price` to `total += price * qty`
```

### C. Link Edits in Code Comments

Add a comment in files you've customized:
```html
<!-- EDIT: 2026-06-13 - Custom theme colors applied -->
<!-- See: EDIT_HISTORY.md for full changelog -->
<style>
  :root {
    --primary-green: #3C6E54; /* CUSTOM: was #5A8970 */
  }
</style>
```

---

## Step 5: Deploy Your First Version

### Quick Deploy (No Git)

```bash
# Option 1: Use Cloudflare's Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy the current folder
wrangler pages deploy . --project-name=horns-heritage
```

### Or via Dashboard

1. Go to **https://dash.cloudflare.com/** → **Pages**
2. **Create project** → **Upload files**
3. Drag all your root files (index.html, CSS, JS, assets/, _ds/)
4. **Deploy**

---

## Step 6: Verify Assets Load

After deployment:

1. **Open your site** on Cloudflare (e.g., `horns-heritage.pages.dev`)
2. **Open DevTools** (F12) → **Network** tab
3. **Reload** (Cmd+Shift+R or Ctrl+Shift+R)
4. Check that:
   - ✅ `index.html` loads (200)
   - ✅ `hh-enhance.css` loads (200)
   - ✅ `app.js` loads (200)
   - ✅ Images in `assets/` load (200)
   - ✅ Design system files in `_ds/` load (200)

If any show **404**, the path is wrong — check your folder structure.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **CSS/JS not loading (404)** | Check the actual file path in Cloudflare → ensure files are at root level |
| **Relative paths like `../assets/` break** | Use absolute paths `/assets/image.jpg` instead |
| **Images missing** | Verify `assets/` folder is in your deployment |
| **Design system files not found** | Ensure `_ds/` folder is included in your deployment |
| **Fonts not loading** | Google Fonts CDN links in your HTML should work as-is (external link) |

---

## Recommended: Use Super Inline HTML

The **safest** approach: bundle everything into ONE HTML file.

```bash
# In your design tool, run:
super_inline_html(
  input_path: "index.html",
  output_path: "horns-heritage-standalone.html"
)
```

Then deploy **only** `horns-heritage-standalone.html` to Cloudflare. No CSS/JS files needed—it's all embedded.

---

## Next Steps

1. **Choose your deployment method:**
   - Simple: Dashboard upload → `index.html` + all assets in one folder
   - Pro: Git + GitHub → Cloudflare auto-deploys on push
   - Safest: Bundle to standalone HTML → single file

2. **Create EDIT_HISTORY.md** to track your changes

3. **Push to GitHub** for version control

4. **Deploy to Cloudflare Pages**

5. **Verify** all assets load in DevTools

