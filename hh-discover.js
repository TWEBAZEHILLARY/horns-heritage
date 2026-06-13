/* ============================================================
   Horns & Heritage — Discover layer (ADDITIVE, vanilla JS)
   1. Site-wide search (products, cattle, tours, membership, pages)
   2. Unified wishlist (hearts on shop + cattle, popup, add-to-cart)
   Reuses the page's existing addToCart(), product/cattle popups,
   cart sidebar and WhatsApp links. Changes no existing content.
   ============================================================ */
(function () {
  'use strict';

  var WA_NUMBER = '256764250125';
  var WL_KEY = 'hh_wishlist_v2';

  /* ---------- tiny helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function norm(s) { return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }

  var ICO = {
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.06 24l1.68-6.13A11.86 11.86 0 0 1 .14 11.9C.13 5.34 5.47 0 12.04 0a11.82 11.82 0 0 1 8.42 3.49 11.82 11.82 0 0 1 3.48 8.43c0 6.56-5.34 11.9-11.9 11.9a11.9 11.9 0 0 1-5.69-1.45L.06 24zM6.6 20.13c1.68 1 3.28 1.6 5.43 1.6 5.45 0 9.9-4.43 9.9-9.88a9.82 9.82 0 0 0-2.9-7 9.8 9.8 0 0 0-6.99-2.9c-5.46 0-9.9 4.44-9.9 9.9 0 2.26.66 3.95 1.77 5.72l-1 3.64 3.69-1.08zM17.5 14.7c-.07-.12-.27-.2-.57-.35-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.76-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.07 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>'
  };

  /* ============================================================
     STORAGE
     ============================================================ */
  function getWish() {
    try { var a = JSON.parse(localStorage.getItem(WL_KEY)); return Array.isArray(a) ? a : []; }
    catch (e) { return []; }
  }
  function setWish(a) { try { localStorage.setItem(WL_KEY, JSON.stringify(a)); } catch (e) {} }
  function inWish(id) { return getWish().some(function (it) { return it.id === id; }); }

  /* ============================================================
     CARD READING — products & cattle share .product-card
     ============================================================ */
  function cardKey(card, prefix, idx) {
    var nm = $('.product-body h3', card);
    var base = nm ? norm(nm.textContent) : (prefix + idx);
    return prefix + '-' + base.replace(/[^a-z0-9]+/g, '-');
  }
  function readCard(card, type) {
    var nm = $('.product-body h3', card);
    var desc = $('.desc', card);
    var price = $('.price', card);
    var img = $('.product-photo', card);
    var tag = $('.tag', card);
    return {
      type: type,                                  // 'product' | 'cattle'
      name: nm ? nm.textContent.trim() : '',
      desc: desc ? desc.textContent.trim() : '',
      priceText: price ? price.textContent.trim() : '',
      img: img ? img.getAttribute('src') : null,
      tag: tag ? tag.textContent.trim() : '',
      soldout: !!card.querySelector('[data-soldout]') ||
               /sold\s*out/i.test((tag ? tag.textContent : '')) ||
               card.classList.contains('is-soldout')
    };
  }

  // Find a live card by wishlist id (so we can open its popup / click its add btn)
  function findCardById(id) {
    var sel = id.indexOf('cattle-') === 0 ? '#cattle .product-card' : '#shop .product-card';
    var prefix = id.indexOf('cattle-') === 0 ? 'cattle' : 'product';
    var found = null;
    $all(sel).forEach(function (card, i) {
      if (cardKey(card, prefix, i) === id) found = card;
    });
    return found;
  }

  /* ============================================================
     1. SITE-WIDE SEARCH
     ============================================================ */
  var searchForm = $('#mcSearch');
  var searchInput = $('#mcSearchInput');
  var resultsBox = null;
  var searchIndex = [];
  var activeIdx = -1;

  function buildIndex() {
    var idx = [];

    // Products
    $all('#shop .product-card').forEach(function (card, i) {
      var d = readCard(card, 'product');
      if (!d.name) return;
      idx.push({
        id: cardKey(card, 'product', i),
        kind: 'product', badge: 'Product', badgeClass: '',
        name: d.name, snippet: d.desc || d.tag,
        priceText: d.priceText, img: d.img,
        hay: norm([d.name, d.desc, d.tag, d.priceText].join(' ')),
        go: function () { goToCard(card, 'product'); }
      });
    });

    // Cattle
    $all('#cattle .product-card').forEach(function (card, i) {
      var d = readCard(card, 'cattle');
      if (!d.name) return;
      idx.push({
        id: cardKey(card, 'cattle', i),
        kind: 'cattle', badge: 'Cattle', badgeClass: 'cattle',
        name: d.name, snippet: d.desc || d.tag,
        priceText: d.priceText, img: d.img,
        hay: norm([d.name, d.desc, d.tag, d.priceText].join(' ')),
        go: function () { goToCard(card, 'cattle'); }
      });
    });

    // Tours
    $all('#tours .tour-card').forEach(function (card) {
      var nm = $('h3', card);
      var p = $('p', card);
      var pill = $('.price-pill', card);
      var img = $('img', card);
      if (!nm) return;
      idx.push({
        id: card.id || ('tour-' + norm(nm.textContent)),
        kind: 'tour', badge: 'Tour', badgeClass: 'tour',
        name: nm.textContent.trim(),
        snippet: p ? p.textContent.trim() : '',
        priceText: pill ? pill.textContent.trim() : '',
        img: img ? img.getAttribute('src') : null,
        hay: norm([nm.textContent, p ? p.textContent : '', pill ? pill.textContent : ''].join(' ')),
        go: function () { scrollToEl(card); }
      });
    });

    // Membership tiers
    $all('.tier').forEach(function (tier) {
      var nm = $('h3', tier);
      var price = $('.price-big', tier);
      var benefits = $all('li', tier).map(function (li) { return li.textContent.trim(); });
      if (!nm) return;
      idx.push({
        id: tier.id || ('tier-' + norm(nm.textContent)),
        kind: 'member', badge: 'Membership', badgeClass: 'member',
        name: nm.textContent.trim() + ' Membership',
        snippet: benefits.slice(0, 3).join(' · '),
        priceText: price ? price.textContent.replace(/\s+/g, ' ').trim() : '',
        img: null,
        hay: norm([nm.textContent, 'membership', benefits.join(' '), price ? price.textContent : ''].join(' ')),
        go: function () { scrollToEl(tier); }
      });
    });

    // Pages / sections
    var pages = [
      { sel: '#about', name: 'News Feed', words: 'news feed heritage family four generations kabula village red soil ankole history' },
      { sel: '#about-testimonials', name: 'Testimonials', words: 'testimonials reviews guests what guests say' },
      { sel: '#tours', name: 'Ranch Experience & Tours', words: 'tours ranch experience visit bonfire pasture walk day visit booking' },
      { sel: '#cattle', name: 'Buy & Sell Cattle', words: 'buy sell cattle ankole longhorn bull heifer calf cross negotiate whatsapp' },
      { sel: '#shop', name: 'The Shop', words: 'shop dairy beef gift boxes milk ghee cheese butter products order' },
      { sel: '#cams', name: 'Live Cams', words: 'live cams cameras stream watch herd youtube channel' },
      { sel: '#members', name: 'Heritage Membership', words: 'membership members herd join bronze silver gold premium benefits' },
      { sel: '#contact', name: 'Contact', words: 'contact address phone email whatsapp location kabula get in touch visit' }
    ];
    pages.forEach(function (p) {
      var el = $(p.sel);
      if (!el) return;
      var head = $('h2, h3', el);
      idx.push({
        id: 'page-' + p.sel.replace('#', ''),
        kind: 'page', badge: 'Page', badgeClass: 'page',
        name: p.name,
        snippet: head ? head.textContent.replace(/\s+/g, ' ').trim() : '',
        priceText: '', img: null,
        hay: norm(p.name + ' ' + p.words + ' ' + (head ? head.textContent : '')),
        go: function () { scrollToEl(el); }
      });
    });

    searchIndex = idx;
  }

  function search(q) {
    var terms = norm(q).split(' ').filter(Boolean);
    if (!terms.length) return [];
    return searchIndex
      .map(function (item) {
        var score = 0;
        terms.forEach(function (t) {
          if (item.hay.indexOf(t) === -1) { score = -999; return; }
          // boost when the term hits the name
          if (norm(item.name).indexOf(t) !== -1) score += 3;
          score += 1;
        });
        return { item: item, score: score };
      })
      .filter(function (r) { return r.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .map(function (r) { return r.item; });
  }

  var ORDER = ['product', 'cattle', 'tour', 'member', 'page'];
  var LABEL = { product: 'Shop products', cattle: 'Cattle listings', tour: 'Tour packages', member: 'Membership', page: 'Pages' };

  function renderResults(q, results) {
    if (!resultsBox) return;
    if (!q || q.length < 2) { closeResults(); return; }

    if (!results.length) {
      resultsBox.innerHTML =
        '<div class="hh-sr-empty">No matches for <strong>' + esc(q) + '</strong>.<br>Try “milk”, “bull”, “bonfire” or “gold”.</div>';
      openResults();
      return;
    }

    var html = '';
    var byKind = {};
    results.forEach(function (it) { (byKind[it.kind] = byKind[it.kind] || []).push(it); });

    var flat = [];
    ORDER.forEach(function (kind) {
      var group = byKind[kind];
      if (!group || !group.length) return;
      html += '<div class="hh-sr-group">' + LABEL[kind] + '</div>';
      group.slice(0, 6).forEach(function (it) {
        var i = flat.length;
        flat.push(it);
        var thumb = it.img
          ? '<span class="hh-sr-thumb"><img src="' + esc(it.img) + '" alt=""></span>'
          : '<span class="hh-sr-thumb">' + (it.kind === 'page' ? ICO.doc : it.kind === 'member' ? ICO.heart : ICO.tag) + '</span>';
        html +=
          '<button type="button" class="hh-sr-item" data-i="' + i + '">' +
            thumb +
            '<span class="hh-sr-info">' +
              '<span class="hh-sr-name">' + esc(it.name) +
                (it.priceText ? '<span class="hh-sr-price">' + esc(it.priceText) + '</span>' : '') +
              '</span>' +
              (it.snippet ? '<span class="hh-sr-snippet">' + esc(it.snippet) + '</span>' : '') +
            '</span>' +
            '<span class="hh-sr-badge ' + it.badgeClass + '">' + esc(it.badge) + '</span>' +
          '</button>';
      });
    });
    html += '<div class="hh-sr-foot"><span>' + results.length + ' result' + (results.length === 1 ? '' : 's') + '</span><span><kbd>↵</kbd> open</span></div>';

    resultsBox.innerHTML = html;
    activeIdx = -1;
    resultsBox._flat = flat;
    $all('.hh-sr-item', resultsBox).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var it = flat[+btn.dataset.i];
        if (it) { closeResults(); searchInput.blur(); it.go(); }
      });
    });
    openResults();
  }

  function openResults() { if (resultsBox) resultsBox.classList.add('open'); }
  function closeResults() { if (resultsBox) { resultsBox.classList.remove('open'); activeIdx = -1; } }

  function runSearch() { renderResults(searchInput.value.trim(), search(searchInput.value.trim())); }

  function initSearch() {
    if (!searchForm || !searchInput) return;
    resultsBox = document.createElement('div');
    resultsBox.className = 'hh-search-results';
    resultsBox.setAttribute('role', 'listbox');
    searchForm.appendChild(resultsBox);

    var debounce;
    searchInput.addEventListener('input', function () {
      clearTimeout(debounce);
      debounce = setTimeout(runSearch, 90);
    });
    searchInput.addEventListener('focus', function () {
      if (searchInput.value.trim().length >= 2) runSearch();
    });

    searchInput.addEventListener('keydown', function (e) {
      var items = $all('.hh-sr-item', resultsBox);
      if (e.key === 'ArrowDown' && items.length) {
        e.preventDefault(); activeIdx = Math.min(items.length - 1, activeIdx + 1); paintActive(items);
      } else if (e.key === 'ArrowUp' && items.length) {
        e.preventDefault(); activeIdx = Math.max(0, activeIdx - 1); paintActive(items);
      } else if (e.key === 'Escape') {
        closeResults();
      }
    });

    // Submit: open the active/first result instead of the old card-filter
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var flat = resultsBox._flat || [];
      var pick = (activeIdx >= 0 && flat[activeIdx]) ? flat[activeIdx] : flat[0];
      if (pick) { closeResults(); searchInput.blur(); pick.go(); }
    });

    document.addEventListener('click', function (e) {
      if (!searchForm.contains(e.target)) closeResults();
    });
  }

  function paintActive(items) {
    items.forEach(function (el, i) { el.classList.toggle('is-active', i === activeIdx); });
    if (items[activeIdx]) items[activeIdx].scrollIntoView ? null : null;
    if (items[activeIdx]) {
      var b = items[activeIdx];
      var top = b.offsetTop, bottom = top + b.offsetHeight;
      if (top < resultsBox.scrollTop) resultsBox.scrollTop = top - 8;
      else if (bottom > resultsBox.scrollTop + resultsBox.clientHeight) resultsBox.scrollTop = bottom - resultsBox.clientHeight + 8;
    }
  }

  /* ---------- navigation helpers ---------- */
  function scrollToEl(el) {
    if (!el) return;
    var y = el.getBoundingClientRect().top + window.pageYOffset - 96;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  }
  function goToCard(card, type) {
    scrollToEl(card);
    // open its detail popup after the scroll settles
    setTimeout(function () { card.click(); }, 520);
  }

  /* ============================================================
     2. WISHLIST — hearts on every product & cattle card
     ============================================================ */
  function makeHeart(card, type, prefix) {
    var imgWrap = $('.product-img', card);
    if (!imgWrap || imgWrap.querySelector('.hh-heart')) return;
    var idx = $all((type === 'cattle' ? '#cattle' : '#shop') + ' .product-card').indexOf(card);
    var id = cardKey(card, prefix, idx);
    card.setAttribute('data-wl-id', id);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hh-heart' + (inWish(id) ? ' is-active' : '');
    btn.setAttribute('aria-label', 'Add to wishlist');
    btn.setAttribute('aria-pressed', inWish(id) ? 'true' : 'false');
    btn.innerHTML = ICO.heart;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleWish(card, type, id, btn);
    });
    imgWrap.appendChild(btn);
  }

  function toggleWish(card, type, id, btn) {
    var arr = getWish();
    var pos = arr.map(function (x) { return x.id; }).indexOf(id);
    if (pos >= 0) {
      arr.splice(pos, 1);
      btn.classList.remove('is-active');
      btn.setAttribute('aria-pressed', 'false');
    } else {
      var d = readCard(card, type);
      arr.push({ id: id, type: type, name: d.name, priceText: d.priceText, img: d.img, soldout: d.soldout });
      btn.classList.add('is-active', 'just-added');
      btn.setAttribute('aria-pressed', 'true');
      setTimeout(function () { btn.classList.remove('just-added'); }, 360);
    }
    setWish(arr);
    updateBadge();
  }

  function decorateHearts() {
    $all('#shop .product-card').forEach(function (c) { makeHeart(c, 'product', 'product'); });
    $all('#cattle .product-card').forEach(function (c) { makeHeart(c, 'cattle', 'cattle'); });
    syncHearts();
  }
  function syncHearts() {
    $all('.hh-heart').forEach(function (btn) {
      var card = btn.closest('[data-wl-id]');
      if (!card) return;
      var on = inWish(card.getAttribute('data-wl-id'));
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  /* ---------- nav badge ---------- */
  var wlLink = $('#mcWishlist');
  var wlCountEl = $('#mcWishlistCount');
  function updateBadge() {
    var n = getWish().length;
    if (wlCountEl) wlCountEl.textContent = n;
    if (wlLink) wlLink.classList.toggle('has-items', n > 0);
    syncHearts();
    if (wlOverlay && wlOverlay.classList.contains('open')) renderWishlist();
  }

  /* ============================================================
     2b. WISHLIST POPUP
     ============================================================ */
  var wlOverlay = null, wlBody = null, wlNum = null, wlAddAll = null, wlClear = null;

  function buildPopup() {
    wlOverlay = document.createElement('div');
    wlOverlay.className = 'hh-wl-overlay';
    wlOverlay.setAttribute('role', 'dialog');
    wlOverlay.setAttribute('aria-modal', 'true');
    wlOverlay.setAttribute('aria-label', 'Wishlist');
    wlOverlay.innerHTML =
      '<div class="hh-wl-modal">' +
        '<div class="hh-wl-head">' +
          '<h2>' + ICO.heart + ' Your Wishlist <span class="hh-wl-num">0</span></h2>' +
          '<button type="button" class="hh-wl-close" aria-label="Close wishlist">' + ICO.close + '</button>' +
        '</div>' +
        '<div class="hh-wl-body"></div>' +
        '<div class="hh-wl-foot">' +
          '<button type="button" class="hh-wl-clear">Clear all</button>' +
          '<button type="button" class="hh-wl-addall">' + ICO.cart + ' Add all to cart</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wlOverlay);

    wlBody = $('.hh-wl-body', wlOverlay);
    wlNum = $('.hh-wl-num', wlOverlay);
    wlAddAll = $('.hh-wl-addall', wlOverlay);
    wlClear = $('.hh-wl-clear', wlOverlay);

    $('.hh-wl-close', wlOverlay).addEventListener('click', closePopup);
    wlOverlay.addEventListener('click', function (e) { if (e.target === wlOverlay) closePopup(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && wlOverlay.classList.contains('open')) closePopup();
    });
    wlClear.addEventListener('click', function () {
      setWish([]); updateBadge();
    });
    wlAddAll.addEventListener('click', function () {
      var arr = getWish();
      var added = 0;
      arr.forEach(function (it) {
        if (it.type === 'product' && !it.soldout && addProductToCart(it)) added++;
      });
      if (added) {
        wlAddAll.classList.add('done');
        wlAddAll.innerHTML = ICO.cart + ' Added ' + added + ' to cart ✓';
        setTimeout(function () {
          closePopup();
          var cb = $('#cartBtn'); if (cb) cb.click();
          wlAddAll.classList.remove('done');
          wlAddAll.innerHTML = ICO.cart + ' Add all to cart';
        }, 850);
      }
    });
  }

  // Re-find the product card and reuse the page's own Add-to-Cart button (most
  // faithful to existing cart logic); fall back to window.addToCart(item).
  function addProductToCart(it) {
    var card = findCardById(it.id);
    if (card) {
      var realBtn = card.querySelector('.add-to-cart');
      if (realBtn) { realBtn.click(); return true; }
    }
    if (typeof window.addToCart === 'function') {
      var price = parsePrice(it.priceText);
      window.addToCart({ id: it.id, name: it.name, priceText: it.priceText, price: price, img: it.img });
      return true;
    }
    return false;
  }
  function parsePrice(text) {
    var t = String(text || '').replace(/UGX|from|\s/gi, '').trim();
    var mil = /M$/i.test(t), k = /k$/i.test(t);
    var num = parseFloat(t.replace(/[^\d.]/g, ''));
    if (isNaN(num)) return 0;
    if (mil) return num * 1e6;
    if (k) return num * 1e3;
    return num;
  }

  function renderWishlist() {
    var arr = getWish();
    if (wlNum) wlNum.textContent = arr.length;

    var hasProducts = arr.some(function (it) { return it.type === 'product' && !it.soldout; });
    if (wlAddAll) wlAddAll.disabled = !hasProducts;

    if (!arr.length) {
      wlBody.innerHTML =
        '<div class="hh-wl-empty">' +
          '<div class="hh-wl-empty-ico">' + ICO.heart + '</div>' +
          '<h3>Nothing saved yet</h3>' +
          '<p>Tap the ♡ on any product or cattle listing to save it here for later.</p>' +
        '</div>';
      return;
    }

    var html = '';
    arr.forEach(function (it) {
      var thumb = it.img
        ? '<span class="hh-wl-thumb"><img src="' + esc(it.img) + '" alt=""></span>'
        : '<span class="hh-wl-thumb">' + ICO.tag + '</span>';
      var typeLabel = it.type === 'cattle' ? 'Cattle' : 'Product';
      var action;
      if (it.type === 'cattle') {
        action = '<button type="button" class="hh-wl-add wa" data-act="wa" data-id="' + esc(it.id) + '">' + ICO.wa + '<span class="lbl">Inquire</span></button>';
      } else if (it.soldout) {
        action = '<button type="button" class="hh-wl-add" disabled>Sold out</button>';
      } else {
        action = '<button type="button" class="hh-wl-add" data-act="add" data-id="' + esc(it.id) + '">' + ICO.cart + '<span class="lbl">Add</span></button>';
      }
      html +=
        '<div class="hh-wl-item">' +
          thumb +
          '<div class="hh-wl-info">' +
            '<div class="hh-wl-name">' + esc(it.name) + '</div>' +
            '<div class="hh-wl-sub">' +
              (it.priceText ? '<span class="hh-wl-price">' + esc(it.priceText) + '</span>' : '') +
              '<span class="hh-wl-type">' + typeLabel + '</span>' +
              (it.soldout ? '<span class="hh-wl-soldout">Sold out</span>' : '') +
            '</div>' +
          '</div>' +
          '<div class="hh-wl-actions">' +
            action +
            '<button type="button" class="hh-wl-remove" data-act="rm" data-id="' + esc(it.id) + '" aria-label="Remove ' + esc(it.name) + '">' + ICO.trash + '</button>' +
          '</div>' +
        '</div>';
    });
    wlBody.innerHTML = html;

    $all('[data-act]', wlBody).forEach(function (btn) {
      var act = btn.dataset.act, id = btn.dataset.id;
      btn.addEventListener('click', function () {
        var arr2 = getWish();
        var it = arr2.filter(function (x) { return x.id === id; })[0];
        if (!it) return;
        if (act === 'rm') {
          setWish(arr2.filter(function (x) { return x.id !== id; }));
          updateBadge();
        } else if (act === 'wa') {
          var msg = 'Hi, I am interested in ' + it.name + ' from my wishlist. Please send more details and negotiation options.';
          window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
        } else if (act === 'add') {
          if (addProductToCart(it)) {
            btn.classList.add('done');
            btn.innerHTML = '✓ Added';
            setTimeout(function () {
              btn.classList.remove('done');
              btn.innerHTML = ICO.cart + '<span class="lbl">Add</span>';
              var cb = $('#cartBtn'); if (cb) cb.click();
              closePopup();
            }, 700);
          }
        }
      });
    });
  }

  function openPopup() { renderWishlist(); wlOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closePopup() { wlOverlay.classList.remove('open'); document.body.style.overflow = ''; }

  function initWishlistNav() {
    if (wlLink) {
      wlLink.addEventListener('click', function (e) { e.preventDefault(); openPopup(); });
    }
  }

  /* ============================================================
     BOOT
     ============================================================ */
  var booted = false;
  function boot() {
    if (booted) return;
    booted = true;
    buildIndex();
    initSearch();
    buildPopup();
    initWishlistNav();
    decorateHearts();
    updateBadge();

    // The page re-asserts cards (nl-theme etc.) shortly after load — re-decorate.
    setTimeout(function () { decorateHearts(); buildIndex(); }, 500);
    setTimeout(function () { decorateHearts(); }, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { window.addEventListener('load', boot); });
  } else {
    window.addEventListener('load', boot);
    // already loaded
    setTimeout(boot, 0);
  }
})();
