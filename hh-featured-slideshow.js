/* ===========================================================================
   hh-featured-slideshow.js — "Featured Offers of the Month"  (ADDITIVE)
   ---------------------------------------------------------------------------
   Replaces the old single "Featured Bull of the Week" card with a horizontal
   slideshow of the four dashboard-managed offers:
       Champion Bull · Breeding Cow · Young Bull · Heifer

   • Data comes from HHApi (Worker/KV when deployed, localStorage in preview)
     — the SAME store the Sales Dashboard writes to, so dashboard edits
     appear here automatically (live, via HHApi.onChange).
   • This slideshow is the ONLY place on index.html where cattle are shown:
     every animal added in "Manage Cattle" appears as a slide, and animals
     deleted (by the dashboard OR by a completed purchase) disappear live.
   • Auto-slides every 3 s; pauses on hover/focus; arrows + dots; smooth
     horizontal transition; subtle zoom on the active image.
   • "View Details" reuses the existing cattle detail modal from hh-cattle.js
     (exposed as window.HHCattleUI.openDetail).

   Load AFTER hh-api.js and hh-cattle.js. Nothing else is modified.
   =========================================================================== */
(function () {
  'use strict';

  if (!window.HHApi) { console.warn('[fbs] HHApi not loaded'); return; }

  var shell = document.getElementById('fbSlideshow');
  if (!shell) return;

  var AUTO_MS = 3000;                  /* auto-slide every 3 seconds */
  var TAG_ORDER = ['champion bull', 'breeding cow', 'young bull', 'heifer'];

  /* === Helpers ========================================================== */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtMoney(n) {
    if (n == null || isNaN(n)) return '';
    return 'UGX ' + Math.round(n).toLocaleString('en-US');
  }
  function ageFrom(dob) {
    if (!dob) return '';
    var d = new Date(dob);
    if (isNaN(d)) return '';
    var yrs = (Date.now() - d.getTime()) / 31557600000;
    if (yrs < 1) { var m = Math.max(1, Math.round(yrs * 12)); return m + (m === 1 ? ' month' : ' months'); }
    var y = Math.floor(yrs);
    return y + (y === 1 ? ' year' : ' years');
  }

  /* ALL dashboard-managed cattle appear here — this slideshow is the single
     source of truth for cattle on the homepage. The four canonical tags lead
     the order; every other listing follows in dashboard order. */
  function pickFeatured(arr) {
    var used = {};
    var picked = [];
    TAG_ORDER.forEach(function (tag) {
      for (var i = 0; i < arr.length; i++) {
        var c = arr[i];
        if (!used[c.id] && String(c.tag || '').trim().toLowerCase() === tag) {
          picked.push(c); used[c.id] = 1; break;
        }
      }
    });
    arr.forEach(function (c) { if (!used[c.id]) { picked.push(c); used[c.id] = 1; } });
    return picked;
  }

  /* === Static scaffold inside the shell ================================= */
  shell.innerHTML =
    '<div class="fbs-viewport"><div class="fbs-track" id="fbsTrack"></div></div>' +
    '<button class="fbs-arrow fbs-prev" type="button" aria-label="Previous offer">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>' +
    '</button>' +
    '<button class="fbs-arrow fbs-next" type="button" aria-label="Next offer">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>' +
    '</button>' +
    '<div class="fbs-dots" role="tablist" aria-label="Slide position"></div>';

  var track = shell.querySelector('#fbsTrack');
  var dotsBox = shell.querySelector('.fbs-dots');
  var prevBtn = shell.querySelector('.fbs-prev');
  var nextBtn = shell.querySelector('.fbs-next');

  var slides = [];      /* cattle objects currently shown */
  var index = 0;
  var timer = null;
  var hovering = false;

  /* === Slide markup ====================================================== */
  function slideHTML(c) {
    var media = c.image
      ? '<img src="' + esc(c.image) + '" alt="' + esc(c.name) + '" loading="lazy" />'
      : '<div class="placeholder-img">' + esc(c.name) + '</div>';
    var badge = String(c.badge || '').toLowerCase();
    var statusCls = badge === 'sold' ? ' is-sold' : (badge === 'reserved' ? ' is-reserved' : '');
    /* prefer the explicit Age / Horn span fields; fall back to derived values */
    var age = c.age || ageFrom(c.dob);
    var tt = c.hornSpan || (c.horns && c.horns.TT ? c.horns.TT + ' cm tip-to-tip' : '');
    var specs = [];
    if (tt) specs.push(['Horn span', tt]);
    if (age) specs.push(['Age', age]);
    if (c.earTag) specs.push(['Ear tag', c.earTag]);
    var waText = encodeURIComponent('Hi, I am interested in the featured offer "' + (c.name || '') +
      '" (' + (c.tag || '') + '). Please send details.');

    return '<article class="fbs-slide" data-id="' + esc(c.id) + '" role="group" aria-roledescription="slide" aria-label="' + esc(c.tag || c.name) + '">' +
      '<div class="fbs-media">' + media +
        '<span class="fb-flag">🔥 Featured Offers of the Month</span>' +
        '<div class="fbs-overlay">' +
          '<span class="fbs-overlay-price">' + esc(fmtMoney(c.price)) + '</span>' +
          '<button class="fbs-overlay-btn fbs-view" type="button" data-id="' + esc(c.id) + '">View Details</button>' +
        '</div>' +
      '</div>' +
      '<div class="fbs-body">' +
        '<div class="fbs-badge-row">' +
          '<span class="eyebrow" style="background:rgba(110,143,116,.18); color:var(--gold-dark);">This month only</span>' +
          (c.badge ? '<span class="fbs-status' + statusCls + '">' + esc(c.badge) + '</span>' : '') +
        '</div>' +
        '<h2 class="fb-name">' + esc(c.name) + ' <small style="display:block; font-size:0.45em; font-family:inherit; opacity:0.75; margin-top:4px;">' + esc(c.tag || '') + '</small></h2>' +
        '<p class="fb-desc">' + esc(c.summary || '') + '</p>' +
        (specs.length ? '<div class="fb-specs">' + specs.map(function (s) {
          return '<div class="fb-spec"><span class="fb-spec-label">' + esc(s[0]) + '</span><strong>' + esc(s[1]) + '</strong></div>';
        }).join('') + '</div>' : '') +
        '<a class="btn btn-primary fb-cta inquire-bull" data-name="' + esc(c.name) + '"' +
          ' href="https://wa.me/256764250125?text=' + waText + '"' +
          ' target="_blank" rel="noopener">Limited time — Inquire now →</a>' +
      '</div>' +
    '</article>';
  }

  /* === Render & navigation ============================================== */
  function render(arr) {
    slides = pickFeatured(arr || []);
    if (!slides.length) {
      track.innerHTML = '<div class="fbs-slide"><div class="fbs-empty">No featured offers right now. Check back soon, or contact us on WhatsApp for current availability.</div></div>';
      dotsBox.innerHTML = '';
      prevBtn.style.display = nextBtn.style.display = 'none';
      return;
    }
    prevBtn.style.display = nextBtn.style.display = '';
    if (index >= slides.length) index = 0;
    track.innerHTML = slides.map(slideHTML).join('');
    dotsBox.innerHTML = slides.map(function (c, i) {
      return '<button class="fbs-dot" type="button" role="tab" data-i="' + i + '" aria-label="Go to slide ' + (i + 1) + ': ' + esc(c.tag || c.name) + '"></button>';
    }).join('');
    update(false);
  }

  function update(animate) {
    if (animate === false) {
      track.style.transition = 'none';
      requestAnimationFrame(function () { requestAnimationFrame(function () { track.style.transition = ''; }); });
    }
    track.style.transform = 'translateX(-' + (index * 100) + '%)';
    var els = track.children;
    for (var i = 0; i < els.length; i++) els[i].classList.toggle('is-active', i === index);
    var dots = dotsBox.children;
    for (var j = 0; j < dots.length; j++) {
      dots[j].classList.toggle('is-active', j === index);
      dots[j].setAttribute('aria-selected', j === index ? 'true' : 'false');
    }
  }

  function goTo(i) {
    if (!slides.length) return;
    index = (i + slides.length) % slides.length;
    update();
  }
  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  /* === Auto-slide (3 s) with pause on hover/focus ======================== */
  function startAuto() {
    stopAuto();
    timer = setInterval(function () { if (!hovering) next(); }, AUTO_MS);
  }
  function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }

  shell.addEventListener('mouseenter', function () { hovering = true; });
  shell.addEventListener('mouseleave', function () { hovering = false; });
  shell.addEventListener('focusin', function () { hovering = true; });
  shell.addEventListener('focusout', function () { hovering = false; });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopAuto(); else startAuto();
  });

  /* === Events ============================================================ */
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  dotsBox.addEventListener('click', function (e) {
    var d = e.target.closest('.fbs-dot');
    if (d) goTo(Number(d.getAttribute('data-i')) || 0);
  });

  /* touch swipe (mobile) */
  var touchX = null;
  shell.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  shell.addEventListener('touchend', function (e) {
    if (touchX == null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 48) { if (dx < 0) next(); else prev(); }
    touchX = null;
  }, { passive: true });

  /* View Details → reuse the existing cattle detail modal */
  track.addEventListener('click', function (e) {
    var btn = e.target.closest('.fbs-view');
    if (!btn) return;
    var id = btn.getAttribute('data-id');
    var c = slides.filter(function (x) { return x.id === id; })[0];
    if (!c) return;
    if (window.HHCattleUI && typeof window.HHCattleUI.openDetail === 'function') {
      window.HHCattleUI.openDetail(c);
    }
  });

  /* === Boot: same data source the dashboard writes to ==================== */
  function load() { HHApi.getCattle().then(render); }

  /* paint instantly from the local mirror, then refresh from the API */
  render(HHApi.cattle.cached());
  load();
  startAuto();

  /* live-refresh when the dashboard changes cattle (same or other tab) */
  HHApi.onChange(function (kind) { if (kind === 'cattle') load(); });
})();
