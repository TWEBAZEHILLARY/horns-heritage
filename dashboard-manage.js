/* ===========================================================================
   dashboard-manage.js — "Manage Cattle" + "Manage News" for the Sales Dashboard
   ---------------------------------------------------------------------------
   Adds two admin areas (and matching sidebar links) that let staff add / edit /
   delete cattle listings and news posts. All writes go through HHApi, so they
   save to the Cloudflare Worker/KV when deployed (localStorage in preview) and
   appear on index.html automatically.

   ADDITIVE: injected at runtime, scoped under .mng-* / #sec-cattle / #sec-news.
   The existing news + sales functionality is untouched. News items keep the
   EXACT shape the existing feed expects:
     { id, type:'news'|'video', date, title, excerpt, fullText, image, youtubeUrl }
   =========================================================================== */
(function () {
  'use strict';
  if (!window.HHApi) { console.warn('[dashboard-manage] HHApi not loaded'); return; }

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function el(html) {
    var t = document.createElement('template'); t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function fmtUGX(n) { return 'UGX ' + Math.round(Number(n) || 0).toLocaleString('en-US'); }

  var ICON = {
    cattle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 7c0 3 2 5 4 5M21 7c0 3-2 5-4 5"/><path d="M7 12c0 4 2 7 5 7s5-3 5-7"/><circle cx="9.5" cy="10" r="1"/><circle cx="14.5" cy="10" r="1"/></svg>',
    news: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 4h12a2 2 0 0 1 2 2v12a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2z"/><path d="M8 8h6M8 12h6M8 16h4"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
    del: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>'
  };

  /* === Toast (reuse the command-centre toast if present) ================= */
  function toast(msg) {
    var t = $('ccToast');
    if (t) {
      t.textContent = msg; t.classList.add('show');
      clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('show'); }, 2600);
    }
  }

  /* === Inject sidebar links ============================================== */
  function addNav() {
    var nav = document.querySelector('.sb-nav');
    if (!nav) return;
    var group = el('<div class="sb-group-label">Content</div>');
    var cattleLink = el('<button class="sb-link" data-scroll="sec-cattle" type="button">' + ICON.cattle + 'Manage Cattle</button>');
    var newsLink = el('<button class="sb-link" data-scroll="sec-news" type="button">' + ICON.news + 'Manage News</button>');
    nav.appendChild(group); nav.appendChild(cattleLink); nav.appendChild(newsLink);

    [cattleLink, newsLink].forEach(function (lnk) {
      lnk.addEventListener('click', function () {
        document.querySelectorAll('.sb-link').forEach(function (l) { l.classList.remove('active'); });
        lnk.classList.add('active');
        var target = $(lnk.getAttribute('data-scroll'));
        if (target) {
          var y = target.getBoundingClientRect().top + window.pageYOffset - 76;
          window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
        }
      });
    });
  }

  /* === Inject the two sections =========================================== */
  function addSections() {
    var main = document.querySelector('.main');
    if (!main) return;

    var wrap = el('<div style="padding: 0 28px 40px;"></div>');
    wrap.innerHTML =
      '<div class="card" id="sec-cattle" style="margin-top:18px; scroll-margin-top:80px;">' +
        '<div class="card-head">' +
          '<h3>Manage Cattle</h3>' +
          '<button class="btn btn-sm" id="mngCattleAdd" type="button">+ Add cattle</button>' +
        '</div>' +
        '<div class="mng-toolbar" style="margin-bottom:14px;">' +
          '<input class="mng-search" id="mngCattleSearch" type="search" placeholder="Search by name, ear tag or reg no…" />' +
          '<span class="mng-status-pill" id="mngCattleCount"></span>' +
        '</div>' +
        '<div class="mng-list" id="mngCattleList"></div>' +
      '</div>' +
      '<div class="card" id="sec-news" style="margin-top:18px; scroll-margin-top:80px;">' +
        '<div class="card-head">' +
          '<h3>Manage News</h3>' +
          '<button class="btn btn-sm" id="mngNewsAdd" type="button">+ Add news</button>' +
        '</div>' +
        '<div class="mng-toolbar" style="margin-bottom:14px;">' +
          '<input class="mng-search" id="mngNewsSearch" type="search" placeholder="Search posts…" />' +
          '<span class="mng-status-pill" id="mngNewsCount"></span>' +
        '</div>' +
        '<div class="mng-list" id="mngNewsList"></div>' +
        '<div class="note" style="margin-top:16px;">These posts feed the right-to-left news slideshow on the public site. Changes appear there automatically.</div>' +
      '</div>';
    main.appendChild(wrap);
  }

  /* === Modal builder ===================================================== */
  var overlay = el('<div class="mng-overlay" role="dialog" aria-modal="true"><div class="mng-form"></div></div>');
  document.body.appendChild(overlay);
  var formBox = overlay.querySelector('.mng-form');
  function closeModal() { overlay.classList.remove('is-open'); document.body.style.overflow = ''; }
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal(); });

  function field(opts) {
    var id = opts.id, type = opts.type || 'text';
    var lbl = '<label for="' + id + '">' + esc(opts.label) + '</label>';
    var ctl;
    if (type === 'textarea') {
      ctl = '<textarea id="' + id + '" placeholder="' + esc(opts.ph || '') + '">' + esc(opts.value || '') + '</textarea>';
    } else if (type === 'select') {
      ctl = '<select id="' + id + '">' + opts.options.map(function (o) {
        return '<option value="' + esc(o.v) + '"' + (o.v === opts.value ? ' selected' : '') + '>' + esc(o.l) + '</option>';
      }).join('') + '</select>';
    } else {
      ctl = '<input id="' + id + '" type="' + type + '" placeholder="' + esc(opts.ph || '') +
        '" value="' + esc(opts.value == null ? '' : opts.value) + '" />';
    }
    return '<div class="mng-field' + (opts.full ? ' full' : '') + '">' + lbl + ctl +
      (opts.hint ? '<span class="mng-hint">' + esc(opts.hint) + '</span>' : '') + '</div>';
  }

  /* === CATTLE ============================================================ */
  var cattle = [];
  function renderCattle() {
    var q = ($('mngCattleSearch').value || '').toLowerCase();
    var list = $('mngCattleList');
    var rows = cattle.filter(function (c) {
      return !q || ((c.name || '') + ' ' + (c.earTag || '') + ' ' + (c.regNo || '')).toLowerCase().indexOf(q) !== -1;
    });
    $('mngCattleCount').textContent = cattle.length + ' listing' + (cattle.length === 1 ? '' : 's');
    if (!rows.length) {
      list.innerHTML = '<div class="mng-empty">' + (cattle.length ? 'No cattle match your search.' : 'No cattle yet. Click “Add cattle” to create your first listing.') + '</div>';
      return;
    }
    list.innerHTML = rows.map(function (c) {
      var badge = c.badge ? '<span class="mng-badge ' + (/(sold|reserved)/i.test(c.badge) ? 'is-' + c.badge.toLowerCase() : '') + '">' + esc(c.badge) + '</span>' : '';
      var thumb = c.image ? '<img class="mng-thumb" src="' + esc(c.image) + '" alt="" />' : '<div class="mng-thumb">no image</div>';
      return '<div class="mng-row" data-id="' + esc(c.id) + '">' + thumb +
        '<div class="mng-row-body"><div class="mng-row-title">' + esc(c.name || 'Untitled') + badge + '</div>' +
        '<div class="mng-row-sub">' + esc(c.earTag ? 'Ear tag ' + c.earTag + ' · ' : '') + esc(c.summary || '') + '</div></div>' +
        '<div class="mng-row-price">' + fmtUGX(c.price) + '</div>' +
        '<div class="mng-row-actions">' +
          '<button class="mng-icon-btn mng-edit" type="button" title="Edit" data-id="' + esc(c.id) + '">' + ICON.edit + '</button>' +
          '<button class="mng-icon-btn is-danger mng-del" type="button" title="Delete" data-id="' + esc(c.id) + '">' + ICON.del + '</button>' +
        '</div></div>';
    }).join('');
  }

  function openCattleForm(existing) {
    var c = existing || {};
    var h = c.horns || {};
    var hornFields = [['LL', 'LL'], ['RL', 'RL'], ['LB', 'LB'], ['RB', 'RB'], ['SCI', 'SCI'], ['TT', 'TT']]
      .map(function (k) { return field({ id: 'cf_horn_' + k[0], label: k[1], value: h[k[0]] || '' }); }).join('');
    formBox.innerHTML =
      '<div class="mng-form-head"><h3>' + (existing ? 'Edit cattle' : 'Add cattle') + '</h3>' +
        '<button class="mng-form-close" type="button" aria-label="Close">✕</button></div>' +
      '<div class="mng-form-body">' +
        field({ id: 'cf_name', label: 'Name', value: c.name, ph: 'e.g. Rwabugiri' }) +
        field({ id: 'cf_tag', label: 'Category tag', value: c.tag, ph: 'e.g. Champion Bull' }) +
        field({ id: 'cf_price', label: 'Price (UGX)', type: 'number', value: c.price, ph: '12000000' }) +
        field({ id: 'cf_age', label: 'Age', value: c.age, ph: 'e.g. 3 years, 18 months' }) +
        field({ id: 'cf_badge', label: 'Status', type: 'select', value: c.badge || 'Available', options: [
          { v: 'Available', l: 'Available' }, { v: 'Reserved', l: 'Reserved' }, { v: 'Sold', l: 'Sold' }] }) +
        field({ id: 'cf_summary', label: 'Summary (card text)', type: 'textarea', value: c.summary, full: true, ph: 'One or two lines shown on the listing card.' }) +
        '<div class="mng-subhead">Registration</div>' +
        field({ id: 'cf_earTag', label: 'Ear tag', value: c.earTag, ph: 'HH-0142' }) +
        field({ id: 'cf_regNo', label: 'Reg no.', value: c.regNo, ph: 'ANK-UG-2021-0142' }) +
        field({ id: 'cf_dob', label: 'Date of birth', type: 'date', value: c.dob }) +
        field({ id: 'cf_image', label: 'Image URL', value: c.image, ph: 'assets/your-photo.jpg', hint: 'Path or full URL' }) +
        '<div class="mng-subhead">Measurements</div>' +
        field({ id: 'cf_hornSpan', label: 'Horn span', value: c.hornSpan, ph: 'e.g. 232 cm or 24 inches', hint: 'Shown with Age in the details pop-up' }) +
        '<div class="mng-horns"><div class="mng-subhead" style="border:none; padding-top:0;">Horn measurements (cm)</div>' +
          '<div class="mng-horns-grid">' + hornFields + '</div></div>' +
        '<div class="mng-subhead">Lineage &amp; health</div>' +
        field({ id: 'cf_sire', label: 'Sire', value: c.sire }) +
        field({ id: 'cf_dam', label: 'Dam', value: c.dam }) +
        field({ id: 'cf_vax', label: 'Vaccinations', value: (Array.isArray(c.vaccinations) ? c.vaccinations.join(', ') : (c.vaccinations || '')), full: true, hint: 'Comma-separated, e.g. FMD, Brucellosis, Lumpy Skin' }) +
        field({ id: 'cf_desc', label: 'Full description', type: 'textarea', value: c.description, full: true, ph: 'Long description — shown in the pop-up, scrolls if long. Use a blank line between paragraphs.' }) +
      '</div>' +
      '<div class="mng-form-foot">' +
        (existing ? '<button class="btn btn-ghost btn-sm mng-spacer mng-form-delete" type="button">Delete</button>' : '') +
        '<button class="btn btn-ghost btn-sm mng-form-cancel" type="button">Cancel</button>' +
        '<button class="btn btn-sm mng-form-save" type="button">' + (existing ? 'Save changes' : 'Add cattle') + '</button>' +
      '</div>';

    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    formBox.querySelector('.mng-form-close').addEventListener('click', closeModal);
    formBox.querySelector('.mng-form-cancel').addEventListener('click', closeModal);
    var delBtn = formBox.querySelector('.mng-form-delete');
    if (delBtn) delBtn.addEventListener('click', function () {
      if (confirm('Delete “' + (c.name || 'this listing') + '”? This cannot be undone.')) {
        HHApi.deleteCattle(c.id).then(function () { toast('Cattle deleted'); closeModal(); });
      }
    });
    formBox.querySelector('.mng-form-save').addEventListener('click', function () {
      var v = function (id) { var n = $(id); return n ? n.value.trim() : ''; };
      var item = Object.assign({}, c, {
        name: v('cf_name'), tag: v('cf_tag'), price: Number(v('cf_price')) || 0,
        age: v('cf_age'), hornSpan: v('cf_hornSpan'),
        badge: v('cf_badge'), summary: v('cf_summary'),
        earTag: v('cf_earTag'), regNo: v('cf_regNo'), dob: v('cf_dob'), image: v('cf_image'),
        horns: { LL: v('cf_horn_LL'), RL: v('cf_horn_RL'), LB: v('cf_horn_LB'),
                 RB: v('cf_horn_RB'), SCI: v('cf_horn_SCI'), TT: v('cf_horn_TT') },
        sire: v('cf_sire'), dam: v('cf_dam'),
        vaccinations: v('cf_vax').split(',').map(function (s) { return s.trim(); }).filter(Boolean),
        description: v('cf_desc')
      });
      if (!item.name) { alert('Please enter a name.'); return; }
      HHApi.saveCattle(item).then(function () { toast(existing ? 'Cattle updated' : 'Cattle added'); closeModal(); });
    });
  }

  /* === NEWS ============================================================== */
  var news = [];
  function renderNews() {
    var q = ($('mngNewsSearch').value || '').toLowerCase();
    var list = $('mngNewsList');
    var rows = news.filter(function (n) {
      return !q || ((n.title || '') + ' ' + (n.excerpt || '')).toLowerCase().indexOf(q) !== -1;
    });
    $('mngNewsCount').textContent = news.length + ' post' + (news.length === 1 ? '' : 's');
    if (!rows.length) {
      list.innerHTML = '<div class="mng-empty">' + (news.length ? 'No posts match your search.' : 'No posts yet. Click “Add news” to create one.') + '</div>';
      return;
    }
    list.innerHTML = rows.map(function (n) {
      var isVid = n.type === 'video';
      var badge = '<span class="mng-badge ' + (isVid ? 'is-video' : '') + '">' + (isVid ? 'Video' : 'News') + '</span>';
      var thumb = n.image ? '<img class="mng-thumb" src="' + esc(n.image) + '" alt="" />'
        : '<div class="mng-thumb">' + (isVid ? '▶' : 'news') + '</div>';
      return '<div class="mng-row" data-id="' + esc(n.id) + '">' + thumb +
        '<div class="mng-row-body"><div class="mng-row-title">' + esc(n.title || 'Untitled') + badge + '</div>' +
        '<div class="mng-row-sub">' + esc(n.date ? n.date + ' · ' : '') + esc(n.excerpt || '') + '</div></div>' +
        '<div class="mng-row-actions">' +
          '<button class="mng-icon-btn mng-edit" type="button" title="Edit" data-id="' + esc(n.id) + '">' + ICON.edit + '</button>' +
          '<button class="mng-icon-btn is-danger mng-del" type="button" title="Delete" data-id="' + esc(n.id) + '">' + ICON.del + '</button>' +
        '</div></div>';
    }).join('');
  }

  function todayStr() {
    var d = new Date();
    return d.getDate() + ' ' + ['January','February','March','April','May','June','July','August','September','October','November','December'][d.getMonth()] + ' ' + d.getFullYear();
  }
  function openNewsForm(existing) {
    var n = existing || {};
    formBox.innerHTML =
      '<div class="mng-form-head"><h3>' + (existing ? 'Edit post' : 'Add news post') + '</h3>' +
        '<button class="mng-form-close" type="button" aria-label="Close">✕</button></div>' +
      '<div class="mng-form-body">' +
        field({ id: 'nf_title', label: 'Title', value: n.title, full: true, ph: 'e.g. Open Farm Day — 25 June' }) +
        field({ id: 'nf_type', label: 'Type', type: 'select', value: n.type || 'news', options: [
          { v: 'news', l: 'News' }, { v: 'video', l: 'Video' }] }) +
        field({ id: 'nf_date', label: 'Date', value: n.date || todayStr(), ph: '9 June 2026' }) +
        field({ id: 'nf_excerpt', label: 'Short excerpt (card text)', type: 'textarea', value: n.excerpt, full: true, ph: 'One or two sentences shown on the card.' }) +
        field({ id: 'nf_full', label: 'Full text (pop-up)', type: 'textarea', value: n.fullText, full: true, hint: 'Optional. Shown when the post is opened. Basic HTML allowed.' }) +
        field({ id: 'nf_image', label: 'Image URL', value: n.image, ph: 'assets/photo.jpg or https://…', hint: 'Optional image or thumbnail' }) +
        field({ id: 'nf_youtube', label: 'YouTube URL', value: n.youtubeUrl, ph: 'https://youtu.be/…', hint: 'Optional — for video posts' }) +
      '</div>' +
      '<div class="mng-form-foot">' +
        (existing ? '<button class="btn btn-ghost btn-sm mng-spacer mng-form-delete" type="button">Delete</button>' : '') +
        '<button class="btn btn-ghost btn-sm mng-form-cancel" type="button">Cancel</button>' +
        '<button class="btn btn-sm mng-form-save" type="button">' + (existing ? 'Save changes' : 'Add post') + '</button>' +
      '</div>';

    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    formBox.querySelector('.mng-form-close').addEventListener('click', closeModal);
    formBox.querySelector('.mng-form-cancel').addEventListener('click', closeModal);
    var delBtn = formBox.querySelector('.mng-form-delete');
    if (delBtn) delBtn.addEventListener('click', function () {
      if (confirm('Delete this post? This cannot be undone.')) {
        HHApi.deleteNews(n.id).then(function () { toast('Post deleted'); closeModal(); });
      }
    });
    formBox.querySelector('.mng-form-save').addEventListener('click', function () {
      var v = function (id) { var node = $(id); return node ? node.value.trim() : ''; };
      var item = Object.assign({}, n, {
        title: v('nf_title'), type: v('nf_type'), date: v('nf_date'),
        excerpt: v('nf_excerpt'), fullText: v('nf_full'),
        image: v('nf_image'), youtubeUrl: v('nf_youtube')
      });
      if (!item.title) { alert('Please enter a title.'); return; }
      HHApi.saveNews(item).then(function () { toast(existing ? 'Post updated' : 'Post added'); closeModal(); });
    });
  }

  /* === Wire up =========================================================== */
  function wire() {
    $('mngCattleAdd').addEventListener('click', function () { openCattleForm(null); });
    $('mngNewsAdd').addEventListener('click', function () { openNewsForm(null); });
    $('mngCattleSearch').addEventListener('input', renderCattle);
    $('mngNewsSearch').addEventListener('input', renderNews);

    $('mngCattleList').addEventListener('click', function (e) {
      var edit = e.target.closest('.mng-edit'), del = e.target.closest('.mng-del');
      var id = (edit || del) && (edit || del).getAttribute('data-id');
      if (!id) return;
      var c = cattle.filter(function (x) { return x.id === id; })[0];
      if (edit && c) openCattleForm(c);
      else if (del && c) {
        if (confirm('Delete “' + (c.name || 'this listing') + '”? This cannot be undone.'))
          HHApi.deleteCattle(id).then(function () { toast('Cattle deleted'); });
      }
    });
    $('mngNewsList').addEventListener('click', function (e) {
      var edit = e.target.closest('.mng-edit'), del = e.target.closest('.mng-del');
      var id = (edit || del) && (edit || del).getAttribute('data-id');
      if (!id) return;
      var n = news.filter(function (x) { return x.id === id; })[0];
      if (edit && n) openNewsForm(n);
      else if (del && n) {
        if (confirm('Delete this post? This cannot be undone.'))
          HHApi.deleteNews(id).then(function () { toast('Post deleted'); });
      }
    });
  }

  function loadCattle() { HHApi.getCattle().then(function (a) { cattle = a || []; renderCattle(); }); }
  function loadNews() { HHApi.getNews().then(function (a) { news = a || []; renderNews(); }); }

  /* === Boot ============================================================== */
  function init() {
    addNav();
    addSections();
    wire();
    loadCattle();
    loadNews();
    HHApi.onChange(function (kind) {
      if (kind === 'cattle') loadCattle();
      if (kind === 'news') loadNews();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
