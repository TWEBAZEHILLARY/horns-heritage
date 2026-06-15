/* =====================================================================
   tilt-3d.js — purely additive visual enhancements (no content changes)

   1) Subtle 3D tilt on product cards, cattle cards & membership cards
      - desktop: follows the cursor on hover
      - mobile : a gentle tilt on tap (touch), springs back on release
   2) Soft 3D press (scale .98) on CTA / add-to-cart / cart buttons
   3) Slow, subtle parallax + idle float on the hero background video

   All effects honour prefers-reduced-motion and never call preventDefault,
   so links and buttons keep working normally.
   ===================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------
     1) CARD TILT
     --------------------------------------------------------------- */
  var MAX_TILT = 5;      // degrees
  var LIFT = 6;          // px lift, matches the site's existing hover lift

  function initTilt() {
    if (reduceMotion) return;

    var cards = document.querySelectorAll('.product-card, .tier');
    cards.forEach(function (card) {
      if (card.dataset.tiltReady) return;
      card.dataset.tiltReady = '1';
      card.classList.add('tilt-card');

      var raf = null;
      var rect = null;

      function apply(px, py) {
        // px, py are 0..1 within the card
        var ry = (px - 0.5) * 2 * MAX_TILT;          // rotateY from x
        var rx = (0.5 - py) * 2 * MAX_TILT;          // rotateX from y
        card.style.transform =
          'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' +
          ry.toFixed(2) + 'deg) translateY(-' + LIFT + 'px)';
      }

      function onMove(e) {
        if (!rect) rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () { apply(px, py); });
      }

      function start() {
        rect = card.getBoundingClientRect();
        card.classList.add('is-tilting');
      }
      function reset() {
        rect = null;
        card.classList.remove('is-tilting');
        card.style.transform = '';
      }

      // Desktop hover (mouse / pen)
      card.addEventListener('pointerenter', function (e) {
        if (e.pointerType === 'touch') return;
        start();
      });
      card.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        onMove(e);
      });
      card.addEventListener('pointerleave', function (e) {
        if (e.pointerType === 'touch') return;
        reset();
      });

      // Touch: subtle tilt on tap, springs back on release.
      card.addEventListener('touchstart', function (e) {
        var t = e.touches[0];
        if (!t) return;
        start();
        onMove({ clientX: t.clientX, clientY: t.clientY });
      }, { passive: true });
      var clear = function () { reset(); };
      card.addEventListener('touchend', clear, { passive: true });
      card.addEventListener('touchcancel', clear, { passive: true });
    });
  }

  /* ---------------------------------------------------------------
     2) BUTTON SOFT PRESS
     --------------------------------------------------------------- */
  function initPress() {
    if (reduceMotion) return;
    var sel = '.btn, .add-to-cart, .cart-btn';

    function press(e) {
      var btn = e.target.closest(sel);
      if (btn) btn.classList.add('is-pressed');
    }
    function release() {
      document.querySelectorAll('.is-pressed').forEach(function (b) {
        b.classList.remove('is-pressed');
      });
    }
    // pointerdown/up covers mouse + touch + pen without blocking clicks
    document.addEventListener('pointerdown', press, true);
    document.addEventListener('pointerup', release, true);
    document.addEventListener('pointercancel', release, true);
    document.addEventListener('pointerleave', release, true);
  }

  /* ---------------------------------------------------------------
     3) HERO VIDEO PARALLAX + IDLE FLOAT
     --------------------------------------------------------------- */
  function initHero() {
    if (reduceMotion) return;
    var hero = document.querySelector('.hero');
    var video = document.querySelector('.hero-video');
    if (!hero || !video) return;

    var BASE_SCALE = 1.06;   // headroom so movement never shows edges
    var visible = true;
    var running = false;

    // Only animate while the hero is on screen.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && !running) loop();
      }, { threshold: 0 }).observe(hero);
    }

    function loop() {
      running = true;
      if (!visible) { running = false; return; }
      var t = performance.now() / 1000;
      // Scroll parallax: hero top relative to viewport, eased & clamped.
      var top = hero.getBoundingClientRect().top;
      var parallax = Math.max(-14, Math.min(14, -top * 0.04));
      // Idle float: a slow ~5px sine drift.
      var floatY = Math.sin(t * 0.6) * 5;
      var driftX = Math.cos(t * 0.45) * 3;
      video.style.transform =
        'translate3d(' + driftX.toFixed(2) + 'px, ' +
        (parallax + floatY).toFixed(2) + 'px, 0) scale(' + BASE_SCALE + ')';
      requestAnimationFrame(loop);
    }
    loop();
  }

  /* ---------------------------------------------------------------
     Boot — and re-scan cards when the shop filter re-renders them.
     --------------------------------------------------------------- */
  function boot() {
    initTilt();
    initPress();
    initHero();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Tab filtering on the shop just toggles display, but re-run defensively
  // a moment later in case other scripts inject cards after load.
  window.addEventListener('load', function () { setTimeout(initTilt, 400); });
})();
