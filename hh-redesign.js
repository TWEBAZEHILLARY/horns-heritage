/* =====================================================================
   hh-redesign.js — additive behaviour for the re-skin.
   - Applies & persists the chosen theme ("light"/"dark") and hero variant.
   - Injects a floating muted video background behind the "Our Story" block.
   - Injects an animated stats band (real facts from the story copy).
   - Exposes window.hhRedesign for the Tweaks panel to drive.

   No existing content, prices, cart, checkout, login or membership logic
   is touched.
   ===================================================================== */
(function () {
  'use strict';

  var STORE = 'hh_redesign_v1';
  var DEFAULTS = { theme: 'dark', hero: '1', storyVideo: true, stats: true };
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function load() {
    try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(STORE)) || {}); }
    catch (e) { return Object.assign({}, DEFAULTS); }
  }
  function save(s) { try { localStorage.setItem(STORE, JSON.stringify(s)); } catch (e) {} }

  var state = load();

  /* ---- apply theme + hero to <html> ---------------------------------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-hh-theme', theme);
  }
  function applyHero(hero) {
    document.documentElement.setAttribute('data-hero', String(hero));
  }

  // Apply immediately (the head boot script may already have done theme; this
  // is the authoritative pass once the DOM is ready).
  applyTheme(state.theme);
  applyHero(state.hero);

  /* ---- Story floating video background ------------------------------- */
  function mountStoryVideo() {
    var story = document.querySelector('section.story#about') ||
                document.querySelector('section.story');
    if (!story) return;
    var existing = story.querySelector('.story-bg-video');
    if (state.storyVideo && !reduceMotion) {
      story.classList.add('story-has-video');
      if (!existing) {
        var v = document.createElement('video');
        v.className = 'story-bg-video';
        v.muted = true; v.loop = true; v.autoplay = true;
        v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
        v.setAttribute('preload', 'metadata'); v.setAttribute('disablepictureinpicture', '');
        var src = document.createElement('source');
        src.src = 'assets/cow-pasture.mp4'; src.type = 'video/mp4';
        v.appendChild(src);
        var scrim = document.createElement('div');
        scrim.className = 'story-bg-scrim'; scrim.setAttribute('aria-hidden', 'true');
        story.insertBefore(scrim, story.firstChild);
        story.insertBefore(v, story.firstChild);
        v.play && v.play().catch(function () {});
      }
    } else {
      story.classList.remove('story-has-video');
      if (existing) existing.remove();
      var sc = story.querySelector('.story-bg-scrim');
      if (sc) sc.remove();
    }
  }

  /* ---- Animated stats band (real facts from the story copy) ---------- */
  var STATS = [
    { target: 1947, suffix: '',  label: 'First Ankole arrived' },
    { target: 4,    suffix: '',  label: 'Generations on the soil' },
    { target: 1400, suffix: ' m', label: 'Metres above sea level', comma: true },
    { target: 2021, suffix: '',  label: 'Opened to guests' }
  ];

  function mountStats() {
    var grid = document.querySelector('.story .story-grid');
    if (!grid) return;
    var existing = document.querySelector('.hh-statband');
    if (state.stats) {
      if (!existing) {
        var band = document.createElement('div');
        band.className = 'hh-statband';
        band.setAttribute('aria-label', 'Ranch heritage at a glance');
        STATS.forEach(function (s) {
          var cell = document.createElement('div');
          cell.className = 'hh-stat';
          var strong = document.createElement('strong');
          strong.setAttribute('data-target', s.target);
          strong.setAttribute('data-suffix', s.suffix || '');
          if (s.comma) strong.setAttribute('data-comma', '1');
          strong.textContent = '0' + (s.suffix || '');
          var span = document.createElement('span');
          span.textContent = s.label;
          cell.appendChild(strong); cell.appendChild(span);
          band.appendChild(cell);
        });
        // place the band right after the story grid (full width)
        grid.parentNode.insertBefore(band, grid.nextSibling);
        observeStats(band);
      }
    } else if (existing) {
      existing.remove();
    }
  }

  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-target')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var comma = el.getAttribute('data-comma') === '1';
    if (reduceMotion) {
      el.textContent = (comma ? target.toLocaleString('en-US') : target) + suffix;
      return;
    }
    var dur = 1400, start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      var val = Math.round(target * eased);
      el.textContent = (comma ? val.toLocaleString('en-US') : val) + suffix;
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function observeStats(band) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          band.classList.add('hh-in');
          band.querySelectorAll('strong[data-target]').forEach(animateCount);
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe(band);
  }

  /* ---- Public API for the Tweaks panel ------------------------------- */
  window.hhRedesign = {
    get: function () { return Object.assign({}, state); },
    set: function (patch) {
      var prev = Object.assign({}, state);
      state = Object.assign({}, state, patch || {});
      save(state);
      document.documentElement.classList.add('hh-theme-anim');
      if (patch && 'theme' in patch && patch.theme !== prev.theme) applyTheme(state.theme);
      if (patch && 'hero' in patch && patch.hero !== prev.hero) applyHero(state.hero);
      if (patch && 'storyVideo' in patch) mountStoryVideo();
      if (patch && 'stats' in patch) mountStats();
    }
  };

  /* ---- boot ---------------------------------------------------------- */
  function boot() {
    mountStoryVideo();
    mountStats();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
