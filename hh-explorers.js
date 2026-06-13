/* =====================================================================
   hh-explorers.js — "Interactive 2026" feature widgets (ADDITIVE)
   ---------------------------------------------------------------------
   A) BUTCHERY — interactive meat-cut explorer (new #butchery section,
      classic butcher's-chart diagram + goat cuts, linked to the Shop)
   B) CATTLE — "Build your herd" instant quote calculator
   C) TOURS — booking modal with a real calendar (WhatsApp request)
   D) MEMBERSHIP — side-by-side plan comparison table

   SAFETY
   - All markup is injected at runtime, gated behind html[data-hhx="on"].
   - Only ONE new localStorage key is written: "hhx_booking_v1" (booking
     draft). No existing key is read, modified or cleared. Cart, login,
     theme and wishlist data are untouched.
   ===================================================================== */
(function () {
  'use strict';

  var WA = '256764250125'; /* same number every existing WhatsApp link uses */
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else { fn(); }
  }
  function el(html) {
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function waLink(msg) {
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
  }
  function fmtUGX(n) { return 'UGX ' + n.toLocaleString('en-US'); }

  /* The page's own .reveal observer ran at load — injected blocks need
     their own, otherwise they'd stay at opacity 0 forever. */
  var revealIO = ('IntersectionObserver' in window)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
        });
      }, { threshold: 0.12 })
    : null;
  function watchReveals(root) {
    root.querySelectorAll('.reveal').forEach(function (r) {
      if (revealIO) revealIO.observe(r); else r.classList.add('in');
    });
    if (root.classList && root.classList.contains('reveal')) {
      if (revealIO) revealIO.observe(root); else root.classList.add('in');
    }
  }
  function flashAndScroll(target) {
    if (!target) return;
    var y = target.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
    target.classList.remove('hhx-flash');
    void target.offsetWidth;
    target.classList.add('hhx-flash');
  }

  /* ==================================================================
     A) BUTCHERY — interactive cut explorer
     ================================================================== */
  var CUTS = {
    chuck: {
      label: 'Neck & Chuck', sub: 'Slow & hearty',
      desc: 'Hard-working muscle with deep flavour. Cube it for long-simmered stews — it turns silky after two hours over a gentle fire.',
      tips: ['SIMMER LOW', 'CUBE FOR STEW'],
      price: 'Ask for today\u2019s price', unit: '',
      shop: null
    },
    ribs: {
      label: 'Ribs', sub: 'Embavu',
      desc: 'Heritage rib racks, ideal for fire-pit roasting. Build a hot bed of charcoal, let the flames die down, then roast slowly.',
      tips: ['CHARCOAL', 'SLOW ROAST'],
      price: 'UGX 20,000', unit: '/ kg',
      shop: 'Beef Short Ribs'
    },
    loin: {
      label: 'Loin · Ribeye & Sirloin', sub: 'Enyama Ennungi',
      desc: 'The most prized cuts on the beast — marbled, knife-tender. Sear hot and fast, three minutes a side, then let it rest.',
      tips: ['HIGH HEAT', 'REST 5 MIN'],
      price: 'UGX 20,000', unit: '/ kg',
      shop: 'Dry-Aged Ribeye'
    },
    rump: {
      label: 'Rump & Round', sub: 'Lean roasts',
      desc: 'Lean and full of character. Roast whole and slice thin against the grain, or cut into strips for a fast pan-fry.',
      tips: ['ROAST', 'SLICE THIN'],
      price: 'Ask for today\u2019s price', unit: '',
      shop: null
    },
    brisket: {
      label: 'Brisket & Flank', sub: 'Low & slow',
      desc: 'The patient cook\u2019s reward. Hours over low embers with an eshabwe baste turn brisket into something worth a celebration.',
      tips: ['LOW & SLOW', 'BASTE'],
      price: 'Ask for today\u2019s price', unit: '',
      shop: null
    },
    shank: {
      label: 'Shank & Mulokonyi', sub: 'Amagufa',
      desc: 'Knuckle, shin and marrow bones — the foundation of the Ankole bone-broth tradition. Simmer four hours with herbs.',
      tips: ['SIMMER 4HR', 'ADD HERBS'],
      price: 'UGX 16,000', unit: '/ kg',
      shop: 'Mulokonyi Soup Bones'
    },
    /* goat cuts (chips below the chart) */
    gshoulder: {
      label: 'Goat Shoulder', sub: 'Akasundi', goat: true,
      desc: 'Tender and well-marbled. Slow-braise with millet and herbs, or cube and grill over charcoal.',
      tips: ['BRAISE', 'OR GRILL'],
      price: 'Ask for today\u2019s price', unit: '', shop: null
    },
    gribs: {
      label: 'Goat Ribs', sub: 'Embavu z\u2019Embuzi', goat: true,
      desc: 'Fall-off-the-bone tender with a simple salt rub. The first thing to vanish at every bonfire night.',
      tips: ['CHARCOAL', 'SALT RUB'],
      price: 'Ask for today\u2019s price', unit: '', shop: null
    },
    gleg: {
      label: 'Goat Leg (bone-in)', sub: 'Okugulu', goat: true,
      desc: 'The showpiece cut. Slow-roast four hours with garlic and an eshabwe baste until it falls apart.',
      tips: ['ROAST 4HR', 'BASTE'],
      price: 'Ask for today\u2019s price', unit: '', shop: null
    },
    gliver: {
      label: 'Goat Liver & Offal', sub: 'Ebibumba', goat: true,
      desc: 'Iron-rich and traditional. Pan-sear quickly with onion and tomato, or skewer over the fire.',
      tips: ['QUICK SEAR', 'SKEWER'],
      price: 'Ask for today\u2019s price', unit: '', shop: null
    }
  };

  /* Stylised side-profile chart — the classic butcher's diagram idiom. */
  function cowSVG() {
    return '' +
    '<svg class="hhx-cow-svg" viewBox="0 0 760 420" role="group" aria-label="Beef cuts diagram">' +
      /* horn — the Ankole signature */
      '<path class="hhx-cow-extra" d="M125 156 C 78 118, 86 38, 158 26 C 126 60, 130 110, 148 150 Z"></path>' +
      /* ear */
      '<path class="hhx-cow-extra" d="M150 158 L 178 142 L 168 168 Z"></path>' +
      /* head */
      '<path class="hhx-cow-extra" d="M150 162 C 118 152, 94 162, 79 186 C 64 208, 60 232, 76 247 C 92 262, 118 259, 132 246 L 152 234 Z"></path>' +
      /* tail */
      '<path class="hhx-cow-extra" d="M646 168 C 664 178, 666 250, 658 308 L 648 308 C 652 252, 648 200, 640 178 Z"></path>' +

      regionG('chuck',  'M152 164 L 252 140 L 252 256 L 152 242 Z',                                  200, 205, 'Neck & Chuck') +
      regionG('ribs',   'M252 140 L 380 136 L 380 256 L 252 256 Z',                                  316, 205, 'Ribs') +
      regionG('loin',   'M380 136 L 502 136 L 502 256 L 380 256 Z',                                  441, 205, 'Loin') +
      regionG('rump',   'M502 136 L 562 136 Q 640 142 642 202 L 642 256 L 502 256 Z',                570, 205, 'Rump & Round') +
      regionG('brisket','M154 244 L 642 258 L 638 294 Q 420 312 240 302 L 168 284 Z',                398, 285, 'Brisket & Flank') +
      regionG('shank',  'M196 298 h 36 v 84 h -36 Z M 556 298 h 36 v 84 h -36 Z',                    394, 360, 'Shank · Mulokonyi') +
    '</svg>';
  }
  function regionG(id, d, lx, ly, label) {
    return '<g class="hhx-region-group" data-cut="' + id + '" tabindex="0" role="button" aria-label="' + esc(label) + '">' +
      '<path class="hhx-cut-region" d="' + d + '"></path>' +
      '<text class="hhx-cut-label" x="' + lx + '" y="' + ly + '">' + esc(label) + '</text>' +
      '</g>';
  }

  function initButchery() {
    var shop = document.getElementById('shop');
    if (!shop || document.getElementById('butchery')) return;

    var section = el(
      '<section class="section" id="butchery" style="background: var(--bg-secondary);" data-screen-label="Butchery">' +
      '<div class="container">' +
        '<div class="section-head reveal">' +
          '<div>' +
            '<span class="eyebrow" style="background:rgba(74,124,94,.12); color:var(--terracotta);">The Butchery</span>' +
            '<h2 style="margin-top:14px">Know your cut. Cook it the Ankole way.</h2>' +
          '</div>' +
          '<p>Tap any part of the chart — every cut comes with its Runyankole name, a cooking tip from our butcher, and a straight price.</p>' +
        '</div>' +
        '<div class="hhx-butchery-grid reveal">' +
          '<div class="hhx-cutboard">' +
            '<span class="hhx-cutboard-hint">Tap a cut to explore · Beef</span>' +
            cowSVG() +
            '<div class="hhx-goat-chips">' +
              '<span class="hhx-goat-chips-title">Goat · Enyama y\u2019Embuzi</span>' +
              '<button type="button" class="hhx-chip" data-cut="gshoulder">Shoulder</button>' +
              '<button type="button" class="hhx-chip" data-cut="gribs">Ribs</button>' +
              '<button type="button" class="hhx-chip" data-cut="gleg">Leg</button>' +
              '<button type="button" class="hhx-chip" data-cut="gliver">Liver & Offal</button>' +
            '</div>' +
          '</div>' +
          '<div class="hhx-cutinfo" aria-live="polite"></div>' +
        '</div>' +
      '</div>' +
      '</section>');

    /* place AFTER the divider that follows the shop section */
    var divider = shop.nextElementSibling;
    var anchor = (divider && divider.classList.contains('hh-divider')) ? divider : shop;
    anchor.insertAdjacentElement('afterend', section);
    section.insertAdjacentElement('afterend',
      el('<div class="hh-divider" aria-hidden="true"><span class="hh-divider-leaf"></span></div>'));

    /* menu: add one link under the Shop dropdown */
    var shopDrop = document.querySelector('.menu .menu-item .dropdown');
    if (shopDrop && !shopDrop.querySelector('a[href="#butchery"]')) {
      shopDrop.appendChild(el('<a href="#butchery">Butchery — Meat Cuts Guide <small>Know your cut, cook it right</small></a>'));
    }

    var info = section.querySelector('.hhx-cutinfo');

    function renderCut(id) {
      var c = CUTS[id];
      if (!c) return;
      section.querySelectorAll('.hhx-region-group .hhx-cut-region').forEach(function (p) {
        p.classList.toggle('is-active', p.parentNode.getAttribute('data-cut') === id);
      });
      section.querySelectorAll('.hhx-chip').forEach(function (ch) {
        ch.classList.toggle('is-active', ch.getAttribute('data-cut') === id);
      });

      var cta;
      if (c.shop) {
        cta = '<button type="button" class="btn btn-primary hhx-cut-shop" data-shop="' + esc(c.shop) + '">View in shop \u2192</button>';
      } else {
        var msg = 'Hi! I\u2019d like to order ' + c.label + (c.goat ? ' (goat)' : ' (beef)') + '. What\u2019s today\u2019s price?';
        cta = '<a class="btn btn-primary" href="' + waLink(msg) + '" target="_blank" rel="noopener">Ask on WhatsApp \u2192</a>';
      }

      info.classList.remove('is-swap');
      void info.offsetWidth;
      info.classList.add('is-swap');
      info.innerHTML =
        '<span class="hhx-cutinfo-runy">' + esc(c.sub) + '</span>' +
        '<h3>' + esc(c.label) + '</h3>' +
        '<p>' + esc(c.desc) + '</p>' +
        '<div class="hhx-cutinfo-tips">' + c.tips.map(function (t) {
          return '<span class="hhx-tip">' + esc(t) + '</span>';
        }).join('') + '</div>' +
        '<div class="hhx-cutinfo-price">' + esc(c.price) + (c.unit ? ' <small>' + esc(c.unit) + '</small>' : '') + '</div>' +
        '<div class="hhx-cutinfo-cta">' + cta + '</div>';

      var shopBtn = info.querySelector('.hhx-cut-shop');
      if (shopBtn) {
        shopBtn.addEventListener('click', function () {
          var name = shopBtn.getAttribute('data-shop');
          var card = null;
          document.querySelectorAll('#productGrid .product-card h3').forEach(function (h) {
            if (h.textContent.trim() === name) card = h.closest('.product-card');
          });
          /* make sure the card isn't hidden by a tab: click "All products" */
          var allTab = document.querySelector('#shop-tabs .tab[data-tab="all"]');
          if (allTab && card && card.offsetParent === null) allTab.click();
          setTimeout(function () { flashAndScroll(card || document.getElementById('shop')); }, 60);
        });
      }
    }

    section.addEventListener('click', function (e) {
      var g = e.target.closest('[data-cut]');
      if (g) renderCut(g.getAttribute('data-cut'));
    });
    section.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var g = e.target.closest('.hhx-region-group[data-cut]');
      if (g) { e.preventDefault(); renderCut(g.getAttribute('data-cut')); }
    });

    renderCut('loin');
    watchReveals(section);
  }

  /* ==================================================================
     B) CATTLE — "Build your herd" instant quote calculator
     ================================================================== */
  function initCattleCalc() {
    var cattle = document.getElementById('cattle');
    if (!cattle || document.querySelector('.hhx-calc')) return;
    var container = cattle.querySelector('.container');
    if (!container) return;

    var STOCK = [
      { id: 'longhorn', name: 'Ankole Longhorn', meta: 'Full-grown bulls & cows · pure heritage', from: 5000000 },
      { id: 'bull',     name: 'Pure Ankole Bull', meta: 'Proven sire · vet-checked', from: 10000000 },
      { id: 'heifer',   name: 'Ankole Heifer', meta: 'Young, ready for breeding', from: 2000000 },
      { id: 'calf',     name: 'Ankole Bull Calf', meta: 'Weaned, ear-tagged, vet-checked', from: 1500000 }
    ];
    var qty = {};
    STOCK.forEach(function (s) { qty[s.id] = 0; });

    var widget = el(
      '<div class="hhx-calc reveal" id="cattle-calculator">' +
        '<div class="hhx-calc-head">' +
          '<span class="eyebrow" style="background:rgba(45,106,79,.12); color:var(--primary-green);">Instant estimate</span>' +
          '<h3>Build your herd</h3>' +
          '<p>Pick what you need — we\u2019ll total the starting prices and open the conversation on WhatsApp with your list ready to send.</p>' +
        '</div>' +
        '<div class="hhx-calc-rows">' +
          STOCK.map(function (s) {
            return '<div class="hhx-calc-row" data-id="' + s.id + '">' +
              '<div class="hhx-calc-name"><strong>' + esc(s.name) + '</strong><small>' + esc(s.meta) + '</small></div>' +
              '<span class="hhx-calc-unit">from ' + fmtUGX(s.from) + '</span>' +
              '<div class="hhx-stepper">' +
                '<button type="button" class="hhx-minus" aria-label="Remove one ' + esc(s.name) + '" disabled>\u2212</button>' +
                '<output aria-live="polite">0</output>' +
                '<button type="button" class="hhx-plus" aria-label="Add one ' + esc(s.name) + '">+</button>' +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
        '<div class="hhx-calc-foot">' +
          '<div class="hhx-calc-total"><small>Estimated from</small><strong id="hhxCalcTotal">UGX 0</strong></div>' +
          '<a class="btn btn-primary hhx-calc-send" target="_blank" rel="noopener" aria-disabled="true" style="opacity:.45; pointer-events:none;">Send my list on WhatsApp \u2192</a>' +
          '<p class="hhx-calc-note">Starting prices — the final figure follows the vet inspection and weighing at the kraal.</p>' +
        '</div>' +
      '</div>');

    var cards = container.querySelector('.cattle-cards');
    (cards || container).insertAdjacentElement('afterend', widget);
    if (!cards) container.appendChild(widget);

    var totalEl = widget.querySelector('#hhxCalcTotal');
    var sendBtn = widget.querySelector('.hhx-calc-send');

    function update() {
      var total = 0, lines = [];
      STOCK.forEach(function (s) {
        total += qty[s.id] * s.from;
        if (qty[s.id] > 0) lines.push(qty[s.id] + ' \u00d7 ' + s.name + ' (from ' + fmtUGX(s.from) + ')');
      });
      totalEl.textContent = fmtUGX(total);
      totalEl.classList.remove('is-bump');
      void totalEl.offsetWidth;
      totalEl.classList.add('is-bump');

      var has = total > 0;
      sendBtn.style.opacity = has ? '' : '.45';
      sendBtn.style.pointerEvents = has ? '' : 'none';
      sendBtn.setAttribute('aria-disabled', has ? 'false' : 'true');
      if (has) {
        sendBtn.href = waLink(
          'Hello Horns & Heritage! I\u2019d like a quote for:\n' +
          lines.map(function (l) { return '\u2022 ' + l; }).join('\n') +
          '\nEstimated from: ' + fmtUGX(total) +
          '\nPlease confirm availability and arrange a vet inspection.');
      } else {
        sendBtn.removeAttribute('href');
      }

      widget.querySelectorAll('.hhx-calc-row').forEach(function (row) {
        var id = row.getAttribute('data-id');
        row.querySelector('output').textContent = qty[id];
        row.querySelector('.hhx-minus').disabled = qty[id] === 0;
        row.querySelector('.hhx-plus').disabled = qty[id] >= 20;
      });
    }

    widget.addEventListener('click', function (e) {
      var row = e.target.closest('.hhx-calc-row');
      if (!row) return;
      var id = row.getAttribute('data-id');
      if (e.target.closest('.hhx-plus')) qty[id] = Math.min(20, qty[id] + 1);
      else if (e.target.closest('.hhx-minus')) qty[id] = Math.max(0, qty[id] - 1);
      else return;
      update();
    });

    update();
    totalEl.classList.remove('is-bump');
    watchReveals(widget);
  }

  /* ==================================================================
     C) TOURS — booking modal with calendar (WhatsApp request)
     ================================================================== */
  function initBooking() {
    var tours = document.getElementById('tours');
    if (!tours || document.querySelector('.hhx-bk')) return;

    var EXPS = [
      { name: 'Pasture Walk', price: 'from UGX 50,000' },
      { name: 'Bonfire & Storytelling', price: 'from UGX 90,000' },
      { name: 'Traditional Drinks Tasting', price: 'from UGX 65,000' },
      { name: 'Group Bookings', price: 'groups of 8+' }
    ];
    var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var DOWS = ['Mo','Tu','We','Th','Fr','Sa','Su'];
    var DRAFT_KEY = 'hhx_booking_v1'; /* NEW key — nothing existing is touched */

    /* trigger button under the tour grid */
    var grid = tours.querySelector('.tour-grid');
    if (grid) {
      var cta = el('<div class="hhx-tours-cta reveal"><button type="button" class="btn btn-primary" id="hhxPlanVisit">Plan your visit — pick a date \u2192</button></div>');
      grid.insertAdjacentElement('afterend', cta);
      watchReveals(cta);
    }

    var modal = el(
      '<div class="hhx-bk" role="dialog" aria-modal="true" aria-label="Book a ranch experience">' +
      '<div class="hhx-bk-card">' +
        '<button type="button" class="hhx-bk-close" aria-label="Close">\u2715</button>' +
        '<h3>Book a ranch experience</h3>' +
        '<p>Pick a date and we\u2019ll confirm availability on WhatsApp — usually within the hour.</p>' +
        '<div class="hhx-bk-grid">' +
          '<div style="display:flex; flex-direction:column; gap:18px;">' +
            '<div class="hhx-field"><label for="hhxBkExp">Experience</label><select id="hhxBkExp">' +
              EXPS.map(function (x) { return '<option>' + esc(x.name) + '</option>'; }).join('') +
            '</select></div>' +
            '<div class="hhx-field"><label for="hhxBkGuests">Guests</label>' +
              '<div class="hhx-stepper" style="align-self:flex-start;">' +
              '<button type="button" id="hhxBkGm" aria-label="Fewer guests">\u2212</button>' +
              '<output id="hhxBkGuests">2</output>' +
              '<button type="button" id="hhxBkGp" aria-label="More guests">+</button></div></div>' +
            '<div class="hhx-field"><label for="hhxBkName">Your name</label>' +
              '<input id="hhxBkName" type="text" placeholder="So we know who\u2019s coming" autocomplete="name" /></div>' +
            '<div class="hhx-bk-summary" id="hhxBkSummary"></div>' +
          '</div>' +
          '<div class="hhx-field"><label>Date</label><div class="hhx-cal" id="hhxCal"></div></div>' +
        '</div>' +
        '<div class="hhx-bk-foot">' +
          '<a class="btn btn-primary" id="hhxBkSend" target="_blank" rel="noopener" style="opacity:.45; pointer-events:none;">Request on WhatsApp \u2192</a>' +
        '</div>' +
      '</div></div>');
    document.body.appendChild(modal);

    var state = { exp: EXPS[0].name, date: null, guests: 2, name: '' };
    try {
      var saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
      if (saved && typeof saved === 'object') {
        if (saved.exp) state.exp = saved.exp;
        if (saved.guests) state.guests = saved.guests;
        if (saved.name) state.name = saved.name;
        if (saved.date) {
          var d = new Date(saved.date);
          if (!isNaN(d) && d >= todayStart()) state.date = d;
        }
      }
    } catch (e) { /* ignore */ }

    var expSel = modal.querySelector('#hhxBkExp');
    var guestsOut = modal.querySelector('#hhxBkGuests');
    var nameIn = modal.querySelector('#hhxBkName');
    var summary = modal.querySelector('#hhxBkSummary');
    var sendBtn = modal.querySelector('#hhxBkSend');
    var calEl = modal.querySelector('#hhxCal');
    var view = new Date();
    view.setDate(1);

    function todayStart() { var t = new Date(); t.setHours(0, 0, 0, 0); return t; }
    function sameDay(a, b) {
      return a && b && a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }
    function fmtDate(d) {
      return d ? d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear() : '';
    }
    function save() {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({
          exp: state.exp, guests: state.guests, name: state.name,
          date: state.date ? state.date.toISOString() : null
        }));
      } catch (e) { /* storage full / private mode — fine */ }
    }

    function renderCal() {
      var now = todayStart();
      var y = view.getFullYear(), m = view.getMonth();
      var atCurrent = y === now.getFullYear() && m === now.getMonth();
      var first = new Date(y, m, 1);
      var startDow = (first.getDay() + 6) % 7; /* Monday-first */
      var days = new Date(y, m + 1, 0).getDate();

      var html = '<div class="hhx-cal-head">' +
        '<button type="button" id="hhxCalPrev" aria-label="Previous month"' + (atCurrent ? ' disabled' : '') + '>\u2190</button>' +
        '<strong>' + MONTHS[m] + ' ' + y + '</strong>' +
        '<button type="button" id="hhxCalNext" aria-label="Next month">\u2192</button>' +
        '</div><div class="hhx-cal-grid">';
      DOWS.forEach(function (d) { html += '<span class="hhx-cal-dow">' + d + '</span>'; });
      for (var i = 0; i < startDow; i++) html += '<span></span>';
      for (var d = 1; d <= days; d++) {
        var date = new Date(y, m, d);
        var past = date < now;
        var cls = 'hhx-cal-day' +
          (sameDay(date, now) ? ' is-today' : '') +
          (sameDay(date, state.date) ? ' is-selected' : '');
        html += '<button type="button" class="' + cls + '" data-d="' + d + '"' +
          (past ? ' disabled' : '') + '>' + d + '</button>';
      }
      html += '</div>';
      calEl.innerHTML = html;
    }

    function renderSummary() {
      var exp = EXPS.filter(function (x) { return x.name === state.exp; })[0] || EXPS[0];
      summary.innerHTML =
        '<strong>' + esc(state.exp) + '</strong> · ' + esc(exp.price) + '<br>' +
        (state.date ? esc(fmtDate(state.date)) : '<em>pick a date \u2192</em>') +
        ' · ' + state.guests + ' guest' + (state.guests === 1 ? '' : 's') +
        (state.name ? ' · ' + esc(state.name) : '');
      var ok = !!state.date;
      sendBtn.style.opacity = ok ? '' : '.45';
      sendBtn.style.pointerEvents = ok ? '' : 'none';
      if (ok) {
        sendBtn.href = waLink(
          'Hello! I\u2019d like to book the ' + state.exp +
          ' on ' + fmtDate(state.date) +
          ' for ' + state.guests + ' guest' + (state.guests === 1 ? '' : 's') +
          (state.name ? '. Name: ' + state.name : '') +
          '. Please confirm availability.');
      } else { sendBtn.removeAttribute('href'); }
    }

    function renderAll() {
      expSel.value = state.exp;
      guestsOut.textContent = state.guests;
      nameIn.value = state.name;
      renderCal();
      renderSummary();
    }

    var lastFocus = null;
    function open(expName) {
      if (expName) state.exp = expName;
      renderAll();
      lastFocus = document.activeElement;
      modal.classList.add('is-open');
      modal.querySelector('.hhx-bk-close').focus();
    }
    function close() {
      modal.classList.remove('is-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    calEl.addEventListener('click', function (e) {
      if (e.target.id === 'hhxCalPrev') { view.setMonth(view.getMonth() - 1); renderCal(); return; }
      if (e.target.id === 'hhxCalNext') { view.setMonth(view.getMonth() + 1); renderCal(); return; }
      var day = e.target.closest('.hhx-cal-day');
      if (day && !day.disabled) {
        state.date = new Date(view.getFullYear(), view.getMonth(), parseInt(day.getAttribute('data-d'), 10));
        renderCal(); renderSummary(); save();
      }
    });
    expSel.addEventListener('change', function () { state.exp = expSel.value; renderSummary(); save(); });
    nameIn.addEventListener('input', function () { state.name = nameIn.value; renderSummary(); save(); });
    modal.querySelector('#hhxBkGp').addEventListener('click', function () {
      state.guests = Math.min(30, state.guests + 1); guestsOut.textContent = state.guests; renderSummary(); save();
    });
    modal.querySelector('#hhxBkGm').addEventListener('click', function () {
      state.guests = Math.max(1, state.guests - 1); guestsOut.textContent = state.guests; renderSummary(); save();
    });
    modal.querySelector('.hhx-bk-close').addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });

    var planBtn = document.getElementById('hhxPlanVisit');
    if (planBtn) planBtn.addEventListener('click', function () { open(); });
    window.addEventListener('hhx:book-tour', function (e) {
      var name = e.detail && e.detail.experience;
      var known = EXPS.some(function (x) { return x.name === name; });
      open(known ? name : null);
    });
  }

  /* ==================================================================
     D) MEMBERSHIP — side-by-side comparison table
     ================================================================== */
  function initCompare() {
    var members = document.getElementById('members');
    if (!members || document.querySelector('.hhx-cmp')) return;
    var grid = members.querySelector('.tier-grid');
    if (!grid) return;

    var tiers = Array.prototype.slice.call(grid.querySelectorAll('.tier')).map(function (t) {
      return {
        el: t,
        name: (t.querySelector('h3') || {}).textContent || '',
        price: ((t.querySelector('.price-big') || {}).textContent || '').replace(/\s+/g, ' ').trim(),
        feats: Array.prototype.slice.call(t.querySelectorAll('ul li')).map(function (li) {
          return li.textContent.replace(/\s+/g, ' ').trim();
        })
      };
    });
    if (tiers.length < 2) return;

    /* union of features, in first-seen order */
    var rows = [];
    tiers.forEach(function (t) {
      t.feats.forEach(function (f) { if (rows.indexOf(f) === -1) rows.push(f); });
    });

    var toggleWrap = el('<div class="hhx-cmp-toggle-wrap reveal"><button type="button" class="btn btn-secondary" id="hhxCmpToggle">Compare all plans side by side</button></div>');
    grid.insertAdjacentElement('afterend', toggleWrap);

    var table = el('<div class="hhx-cmp" id="hhxCmp" aria-label="Membership comparison">' +
      '<table><thead><tr><th>What you get</th>' +
      tiers.map(function (t) { return '<th>' + esc(t.name) + '<small>' + esc(t.price) + '</small></th>'; }).join('') +
      '</tr></thead><tbody>' +
      rows.map(function (f) {
        return '<tr><td>' + esc(f) + '</td>' + tiers.map(function (t) {
          return '<td>' + (t.feats.indexOf(f) !== -1
            ? '<span class="hhx-yes">\u2713</span>'
            : '<span class="hhx-no">\u2014</span>') + '</td>';
        }).join('') + '</tr>';
      }).join('') +
      '<tr><td></td>' + tiers.map(function (t, i) {
        return '<td><button type="button" class="hhx-cmp-go" data-i="' + i + '">Choose ' + esc(t.name) + '</button></td>';
      }).join('') + '</tr>' +
      '</tbody></table></div>');
    toggleWrap.insertAdjacentElement('afterend', table);

    var btn = toggleWrap.querySelector('#hhxCmpToggle');
    btn.addEventListener('click', function () {
      var open = table.classList.toggle('is-open');
      btn.textContent = open ? 'Hide comparison' : 'Compare all plans side by side';
      if (open) flashAndScroll(table);
    });

    /* column hover highlight */
    table.addEventListener('mouseover', function (e) {
      var cell = e.target.closest('td, th');
      if (!cell || cell.cellIndex === 0 || cell.cellIndex === undefined) return;
      highlight(cell.cellIndex);
    });
    table.addEventListener('mouseleave', function () { highlight(-1); });
    function highlight(ci) {
      table.querySelectorAll('tr').forEach(function (tr) {
        Array.prototype.forEach.call(tr.cells || [], function (c, i) {
          c.classList.toggle('is-hl', i === ci);
        });
      });
    }

    table.addEventListener('click', function (e) {
      var go = e.target.closest('.hhx-cmp-go');
      if (!go) return;
      var tier = tiers[parseInt(go.getAttribute('data-i'), 10)];
      if (tier) {
        flashAndScroll(tier.el);
        var choose = tier.el.querySelector('.choose-tier');
        if (choose) setTimeout(function () { choose.click(); }, 700);
      }
    });

    watchReveals(toggleWrap);
  }

  /* ================================================================== */
  onReady(function () {
    initButchery();
    initCattleCalc();
    initBooking();
    initCompare();
  });
})();
