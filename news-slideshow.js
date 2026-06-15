/* ===========================================================================
   NEWS FEED — horizontal right-to-left slideshow + pop-up modal.
   Replaces ONLY the rendering of the existing "News feed" section on the
   About page. Filters, search, Subscribe/Suggest buttons keep working.

   DATA SOURCES (merged, newest first):
     1. data/news.json          — optional file; same shape the admin
                                  dashboard uses. Fetched on every page load.
     2. localStorage hhNewsItems — written by the existing admin news
                                  dashboard (public/admin-news-dashboard.html):
                                  { id, type:'news'|'video', date, title,
                                    excerpt, fullText, image, youtubeUrl }
     3. Built-in posts below     — the original hard-coded feed (fallback).

   TUNING:
     SPEED  — auto-drift speed in pixels/second (right → left).
     Card width lives in hero-news-overrides.css (.news-card).
   =========================================================================== */
(function () {
  'use strict';

  var SPEED = 28;            /* ← auto-scroll speed (px per second) */
  var RESUME_DELAY = 2500;   /* ← ms to wait after user interaction before drifting again */

  /* ---- Built-in posts (the original feed; edit freely) ------------------ */
  var builtInPosts = [
    { id: 'b1', date: '9 June 2026',  category: 'event',  emoji: '📢', title: 'Open Farm Day — 25 June', excerpt: 'Come see our herd! Walk the pastures, meet the team, taste traditional drinks. Bring family & friends. 10:00–17:00.' },
    { id: 'b2', date: '6 June 2026',  category: 'semen',  emoji: '💧', title: 'Limited Semen Straws Available', excerpt: 'Premium semen from "Rwabugiri" (champion bull, 2024) now in stock. High conception rates. Contact us for pricing & delivery.' },
    { id: 'b3', date: '2 June 2026',  category: 'health', emoji: '🩺', title: 'FMD Vaccination Round Complete', excerpt: 'All 120 head vaccinated against Foot & Mouth Disease. Next round in November. Herd health status: excellent.' },
    { id: 'b4', date: '28 May 2026',  category: 'action', emoji: '🐂', title: 'New Bull Arrival: "Mukamashyaka"', excerpt: 'Exceptional long-horn genetics from northern Uganda. Ready for stud service. See full pedigree in our Cattle Listings.' },
    { id: 'b5', date: '22 May 2026',  category: 'market', emoji: '📊', title: 'Ankole Prices Up 15% This Quarter', excerpt: 'Strong demand in regional markets. Our heifers are selling well. Buyers appreciate documented genetics & health records.' },
    { id: 'b6', date: '18 May 2026',  category: 'health', emoji: '💊', title: 'Tick Prevention Tips for Dry Season', excerpt: 'Spray your herd every 2 weeks with recommended acaricide. Ensure water points are clean & accessible. Prevents disease.' },
    { id: 'b7', date: '12 May 2026',  category: 'action', emoji: '🐂', title: 'Heifer Birth: "Kabula Star"', excerpt: 'Healthy calf born to "Amahoro" (award-winner). Excellent conformation. Will be available for sale in 2027.' },
    { id: 'b8', date: '5 May 2026',   category: 'event',  emoji: '📢', title: 'Buyer Testimonial: Rwanda Purchase', excerpt: 'Customer from Rwanda purchased 3 heifers. Excellent transport & after-sale support. Very satisfied. Repeat buyer expected.' }
  ];

  var CAT_LABELS = { action: 'Action Update', semen: 'Semen Sales', health: 'Health', event: 'Event', market: 'Market News', news: 'News', video: 'Video' };
  var CAT_EMOJI  = { action: '🐂', semen: '💧', health: '🩺', event: '📢', market: '📊', news: '📰', video: '🎥' };

  var viewport = document.getElementById('news-viewport');
  var track = document.getElementById('news-track');
  if (!viewport || !track) return;

  var carousel = viewport.closest('.news-carousel');
  var filterBtns = document.querySelectorAll('.news-filter-btn');
  var searchInput = document.getElementById('news-search');
  var currentFilter = 'all';
  var currentSearch = '';
  var allPosts = [];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* Normalize a dashboard item → internal post shape */
  function fromDashboard(item, i) {
    var cat = item.type === 'video' ? 'video' : 'news';
    return {
      id: 'd' + (item.id || i),
      date: item.date || '',
      category: cat,
      emoji: CAT_EMOJI[cat],
      title: item.title || '',
      excerpt: item.excerpt || '',
      fullText: item.fullText || '',
      image: item.image || '',
      youtubeUrl: item.youtubeUrl || ''
    };
  }

  function readLocalStorageItems() {
    try {
      var arr = JSON.parse(localStorage.getItem('hhNewsItems')) || [];
      return Array.isArray(arr) ? arr.map(fromDashboard) : [];
    } catch (e) { return []; }
  }

  function dedupe(posts) {
    var seen = {}, out = [];
    posts.forEach(function (p) {
      var key = (p.title + '|' + p.date).toLowerCase();
      if (!seen[key]) { seen[key] = 1; out.push(p); }
    });
    return out;
  }

  /* Turn any YouTube URL into an embeddable one */
  function toEmbedUrl(url) {
    if (!url) return '';
    var m = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{6,})/);
    return m ? 'https://www.youtube.com/embed/' + m[1] : url;
  }

  /* ---------------- Card rendering ---------------- */
  function cardHTML(post) {
    var thumb = '';
    if (post.image) {
      thumb = '<div class="news-card-thumb"><img src="' + esc(post.image) + '" alt="" loading="lazy" />' +
              (post.category === 'video' ? '<span class="news-card-play" aria-hidden="true">▶</span>' : '') +
              '</div>';
    } else if (post.category === 'video') {
      thumb = '<div class="news-card-thumb"><span class="news-card-play" aria-hidden="true">▶</span></div>';
    }
    return thumb +
      '<div class="news-post-header">' +
        '<span class="news-post-date">' + esc(post.date) + '</span>' +
        '<span class="news-post-category">' + (post.emoji || '') + ' ' + (CAT_LABELS[post.category] || 'News') + '</span>' +
      '</div>' +
      '<h3 class="news-post-title">' + esc(post.title) + '</h3>' +
      '<p class="news-post-description">' + esc(post.excerpt) + '</p>' +
      '<span class="news-card-more">Read more →</span>';
  }

  function filteredPosts() {
    return allPosts.filter(function (p) {
      var okFilter = currentFilter === 'all' || p.category === currentFilter;
      var q = currentSearch.toLowerCase();
      var okSearch = !q || (p.title + ' ' + p.excerpt).toLowerCase().indexOf(q) !== -1;
      return okFilter && okSearch;
    });
  }

  function renderTrack() {
    var posts = filteredPosts();
    track.innerHTML = '';
    if (!posts.length) {
      track.innerHTML = '<div class="news-empty" style="flex:0 0 100%;">No posts found. Try adjusting your filters.</div>';
      return;
    }
    var makeSet = function (clone) {
      posts.forEach(function (post) {
        var el = document.createElement('button');
        el.type = 'button';
        el.className = 'news-card';
        if (clone) el.setAttribute('aria-hidden', 'true');
        el.innerHTML = cardHTML(post);
        el.addEventListener('click', function () { openModal(post); });
        track.appendChild(el);
      });
    };
    makeSet(false);
    /* duplicate the set once so the loop is seamless */
    makeSet(true);
    viewport.scrollLeft = 0;
  }

  /* ---------------- Auto-drift (right → left, continuous loop) ----------- */
  var paused = false;
  var resumeTimer = null;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lastT = null;

  function loopWidth() { return track.scrollWidth / 2; }

  function tick(t) {
    if (lastT == null) lastT = t;
    var dt = (t - lastT) / 1000;
    lastT = t;
    if (!paused && !document.hidden && track.scrollWidth > viewport.clientWidth + 40) {
      viewport.scrollLeft += SPEED * dt;
      var lw = loopWidth();
      if (lw > 0 && viewport.scrollLeft >= lw) viewport.scrollLeft -= lw;
    }
    requestAnimationFrame(tick);
  }

  function pause() { paused = true; if (resumeTimer) clearTimeout(resumeTimer); }
  function resumeSoon() {
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(function () { paused = false; }, RESUME_DELAY);
  }

  carousel.addEventListener('mouseenter', pause);
  carousel.addEventListener('mouseleave', function () { if (!modalOpen) resumeSoon(); });
  viewport.addEventListener('touchstart', pause, { passive: true });
  viewport.addEventListener('touchend', resumeSoon, { passive: true });
  carousel.addEventListener('focusin', pause);
  carousel.addEventListener('focusout', resumeSoon);

  /* ---------------- Arrows ---------------- */
  function jump(dir) {
    pause();
    var card = track.querySelector('.news-card');
    var step = card ? card.offsetWidth + 16 : 336;
    var target = viewport.scrollLeft + dir * step;
    var lw = loopWidth();
    if (lw > 0) {
      if (target < 0) target += lw;
      if (target >= lw) target -= lw;
    }
    viewport.scrollTo({ left: target, behavior: 'smooth' });
    resumeSoon();
  }
  var prevBtn = document.getElementById('news-arrow-prev');
  var nextBtn = document.getElementById('news-arrow-next');
  if (prevBtn) prevBtn.addEventListener('click', function () { jump(-1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { jump(1); });

  /* ---------------- Modal (pop-up with full content) ---------------- */
  var modalOpen = false;
  var overlay = document.createElement('div');
  overlay.className = 'news-modal-overlay';
  overlay.innerHTML =
    '<div class="news-modal" role="dialog" aria-modal="true" aria-label="News post">' +
      '<button class="news-modal-close" type="button" aria-label="Close">✕</button>' +
      '<div class="news-post-header">' +
        '<span class="news-post-date" id="nm-date"></span>' +
        '<span class="news-post-category" id="nm-cat"></span>' +
      '</div>' +
      '<h3 id="nm-title"></h3>' +
      '<div class="news-modal-media" id="nm-media"></div>' +
      '<div class="news-modal-body" id="nm-body"></div>' +
      '<div class="news-post-actions"><button class="news-share-btn" type="button" id="nm-copy">📋 Copy</button></div>' +
    '</div>';
  document.body.appendChild(overlay);

  var nmDate = overlay.querySelector('#nm-date');
  var nmCat = overlay.querySelector('#nm-cat');
  var nmTitle = overlay.querySelector('#nm-title');
  var nmMedia = overlay.querySelector('#nm-media');
  var nmBody = overlay.querySelector('#nm-body');
  var nmCopy = overlay.querySelector('#nm-copy');
  var currentPost = null;

  function openModal(post) {
    currentPost = post;
    nmDate.textContent = post.date;
    nmCat.textContent = (post.emoji || '') + ' ' + (CAT_LABELS[post.category] || 'News');
    nmTitle.textContent = post.title;

    var media = '';
    if (post.youtubeUrl) {
      media = '<iframe src="' + esc(toEmbedUrl(post.youtubeUrl)) + '" title="' + esc(post.title) + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    } else if (post.image && /\.(mp4|webm|mov)(\?|$)/i.test(post.image)) {
      media = '<video src="' + esc(post.image) + '" controls playsinline></video>';
    } else if (post.image) {
      media = '<img src="' + esc(post.image) + '" alt="" />';
    }
    nmMedia.innerHTML = media;
    nmMedia.style.display = media ? '' : 'none';

    /* fullText comes from the dashboard and may contain HTML on purpose */
    if (post.fullText) { nmBody.innerHTML = post.fullText; }
    else { nmBody.textContent = post.excerpt; }

    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    modalOpen = true;
    pause();
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    nmMedia.innerHTML = '';           /* stops any playing video */
    document.body.style.overflow = '';
    modalOpen = false;
    resumeSoon();
  }

  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
  overlay.querySelector('.news-modal-close').addEventListener('click', closeModal);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modalOpen) closeModal(); });

  nmCopy.addEventListener('click', function () {
    if (!currentPost) return;
    var text = currentPost.title + '\n\n' + (currentPost.excerpt || '') + '\n\n— Horns & Heritage News';
    navigator.clipboard.writeText(text).then(function () {
      nmCopy.textContent = '✓ Copied!';
      setTimeout(function () { nmCopy.textContent = '📋 Copy'; }, 2000);
    });
  });

  /* ---------------- Filters + search (unchanged behaviour) -------------- */
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = 'var(--primary-green)';
      });
      btn.classList.add('active');
      btn.style.background = 'var(--primary-green)';
      btn.style.color = 'white';
      currentFilter = btn.dataset.filter;
      renderTrack();
    });
  });
  if (searchInput) {
    searchInput.addEventListener('input', function (e) {
      currentSearch = e.target.value;
      renderTrack();
    });
  }

  /* ---------------- Boot: merge data sources, render, start ------------- */
  function rebuild(extra) {
    var dashboardPosts = readLocalStorageItems();
    allPosts = dedupe((extra || []).concat(dashboardPosts, builtInPosts));
    renderTrack();
  }

  function boot(jsonItems) {
    var filePosts = (jsonItems || []).map(fromDashboard);
    rebuild(filePosts);
    if (!reduceMotion) requestAnimationFrame(tick);

    /* Also pull from the shared API (Cloudflare Worker/KV when deployed).
       HHApi already mirrors into localStorage, so readLocalStorageItems()
       picks it up — we just trigger a refresh once it resolves. */
    if (window.HHApi) {
      window.HHApi.getNews().then(function () { rebuild(filePosts); }).catch(function () {});
      window.HHApi.onChange(function (kind) { if (kind === 'news') rebuild(filePosts); });
    }
  }

  /* Optional data/news.json (same item shape as the dashboard). Fails silently. */
  fetch('data/news.json', { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : []; })
    .catch(function () { return []; })
    .then(boot);

  /* Live update if the dashboard saves in another tab */
  window.addEventListener('storage', function (e) {
    if (e.key === 'hhNewsItems') {
      allPosts = dedupe(readLocalStorageItems().concat(builtInPosts));
      renderTrack();
    }
  });
})();
