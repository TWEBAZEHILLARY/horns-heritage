/* ===========================================================================
   worker.js — Horns & Heritage Cloudflare Worker
   ---------------------------------------------------------------------------
   Serves the static site (via the [assets] binding) AND a small JSON API for
   cattle listings and news posts, backed by two KV namespaces.

   ROUTES
     GET    /api/cattle          → list all cattle
     POST   /api/cattle          → create (body: cattle object; id auto if absent)
     PUT    /api/cattle/:id       → update
     DELETE /api/cattle/:id       → delete
     GET    /api/news            → list all news
     POST   /api/news            → create
     PUT    /api/news/:id         → update
     DELETE /api/news/:id         → delete
     (everything else)           → static asset (index.html, dashboard, JS, CSS…)

   STORAGE MODEL
     Each collection is stored as ONE JSON array under the key "all" in its KV
     namespace (CATTLE_KV / NEWS_KV). Simple and atomic enough for a ranch-scale
     catalogue. Swap to per-item keys if you expect thousands of records.

     The API is schema-less: POST /api/cattle and PUT /api/cattle/:id store the
     full JSON body, and GET returns it verbatim — so the cattle fields `age`
     and `hornSpan` (added June 2026) are accepted, persisted and returned with
     no code changes here. Older records simply lack the keys; the front-end
     treats a missing value as empty and hides the row.

   The front-end (hh-api.js) automatically falls back to localStorage when this
   Worker isn't reachable, so the site keeps working in preview / offline.
   =========================================================================== */

const COLLECTION_KEY = 'all';

/* ---- CORS ---------------------------------------------------------------- */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

function json(data, status = 200) {
  return new Response(data === null ? null : JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS },
  });
}
function noContent() {
  return new Response(null, { status: 204, headers: CORS });
}
function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/* ---- KV helpers ---------------------------------------------------------- */
async function readAll(ns) {
  if (!ns) return [];
  const raw = await ns.get(COLLECTION_KEY);
  try {
    const arr = JSON.parse(raw || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
async function writeAll(ns, arr) {
  await ns.put(COLLECTION_KEY, JSON.stringify(arr));
}

/* ---- Generic collection handler ----------------------------------------- */
async function handleCollection(request, ns, prefix, idFromPath) {
  const method = request.method;

  // LIST
  if (method === 'GET') {
    return json(await readAll(ns));
  }

  // CREATE
  if (method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const arr = await readAll(ns);
    if (!body.id) body.id = uid(prefix);
    // newest first; replace if the id already exists
    const i = arr.findIndex((x) => x.id === body.id);
    if (i === -1) arr.unshift(body);
    else arr[i] = body;
    await writeAll(ns, arr);
    return json(body, 201);
  }

  // UPDATE
  if (method === 'PUT') {
    if (!idFromPath) return json({ error: 'Missing id' }, 400);
    const body = await request.json().catch(() => ({}));
    body.id = idFromPath;
    const arr = await readAll(ns);
    const i = arr.findIndex((x) => x.id === idFromPath);
    if (i === -1) arr.unshift(body);
    else arr[i] = { ...arr[i], ...body };
    await writeAll(ns, arr);
    return json(arr.find((x) => x.id === idFromPath));
  }

  // DELETE
  if (method === 'DELETE') {
    if (!idFromPath) return json({ error: 'Missing id' }, 400);
    const arr = await readAll(ns);
    await writeAll(ns, arr.filter((x) => x.id !== idFromPath));
    return noContent();
  }

  return json({ error: 'Method not allowed' }, 405);
}

/* ---- API router ---------------------------------------------------------- */
async function handleApi(request, env, url) {
  if (request.method === 'OPTIONS') return noContent();

  const parts = url.pathname.replace(/^\/api\//, '').split('/').filter(Boolean);
  const resource = parts[0];          // "cattle" | "news"
  const id = parts[1] ? decodeURIComponent(parts[1]) : null;

  if (resource === 'cattle') return handleCollection(request, env.CATTLE_KV, 'cattle', id);
  if (resource === 'news') return handleCollection(request, env.NEWS_KV, 'news', id);

  /* ---------------------------------------------------------------------
     PAYMENTS (placeholder). To add a real USSD / mobile-money flow:
       POST /api/payments  → push a USSD/STK prompt to the buyer's MSISDN
                             via your aggregator (e.g. Flutterwave, MTN MoMo,
                             Africa's Talking) and return a payment reference.
       GET  /api/payments/:ref → return the live status; the "Verify" button
                             in hh-cattle.js polls this.
     --------------------------------------------------------------------- */
  // if (resource === 'payments') return handlePayments(request, env, id);

  return json({ error: 'Not found' }, 404);
}

/* ---- Entry point --------------------------------------------------------- */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      return handleApi(request, env, url);
    }

    // Everything else → static assets (index.html, Sales Dashboard.html, JS, CSS, images).
    // The [assets] binding is configured in wrangler.toml.
    if (env.ASSETS && env.ASSETS.fetch) {
      return env.ASSETS.fetch(request);
    }
    return new Response('Not found', { status: 404 });
  },
};
