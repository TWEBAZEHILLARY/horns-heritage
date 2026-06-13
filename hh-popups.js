/* ════════════════════════════════════════════════════════════════
   HORNS & HERITAGE — Detail popups (Shop products + Cattle listings)
   Additive: reads existing card markup, never mutates page content.
   Shop "Add to Cart" reuses the page's own injected cart button so
   all existing cart/checkout/login behaviour stays intact.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var WA_NUMBER = '256764250125';

  /* SVG icons */
  var ICO_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';
  var ICO_CART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>';
  var ICO_WA = '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16.04 3C9.4 3 4 8.4 4 15.04c0 2.12.56 4.18 1.62 6L4 29l8.18-1.58a12 12 0 0 0 3.86.64h.01c6.63 0 12.03-5.4 12.03-12.04C28.08 8.4 22.68 3 16.04 3zm0 21.9h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.22-3.75.73.75-3.65-.24-.38a9.86 9.86 0 0 1-1.51-5.27c0-5.46 4.45-9.9 9.93-9.9 2.65 0 5.14 1.04 7.01 2.91a9.83 9.83 0 0 1 2.9 7C25.96 20.46 21.5 24.9 16.04 24.9zm5.44-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35z"/></svg>';
  var ICO_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>';

  /* ----- New heritage stories + spec sheet for each cattle type ----- */
  /* (Shown ONLY inside the popup — main-page cards are untouched) */
  var CATTLE = {
    'Ankole Longhorn': {
      story: 'Descended from the royal Bahima herds that crossed the Kagera generations ago, the long-horned Ankole was once a king\u2019s living treasury \u2014 counted at first light and praised by name around the kraal fire.',
      age: '4\u20136 years', tag: '#AK-202'
    },
    'Ankole Cross': {
      story: 'Where heritage meets the modern dairy \u2014 the steady Ankole frame carried into richer milk lines, yet raised on the very same open Kabula pasture its ancestors grazed.',
      age: '3\u20135 years', tag: '#AC-118'
    },
    'Pure Ankole Bull': {
      story: 'A proven sire whose bloodline neighbouring herders borrow to refresh their own. He is the unbroken spine of the Ankole line \u2014 horns spread wide as a herder\u2019s open arms.',
      age: '5\u20137 years', tag: '#AB-340'
    },
    'Ankole Heifer': {
      story: 'Raised from a calf on savanna grass, she carries the next generation of the herd \u2014 chosen young for the gentle temperament and deep lineage the Bahima have always prized.',
      age: '2\u20133 years', tag: '#AH-076'
    },
    'Ankole Bull Calf': {
      story: 'Weaned beneath the acacia and already ear-tagged for his kraal, this young bull is the herd\u2019s tomorrow \u2014 strong-legged, bright-eyed, and born to the long horns.',
      age: '6\u201310 months', tag: '#AK-512'
    },
    'Ankole Heifer Calf': {
      story: 'A future mother of the line, pasture-raised since her very first morning. Her documented lineage marks her early for the breeding herds that keep Ankole blood pure.',
      age: '6\u201310 months', tag: '#AH-518'
    }
  };
  /* Consistent health / permit info across all listings */
  var HEALTH = { fmd: 'Current', tick: 'Treated monthly', permit: 'Available upon request' };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- Shared overlay shell ---------- */
  var overlay = document.createElement('div');
  overlay.className = 'hh-modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);

  var lastFocus = null;

  function openOverlay(html) {
    overlay.innerHTML = html;
    overlay.setAttribute('aria-hidden', 'false');
    lastFocus = document.activeElement;
    // force reflow so the transition runs
    void overlay.offsetWidth;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    var x = overlay.querySelector('.hh-modal-close');
    if (x) x.focus();
  }
  function closeOverlay() {
    if (!overlay.classList.contains('open')) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(function () {
      if (!overlay.classList.contains('open')) overlay.innerHTML = '';
    }, 320);
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeOverlay();
    if (e.target.closest('.hh-modal-close')) closeOverlay();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeOverlay();
  });

  /* ════════════════ SHOP PRODUCT POPUP ════════════════ */
  function openProduct(card) {
    var titleEl = card.querySelector('.product-body h3');
    var priceEl = card.querySelector('.price');
    var descEl = card.querySelector('.desc');
    var imgEl = card.querySelector('.product-photo');
    var tagEl = card.querySelector('.tag');
    if (!titleEl) return;

    var name = titleEl.textContent.trim();
    var priceHTML = priceEl ? priceEl.innerHTML : '';
    var desc = descEl ? descEl.textContent.trim() : '';
    var imgSrc = imgEl ? imgEl.getAttribute('src') : '';
    var tag = tagEl ? tagEl.textContent.trim() : 'Horns & Heritage';
    var canBuy = !!card.querySelector('.add-to-cart');

    var buyRow = canBuy
      ? '<div class="hh-modal-buy">' +
          '<div class="hh-qty" role="group" aria-label="Quantity">' +
            '<button type="button" class="hh-qty-dec" aria-label="Decrease quantity">\u2212</button>' +
            '<span class="hh-qty-val" aria-live="polite">1</span>' +
            '<button type="button" class="hh-qty-inc" aria-label="Increase quantity">+</button>' +
          '</div>' +
          '<button type="button" class="hh-modal-add">' + ICO_CART + '<span>Add to Cart</span></button>' +
        '</div>' +
        '<div class="hh-modal-note">Adds to your basket \u2014 review &amp; check out from the cart at any time.</div>'
      : '';

    var html =
      '<div class="hh-modal">' +
        '<button type="button" class="hh-modal-close" aria-label="Close">' + ICO_CLOSE + '</button>' +
        '<div class="hh-modal-media">' +
          (imgSrc ? '<img src="' + esc(imgSrc) + '" alt="' + esc(name) + '">' : '') +
          '<span class="hh-media-tag">' + esc(tag) + '</span>' +
        '</div>' +
        '<div class="hh-modal-body">' +
          '<div class="hh-modal-eyebrow">The Shop \u00b7 Horns &amp; Heritage</div>' +
          '<h2 class="hh-modal-title">' + esc(name) + '</h2>' +
          (desc ? '<p class="hh-modal-desc">' + esc(desc) + '</p>' : '') +
          (priceHTML ? '<div class="hh-modal-price">' + priceHTML + '</div>' : '') +
          buyRow +
        '</div>' +
      '</div>';

    openOverlay(html);

    if (!canBuy) return;
    var qty = 1;
    var valEl = overlay.querySelector('.hh-qty-val');
    var decEl = overlay.querySelector('.hh-qty-dec');
    var incEl = overlay.querySelector('.hh-qty-inc');
    var addEl = overlay.querySelector('.hh-modal-add');
    function sync() { valEl.textContent = qty; decEl.disabled = qty <= 1; }
    sync();
    decEl.addEventListener('click', function () { if (qty > 1) { qty--; sync(); } });
    incEl.addEventListener('click', function () { if (qty < 99) { qty++; sync(); } });

    addEl.addEventListener('click', function () {
      // Reuse the card's own injected Add-to-Cart button => existing cart logic
      var realBtn = card.querySelector('.add-to-cart');
      if (realBtn) { for (var i = 0; i < qty; i++) realBtn.click(); }
      addEl.classList.add('added');
      addEl.querySelector('span').textContent = 'Added \u2713';
      setTimeout(function () {
        closeOverlay();
        var cb = document.getElementById('cartBtn');
        if (cb) cb.click(); // surface the cart sidebar
      }, 650);
    });
  }

  /* ════════════════ CATTLE LISTING POPUP ════════════════ */
  function openCattle(card) {
    var titleEl = card.querySelector('.product-body h3');
    var priceEl = card.querySelector('.price');
    var descEl = card.querySelector('.desc');
    var imgEl = card.querySelector('.product-photo');
    var tagEl = card.querySelector('.tag');
    if (!titleEl) return;

    var name = titleEl.textContent.trim();
    var data = CATTLE[name] || {
      story: 'Pure heritage Ankole stock, raised the slow way on the open plains of Kabula and sold with a transparent, honest record.',
      age: '4\u20136 years', tag: '#AK-200'
    };
    var priceHTML = priceEl ? priceEl.innerHTML : '';
    var imgSrc = imgEl ? imgEl.getAttribute('src') : '';
    var tag = tagEl ? tagEl.textContent.trim() : 'Cattle \u00b7 Ente';

    var waMsg = 'Hi, I am interested in ' + name + '. Please send more details and negotiation options.';
    var waURL = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(waMsg);

    var html =
      '<div class="hh-modal">' +
        '<button type="button" class="hh-modal-close" aria-label="Close">' + ICO_CLOSE + '</button>' +
        '<div class="hh-modal-media">' +
          (imgSrc ? '<img src="' + esc(imgSrc) + '" alt="' + esc(name) + '">' : '') +
          '<span class="hh-media-tag">' + esc(tag) + '</span>' +
        '</div>' +
        '<div class="hh-modal-body">' +
          '<div class="hh-modal-eyebrow">Buy &amp; Sell Cattle</div>' +
          '<h2 class="hh-modal-title">' + esc(name) + '</h2>' +
          (priceHTML ? '<div class="hh-modal-price" style="border:none;padding-top:8px;margin-top:8px;">' + priceHTML + '</div>' : '') +
          '<p class="hh-story">' + esc(data.story) + '</p>' +
          '<div class="hh-specs">' +
            '<div class="hh-spec"><span class="hh-spec-label">Age</span><span class="hh-spec-val">' + esc(data.age) + '</span></div>' +
            '<div class="hh-spec"><span class="hh-spec-label">FMD vaccination</span><span class="hh-spec-val ok">' + esc(HEALTH.fmd) + '</span></div>' +
            '<div class="hh-spec"><span class="hh-spec-label">Tick &amp; tsetse treatment</span><span class="hh-spec-val ok">' + esc(HEALTH.tick) + '</span></div>' +
            '<div class="hh-spec"><span class="hh-spec-label">Lineage notes &amp; ear tag</span><span class="hh-spec-val">Documented \u00b7 ' + esc(data.tag) + '</span></div>' +
            '<div class="hh-spec"><span class="hh-spec-label">Movement permit \u00b7 district vet</span><span class="hh-spec-val">' + esc(HEALTH.permit) + '</span></div>' +
          '</div>' +
          '<a class="hh-wa" href="' + esc(waURL) + '" target="_blank" rel="noopener">' + ICO_WA + 'Discuss on WhatsApp</a>' +
        '</div>' +
      '</div>';

    openOverlay(html);
  }

  /* ════════════════ Wire up cards ════════════════ */
  function shouldIgnore(e) {
    // Don't hijack the existing in-card controls / links
    return !!(e.target.closest('a') || e.target.closest('button') ||
              e.target.closest('select') || e.target.closest('.unit-pick'));
  }

  function wire() {
    var shop = document.getElementById('shop');
    if (shop) {
      shop.querySelectorAll('.product-card').forEach(function (card) {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.addEventListener('click', function (e) {
          if (shouldIgnore(e)) return;
          openProduct(card);
        });
        card.addEventListener('keydown', function (e) {
          if ((e.key === 'Enter' || e.key === ' ') && !shouldIgnore(e)) { e.preventDefault(); openProduct(card); }
        });
      });
    }

    var cattle = document.getElementById('cattle');
    if (cattle) {
      cattle.querySelectorAll('.product-card').forEach(function (card) {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.addEventListener('click', function (e) {
          if (shouldIgnore(e)) return;
          openCattle(card);
        });
        card.addEventListener('keydown', function (e) {
          if ((e.key === 'Enter' || e.key === ' ') && !shouldIgnore(e)) { e.preventDefault(); openCattle(card); }
        });
      });
    }
  }

  /* ════════════════ Cart row: trash icon + live count ════════════════ */
  /* The page's renderCart() rebuilds .cart-item rows on every change.
     We upgrade each row's "Remove" control to a trash icon via an
     observer, without touching the original cart logic. */
  function upgradeCartRows() {
    document.querySelectorAll('.cart-item .ci-remove:not(.is-trash)').forEach(function (btn) {
      btn.classList.add('is-trash');
      btn.setAttribute('title', 'Remove item');
      var nameEl = btn.closest('.cart-item') && btn.closest('.cart-item').querySelector('h4');
      btn.setAttribute('aria-label', 'Remove ' + (nameEl ? nameEl.textContent.trim() : 'item') + ' from cart');
      btn.innerHTML = ICO_TRASH;
    });
  }

  function init() {
    wire();
    upgradeCartRows();
    var itemsHost = document.getElementById('cartItems');
    if (itemsHost) {
      var mo = new MutationObserver(upgradeCartRows);
      mo.observe(itemsHost, { childList: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
