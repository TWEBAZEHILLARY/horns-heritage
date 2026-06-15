/* ============================================================
   Site Editor — click-to-edit text, images, alignment, styles.
   Save with Ctrl+S (persists to localStorage as a patch on this page).
   Undo with Ctrl+Z. Redo with Ctrl+Shift+Z or Ctrl+Y.
   Toggle edit mode with Ctrl+E.
   ============================================================ */
(function () {
  if (window.__siteEditorLoaded) return;
  window.__siteEditorLoaded = true;

  const STORAGE_KEY = 'site-editor::' + location.pathname;
  const HISTORY_LIMIT = 100;

  // ---------- styles ----------
  const css = `
    .se-editing [data-se-editable]{outline:1px dashed rgba(232,100,26,.55);outline-offset:2px;cursor:text;transition:outline-color .15s}
    .se-editing [data-se-editable]:hover{outline:2px solid #e8641a;outline-offset:2px}
    .se-editing [data-se-editable].se-active{outline:2px solid #d4a820 !important;outline-offset:3px}
    .se-editing img,.se-editing [data-se-bg]{cursor:pointer}
    .se-editing img:hover{outline:2px solid #d4a820;outline-offset:2px}
    .se-editing [data-se-bg]:hover{box-shadow:inset 0 0 0 2px #d4a820}
    .se-editing [contenteditable="true"]{cursor:text;min-width:1ch}
    .se-editing [contenteditable="true"]:focus{outline:2px solid #d4a820;outline-offset:3px;background:rgba(212,168,32,.06)}

    .se-bar{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:2147483600;
      background:rgba(8,6,4,.96);backdrop-filter:blur(14px);
      border:1px solid rgba(212,168,32,.35);border-radius:999px;
      padding:.55rem .9rem;display:flex;gap:.4rem;align-items:center;
      font-family:'Outfit',system-ui,sans-serif;font-size:.72rem;letter-spacing:.06em;
      color:#faf2e0;box-shadow:0 18px 50px rgba(0,0,0,.55), 0 2px 6px rgba(0,0,0,.4);
      cursor:default;user-select:none}
    .se-bar.se-hidden{display:none}
    .se-bar button{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);
      color:#faf2e0;padding:.4rem .75rem;border-radius:999px;cursor:pointer;
      font:inherit;letter-spacing:.08em;text-transform:uppercase;transition:all .15s}
    .se-bar button:hover{background:rgba(212,168,32,.18);border-color:rgba(212,168,32,.5);color:#f0c840}
    .se-bar button:disabled{opacity:.35;cursor:not-allowed}
    .se-bar .se-pill{padding:.4rem .8rem;border-radius:999px;background:rgba(232,100,26,.18);
      border:1px solid rgba(232,100,26,.4);color:#f0c840;text-transform:uppercase;font-weight:600}
    .se-bar .se-status{font-size:.65rem;opacity:.7;min-width:90px;text-align:center}
    .se-bar .se-divider{width:1px;height:18px;background:rgba(255,255,255,.15);margin:0 .15rem}

    .se-toolbar{position:fixed;z-index:2147483601;background:#120e08;
      border:1px solid rgba(212,168,32,.45);border-radius:10px;
      padding:.45rem;display:flex;gap:.25rem;align-items:center;flex-wrap:wrap;
      box-shadow:0 14px 40px rgba(0,0,0,.6);font-family:'Outfit',sans-serif;font-size:.7rem;
      max-width:520px}
    .se-toolbar.se-hidden{display:none}
    .se-toolbar button,.se-toolbar select,.se-toolbar input[type="color"]{
      background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
      color:#faf2e0;padding:.32rem .55rem;border-radius:6px;cursor:pointer;
      font:inherit;min-width:30px;height:30px}
    .se-toolbar button:hover{background:rgba(212,168,32,.2);color:#f0c840}
    .se-toolbar button.se-on{background:rgba(232,100,26,.35);color:#fff;border-color:#e8641a}
    .se-toolbar input[type="color"]{padding:2px;width:34px}
    .se-toolbar .se-sep{width:1px;height:20px;background:rgba(255,255,255,.15);margin:0 .15rem}
    .se-toolbar select{cursor:pointer}

    .se-toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:2147483602;
      background:rgba(26,61,30,.96);color:#f0c840;padding:.7rem 1.4rem;border-radius:999px;
      font-family:'Outfit',sans-serif;font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;
      border:1px solid rgba(212,168,32,.4);box-shadow:0 10px 30px rgba(0,0,0,.5);
      opacity:0;transition:opacity .25s, transform .25s;pointer-events:none}
    .se-toast.se-show{opacity:1;transform:translateX(-50%) translateY(-6px)}
    .se-toast.se-warn{background:rgba(122,46,14,.97);color:#fff}

    .se-help{position:fixed;bottom:80px;right:18px;z-index:2147483600;
      background:rgba(8,6,4,.97);border:1px solid rgba(212,168,32,.3);border-radius:10px;
      padding:.9rem 1rem;font-family:'Outfit',sans-serif;font-size:.7rem;color:#faf2e0;
      max-width:240px;line-height:1.7;box-shadow:0 14px 40px rgba(0,0,0,.55);
      display:none}
    .se-help.se-show{display:block}
    .se-help h4{font-family:'Cinzel',serif;color:#d4a820;font-size:.75rem;letter-spacing:.1em;margin-bottom:.5rem;text-transform:uppercase}
    .se-help kbd{background:rgba(212,168,32,.15);border:1px solid rgba(212,168,32,.3);
      border-radius:4px;padding:1px 6px;font-family:'JetBrains Mono',monospace;font-size:.65rem;color:#f0c840}
    .se-help .row{display:flex;justify-content:space-between;gap:.5rem;align-items:center;padding:.15rem 0}

    body.se-editing{cursor:default !important}
    body.se-editing #cx,body.se-editing #cr{display:none !important}
  `;
  const styleEl = document.createElement('style');
  styleEl.id = 'se-styles';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ---------- mark editable elements ----------
  function markEditables() {
    // Text-bearing elements
    const textSel = 'h1,h2,h3,h4,h5,h6,p,li,a,button,span,small,strong,em,blockquote,figcaption,label,td,th,dt,dd';
    document.querySelectorAll(textSel).forEach((el) => {
      // skip if it contains block-level kids (we'll edit deeper)
      if (el.closest('.se-bar,.se-toolbar,.se-toast,.se-help,#cx,#cr')) return;
      if (el.querySelector(textSel)) return; // only leaf text holders
      if (!el.textContent.trim()) return;
      if (!el.dataset.seId) el.dataset.seId = uid();
      el.dataset.seEditable = 'text';
    });
    // Images
    document.querySelectorAll('img').forEach((img) => {
      if (img.closest('.se-bar,.se-toolbar')) return;
      if (!img.dataset.seId) img.dataset.seId = uid();
      img.dataset.seEditable = 'image';
    });
    // Elements with background-image
    document.querySelectorAll('*').forEach((el) => {
      if (el.closest('.se-bar,.se-toolbar,.se-toast,.se-help')) return;
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg !== 'none' && bg.includes('url(')) {
        if (!el.dataset.seId) el.dataset.seId = uid();
        el.dataset.seBg = '1';
      }
    });
    // Alignable containers (rows/grids/sections) -> give an id for alignment edits
    document.querySelectorAll('section,div,header,footer,article,nav,main,aside').forEach((el) => {
      if (el.closest('.se-bar,.se-toolbar,.se-toast,.se-help')) return;
      if (!el.dataset.seId) el.dataset.seId = uid();
    });
  }

  function uid() {
    return 'se' + Math.random().toString(36).slice(2, 9);
  }

  // ---------- patch storage ----------
  // Each patch: { id, type: 'text'|'html'|'src'|'style'|'attr', value, prop? }
  let patches = {}; // id -> array of patches collapsed by type/prop

  function loadPatches() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) patches = JSON.parse(raw) || {};
    } catch (e) { patches = {}; }
  }

  function savePatches() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patches));
    showToast('Saved ✓');
  }

  function applyPatches() {
    Object.keys(patches).forEach((id) => {
      const el = document.querySelector(`[data-se-id="${id}"]`);
      if (!el) return;
      const list = patches[id];
      list.forEach((p) => applySingle(el, p));
    });
  }

  function applySingle(el, p) {
    if (p.type === 'text') el.textContent = p.value;
    else if (p.type === 'html') el.innerHTML = p.value;
    else if (p.type === 'src') el.src = p.value;
    else if (p.type === 'style') el.style.setProperty(p.prop, p.value, 'important');
    else if (p.type === 'attr') el.setAttribute(p.prop, p.value);
    else if (p.type === 'bg') el.style.setProperty('background-image', `url(${p.value})`, 'important');
  }

  function recordPatch(id, patch) {
    if (!patches[id]) patches[id] = [];
    // collapse by type+prop
    const key = patch.type + (patch.prop || '');
    patches[id] = patches[id].filter((p) => (p.type + (p.prop || '')) !== key);
    patches[id].push(patch);
  }

  // ---------- history (undo/redo) ----------
  const history = [];
  let historyIdx = -1;

  function pushHistory(action) {
    // action: { id, before:{type,prop,value}, after:{...} }
    if (historyIdx < history.length - 1) history.length = historyIdx + 1;
    history.push(action);
    if (history.length > HISTORY_LIMIT) history.shift();
    historyIdx = history.length - 1;
    updateBar();
  }

  function undo() {
    if (historyIdx < 0) return;
    const a = history[historyIdx--];
    const el = document.querySelector(`[data-se-id="${a.id}"]`);
    if (el) {
      if (a.before) applySingle(el, a.before); else revertField(el, a.after);
      // update patches: remove the latest of this type/prop and reapply previous from history
      rebuildPatchFor(a.id);
    }
    updateBar();
    showToast('Undid');
  }

  function redo() {
    if (historyIdx >= history.length - 1) return;
    const a = history[++historyIdx];
    const el = document.querySelector(`[data-se-id="${a.id}"]`);
    if (el) {
      applySingle(el, a.after);
      rebuildPatchFor(a.id);
    }
    updateBar();
    showToast('Redid');
  }

  function revertField(el, after) {
    // best effort: clear style if 'style', remove src if 'src' etc.
    if (after.type === 'style') el.style.removeProperty(after.prop);
    else if (after.type === 'attr') el.removeAttribute(after.prop);
  }

  function rebuildPatchFor(id) {
    // walk history up to historyIdx, take last action per type/prop for this id
    patches[id] = [];
    for (let i = 0; i <= historyIdx; i++) {
      const a = history[i];
      if (a.id !== id) continue;
      recordPatch(id, a.after);
    }
    if (patches[id].length === 0) delete patches[id];
  }

  // ---------- edit mode ----------
  let editing = false;
  let activeEl = null;

  function setEditing(on) {
    editing = on;
    document.body.classList.toggle('se-editing', on);
    if (on) {
      document.querySelectorAll('[data-se-editable="text"]').forEach((el) => {
        el.setAttribute('contenteditable', 'true');
      });
      bar.classList.remove('se-hidden');
      help.classList.add('se-show');
    } else {
      document.querySelectorAll('[contenteditable]').forEach((el) => el.removeAttribute('contenteditable'));
      hideToolbar();
      help.classList.remove('se-show');
    }
    updateBar();
  }

  // ---------- text editing ----------
  document.addEventListener('input', (e) => {
    if (!editing) return;
    const el = e.target.closest('[data-se-editable="text"]');
    if (!el) return;
    el.dataset.seDirty = '1';
  });

  document.addEventListener('focusin', (e) => {
    if (!editing) return;
    const el = e.target.closest('[data-se-editable="text"]');
    if (el) {
      activeEl = el;
      el.dataset.seBefore = el.textContent;
      el.classList.add('se-active');
      showInlineToolbar(el);
    }
  });

  document.addEventListener('focusout', (e) => {
    if (!editing) return;
    const el = e.target.closest('[data-se-editable="text"]');
    if (el && el.dataset.seDirty) {
      const before = el.dataset.seBefore || '';
      const after = el.textContent;
      if (before !== after) {
        const action = {
          id: el.dataset.seId,
          before: { type: 'text', value: before },
          after: { type: 'text', value: after },
        };
        recordPatch(el.dataset.seId, action.after);
        pushHistory(action);
      }
      delete el.dataset.seDirty;
      delete el.dataset.seBefore;
    }
    if (el) el.classList.remove('se-active');
  });

  // ---------- image click → replace ----------
  document.addEventListener('click', (e) => {
    if (!editing) return;
    const img = e.target.closest('img');
    const bgEl = e.target.closest('[data-se-bg]');
    if (img && !img.closest('.se-bar,.se-toolbar')) {
      e.preventDefault();
      pickImage((dataUrl) => {
        const before = { type: 'src', value: img.src };
        img.src = dataUrl;
        const after = { type: 'src', value: dataUrl };
        recordPatch(img.dataset.seId, after);
        pushHistory({ id: img.dataset.seId, before, after });
      });
      return;
    }
    if (bgEl && !e.target.closest('[data-se-editable="text"]') && !bgEl.querySelector('[data-se-editable="text"]:hover')) {
      // only hijack if direct click on the bg element area not on text
      if (e.target === bgEl) {
        e.preventDefault();
        pickImage((dataUrl) => {
          const id = bgEl.dataset.seId;
          const prevBg = bgEl.style.backgroundImage || getComputedStyle(bgEl).backgroundImage;
          const before = { type: 'style', prop: 'background-image', value: prevBg };
          bgEl.style.setProperty('background-image', `url(${dataUrl})`, 'important');
          const after = { type: 'style', prop: 'background-image', value: `url(${dataUrl})` };
          recordPatch(id, after);
          pushHistory({ id, before, after });
        });
      }
    }
  }, true);

  function pickImage(cb) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const f = input.files && input.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => cb(reader.result);
      reader.readAsDataURL(f);
    };
    input.click();
  }

  // ---------- inline toolbar (alignment + style) ----------
  const toolbar = document.createElement('div');
  toolbar.className = 'se-toolbar se-hidden';
  toolbar.innerHTML = `
    <button data-cmd="bold" title="Bold (Ctrl+B)"><b>B</b></button>
    <button data-cmd="italic" title="Italic"><i>I</i></button>
    <button data-cmd="underline" title="Underline"><u>U</u></button>
    <span class="se-sep"></span>
    <button data-align="left" title="Align left">⇤</button>
    <button data-align="center" title="Align center">↔</button>
    <button data-align="right" title="Align right">⇥</button>
    <button data-align="justify" title="Justify">≡</button>
    <span class="se-sep"></span>
    <select data-style="font-size" title="Font size">
      <option value="">size</option>
      <option value=".75rem">XS</option>
      <option value=".9rem">S</option>
      <option value="1rem">M</option>
      <option value="1.25rem">L</option>
      <option value="1.6rem">XL</option>
      <option value="2.2rem">2XL</option>
      <option value="3rem">3XL</option>
      <option value="4rem">4XL</option>
    </select>
    <select data-style="font-weight" title="Weight">
      <option value="">weight</option>
      <option value="300">300</option>
      <option value="400">400</option>
      <option value="500">500</option>
      <option value="600">600</option>
      <option value="700">700</option>
      <option value="900">900</option>
    </select>
    <input type="color" data-style="color" title="Text color">
    <span class="se-sep"></span>
    <button data-pad="up" title="More padding">+pad</button>
    <button data-pad="down" title="Less padding">−pad</button>
    <button data-margin="up" title="More margin">+mar</button>
    <button data-margin="down" title="Less margin">−mar</button>
    <span class="se-sep"></span>
    <button data-action="reset" title="Reset this element">↺</button>
  `;
  document.body.appendChild(toolbar);

  function showInlineToolbar(el) {
    if (!editing) return;
    const r = el.getBoundingClientRect();
    toolbar.classList.remove('se-hidden');
    // measure
    const tw = toolbar.offsetWidth || 480;
    let top = r.top - 46;
    if (top < 8) top = r.bottom + 8;
    let left = r.left;
    if (left + tw > window.innerWidth - 12) left = window.innerWidth - tw - 12;
    if (left < 12) left = 12;
    toolbar.style.top = top + 'px';
    toolbar.style.left = left + 'px';
  }

  function hideToolbar() {
    toolbar.classList.add('se-hidden');
  }

  toolbar.addEventListener('mousedown', (e) => {
    // prevent the editable from losing focus before we act
    e.preventDefault();
  });

  toolbar.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn || !activeEl) return;
    const id = activeEl.dataset.seId;
    if (btn.dataset.cmd) {
      document.execCommand(btn.dataset.cmd, false, null);
      const before = { type: 'html', value: activeEl.dataset.seBefore || activeEl.innerHTML };
      const after = { type: 'html', value: activeEl.innerHTML };
      recordPatch(id, after);
      pushHistory({ id, before, after });
      return;
    }
    if (btn.dataset.align) {
      const before = { type: 'style', prop: 'text-align', value: activeEl.style.textAlign || '' };
      activeEl.style.setProperty('text-align', btn.dataset.align, 'important');
      const after = { type: 'style', prop: 'text-align', value: btn.dataset.align };
      recordPatch(id, after);
      pushHistory({ id, before, after });
      return;
    }
    if (btn.dataset.pad) {
      const cur = parseFloat(getComputedStyle(activeEl).padding) || 0;
      const next = btn.dataset.pad === 'up' ? cur + 8 : Math.max(0, cur - 8);
      const before = { type: 'style', prop: 'padding', value: activeEl.style.padding || '' };
      activeEl.style.setProperty('padding', next + 'px', 'important');
      const after = { type: 'style', prop: 'padding', value: next + 'px' };
      recordPatch(id, after);
      pushHistory({ id, before, after });
      return;
    }
    if (btn.dataset.margin) {
      const cur = parseFloat(getComputedStyle(activeEl).margin) || 0;
      const next = btn.dataset.margin === 'up' ? cur + 8 : Math.max(0, cur - 8);
      const before = { type: 'style', prop: 'margin', value: activeEl.style.margin || '' };
      activeEl.style.setProperty('margin', next + 'px', 'important');
      const after = { type: 'style', prop: 'margin', value: next + 'px' };
      recordPatch(id, after);
      pushHistory({ id, before, after });
      return;
    }
    if (btn.dataset.action === 'reset') {
      const before = patches[id] ? JSON.parse(JSON.stringify(patches[id])) : null;
      delete patches[id];
      // wipe inline styles + restore initial text guess
      activeEl.removeAttribute('style');
      pushHistory({ id, before: { type: 'reset', list: before }, after: { type: 'noop' } });
      showToast('Reset');
    }
  });

  toolbar.addEventListener('change', (e) => {
    if (!activeEl) return;
    const id = activeEl.dataset.seId;
    const t = e.target;
    if (t.dataset.style) {
      const prop = t.dataset.style;
      const val = t.value;
      if (!val) return;
      const before = { type: 'style', prop, value: activeEl.style.getPropertyValue(prop) || '' };
      activeEl.style.setProperty(prop, val, 'important');
      const after = { type: 'style', prop, value: val };
      recordPatch(id, after);
      pushHistory({ id, before, after });
    }
  });

  // ---------- bottom bar ----------
  const bar = document.createElement('div');
  bar.className = 'se-bar se-hidden';
  bar.innerHTML = `
    <span class="se-pill">Edit Mode</span>
    <span class="se-divider"></span>
    <button data-act="save" title="Save (Ctrl+S)">💾 Save</button>
    <button data-act="undo" title="Undo (Ctrl+Z)">↶ Undo</button>
    <button data-act="redo" title="Redo (Ctrl+Shift+Z)">↷ Redo</button>
    <span class="se-divider"></span>
    <button data-act="export" title="Download saved patches">⤓ Export</button>
    <button data-act="import" title="Load saved patches">⤒ Import</button>
    <button data-act="clear" title="Clear all changes">⌫ Reset</button>
    <span class="se-divider"></span>
    <span class="se-status" id="se-status">no changes</span>
    <span class="se-divider"></span>
    <button data-act="exit" title="Exit edit mode (Ctrl+E)">✕ Exit</button>
  `;
  document.body.appendChild(bar);

  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const a = btn.dataset.act;
    if (a === 'save') savePatches();
    else if (a === 'undo') undo();
    else if (a === 'redo') redo();
    else if (a === 'exit') setEditing(false);
    else if (a === 'export') exportPatches();
    else if (a === 'import') importPatches();
    else if (a === 'clear') clearAll();
  });

  function updateBar() {
    const s = document.getElementById('se-status');
    if (!s) return;
    const n = Object.keys(patches).length;
    s.textContent = n ? `${n} change${n !== 1 ? 's' : ''} • ${historyIdx + 1}/${history.length}` : 'no changes';
    bar.querySelector('[data-act="undo"]').disabled = historyIdx < 0;
    bar.querySelector('[data-act="redo"]').disabled = historyIdx >= history.length - 1;
  }

  function exportPatches() {
    const blob = new Blob([JSON.stringify(patches, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'site-patches.json';
    a.click();
  }

  function importPatches() {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'application/json';
    inp.onchange = () => {
      const f = inp.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        try {
          patches = JSON.parse(r.result);
          applyPatches();
          updateBar();
          showToast('Imported');
        } catch (err) { showToast('Bad file', true); }
      };
      r.readAsText(f);
    };
    inp.click();
  }

  function clearAll() {
    if (!confirm('Clear all saved changes for this page?')) return;
    patches = {};
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }

  // ---------- toast ----------
  const toast = document.createElement('div');
  toast.className = 'se-toast';
  document.body.appendChild(toast);
  let toastTimer;
  function showToast(msg, warn) {
    toast.textContent = msg;
    toast.classList.toggle('se-warn', !!warn);
    toast.classList.add('se-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('se-show'), 1400);
  }

  // ---------- help panel ----------
  const help = document.createElement('div');
  help.className = 'se-help';
  help.innerHTML = `
    <h4>Edit shortcuts</h4>
    <div class="row"><span>Toggle edit</span><kbd>Ctrl</kbd>+<kbd>E</kbd></div>
    <div class="row"><span>Save</span><kbd>Ctrl</kbd>+<kbd>S</kbd></div>
    <div class="row"><span>Undo</span><kbd>Ctrl</kbd>+<kbd>Z</kbd></div>
    <div class="row"><span>Redo</span><kbd>Ctrl</kbd>+<kbd>Y</kbd></div>
    <div class="row" style="margin-top:.4rem;opacity:.7;font-size:.65rem;line-height:1.5">
      Click any text to edit. Click an image to replace. Use the popup toolbar for alignment and styles.
    </div>
  `;
  document.body.appendChild(help);

  // ---------- keyboard shortcuts ----------
  document.addEventListener('keydown', (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    const k = e.key.toLowerCase();
    if (k === 'e') {
      e.preventDefault();
      setEditing(!editing);
    } else if (k === 's') {
      e.preventDefault();
      savePatches();
    } else if (k === 'z' && !e.shiftKey) {
      if (!editing) return;
      e.preventDefault();
      undo();
    } else if ((k === 'z' && e.shiftKey) || k === 'y') {
      if (!editing) return;
      e.preventDefault();
      redo();
    }
  });

  // ---------- prevent navigation while editing ----------
  document.addEventListener('click', (e) => {
    if (!editing) return;
    const a = e.target.closest('a');
    if (a && !e.target.closest('.se-bar,.se-toolbar')) {
      e.preventDefault();
    }
    const btn = e.target.closest('button');
    if (btn && !btn.closest('.se-bar,.se-toolbar')) {
      e.preventDefault();
    }
  }, true);

  // ---------- boot ----------
  function boot() {
    markEditables();
    loadPatches();
    applyPatches();
    updateBar();
    // Re-mark after dynamic content finishes
    setTimeout(() => { markEditables(); applyPatches(); }, 600);
    setTimeout(() => { markEditables(); applyPatches(); }, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
