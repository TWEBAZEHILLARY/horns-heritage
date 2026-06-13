/* ===========================================================================
   hh-api.js — SHARED DATA LAYER for Horns & Heritage
   ---------------------------------------------------------------------------
   One small library used by BOTH the public site and the Sales Dashboard so
   that cattle listings and news items stay in sync.

   HOW IT WORKS
   ------------
   Two modes, chosen automatically and transparently:

     • DEPLOYED (Cloudflare Worker present)  → talks to the REST API:
          GET/POST   /api/cattle      GET/POST   /api/news
          PUT/DELETE /api/cattle/:id  PUT/DELETE /api/news/:id
       Data lives in KV (CATTLE_KV / NEWS_KV). Every device sees the same data.

     • PREVIEW / OFFLINE (no Worker, e.g. opened as a file or before deploy)
          → falls back to window.localStorage, so the whole site is fully
            functional with no backend at all.

   localStorage is also used as an instant cache/mirror in API mode, so the UI
   paints immediately and a dropped network never wipes the screen.

   SAFETY
   ------
   • News uses the EXISTING key  "hhNewsItems"  (written by the original admin
     dashboard) — existing posts are preserved untouched.
   • Cattle uses a NEW key       "hhCattleItems".
   • Nothing here clears or rewrites any other key (cart, login, theme, orders).
   =========================================================================== */
(function (global) {
  'use strict';

  var NEWS_KEY = 'hhNewsItems';     /* existing — do not change */
  var CATTLE_KEY = 'hhCattleItems'; /* new */
  var API_TIMEOUT = 3500;

  /* The API base. Same-origin by default; override by setting
     window.HH_API_BASE = 'https://your-worker.example.workers.dev' before
     this script loads (handy when the dashboard is hosted separately). */
  var API_BASE = (global.HH_API_BASE || '').replace(/\/$/, '');

  /* Whether the Worker API is reachable. null = unknown (probe lazily). */
  var apiUp = null;

  /* ----------------------------------------------------------------------- */
  function readLS(key) {
    try {
      var v = JSON.parse(global.localStorage.getItem(key));
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }
  function writeLS(key, arr) {
    try { global.localStorage.setItem(key, JSON.stringify(arr)); } catch (e) {}
  }
  function uid(prefix) {
    return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  function notify(kind) {
    /* Same-tab listeners + cross-tab storage event both fire on writeLS,
       but dispatch an explicit event for same-tab subscribers too. */
    try { global.dispatchEvent(new CustomEvent('hh:data', { detail: { kind: kind } })); } catch (e) {}
  }

  /* fetch with a timeout; resolves to Response or throws */
  function timedFetch(url, opts) {
    opts = opts || {};
    if (!('AbortController' in global)) return fetch(url, opts);
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, API_TIMEOUT);
    opts.signal = ctrl.signal;
    return fetch(url, opts).then(function (r) { clearTimeout(t); return r; },
      function (e) { clearTimeout(t); throw e; });
  }

  /* Try an API call; on ANY failure flip apiUp=false and rethrow so callers
     can fall back to localStorage. */
  function api(path, opts) {
    if (apiUp === false) return Promise.reject(new Error('api-down'));
    return timedFetch(API_BASE + path, Object.assign({
      headers: { 'Content-Type': 'application/json' }
    }, opts || {})).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      apiUp = true;
      return r.status === 204 ? null : r.json();
    }).catch(function (e) {
      apiUp = false;
      throw e;
    });
  }

  /* ----------------------------------------------------------------------- */
  /* Generic collection helpers parameterised by resource + storage key.     */
  function makeResource(resource, key) {
    function list() {
      return api('/api/' + resource).then(function (data) {
        var arr = Array.isArray(data) ? data : (data && data.items) || [];
        writeLS(key, arr);               /* mirror for instant next paint */
        return arr;
      }).catch(function () {
        return readLS(key);              /* offline / preview */
      });
    }

    function save(item) {
      var isNew = !item.id;
      if (isNew) item.id = uid(resource);
      /* optimistic local write first → UI is instant and data never lost */
      var arr = readLS(key);
      var i = arr.findIndex(function (x) { return x.id === item.id; });
      if (i === -1) arr.unshift(item); else arr[i] = item;
      writeLS(key, arr);
      notify(resource);

      var path = '/api/' + resource + (isNew ? '' : '/' + encodeURIComponent(item.id));
      return api(path, { method: isNew ? 'POST' : 'PUT', body: JSON.stringify(item) })
        .then(function (saved) { return saved || item; })
        .catch(function () { return item; });   /* localStorage already has it */
    }

    function remove(id) {
      var arr = readLS(key).filter(function (x) { return x.id !== id; });
      writeLS(key, arr);
      notify(resource);
      return api('/api/' + resource + '/' + encodeURIComponent(id), { method: 'DELETE' })
        .then(function () { return true; })
        .catch(function () { return true; });
    }

    /* synchronous read straight from cache — for first paint before list() */
    function cached() { return readLS(key); }

    return { list: list, save: save, remove: remove, cached: cached, key: key };
  }

  /* ----------------------------------------------------------------------- */
  var HHApi = {
    NEWS_KEY: NEWS_KEY,
    CATTLE_KEY: CATTLE_KEY,
    cattle: makeResource('cattle', CATTLE_KEY),
    news: makeResource('news', NEWS_KEY),

    /* convenience aliases */
    getCattle: function () { return this.cattle.list(); },
    saveCattle: function (i) { return this.cattle.save(i); },
    deleteCattle: function (id) { return this.cattle.remove(id); },
    getNews: function () { return this.news.list(); },
    saveNews: function (i) { return this.news.save(i); },
    deleteNews: function (id) { return this.news.remove(id); },

    /* subscribe to local changes (same tab AND cross tab) */
    onChange: function (fn) {
      global.addEventListener('hh:data', function (e) { fn(e.detail && e.detail.kind); });
      global.addEventListener('storage', function (e) {
        if (e.key === NEWS_KEY) fn('news');
        if (e.key === CATTLE_KEY) fn('cattle');
      });
    },

    /* seed default cattle ONCE if nothing exists yet (never overwrites) */
    seedCattle: function (defaults) {
      if (readLS(CATTLE_KEY).length === 0 && Array.isArray(defaults) && defaults.length) {
        defaults.forEach(function (d) { if (!d.id) d.id = uid('cattle'); });
        writeLS(CATTLE_KEY, defaults);
      }
      return readLS(CATTLE_KEY);
    },

    isApiUp: function () { return apiUp; }
  };

  global.HHApi = HHApi;
})(window);
