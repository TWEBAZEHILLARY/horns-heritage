/* =====================================================================
   hh-interactive.js — "Interactive 2026" polish layer (ADDITIVE)
   ---------------------------------------------------------------------
   1) Scroll progress bar (top of page)
   2) Hero: staggered headline entrance + cursor parallax on the slideshow
   3) Back-to-top button with a scroll-progress ring
   4) Shop: live filter box (works WITH the existing tabs, never against)
   5) Lightbox for the four Tour cards (image + details + "Book" CTA)
   6) Magnetic hover on primary CTAs (desktop, fine pointers only)
   7) Scrollspy — highlights the menu item of the section in view

   SAFETY
   - Everything is created at runtime and gated behind html[data-hhx="on"].
   - NO existing localStorage keys are read, written or cleared.
   - All listeners are passive; nothing calls preventDefault except the
     tour-card click (which previously linked to its own anchor).
   ===================================================================== */
(function () {
  'use strict';

  var doc = document.documentElement;
  doc.setAttribute('data-hhx', 'on');

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else { fn(); }
  }

  /* ------------------------------------------------------------------
     1) SCROLL PROGRESS BAR
     ------------------------------------------------------------------ */
  function initProgress() {
    var bar = document.createElement('div');
    bar.className = 'hhx-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    var ticking = false;
    function update() {
      ticking = false;
      var max = doc.scrollHeight - window.innerHeight;
      var p = max > 0 ? (window.scrollY / max) : 0;
      bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)).toFixed(4) + ')';
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ------------------------------------------------------------------
     2) HERO — headline word-by-word entrance + cursor parallax
     ------------------------------------------------------------------ */
  function initHero() {
    var h1 = document.querySelector('.hero .mc-hero-head h1');
    if (h1 && !reduceMotion && !h1.dataset.hhxSplit) {
      h1.dataset.hhxSplit = '1';
      var words = h1.textContent.trim().split(/\s+/);
      h1.textContent = '';
      words.forEach(function (w, i) {
        var outer = document.createElement('span');
        outer.className = 'hhx-w';
        var inner = document.createElement('span');
        inner.className = 'hhx-wi';
        inner.style.setProperty('--hhx-i', i);
        inner.textContent = w;
        outer.appendChild(inner);
        h1.appendChild(outer);
        if (i < words.length - 1) h1.appendChild(document.createTextNode(' '));
      });
      doc.classList.add('hhx-hero-anim');
    }

    /* Cursor parallax on the slideshow (desktop only) */
    if (!finePointer || reduceMotion) return;
    var hero = document.querySelector('.hero');
    var photos = document.querySelector('.hero .mc-hero-photos');
    if (!hero || !photos) return;
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;   // -0.5 … 0.5
      var y = (e.clientY - r.top) / r.height - 0.5;
      photos.style.translate = (x * -14).toFixed(1) + 'px ' + (y * -8).toFixed(1) + 'px';
    }, { passive: true });
    hero.addEventListener('mouseleave', function () {
      photos.style.translate = '0px 0px';
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
     3) BACK-TO-TOP with progress ring
     ------------------------------------------------------------------ */
  function initBackToTop() {
    var R = 23, CIRC = 2 * Math.PI * R;
    var btn = document.createElement('button');
    btn.className = 'hhx-btt';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML =
      '<svg class="hhx-btt-ring" viewBox="0 0 52 52" aria-hidden="true">' +
      '<circle cx="26" cy="26" r="' + R + '" stroke-dasharray="' + CIRC.toFixed(1) +
      '" stroke-dashoffset="' + CIRC.toFixed(1) + '"></circle></svg>' +
      '<span class="hhx-btt-arrow" aria-hidden="true">↑</span>';
    document.body.appendChild(btn);
    var ring = btn.querySelector('circle');

    var ticking = false;
    function update() {
      ticking = false;
      var max = doc.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      ring.style.strokeDashoffset = (CIRC * (1 - p)).toFixed(1);
      btn.classList.toggle('is-show', window.scrollY > 600);
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------------------------------------------
     4) SHOP LIVE FILTER — additive, cooperates with the category tabs
     ------------------------------------------------------------------ */
  function initShopFilter() {
    var shop = document.getElementById('shop');
    var tabs = document.getElementById('shop-tabs');
    var grid = document.getElementById('productGrid');
    if (!shop || !tabs || !grid || document.querySelector('.hhx-shopfilter')) return;

    var wrap = document.createElement('div');
    wrap.className = 'hhx-shopfilter reveal';
    wrap.innerHTML =
      '<div class="hhx-shopfilter-box">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m21 21-4.3-4.3"></path></svg>' +
      '<input type="search" placeholder="Filter products… try “ghee” or “ribs”" aria-label="Filter products" autocomplete="off" />' +
      '<button type="button" class="hhx-shopfilter-clear" aria-label="Clear filter">✕</button>' +
      '</div>' +
      '<span class="hhx-shopfilter-count" aria-live="polite"></span>';
    tabs.insertAdjacentElement('afterend', wrap);

    var input = wrap.querySelector('input');
    var clear = wrap.querySelector('.hhx-shopfilter-clear');
    var count = wrap.querySelector('.hhx-shopfilter-count');
    var empty = document.createElement('div');
    empty.className = 'hhx-shop-empty hhx-hide';
    empty.textContent = 'No products match — try a different word, or browse the tabs above.';
    grid.appendChild(empty);

    function apply() {
      var q = input.value.trim().toLowerCase();
      wrap.classList.toggle('has-q', q.length > 0);
      var cards = grid.querySelectorAll('.product-card');
      var shown = 0;
      cards.forEach(function (card) {
        var match = !q || card.textContent.toLowerCase().indexOf(q) !== -1;
        card.classList.toggle('hhx-hide', !match);
        /* respect the tab filter: a card hidden by the tabs stays hidden */
        if (match && card.offsetParent !== null) shown++;
      });
      empty.classList.toggle('hhx-hide', shown !== 0);
      count.textContent = q ? (shown + ' match' + (shown === 1 ? '' : 'es')) : '';
    }
    input.addEventListener('input', apply);
    clear.addEventListener('click', function () { input.value = ''; apply(); input.focus(); });
    /* re-count when a tab is clicked (tabs toggle display on cards) */
    tabs.addEventListener('click', function () { setTimeout(apply, 80); });
  }

  /* ------------------------------------------------------------------
     5) TOURS LIGHTBOX — click a tour card to open it large
     ------------------------------------------------------------------ */
  function initTourLightbox() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.tour-card'));
    if (!cards.length || document.querySelector('.hhx-lb')) return;

    var data = cards.map(function (card) {
      var img = card.querySelector('img');
      return {
        src: img ? img.getAttribute('src') : '',
        alt: img ? img.getAttribute('alt') : '',
        pill: (card.querySelector('.price-pill') || {}).textContent || '',
        title: (card.querySelector('h3') || {}).textContent || '',
        desc: (card.querySelector('p') || {}).textContent || ''
      };
    });

    var lb = document.createElement('div');
    lb.className = 'hhx-lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Tour preview');
    lb.innerHTML =
      '<div class="hhx-lb-card">' +
      '<div class="hhx-lb-media"><img alt="" /><span class="hhx-lb-pill"></span></div>' +
      '<div class="hhx-lb-body">' +
      '<div><h3></h3><p></p></div>' +
      '<a class="btn btn-primary hhx-lb-book" href="#tours">Book this experience →</a>' +
      '</div>' +
      '<button type="button" class="hhx-lb-close" aria-label="Close">✕</button>' +
      '<button type="button" class="hhx-lb-nav hhx-lb-prev" aria-label="Previous">←</button>' +
      '<button type="button" class="hhx-lb-nav hhx-lb-next" aria-label="Next">→</button>' +
      '</div>';
    document.body.appendChild(lb);

    var idx = 0, lastFocus = null;
    var imgEl = lb.querySelector('img');
    var pillEl = lb.querySelector('.hhx-lb-pill');
    var titleEl = lb.querySelector('h3');
    var descEl = lb.querySelector('.hhx-lb-body p');
    var bookBtn = lb.querySelector('.hhx-lb-book');

    function render() {
      var d = data[idx];
      imgEl.src = d.src;
      imgEl.alt = d.alt;
      pillEl.textContent = d.pill;
      titleEl.textContent = d.title;
      descEl.textContent = d.desc;
    }
    function open(i) {
      idx = i;
      render();
      lastFocus = document.activeElement;
      lb.classList.add('is-open');
      lb.querySelector('.hhx-lb-close').focus();
    }
    function close() {
      lb.classList.remove('is-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function nav(d) { idx = (idx + d + data.length) % data.length; render(); }

    cards.forEach(function (card, i) {
      card.addEventListener('click', function (e) {
        e.preventDefault();
        open(i);
      });
    });
    lb.querySelector('.hhx-lb-close').addEventListener('click', close);
    lb.querySelector('.hhx-lb-prev').addEventListener('click', function () { nav(-1); });
    lb.querySelector('.hhx-lb-next').addEventListener('click', function () { nav(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') nav(-1);
      if (e.key === 'ArrowRight') nav(1);
    });
    bookBtn.addEventListener('click', function () {
      close();
      /* the booking modal (hh-explorers.js) listens for this */
      window.dispatchEvent(new CustomEvent('hhx:book-tour', {
        detail: { experience: data[idx].title }
      }));
    });
  }

  /* ------------------------------------------------------------------
     6) MAGNETIC CTAs — gentle pull toward the cursor
     ------------------------------------------------------------------ */
  function initMagnetic() {
    if (!finePointer || reduceMotion) return;
    var sel = '.hero-actions .btn, .fb-cta, .pulse-cta, .hhx-tours-cta .btn';
    document.querySelectorAll(sel).forEach(function (btn) {
      if (btn.dataset.hhxMag) return;
      btn.dataset.hhxMag = '1';
      btn.classList.add('hhx-magnet');
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        btn.style.translate = (x * 6).toFixed(1) + 'px ' + (y * 4).toFixed(1) + 'px';
      }, { passive: true });
      btn.addEventListener('mouseleave', function () {
        btn.style.translate = '0px 0px';
      }, { passive: true });
    });
  }

  /* ------------------------------------------------------------------
     7) SCROLLSPY — light the menu item for the section in view
     ------------------------------------------------------------------ */
  function initScrollspy() {
    if (!('IntersectionObserver' in window)) return;
    var map = [
      ['shop', '#shop'], ['butchery', '#butchery'], ['cattle', '#cattle'],
      ['tours', '#tours'], ['cams', '#cams'], ['members', '#members'],
      ['about', '#about']
    ];
    var items = {};
    document.querySelectorAll('.menu .menu-item').forEach(function (item) {
      var link = item.querySelector('.menu-link');
      if (!link) return;
      var href = link.getAttribute('href');
      map.forEach(function (m) { if (href === m[1]) items[m[0]] = item; });
    });
    var current = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        var key = id === 'featured-bull' ? 'shop' : id;
        if (!items[key] || current === key) return;
        Object.keys(items).forEach(function (k) {
          items[k].classList.toggle('active', k === key);
        });
        current = key;
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    map.forEach(function (m) {
      var sec = document.getElementById(m[0]);
      if (sec) io.observe(sec);
    });
  }

  /* ------------------------------------------------------------------ */
  onReady(function () {
    initProgress();
    initHero();
    initBackToTop();
    initShopFilter();
    initTourLightbox();
    initMagnetic();
    /* scrollspy waits a tick so hh-explorers.js can inject #butchery */
    setTimeout(initScrollspy, 600);
    window.addEventListener('load', function () { setTimeout(initMagnetic, 500); });
  });
})();
