# Cattle + News Backend — Integration & Deploy Notes

This adds **Cattle for Sale** (listings → auction-style detail modal → cart → USSD
checkout), **dashboard management** for cattle & news, and a **Cloudflare Worker +
KV backend** — all without changing any existing design, data, or features.

## What was added (new files only — nothing existing was deleted)

| File | Purpose |
|---|---|
| `hh-api.js` | Shared data layer. Talks to the Worker API when deployed; falls back to `localStorage` in preview/offline. Used by the site **and** the dashboard. |
| `hh-cattle.js` / `hh-cattle.css` | Cattle listings, auction detail modal (Ear Tag, DOB, REG NO, horn table LL/RL/LB/RB/SCI/TT, Sire/Dam, vaccinations, scrollable description), cattle cart drawer, simulated USSD checkout. |
| `dashboard-manage.js` / `dashboard-manage.css` | "Manage Cattle" + "Manage News" areas in the Sales Dashboard (add / edit / delete, all fields). |
| `worker.js` | Cloudflare Worker: serves static files + `/api/cattle` and `/api/news` (GET/POST/PUT/DELETE) with CORS. |
| `wrangler.toml` | Updated config — Worker + Static Assets + two KV namespaces, using array-of-tables (no inline-array conflict). |

Edited (additive include lines only): `index.html`, `Sales Dashboard.html`,
`news-slideshow.js`.

## Data safety

- **News** keeps the existing key `hhNewsItems` and the existing item shape, so old
  posts and the existing admin news dashboard keep working.
- **Cattle** uses a new key `hhCattleItems`; the cattle cart uses `hhCattleCart`.
- Nothing clears or rewrites the storefront cart, login, theme, or orders.

## How sync works

- **Preview / before deploy:** everything runs on `localStorage`. The site and the
  dashboard share the same browser storage, so dashboard edits show on the site
  immediately (and live-update across tabs).
- **Deployed:** `hh-api.js` calls the Worker API; data lives in KV and syncs across
  every device. `localStorage` is kept as an instant cache.

## Deploy

1. Copy the deployable files into `./public`:
   `index.html`, `Sales Dashboard.html`, `hh-api.js`, `hh-cattle.js`,
   `hh-cattle.css`, `hh-interactive.js`, `hh-interactive.css`, `hh-explorers.js`,
   `news-slideshow.js`, the other CSS/JS this site uses, and the `assets/` folder.
2. Create the KV namespaces and paste the printed ids into `wrangler.toml`:
   ```
   npx wrangler kv namespace create CATTLE_KV
   npx wrangler kv namespace create NEWS_KV
   ```
3. Deploy:
   ```
   npx wrangler deploy
   ```

## Real USSD / mobile-money later

`hh-cattle.js` `startUssd()` and the **Verify** button are intentionally decoupled.
Wire them to your aggregator (MTN MoMo, Flutterwave, Africa's Talking):
add `POST /api/payments` (push the prompt) and `GET /api/payments/:ref` (status)
in `worker.js` — there's a commented placeholder showing where.
