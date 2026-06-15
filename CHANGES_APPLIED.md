# Horns & Heritage — Targeted Update Note (ready to redeploy)

All requested changes applied. No fonts, colors, layout, hero slideshow, news feed,
cattle cards, cart, or other features were altered.

## 1. Phone number (site-wide)
`+256 (0) 779 036 973` → **`+256 (0) 764 250 125`**
- `index.html` (top bar, contact, footer) and `public/index.html` (same three spots).

## 2. WhatsApp links & numbers
All `wa.me` links and number variables now point to **`256764250125`**:
- `index.html`, `public/index.html` (featured-bull CTA, sell CTA, social, chat reply, `WHATSAPP_NUMBER`)
- `app.js`, `public/app.js` (order / sell buttons)
- `hh-enhance.js` (checkout WhatsApp + cattle-inquire links)
- `hh-popups.js` (`WA_NUMBER`), `hh-explorers.js` (`WA`), `hh-discover.js` (`WA_NUMBER`)
- `dashboard-command-centre.js` — supplier `256779036973` → `256764250125`, plus fallback.

## 3. USSD / MTN payee
- USSD modal (`hh-cattle.js`) now reads: *"Dial the code below on your phone and enter the
  amount to pay merchant **+256764250125**."* USSD-code logic (`*123*456#`) unchanged.
- MTN MoMo payee (`hh-enhance.js`) — checkout method subtitle and "How to pay" panel now show
  **+256764250125** (Airtel number left unchanged).

## 4. "Our Story" → "News Feed"
- Renamed in `index.html` (About dropdown + footer). `public/index.html` already read "News Feed".
- Other menu items untouched; section content preserved. (Internal CSS/JS code comments that
  mention the legacy "story video" feature were intentionally left alone — not user-facing.)

## 5. Deployment
- `wrangler.toml` — already uses array-of-tables (`[[kv_namespaces]]`, `[[env.production.routes]]`)
  with **no inline arrays mixed in**, so the *"Can't extend an inline array"* error does not occur.
  KV bindings `CATTLE_KV` / `NEWS_KV` are defined for both default and `production`; paste the real
  namespace IDs (`REPLACE_WITH_*_KV_ID`) before `npx wrangler deploy`.
- `worker.js` and `package.json` were **not modified** — all API paths, variable names, and KV
  read/write operations are intact.

### Verification
- Old number `+256 (0) 779 036 973` / `779036973` / `256700000000`: **0 occurrences**.
- WhatsApp links use `256764250125`. USSD & MTN prompts display `+256764250125`.
