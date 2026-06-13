/* ==========================================================================
   F-PATTERN RESTRUCTURE — runtime layer
   - Wraps existing sections into F-pattern rows (zigzag) with sticky media pins
   - Splits hero (video + content right column)
   - Pins category strip + reveal/scroll-driven motion
   - Builds Media Library admin (drawer) listing every <img>/<video poster>
   - Adds quick-add-to-cart on product cards
   ========================================================================== */
(function(){
  'use strict';
  if (window.__fpRestructured) return;
  window.__fpRestructured = true;

  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  /* ------------------------------------------------------------------ *
   * 1. HERO: remove any logo glyph inside the headline
   * ------------------------------------------------------------------ */
  function cleanHero(){
    const h = $('#hero h1, #hero .hero-h');
    if (!h) return;
    $$('svg, img, .hh-mark, .logo, [class*="logo"]', h).forEach(n => n.remove());
    // Also drop any decorative SVG sibling that sits directly above the H1
    const hb = $('.hero-body');
    if (hb){
      $$(':scope > svg', hb).forEach(n => n.remove());
    }
    // Add the vertical "scroll" anchor on the left side of the hero
    const hero = $('#hero');
    if (hero && !$('.fp-hero-anchor', hero)){
      const a = document.createElement('div');
      a.className = 'fp-hero-anchor';
      a.textContent = 'Scroll · The Heritage';
      hero.appendChild(a);
    }
  }

  /* ------------------------------------------------------------------ *
   * 2. F-PATTERN WRAPPER
   *    For each top-level section (excluding hero, live cam, footer),
   *    pick a "media" element (first img / video / canvas / picture)
   *    and a "text" container (everything else), then re-arrange them
   *    into a zigzag grid.
   * ------------------------------------------------------------------ */
  const HERO_IDS    = new Set(['hero', 'live', 'livecam', 'footer']);
  const HERO_CLASSES= ['hero', 'announce', 'csw', 'cs', 'csec' /* category */];

  function isSkippable(sec){
    const id = (sec.id || '').toLowerCase();
    if (HERO_IDS.has(id)) return true;
    if (sec.classList.contains('an')) return true;          // announce bar
    if (sec.classList.contains('csw')) return true;         // cat strip
    if (sec.tagName === 'NAV') return true;
    if (sec.tagName === 'HEADER') return true;
    if (sec.tagName === 'FOOTER') return true;
    if (sec.closest && sec.closest('#hero')) return true;
    return false;
  }

  function pickMedia(sec){
    // Prefer first image-like element that's > 200px tall in source
    const candidates = $$('img, video, picture, canvas, .hero-vid, .vid-wrap, [data-fp-media]', sec);
    return candidates.find(n => {
      // skip tiny icons & svgs in eyebrows
      const r = n.getBoundingClientRect();
      return (r.height >= 120 || n.tagName === 'VIDEO' || n.tagName === 'CANVAS');
    }) || candidates[0] || null;
  }

  function wrapSections(){
    // Operate on direct children of <body> that look like sections
    const sections = $$('body > section, body > div.section, body > article, main > section, main > div.section');
    let i = 0;
    sections.forEach(sec => {
      if (isSkippable(sec)) return;
      if (sec.dataset.fpWrapped === '1') return;
      // Avoid wrapping nested sections
      if (sec.closest('.fp-fsec')) return;

      const media = pickMedia(sec);
      // Even without media, we still apply F section styling for rhythm
      sec.classList.add('fp-fsec');
      sec.classList.add(i % 2 === 0 ? 'fp-tone-a' : 'fp-tone-b');
      if (i % 2 === 1) sec.classList.add('fp-flip');

      // Build the F-row
      const row = document.createElement('div');
      row.className = 'fp-row';

      const textCol = document.createElement('div');
      textCol.className = 'fp-text';

      const mediaCol = document.createElement('div');
      mediaCol.className = 'fp-media';

      // Move media (and its parent figure if any) into mediaCol
      if (media){
        const mediaHost = media.closest('figure, .vid-wrap, picture') || media;
        const pin = document.createElement('div');
        pin.className = 'fp-pin';
        pin.appendChild(mediaHost.cloneNode(true));
        // Remove originals
        mediaHost.parentNode && mediaHost.parentNode.removeChild(mediaHost);
        mediaCol.appendChild(pin);
      } else {
        // placeholder striped block
        const ph = document.createElement('div');
        ph.className = 'fp-pin';
        ph.style.cssText = 'aspect-ratio:4/5;background:repeating-linear-gradient(135deg,#1a1109,#1a1109 10px,#221608 10px,#221608 20px);';
        mediaCol.appendChild(ph);
      }

      // Move all remaining children into textCol
      while (sec.firstChild){ textCol.appendChild(sec.firstChild); }

      // Add a section number eyebrow at top of textCol
      const num = document.createElement('div');
      num.className = 'fp-num';
      num.textContent = String(i+1).padStart(2,'0') + ' · 0' + (sections.length);
      textCol.insertBefore(num, textCol.firstChild);

      row.appendChild(textCol);
      row.appendChild(mediaCol);
      sec.appendChild(row);

      sec.dataset.fpWrapped = '1';
      i++;
    });
  }

  /* ------------------------------------------------------------------ *
   * 3. STICKY CATEGORY STRIP: pin behaviour
   * ------------------------------------------------------------------ */
  function watchCategoryStrip(){
    const strip = $('.csw');
    if (!strip) return;
    let lastY = 0;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > 220) strip.classList.add('fp-pinned');
      else strip.classList.remove('fp-pinned');
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
  }

  /* ------------------------------------------------------------------ *
   * 4. REVEAL OBSERVER (cinematic entrance)
   * ------------------------------------------------------------------ */
  function setupReveals(){
    $$('.fp-fsec').forEach((sec) => {
      const text = $('.fp-text', sec);
      if (text){
        // mark first 3 children as staggered reveals
        const kids = Array.from(text.children).slice(0, 5);
        kids.forEach((k, idx) => {
          k.classList.add('fp-reveal');
          if (idx === 1) k.classList.add('fp-d1');
          if (idx === 2) k.classList.add('fp-d2');
          if (idx === 3) k.classList.add('fp-d3');
        });
      }
    });
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting){
          e.target.classList.add('fp-in');
          if (e.target.classList.contains('fp-fsec')){
            $$('.fp-pin', e.target).forEach(p => p.classList.add('fp-active'));
          }
        }
      });
    }, {threshold: .14, rootMargin: '0px 0px -10% 0px'});
    $$('.fp-reveal, .fp-fsec').forEach(n => io.observe(n));
  }

  /* ------------------------------------------------------------------ *
   * 5. QUICK-ADD-TO-CART overlay on product cards
   * ------------------------------------------------------------------ */
  function setupQuickAdd(){
    $$('.pc').forEach(card => {
      if (card.dataset.fpQa === '1') return;
      const qa = document.createElement('div');
      qa.className = 'fp-quickadd';
      qa.innerHTML = `
        <button type="button" data-fp-qa="quick">Quick Add</button>
        <button type="button" data-fp-qa="wish">Save</button>
      `;
      card.style.position = card.style.position || 'relative';
      card.appendChild(qa);
      qa.addEventListener('click', (e)=>{
        const btn = e.target.closest('button');
        if (!btn) return;
        e.preventDefault(); e.stopPropagation();
        const action = btn.dataset.fpQa;
        const title = ($('.pt, .pn, h3, h4', card)?.textContent || 'Item').trim();
        toast(action === 'quick' ? `Added · ${title}` : `Saved · ${title}`);
        if (action === 'quick'){
          // increment cart counter if present
          const counter = $('[data-cart-count], .cart-count, .cn');
          if (counter){ counter.textContent = (parseInt(counter.textContent||'0',10)+1); }
        }
      });
      card.dataset.fpQa = '1';
    });
  }

  /* ------------------------------------------------------------------ *
   * 6. MEDIA LIBRARY ADMIN PANEL
   * ------------------------------------------------------------------ */
  let MLState = { open:false, items:[] };

  function collectMedia(){
    const items = [];
    $$('img').forEach((el, i) => {
      if (el.closest('.fp-ml')) return;          // skip our own thumbs
      items.push({el, kind:'img', src: el.currentSrc || el.src, label: el.alt || el.getAttribute('data-fp-label') || `Image ${i+1}`, loc: locOf(el)});
    });
    $$('video[poster]').forEach((el, i) => {
      items.push({el, kind:'poster', src: el.poster, label: el.getAttribute('data-fp-label') || `Video poster ${i+1}`, loc: locOf(el)});
    });
    return items;
  }

  function locOf(el){
    const sec = el.closest('section, footer, header, [data-screen-label]');
    if (!sec) return 'page';
    return (sec.id || sec.dataset.screenLabel || sec.className.split(/\s+/)[0] || 'section').slice(0,40);
  }

  function buildMediaLibrary(){
    if ($('.fp-ml')) return;

    const fab = document.createElement('button');
    fab.className = 'fp-ml-fab';
    fab.title = 'Open media library (M)';
    fab.innerHTML = '🖼';
    document.body.appendChild(fab);

    const drawer = document.createElement('aside');
    drawer.className = 'fp-ml';
    drawer.innerHTML = `
      <div class="fp-ml-head">
        <h3>Media Library</h3>
        <button type="button" class="fp-ml-close" title="Close (Esc)">Close</button>
      </div>
      <div class="fp-ml-actions">
        <input type="search" placeholder="Filter by label or section…" data-fp-filter />
        <button type="button" data-fp-act="bulk">Bulk upload</button>
        <button type="button" data-fp-act="export">Save to project</button>
        <input type="file" accept="image/*" multiple style="display:none" data-fp-bulk />
        <input type="file" accept="image/*" style="display:none" data-fp-single />
      </div>
      <div class="fp-ml-list" data-fp-list></div>
    `;
    document.body.appendChild(drawer);

    const list   = $('[data-fp-list]', drawer);
    const filter = $('[data-fp-filter]', drawer);
    const bulkIn = $('[data-fp-bulk]', drawer);
    const singleIn = $('[data-fp-single]', drawer);

    fab.addEventListener('click', () => toggleML());
    $('.fp-ml-close', drawer).addEventListener('click', () => toggleML(false));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && MLState.open){ toggleML(false); }
      if ((e.key === 'm' || e.key === 'M') && !e.ctrlKey && !e.metaKey && !e.altKey){
        const t = e.target;
        if (t && (t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable)) return;
        toggleML();
      }
    });

    filter.addEventListener('input', () => render(filter.value.toLowerCase()));

    // Bulk upload: replace placeholders / first N items in order
    $('[data-fp-act="bulk"]', drawer).addEventListener('click', () => bulkIn.click());
    bulkIn.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      const items = collectMedia();
      const N = Math.min(files.length, items.length);
      for (let i=0; i<N; i++){
        const dataUrl = await readFileAsDataURL(files[i]);
        applyImageReplace(items[i], dataUrl, files[i].name);
      }
      bulkIn.value = '';
      toast(`Replaced ${N} image${N!==1?'s':''}`);
      render(filter.value.toLowerCase());
    });

    // Save-to-project (writes the localStorage edits + uploaded blobs as <link rel="ext-resource">
    // tagged data so the user can capture them; we surface as a JSON export download)
    $('[data-fp-act="export"]', drawer).addEventListener('click', exportProjectMedia);

    // Single-file replace (driven by per-row "Replace" buttons)
    let pendingTarget = null;
    list.addEventListener('click', (e) => {
      const row = e.target.closest('.fp-mli');
      if (!row) return;
      if (e.target.matches('[data-fp-replace]')){
        pendingTarget = row.__fpItem;
        singleIn.click();
      } else if (e.target.matches('[data-fp-locate]')){
        const item = row.__fpItem;
        if (!item) return;
        toggleML(false);
        item.el.scrollIntoView({block:'center', behavior:'smooth'});
        item.el.classList.add('fp-target-pulse');
        setTimeout(()=>item.el.classList.remove('fp-target-pulse'), 2000);
      } else if (e.target.matches('[data-fp-revert]')){
        const item = row.__fpItem;
        if (!item) return;
        revertImage(item);
        render(filter.value.toLowerCase());
      }
    });
    singleIn.addEventListener('change', async (e) => {
      const f = (e.target.files||[])[0];
      singleIn.value = '';
      if (!f || !pendingTarget) return;
      const dataUrl = await readFileAsDataURL(f);
      applyImageReplace(pendingTarget, dataUrl, f.name);
      toast(`Replaced · ${pendingTarget.label}`);
      render(filter.value.toLowerCase());
      pendingTarget = null;
    });

    function render(q=''){
      MLState.items = collectMedia();
      const rows = MLState.items
        .filter(it => !q || it.label.toLowerCase().includes(q) || it.loc.toLowerCase().includes(q))
        .map((it, idx) => {
          const row = document.createElement('div');
          row.className = 'fp-mli';
          row.__fpItem = it;
          const replaced = it.el.dataset.fpReplaced === '1';
          row.innerHTML = `
            <img class="fp-thumb" src="${escapeAttr(it.src)}" alt="" loading="lazy" />
            <div class="fp-info">
              <div class="fp-label">${escapeHTML(it.label)}${replaced?' ·  edited':''}</div>
              <div class="fp-loc">${escapeHTML(it.loc)} · ${it.kind}</div>
            </div>
            <div style="display:flex;gap:.3rem;flex-direction:column">
              <button type="button" data-fp-replace>Replace</button>
              <button type="button" data-fp-locate style="background:rgba(212,168,32,.1);border-color:rgba(212,168,32,.3);color:var(--gold)">Locate</button>
              ${replaced?'<button type="button" data-fp-revert style="background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.2);color:var(--cream)">Revert</button>':''}
            </div>
          `;
          return row;
        });
      list.innerHTML = '';
      rows.forEach(r => list.appendChild(r));
      if (!rows.length){
        list.innerHTML = '<div style="padding:2rem 0;text-align:center;color:rgba(255,255,255,.4);font-size:.8rem">No matches.</div>';
      }
    }

    function toggleML(force){
      MLState.open = (typeof force === 'boolean') ? force : !MLState.open;
      drawer.classList.toggle('fp-open', MLState.open);
      fab.classList.toggle('fp-open', MLState.open);
      if (MLState.open) render(filter.value.toLowerCase());
    }

    // Initial render
    render('');
    // Keep in sync with DOM mutations (sections being wrapped) for first ~3 s
    setTimeout(()=>render(''), 800);
    setTimeout(()=>render(''), 2400);

    window.fpMediaLibrary = { toggle: toggleML, render };
  }

  function applyImageReplace(item, dataUrl, fileName){
    const stamp = Date.now();
    item.el.dataset.fpReplaced = '1';
    item.el.dataset.fpFile = fileName || '';
    if (item.kind === 'img'){
      if (!item.el.dataset.fpOrig) item.el.dataset.fpOrig = item.el.src;
      item.el.src = dataUrl;
      item.el.removeAttribute('srcset');
    } else if (item.kind === 'poster'){
      if (!item.el.dataset.fpOrigPoster) item.el.dataset.fpOrigPoster = item.el.poster;
      item.el.poster = dataUrl;
    }
    persistOne(item, dataUrl, fileName, stamp);
  }
  function revertImage(item){
    if (item.kind === 'img' && item.el.dataset.fpOrig){
      item.el.src = item.el.dataset.fpOrig;
    } else if (item.kind === 'poster' && item.el.dataset.fpOrigPoster){
      item.el.poster = item.el.dataset.fpOrigPoster;
    }
    delete item.el.dataset.fpReplaced;
    delete item.el.dataset.fpFile;
    persistRemove(item);
  }

  /* ------- Persistence: localStorage + export-to-files ------- */
  const STORE_KEY = 'fp:media:v1';
  function readStore(){
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); }
    catch { return {}; }
  }
  function writeStore(s){ localStorage.setItem(STORE_KEY, JSON.stringify(s)); }

  function keyFor(item){
    // stable key: location + label + index among siblings
    const sec = item.el.closest('section, footer, header') || document.body;
    const all = $$('img, video[poster]', sec);
    const idx = all.indexOf(item.el);
    return `${locOf(item.el)}::${item.kind}::${idx}::${item.label}`;
  }

  function persistOne(item, dataUrl, fileName, stamp){
    const s = readStore();
    s[keyFor(item)] = { dataUrl, fileName, stamp, kind: item.kind };
    writeStore(s);
  }
  function persistRemove(item){
    const s = readStore();
    delete s[keyFor(item)];
    writeStore(s);
  }
  function restoreFromStore(){
    const s = readStore();
    if (!s || !Object.keys(s).length) return;
    const items = collectMedia();
    items.forEach(it => {
      const rec = s[keyFor(it)];
      if (!rec) return;
      if (rec.kind === 'img'){
        if (!it.el.dataset.fpOrig) it.el.dataset.fpOrig = it.el.src;
        it.el.src = rec.dataUrl;
        it.el.removeAttribute('srcset');
      } else if (rec.kind === 'poster'){
        if (!it.el.dataset.fpOrigPoster) it.el.dataset.fpOrigPoster = it.el.poster;
        it.el.poster = rec.dataUrl;
      }
      it.el.dataset.fpReplaced = '1';
      it.el.dataset.fpFile = rec.fileName || '';
    });
  }

  function exportProjectMedia(){
    const s = readStore();
    const entries = Object.entries(s);
    if (!entries.length){ toast('No edits to save', true); return; }
    // Build a JSON manifest + zip-style data URL list (we just trigger downloads of each)
    entries.forEach(([key, rec], i) => {
      const a = document.createElement('a');
      a.href = rec.dataUrl;
      a.download = rec.fileName || `media-${i+1}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
    toast(`Saving ${entries.length} file${entries.length!==1?'s':''}…`);
  }

  /* ------- helpers ------- */
  function readFileAsDataURL(file){
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
  }
  function escapeHTML(s){ return String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  function escapeAttr(s){ return escapeHTML(s); }

  function toast(msg, warn){
    let t = $('.fp-toast');
    if (!t){ t = document.createElement('div'); t.className='fp-toast'; document.body.appendChild(t); }
    t.classList.toggle('fp-warn', !!warn);
    t.textContent = msg;
    t.classList.add('fp-show');
    clearTimeout(t.__h);
    t.__h = setTimeout(()=>t.classList.remove('fp-show'), 1900);
  }

  /* ------------------------------------------------------------------ *
   * BOOT
   * ------------------------------------------------------------------ */
  function boot(){
    cleanHero();
    wrapSections();
    watchCategoryStrip();
    setupReveals();
    setupQuickAdd();
    buildMediaLibrary();
    restoreFromStore();
    // Re-collect after a tick (videos / late images)
    setTimeout(() => {
      setupQuickAdd();
      if (window.fpMediaLibrary) window.fpMediaLibrary.render();
    }, 600);
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
