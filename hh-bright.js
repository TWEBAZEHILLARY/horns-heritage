/* ============================================================================
   hh-bright.js  —  Looping cow-video backdrops + bees clean-up
   Runs after hh-redesign.js. Purely visual; touches no content/cart/login.
     - Drops a muted, looping, controls-less cow video behind the named
       sections as a subtle cinematic backdrop (light veil keeps text legible).
     - Guarantees the bees clip (cow-2.mp4) is gone and the About story shows
       the cow video, independent of the Tweaks "story video" toggle.
   ========================================================================== */
(function () {
  'use strict';

  var COW = 'assets/cow-pasture.mp4';
  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sections that get a full-section cinematic cow backdrop.
  // (About/#about is handled through the existing .story video system below.)
  var SECTION_IDS = ['shop', 'cattle', 'tours', 'cams', 'members'];

  function makeVideo() {
    var v = document.createElement('video');
    v.muted = true; v.defaultMuted = true;
    v.loop = true; v.autoplay = true;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.setAttribute('preload', 'auto');
    v.setAttribute('aria-hidden', 'true');
    v.setAttribute('disablepictureinpicture', '');
    v.removeAttribute('controls');
    var s = document.createElement('source');
    s.src = COW; s.type = 'video/mp4';
    v.appendChild(s);
    return v;
  }

  function playSafe(v) { try { var p = v.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {} }

  function mountSection(id) {
    var sec = document.getElementById(id);
    if (!sec || sec.classList.contains('hh-has-cowbg')) return;
    // Need a positioned content wrapper to sit above the video.
    if (!sec.querySelector(':scope > .container')) return;
    sec.classList.add('hh-has-cowbg');

    var wrap = document.createElement('div');
    wrap.className = 'hh-cowbg';
    wrap.setAttribute('aria-hidden', 'true');

    if (!reduce) {
      var v = makeVideo();
      wrap.appendChild(v);
      playSafe(v);
    }
    var veil = document.createElement('div');
    veil.className = 'hh-cowbg-veil';
    wrap.appendChild(veil);

    sec.insertBefore(wrap, sec.firstChild);
  }

  // --- About / Story: ensure the cow video is present, never the bees clip ---
  function fixStory() {
    var story = document.querySelector('section.story#about') ||
                document.querySelector('section.story');
    if (!story) return;

    // Swap any stale bees source to the cow clip.
    story.querySelectorAll('.story-bg-video source').forEach(function (s) {
      if (/cow-2\.mp4/.test(s.src) || !/cow-pasture\.mp4/.test(s.src)) {
        s.src = COW;
        var vid = s.closest('video');
        if (vid) { vid.load(); playSafe(vid); }
      }
    });

    if (reduce) return;
    // If the toggle left the story without a video, inject the cow video so the
    // About page always carries the cinematic motion the brief asks for.
    if (!story.querySelector('.story-bg-video')) {
      story.classList.add('story-has-video');
      var scrim = document.createElement('div');
      scrim.className = 'story-bg-scrim';
      scrim.setAttribute('aria-hidden', 'true');
      var v = makeVideo();
      v.className = 'story-bg-video';
      story.insertBefore(scrim, story.firstChild);
      story.insertBefore(v, story.firstChild);
      playSafe(v);
    }
  }

  function run() {
    SECTION_IDS.forEach(mountSection);
    fixStory();
  }

  // The hero entrance fade (hh-fade-up) leaves content at opacity:0 until it
  // plays. In some offscreen/throttled contexts the animation clock never
  // starts (startTime stays null), so content would stay invisible. After the
  // fade's natural duration, commit any still-pending hero animations so the
  // heading is guaranteed visible everywhere — a no-op once the fade has run.
  function commitHeroIntro() {
    try {
      document.querySelectorAll('.hero .container > div > *').forEach(function (el) {
        var as = el.getAnimations ? el.getAnimations() : [];
        as.forEach(function (a) {
          if (a.playState !== 'finished' && (a.startTime == null || a.currentTime === 0)) {
            try { a.finish(); } catch (e) {}
          }
        });
      });
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  // Re-assert shortly after, in case the Tweaks app re-mounts the story video.
  window.addEventListener('load', function () {
    setTimeout(run, 400);
    setTimeout(commitHeroIntro, 1200);
  });

  // Keep the bees out and the cow backdrops alive if other scripts mutate later.
  var ro;
  try {
    ro = new MutationObserver(function () {
      window.clearTimeout(run._t);
      run._t = window.setTimeout(run, 150);
    });
    ro.observe(document.body, { childList: true, subtree: true });
    // stop watching after things settle to avoid needless work
    setTimeout(function () { try { ro.disconnect(); } catch (e) {} }, 6000);
  } catch (e) {}
})();
