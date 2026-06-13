/* ============================================================================
   nl-theme.js  —  "Nature Leaf" behaviour layer
   Runs LAST. Purely visual / structural. Touches no prices, products, units,
   cart, checkout, login, membership or WhatsApp logic.

   Three jobs:
     1. Add a "Quick View" pill (+ decorative heart) to every Shop product card.
        Quick View just re-triggers the card's own click → the EXISTING product
        popup (price · unit · description · Add to Cart) opens unchanged.
     2. Remove the looping cow-video backdrops from Shop / Buy-Sell / Tours /
        Cattle-Cams / Membership, and the cow video behind the About story.
        The hero video on the homepage is left exactly as-is.
     3. Keep them removed if another script tries to re-inject (short watch).
   ========================================================================== */
(function () {
  'use strict';

  var EYE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>' +
    '<circle cx="12" cy="12" r="3"></circle></svg>';

  var HEART =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78' +
    'L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"></path></svg>';

  /* ---- 1. Quick View + heart on Shop cards -------------------------------- */
  function decorateShop() {
    var shop = document.getElementById('shop');
    if (!shop) return;
    shop.querySelectorAll('.product-card').forEach(function (card) {
      var imgWrap = card.querySelector('.product-img');
      if (!imgWrap || imgWrap.querySelector('.nl-quickview')) return;

      var nameEl = card.querySelector('.product-body h3');
      var name = nameEl ? nameEl.textContent.trim() : 'product';

      /* Quick View — re-fires the card's own click so the existing popup opens */
      var qv = document.createElement('button');
      qv.type = 'button';
      qv.className = 'nl-quickview';
      qv.setAttribute('aria-label', 'Quick view ' + name);
      qv.innerHTML = EYE + '<span>Quick View</span>';
      qv.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        card.click(); /* card.click() target = card → popup opens (not ignored) */
      });

      /* Decorative save heart — cosmetic toggle, no data / cart impact */
      var fav = document.createElement('button');
      fav.type = 'button';
      fav.className = 'nl-fav';
      fav.setAttribute('aria-label', 'Save ' + name);
      fav.innerHTML = HEART;
      fav.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        fav.classList.toggle('is-active');
      });

      imgWrap.appendChild(fav);
      imgWrap.appendChild(qv);
    });
  }

  /* ---- 2. Strip cow-video backdrops + the About story video --------------- */
  function stripCowVideos() {
    /* Full-section cinematic backdrops injected by hh-bright.js */
    document.querySelectorAll('.hh-cowbg').forEach(function (el) { el.remove(); });
    document.querySelectorAll('.hh-has-cowbg').forEach(function (sec) {
      sec.classList.remove('hh-has-cowbg');
    });

    /* About / story floating cow video + its scrim */
    document.querySelectorAll('.story-bg-video, .story-bg-scrim').forEach(function (el) {
      el.remove();
    });
    document.querySelectorAll('section.story.story-has-video').forEach(function (s) {
      s.classList.remove('story-has-video');
    });

    /* Persist the "story video OFF" choice through the redesign controller so
       it does not re-mount on the next tick / reload. */
    try {
      if (window.hhRedesign && typeof window.hhRedesign.set === 'function') {
        var st = window.hhRedesign.get ? window.hhRedesign.get() : {};
        if (st.storyVideo !== false) window.hhRedesign.set({ storyVideo: false });
      }
    } catch (e) {}
  }

  function run() {
    decorateShop();
    stripCowVideos();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  /* Re-assert after other scripts settle (they boot on load / +400ms). */
  window.addEventListener('load', function () {
    run();
    setTimeout(run, 250);
    setTimeout(stripCowVideos, 700);
  });

  /* Brief watcher: if anything re-injects a cow backdrop, pull it again. */
  try {
    var t;
    var mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var added = muts[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var n = added[j];
          if (n.nodeType !== 1) continue;
          if (
            (n.classList && (n.classList.contains('hh-cowbg') ||
                             n.classList.contains('story-bg-video') ||
                             n.classList.contains('story-bg-scrim'))) ||
            (n.querySelector && n.querySelector('.hh-cowbg, .story-bg-video'))
          ) {
            clearTimeout(t);
            t = setTimeout(stripCowVideos, 60);
            return;
          }
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    setTimeout(function () { try { mo.disconnect(); } catch (e) {} }, 8000);
  } catch (e) {}
})();
