/* ============================================================================
   hh-beauty-2026.js  —  behaviour for the "Clean / Beauty" re-skin layer
   ----------------------------------------------------------------------------
   PURELY ADDITIVE. Adds to the Shop section ONLY:
     • a "Showing N of M products" result count
     • a "Sort by" dropdown (Default · Price low→high · Price high→low · Name A–Z)
   The existing category tabs, prices, product names and cart logic are NOT
   modified — sorting only re-orders existing cards in the DOM; the count just
   reads them. Also exposes window.HHBeauty to toggle/persist the skin.
   ========================================================================== */
(function () {
  'use strict';

  /* ---- Skin toggle + persistence (default ON) --------------------------- */
  var DEFAULT_SKIN = 'beauty';
  window.HHBeauty = {
    get: function () {
      return document.documentElement.getAttribute('data-hh-skin') === 'beauty';
    },
    set: function (on) {
      var v = on ? 'beauty' : 'classic';
      document.documentElement.setAttribute('data-hh-skin', v);
      try { localStorage.setItem('hh_skin', v); } catch (e) {}
      document.dispatchEvent(new CustomEvent('hh-skin-change', { detail: { on: on } }));
    },
    toggle: function () { this.set(!this.get()); }
  };

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else { fn(); }
  }

  ready(function () {
    var grid = document.getElementById('productGrid');
    var tabsRow = document.getElementById('shop-tabs');
    if (!grid) return;

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.product-card'));
    if (!cards.length) return;

    // Preserve the original (authored) order for the "Default" sort.
    var originalOrder = cards.slice();

    // Parse a numeric price from a card's visible .price text (e.g. "UGX 25,000").
    function priceOf(card) {
      var el = card.querySelector('.price');
      if (!el) return Number.POSITIVE_INFINITY;
      var m = (el.textContent || '').replace(/[^\d]/g, '');
      var n = parseInt(m, 10);
      return isNaN(n) ? Number.POSITIVE_INFINITY : n;
    }
    function nameOf(card) {
      var h = card.querySelector('h3');
      return (h ? h.textContent : '').trim().toLowerCase();
    }

    /* ---- Build the toolbar (count + sort) ------------------------------- */
    var toolbar = document.createElement('div');
    toolbar.className = 'hh-shop-toolbar';

    var count = document.createElement('div');
    count.className = 'hh-result-count';

    var sortWrap = document.createElement('label');
    sortWrap.className = 'hh-sort';
    var sortLabel = document.createElement('span');
    sortLabel.textContent = 'Sort by';
    var select = document.createElement('select');
    select.id = 'hh-sort-select';
    select.setAttribute('aria-label', 'Sort products');
    [
      ['default', 'Default'],
      ['price-asc', 'Price (low to high)'],
      ['price-desc', 'Price (high to low)'],
      ['name-asc', 'Name (A\u2013Z)']
    ].forEach(function (o) {
      var opt = document.createElement('option');
      opt.value = o[0];
      opt.textContent = o[1];
      select.appendChild(opt);
    });
    sortWrap.appendChild(sortLabel);
    sortWrap.appendChild(select);

    toolbar.appendChild(count);
    toolbar.appendChild(sortWrap);
    grid.parentNode.insertBefore(toolbar, grid);

    /* ---- Result count --------------------------------------------------- */
    function visibleCards() {
      return cards.filter(function (c) { return c.style.display !== 'none'; });
    }
    function updateCount() {
      var v = visibleCards().length;
      var total = cards.length;
      var word = total === 1 ? 'product' : 'products';
      if (v === total) {
        count.innerHTML = 'Showing <strong>all ' + total + '</strong> ' + word;
      } else {
        count.innerHTML = 'Showing <strong>' + v + '</strong> of ' + total + ' ' + word;
      }
    }

    /* ---- Sorting -------------------------------------------------------- */
    function applySort() {
      var mode = select.value;
      var ordered;
      if (mode === 'default') {
        ordered = originalOrder.slice();
      } else if (mode === 'name-asc') {
        ordered = cards.slice().sort(function (a, b) {
          return nameOf(a).localeCompare(nameOf(b));
        });
      } else {
        var dir = mode === 'price-desc' ? -1 : 1;
        ordered = cards.slice().sort(function (a, b) {
          return (priceOf(a) - priceOf(b)) * dir;
        });
      }
      // Re-append in the new order (display state untouched, so the active
      // category filter still hides/shows exactly the same cards).
      ordered.forEach(function (c) { grid.appendChild(c); });
    }

    select.addEventListener('change', function () {
      applySort();
      updateCount();
    });

    /* ---- Keep count in sync with the existing tab filter ---------------- */
    // The inline setTab() toggles each card's style.display on click; we read
    // the result just after it runs (next tick) without altering its logic.
    function scheduleCount() { setTimeout(updateCount, 0); }
    if (tabsRow) {
      tabsRow.querySelectorAll('.tab').forEach(function (t) {
        t.addEventListener('click', scheduleCount);
      });
    }
    document.querySelectorAll('a[data-tab-target]').forEach(function (a) {
      a.addEventListener('click', scheduleCount);
    });

    updateCount();
  });
})();
