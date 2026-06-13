/* ===========================================================================
   hh-cattle.js — cattle modal, cart & USSD checkout for index.html (ADDITIVE)
   ---------------------------------------------------------------------------
     • Cattle listings are displayed ONLY in the "Featured Offers of the
       Month" slideshow (hh-featured-slideshow.js) — the old "Cattle for
       Sale" grid in #cattle has been removed.
     • "View Details" opens an auction-style modal (Ear Tag, DOB, REG NO,
       horn measurements LL/RL/LB/RB/SCI/TT, Sire & Dam, vaccinations and a
       scrollable long description) — modelled on ankole.co.za/auctions.
     • "Add to Cart" → a dedicated cattle cart drawer (separate from the
       existing product cart in app.js, which is left completely untouched).
     • Checkout → USSD payment prompt (simulated; integration notes inline).

   Data comes from HHApi (Worker/KV when deployed, localStorage in preview),
   so anything added in the Sales Dashboard appears here automatically.
   =========================================================================== */
(function () {
  'use strict';

  if (!window.HHApi) { console.warn('[hh-cattle] HHApi not loaded'); return; }

  /* === CONFIG ============================================================ */
  var CURRENCY = 'UGX';          /* site currency */
  var USSD_CODE = '*123*456#';   /* ← change to your real USSD string */
  var CART_KEY = 'hhCattleCart'; /* NEW key — separate from product cart */

  /* === Default seed listings (only used if the store is empty) =========== */
  var SEED = [
    {
      name: 'Rwabugiri', tag: 'Champion Bull', badge: 'Available',
      summary: 'Proven champion sire with exceptional long-horn genetics. Documented pedigree and full health records.',
      price: 12000000, image: 'assets/pure-ankole-bull.jpg',
      earTag: 'HH-0142', dob: '2021-03-14', regNo: 'ANK-UG-2021-0142',
      horns: { LL: '118', RL: '116', LB: '46', RB: '45', SCI: '129.5', TT: '232' },
      sire: 'Mukama', dam: 'Amahoro',
      vaccinations: ['FMD', 'Brucellosis', 'Lumpy Skin', 'Anthrax'],
      description: 'Rwabugiri is the cornerstone of our breeding programme. Crowned champion at the 2024 regional show, he carries the deep mahogany coat and sweeping symmetrical horns prized in the Ankole tradition.\n\nHe has sired more than 30 calves on the ranch, all with excellent conformation and temperament. Vet-checked quarterly, fertility-tested, and free-grazed on natural pasture. Pedigree certificate, full vaccination history and a transport plan accompany every sale.'
    },
    {
      name: 'Amahoro', tag: 'Breeding Cow', badge: 'Available',
      summary: 'Award-winning cow with a calm temperament and a strong calving record. Excellent dam line.',
      price: 8500000, image: 'assets/ankole-heifer.jpg',
      earTag: 'HH-0098', dob: '2020-08-02', regNo: 'ANK-UG-2020-0098',
      horns: { LL: '104', RL: '103', LB: '40', RB: '40', SCI: '112.0', TT: '208' },
      sire: 'Kato', dam: 'Nyabingi',
      vaccinations: ['FMD', 'Brucellosis', 'Lumpy Skin'],
      description: 'Amahoro ("peace") lives up to her name — gentle, easy to handle, and a reliable mother. She has produced five healthy calves, including our rising star Kabula Star.\n\nIdeal foundation cow for a serious Ankole herd. Sold with full health records and pedigree documentation.'
    },
    {
      name: 'Mukamashyaka', tag: 'Young Bull', badge: 'Reserved',
      summary: 'Rising long-horn bull from northern Uganda. Ready for stud service with promising horn growth.',
      price: 9000000, image: 'assets/ankole-longhorn.jpg',
      earTag: 'HH-0177', dob: '2022-01-20', regNo: 'ANK-UG-2022-0177',
      horns: { LL: '96', RL: '95', LB: '38', RB: '37', SCI: '104.0', TT: '191' },
      sire: 'Rwabugiri', dam: 'Kabarungi',
      vaccinations: ['FMD', 'Brucellosis', 'Anthrax'],
      description: 'Mukamashyaka shows outstanding promise — already displaying the wide, balanced horn base that defines a future champion. Sired by our own Rwabugiri.\n\nCurrently reserved pending inspection. Contact us to join the waiting list for his next progeny.'
    },
    {
      name: 'Kabula Star', tag: 'Heifer', badge: 'Available',
      summary: 'Young heifer with championship bloodlines. Excellent conformation, ready for breeding in 2027.',
      price: 4500000, image: 'assets/ankole-calf.jpg',
      earTag: 'HH-0203', dob: '2024-02-11', regNo: 'ANK-UG-2024-0203',
      horns: { LL: '52', RL: '51', LB: '24', RB: '24', SCI: '58.0', TT: '104' },
      sire: 'Rwabugiri', dam: 'Amahoro',
      vaccinations: ['FMD', 'Lumpy Skin'],
      description: 'Kabula Star unites our two finest lines — Rwabugiri and Amahoro. Even at this age her frame and horn set are exceptional.\n\nA rare opportunity to secure championship genetics early. Will be ready for breeding in 2027; reserve now with documented lineage.'
    }
  ];

  /* === Helpers =========================================================== */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtMoney(n) {
    if (n == null || isNaN(n)) return '';
    return CURRENCY + ' ' + Math.round(n).toLocaleString('en-US');
  }
  function el(html) {
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function readCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { return []; }
  }
  function writeCart(a) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(a)); } catch (e) {}
  }

  var cattle = [];
  var cart = readCart();

  /* === DOM scaffold ====================================================== */
  /* NOTE: the old "Cattle for Sale / Available from the kraal" listings grid
     has been REMOVED from index.html. The "Featured Offers of the Month"
     slideshow (hh-featured-slideshow.js) is now the ONLY place on the
     homepage where dashboard-managed cattle appear. This module still
     provides the shared pieces the slideshow relies on: the detail modal
     (window.HHCattleUI.openDetail), the cattle cart drawer + floating cart
     button, and the USSD checkout. */

  /* floating cart button */
  var fab = el(
    '<button class="hhc-cartfab" type="button" aria-label="View cattle cart">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.4"></circle><circle cx="18" cy="20" r="1.4"></circle><path d="M2 3h2l2.5 12.5a2 2 0 0 0 2 1.5h8a2 2 0 0 0 2-1.5L21 7H5.5"></path></svg>' +
      '<span>Cattle cart</span><span class="hhc-fab-count">0</span>' +
    '</button>');
  document.body.appendChild(fab);

  /* === Detail modal ====================================================== */
  var detailOverlay = el(
    '<div class="hhc-overlay" id="hhc-detail" role="dialog" aria-modal="true" aria-label="Cattle details">' +
      '<div class="hhc-modal">' +
        '<div class="hhc-modal-media"><img alt="" /><button class="hhc-modal-close" type="button" aria-label="Close">✕</button></div>' +
        '<div class="hhc-modal-info">' +
          '<div class="hhc-modal-scroll"></div>' +
          '<div class="hhc-modal-foot">' +
            '<div class="hhc-foot-price"><small>Price</small><strong></strong></div>' +
            '<button class="hhc-btn hhc-btn-primary hhc-modal-add" type="button">Add to cart</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>');
  document.body.appendChild(detailOverlay);
  var dImg = detailOverlay.querySelector('img');
  var dScroll = detailOverlay.querySelector('.hhc-modal-scroll');
  var dPrice = detailOverlay.querySelector('.hhc-foot-price strong');
  var dAdd = detailOverlay.querySelector('.hhc-modal-add');
  var detailId = null;

  function hornTable(h) {
    h = h || {};
    var cols = [['LL', 'Left length'], ['RL', 'Right length'], ['LB', 'Left base'],
                ['RB', 'Right base'], ['SCI', 'SCI score'], ['TT', 'Tip to tip']];
    var any = cols.some(function (c) { return h[c[0]]; });
    if (!any) return '';
    return '<div class="hhc-spec-title">Horn measurements (cm)</div>' +
      '<table class="hhc-horn-table"><thead><tr>' +
      cols.map(function (c) { return '<th>' + c[0] + '</th>'; }).join('') +
      '</tr></thead><tbody><tr>' +
      cols.map(function (c) {
        return '<td>' + esc(h[c[0]] || '—') + '<small>' + c[1] + '</small></td>';
      }).join('') + '</tr></tbody></table>';
  }

  function openDetail(c) {
    detailId = c.id;
    if (c.image) { dImg.src = c.image; dImg.style.display = ''; dImg.alt = c.name; }
    else { dImg.removeAttribute('src'); dImg.style.display = 'none'; }
    dPrice.textContent = fmtMoney(c.price);

    var specs = [
      ['Name', c.name], ['Age', c.age], ['Horn span', c.hornSpan],
      ['Ear tag', c.earTag], ['Date of birth', c.dob], ['Reg no.', c.regNo]
    ].filter(function (s) { return s[1]; });
    /* keep the old "Registration" heading for records without the new fields */
    var specTitle = (c.age || c.hornSpan) ? 'Key details' : 'Registration';

    var vax = (Array.isArray(c.vaccinations) ? c.vaccinations
      : String(c.vaccinations || '').split(',')).map(function (v) { return String(v).trim(); })
      .filter(Boolean);

    var descHtml = String(c.description || c.summary || '')
      .split(/\n{2,}/).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');

    dScroll.innerHTML =
      (c.tag ? '<span class="hhc-modal-tag">' + esc(c.tag) + '</span>' : '') +
      '<h2 class="hhc-modal-name">' + esc(c.name) + '</h2>' +
      '<div class="hhc-modal-price">' + esc(fmtMoney(c.price)) + '</div>' +
      '<div class="hhc-spec-title">' + specTitle + '</div>' +
      '<div class="hhc-spec-grid">' + specs.map(function (s) {
        return '<dl class="hhc-spec"><dt>' + esc(s[0]) + '</dt><dd>' + esc(s[1]) + '</dd></dl>';
      }).join('') + '</div>' +
      hornTable(c.horns) +
      ((c.sire || c.dam) ? '<div class="hhc-spec-title">Lineage</div><div class="hhc-lineage">' +
        '<div class="hhc-line"><span>Sire</span><strong>' + esc(c.sire || '—') + '</strong></div>' +
        '<div class="hhc-line"><span>Dam</span><strong>' + esc(c.dam || '—') + '</strong></div>' +
        '</div>' : '') +
      (vax.length ? '<div class="hhc-spec-title">Vaccinations &amp; health</div><div class="hhc-vax">' +
        vax.map(function (v) { return '<span class="hhc-pill">' + esc(v) + '</span>'; }).join('') + '</div>' : '') +
      '<div class="hhc-spec-title">Description</div><div class="hhc-desc">' + descHtml + '</div>';

    var sold = (c.badge || '').toLowerCase() === 'sold';
    dAdd.disabled = sold;
    dAdd.textContent = sold ? 'Sold' : 'Add to cart';
    dScroll.scrollTop = 0;
    openOverlay(detailOverlay);
  }
  dAdd.addEventListener('click', function () {
    if (detailId) { addToCart(detailId); closeOverlay(detailOverlay); }
  });

  /* === Cart drawer ======================================================= */
  var cartOverlay = el(
    '<div class="hhc-overlay hhc-cart-overlay" id="hhc-cart" role="dialog" aria-modal="true" aria-label="Cattle cart">' +
      '<aside class="hhc-cart">' +
        '<div class="hhc-cart-head"><h3>Your cattle</h3><button class="hhc-cart-close" type="button" aria-label="Close">✕</button></div>' +
        '<div class="hhc-cart-items"></div>' +
        '<div class="hhc-cart-foot">' +
          '<div class="hhc-cart-total"><span>Total</span><strong>0</strong></div>' +
          '<button class="hhc-btn hhc-btn-primary hhc-btn-block hhc-checkout" type="button">Checkout — pay by USSD</button>' +
        '</div>' +
      '</aside>' +
    '</div>');
  document.body.appendChild(cartOverlay);
  var cartItemsEl = cartOverlay.querySelector('.hhc-cart-items');
  var cartTotalEl = cartOverlay.querySelector('.hhc-cart-total strong');
  var checkoutBtn = cartOverlay.querySelector('.hhc-checkout');

  function cartTotal() {
    return cart.reduce(function (s, it) { return s + (Number(it.price) || 0); }, 0);
  }
  function renderCart() {
    fab.querySelector('.hhc-fab-count').textContent = cart.length;
    fab.classList.toggle('is-show', cart.length > 0);
    cartTotalEl.textContent = fmtMoney(cartTotal());
    checkoutBtn.disabled = cart.length === 0;
    if (!cart.length) {
      cartItemsEl.innerHTML = '<div class="hhc-cart-empty">Your cattle cart is empty.<br>Browse the listings and add an animal.</div>';
      return;
    }
    cartItemsEl.innerHTML = cart.map(function (it) {
      var media = it.image ? '<img src="' + esc(it.image) + '" alt="" />' : '<div class="placeholder-img"></div>';
      return '<div class="hhc-cart-row" data-id="' + esc(it.id) + '">' + media +
        '<div class="hhc-ci-body"><div class="hhc-ci-name">' + esc(it.name) + '</div>' +
        (it.earTag ? '<div class="hhc-ci-tag">Ear tag ' + esc(it.earTag) + '</div>' : '') +
        '<div class="hhc-ci-price">' + esc(fmtMoney(it.price)) + '</div></div>' +
        '<button class="hhc-ci-remove" type="button" data-id="' + esc(it.id) + '">Remove</button></div>';
    }).join('');
  }
  function addToCart(id) {
    if (cart.some(function (x) { return x.id === id; })) { openOverlay(cartOverlay); return; }
    var c = cattle.filter(function (x) { return x.id === id; })[0];
    if (!c) return;
    cart.push({ id: c.id, name: c.name, price: Number(c.price) || 0, earTag: c.earTag, image: c.image });
    writeCart(cart);
    renderCart();
    fab.classList.add('is-show');
    /* tiny pulse on the FAB */
    fab.animate && fab.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }],
      { duration: 320, easing: 'ease-out' });
  }
  function removeFromCart(id) {
    cart = cart.filter(function (x) { return x.id !== id; });
    writeCart(cart);
    renderCart();
  }
  cartItemsEl.addEventListener('click', function (e) {
    var rm = e.target.closest('.hhc-ci-remove');
    if (rm) removeFromCart(rm.getAttribute('data-id'));
  });

  /* === USSD payment modal (SIMULATED) ====================================
     To wire a REAL USSD / mobile-money flow later, replace the body of
     startUssd() with a call to your aggregator's API (e.g. push an STK/USSD
     prompt to the buyer's MSISDN) and poll your /api/payments/:ref endpoint
     from the Verify button. The UI below is intentionally decoupled. */
  var ussdOverlay = el(
    '<div class="hhc-overlay" id="hhc-ussd" role="dialog" aria-modal="true" aria-label="USSD payment">' +
      '<div class="hhc-ussd">' +
        '<div class="hhc-ussd-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"></rect><path d="M12 18h.01"></path></svg></div>' +
        '<h3>Pay by USSD</h3>' +
        '<p>Dial the code below on your phone and enter the amount to pay merchant <b>+256764250125</b>. After paying, tap <b>Verify</b> to confirm your order.</p>' +
        '<div class="hhc-ussd-code"></div>' +
        '<div class="hhc-ussd-amt">Amount due: <strong></strong></div>' +
        '<div class="hhc-ussd-actions">' +
          '<button class="hhc-btn hhc-btn-ghost hhc-btn-block hhc-ussd-cancel" type="button">Cancel</button>' +
          '<button class="hhc-btn hhc-btn-primary hhc-btn-block hhc-ussd-verify" type="button">Verify payment</button>' +
        '</div>' +
        '<div class="hhc-ussd-state" aria-live="polite"></div>' +
      '</div>' +
    '</div>');
  document.body.appendChild(ussdOverlay);
  var ussdCode = ussdOverlay.querySelector('.hhc-ussd-code');
  var ussdAmt = ussdOverlay.querySelector('.hhc-ussd-amt strong');
  var ussdState = ussdOverlay.querySelector('.hhc-ussd-state');
  var ussdVerify = ussdOverlay.querySelector('.hhc-ussd-verify');

  function startUssd() {
    var total = cartTotal();
    /* Build a session-specific USSD string: *123*456*<amount>#  */
    ussdCode.textContent = USSD_CODE.replace('#', '*' + Math.round(total) + '#');
    ussdAmt.textContent = fmtMoney(total);
    ussdState.textContent = '';
    ussdState.className = 'hhc-ussd-state';
    ussdVerify.disabled = false;
    ussdVerify.textContent = 'Verify payment';
    openOverlay(ussdOverlay);
  }
  ussdVerify.addEventListener('click', function () {
    /* SIMULATED verification. Replace with a real status check. */
    ussdVerify.disabled = true;
    ussdState.className = 'hhc-ussd-state is-wait';
    ussdState.textContent = 'Checking for your payment…';
    setTimeout(function () {
      ussdState.className = 'hhc-ussd-state is-ok';
      ussdState.textContent = '✓ Payment received. We’ll be in touch to arrange collection & transport.';

      /* =====================================================================
         PAYMENT-SUCCESS HOOK — REAL PAYMENT GATEWAY INTEGRATION POINT
         ---------------------------------------------------------------------
         Everything inside this block must run ONLY after the payment is
         CONFIRMED. When you wire a real USSD / MTN MoMo aggregator, move this
         block into the success callback of your payment-status check (e.g.
         after GET /api/payments/:ref returns status === 'paid').

         Each purchased animal is removed from the catalogue with
         DELETE /api/cattle/:id (HHApi.deleteCattle → Worker → KV; falls back
         to localStorage in preview). HHApi then fires its 'cattle' change
         event, so the "Featured Offers of the Month" slideshow re-fetches and
         drops the sold slide(s) WITHOUT a page reload.

         If the buyer cancels (Cancel button / Esc / backdrop click), this
         code never runs — nothing is removed.
         ===================================================================== */
      cart.forEach(function (it) {
        HHApi.deleteCattle(it.id);   /* DELETE /api/cattle/:id — one per item */
      });

      /* clear the cart on success */
      cart = []; writeCart(cart); renderCart();
      ussdVerify.textContent = 'Done';
      setTimeout(function () { closeOverlay(ussdOverlay); }, 2200);
    }, 1600);
  });
  ussdOverlay.querySelector('.hhc-ussd-cancel').addEventListener('click', function () { closeOverlay(ussdOverlay); });
  checkoutBtn.addEventListener('click', function () {
    if (!cart.length) return;
    closeOverlay(cartOverlay);
    setTimeout(startUssd, 260);
  });

  /* === Overlay open/close plumbing ======================================= */
  var openStack = [];
  function openOverlay(ov) {
    ov.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    openStack.push(ov);
  }
  function closeOverlay(ov) {
    ov.classList.remove('is-open');
    openStack = openStack.filter(function (x) { return x !== ov; });
    if (!openStack.length) document.body.style.overflow = '';
  }
  [detailOverlay, cartOverlay, ussdOverlay].forEach(function (ov) {
    ov.addEventListener('click', function (e) {
      if (e.target === ov) closeOverlay(ov);
      var c = e.target.closest('.hhc-modal-close, .hhc-cart-close');
      if (c) closeOverlay(ov);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && openStack.length) closeOverlay(openStack[openStack.length - 1]);
  });
  fab.addEventListener('click', function () { openOverlay(cartOverlay); });

  /* === Boot ============================================================== */
  function load() {
    HHApi.getCattle().then(function (arr) {
      cattle = (arr && arr.length) ? arr : [];
      /* drop cart items that no longer exist */
      var ids = {}; cattle.forEach(function (c) { ids[c.id] = 1; });
      var before = cart.length;
      cart = cart.filter(function (it) { return ids[it.id]; });
      if (cart.length !== before) writeCart(cart);
      renderCart();
    });
  }

  /* additive: let other modules (e.g. the Featured Offers slideshow) reuse
     the existing detail modal without duplicating it */
  window.HHCattleUI = { openDetail: openDetail };

  /* seed defaults once, then load (seed only writes if store is empty) */
  HHApi.seedCattle(SEED);
  load();
  renderCart();

  /* live-refresh when the dashboard changes cattle (same or other tab) */
  HHApi.onChange(function (kind) { if (kind === 'cattle') load(); });
})();
