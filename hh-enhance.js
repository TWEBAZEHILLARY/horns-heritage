/* ============================================================
   Horns & Heritage — enhancements
   1) Testimonials carousel (auto-slide + arrows + dots)
   2) Account system (login / signup, localStorage)
   3) Checkout gated behind login → Mobile Money / Airtel
      → delivery address → order confirmation
   All product/price/content text is left untouched.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- small utils ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function parsePrice(text) {
    const t = String(text).replace(/UGX|from|\s/gi, '').trim();
    const mil = /M$/i.test(t), k = /k$/i.test(t);
    const num = parseFloat(t.replace(/[^\d.]/g, ''));
    if (isNaN(num)) return 0;
    if (mil) return num * 1e6;
    if (k) return num * 1e3;
    return num;
  }
  const fmtUGX = (n) => 'UGX ' + Math.round(n).toLocaleString('en-US');

  /* membership tiers (prices/benefits unchanged — used for cart + tagging) */
  const TIERS = {
    bronze:  { name: 'Bronze',  price: 200000,  priceText: 'UGX 200,000 / year',   rank: 1 },
    silver:  { name: 'Silver',  price: 500000,  priceText: 'UGX 500,000 / year',   rank: 2 },
    gold:    { name: 'Gold',    price: 1000000, priceText: 'UGX 1,000,000 / year', rank: 3 },
    premium: { name: 'Premium', price: 2000000, priceText: 'UGX 2,000,000 / year', rank: 4 }
  };

  /* ============================================================
     1) TESTIMONIALS CAROUSEL
     ============================================================ */
  function initCarousel() {
    const track = $('#tcarTrack');
    if (!track) return;
    const slides = $$('.tcar-slide', track);
    if (slides.length < 2) return;
    let i = 0, timer = null;
    const dotsWrap = $('#tcarDots');
    slides.forEach((_, idx) => {
      const d = document.createElement('button');
      d.className = 'tcar-dot' + (idx === 0 ? ' active' : '');
      d.type = 'button';
      d.setAttribute('aria-label', 'Testimonial ' + (idx + 1));
      d.addEventListener('click', () => { go(idx); restart(); });
      dotsWrap.appendChild(d);
    });
    const dots = $$('.tcar-dot', dotsWrap);
    function go(n) {
      i = (n + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-i * 100) + '%)';
      dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
    }
    function next() { go(i + 1); }
    function prev() { go(i - 1); }
    function start() { timer = setInterval(next, 5000); }
    function stop() { clearInterval(timer); }
    function restart() { stop(); start(); }
    $('#tcarNext').addEventListener('click', () => { next(); restart(); });
    $('#tcarPrev').addEventListener('click', () => { prev(); restart(); });
    const root = $('#tcar');
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    // basic swipe
    let sx = null;
    root.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); restart(); }
      sx = null;
    });
    start();
  }

  /* ============================================================
     2) ACCOUNT SYSTEM
     ============================================================ */
  const USER_KEY = 'hh_user';
  const ACCTS_KEY = 'hh_accounts';
  const ORDERS_KEY = 'hh_orders';

  const store = {
    user() { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch (e) { return null; } },
    setUser(u) { u ? localStorage.setItem(USER_KEY, JSON.stringify(u)) : localStorage.removeItem(USER_KEY); },
    accounts() { try { return JSON.parse(localStorage.getItem(ACCTS_KEY)) || {}; } catch (e) { return {}; } },
    saveAccounts(a) { localStorage.setItem(ACCTS_KEY, JSON.stringify(a)); },
    orders() { try { return JSON.parse(localStorage.getItem(ORDERS_KEY)) || []; } catch (e) { return []; } },
    saveOrders(o) { localStorage.setItem(ORDERS_KEY, JSON.stringify(o)); }
  };

  /* ============================================================
     MEMBERSHIP VALIDITY — tags last exactly one year.
     A membership tag carries `membershipExpires` (timestamp set to
     one calendar year after purchase). We don't run a server cron;
     instead the expiry timestamp is stored with the tag and checked
     on every page load and at login (pruneExpiredMembership). When
     the date has passed, the tag is removed from both the active
     session and the saved account, so member-only benefits stop.
     ============================================================ */
  function oneYearFrom(ts) {
    const d = new Date(ts);
    d.setFullYear(d.getFullYear() + 1); // exactly one calendar year later
    return d.getTime();
  }
  function pruneExpiredMembership() {
    const u = store.user();
    if (!u || !u.membership || !u.membershipExpires) return;
    if (Date.now() <= u.membershipExpires) return; // still valid
    const expired = u.membership;
    delete u.membership; delete u.membershipExpires; delete u.membershipSince;
    store.setUser(u);
    const accts = store.accounts();
    if (u.email && accts[u.email]) {
      delete accts[u.email].membership;
      delete accts[u.email].membershipExpires;
      delete accts[u.email].membershipSince;
      store.saveAccounts(accts);
    }
    try { console.info('[H&H] ' + ((TIERS[expired] && TIERS[expired].name) || expired) + ' membership expired — tag removed.'); } catch (e) {}
  }

  function initials(name) {
    return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'H';
  }

  /* ---- account control in the nav ---- */
  function renderAccount() {
    const wrap = $('#accountWrap');
    if (!wrap) return;
    pruneExpiredMembership();
    const u = store.user();
    wrap.innerHTML = '';
    const btn = document.createElement('button');
    btn.className = 'btn btn-ghost account-btn';
    btn.type = 'button';
    if (u) {
      btn.innerHTML = '<span class="avatar-ring">' + esc(initials(u.name)) + '</span><span>Hello, ' + esc(u.name.split(/\s+/)[0]) + '</span>';
    } else {
      btn.innerHTML = '<span>Sign in</span>';
    }
    wrap.appendChild(btn);

    const menu = document.createElement('div');
    menu.className = 'account-menu';
    if (u) {
      const orders = store.orders().filter(o => o.email === u.email);
      menu.innerHTML =
        '<div class="am-head"><strong>' + esc(u.name) + '</strong><span>' + esc(u.email) + '</span>' +
          (u.membership && TIERS[u.membership] ? '<span class="am-badge">Membership: ' + esc(TIERS[u.membership].name) + ' – Paid' + (u.membershipExpires ? ' · renews ' + new Date(u.membershipExpires).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '') + '</span>' : '') +
        '</div>' +
        '<button type="button" data-act="orders">' + icon('bag') + 'My Orders (' + orders.length + ')</button>' +
        '<a href="#members">' + icon('star') + 'Membership</a>' +
        '<button type="button" class="am-logout" data-act="logout">' + icon('out') + 'Log out</button>';
    } else {
      menu.innerHTML =
        '<div class="am-head"><strong>Welcome</strong><span>Log in or create an account</span></div>' +
        '<button type="button" data-act="login">' + icon('in') + 'Log in</button>' +
        '<button type="button" data-act="signup">' + icon('user') + 'Sign up</button>';
    }
    wrap.appendChild(menu);

    btn.addEventListener('click', (e) => { e.stopPropagation(); menu.classList.toggle('open'); });
    menu.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const act = b.dataset.act;
      menu.classList.remove('open');
      if (act === 'logout') { store.setUser(null); renderAccount(); toast('Logged out'); }
      else if (act === 'orders') openOrders();
      else if (act === 'login') openAuth('login');
      else if (act === 'signup') openAuth('signup');
    });
    document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) menu.classList.remove('open'); });
  }

  function icon(name) {
    const p = {
      bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
      star: '<polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9"/>',
      in: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>',
      out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
      user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'
    }[name] || '';
    return '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  }

  /* ============================================================
     MODAL plumbing
     ============================================================ */
  let overlay;
  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.className = 'hh-modal-overlay';
    overlay.id = 'hhModalOverlay';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
    return overlay;
  }
  function openModal(html) {
    ensureOverlay();
    overlay.innerHTML = '<div class="hh-modal" role="dialog" aria-modal="true">' + html + '</div>';
    overlay.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModal));
    requestAnimationFrame(() => overlay.classList.add('open'));
    document.body.style.overflow = 'hidden';
    return overlay.querySelector('.hh-modal');
  }
  function closeModal() {
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { if (!overlay.classList.contains('open')) overlay.innerHTML = ''; }, 280);
  }
  const closeX = '<button class="hh-modal-close" data-close aria-label="Close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';

  function toast(msg) {
    let t = $('#hhToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'hhToast';
      t.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(20px);background:var(--bg-footer);color:var(--cream);padding:12px 22px;border-radius:999px;font-size:.9rem;font-weight:600;z-index:400;box-shadow:0 8px 24px rgba(61,42,26,.3);opacity:0;transition:opacity .25s,transform .25s;pointer-events:none;';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; });
    clearTimeout(t._h);
    t._h = setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(20px)'; }, 2200);
  }

  /* ============================================================
     AUTH modal (login / signup)
     onDone(user) optional callback (used to continue checkout)
     ============================================================ */
  let authMode = 'login';
  let afterAuth = null;
  function openAuth(mode, onDone, note) {
    authMode = mode || 'login';
    afterAuth = onDone || null;
    const m = openModal(
      '<div class="hh-modal-head">' + closeX +
        '<span class="eyebrow" style="background:rgba(212,160,43,.18);color:var(--gold-dark);">Your Account</span>' +
        '<h3 id="authTitle"></h3>' +
        '<p id="authNote">' + (note ? esc(note) : '') + '</p>' +
      '</div>' +
      '<div class="hh-modal-body">' +
        '<div class="auth-tabs">' +
          '<button class="auth-tab" type="button" data-mode="login">Log in</button>' +
          '<button class="auth-tab" type="button" data-mode="signup">Sign up</button>' +
        '</div>' +
        '<form id="authForm" novalidate></form>' +
      '</div>'
    );
    m.querySelectorAll('.auth-tab').forEach(t => t.addEventListener('click', () => { authMode = t.dataset.mode; paintAuth(); }));
    $('#authForm').addEventListener('submit', submitAuth);
    paintAuth();
  }
  function paintAuth() {
    const form = $('#authForm');
    if (!form) return;
    $$('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === authMode));
    $('#authTitle').textContent = authMode === 'login' ? 'Welcome back' : 'Create your account';
    if (authMode === 'login') {
      form.innerHTML =
        field('Email', 'email', 'auth-email', 'you@example.com') +
        field('Password', 'password', 'auth-pass', '••••••••') +
        '<div class="hh-field err" id="authErr"></div>' +
        '<button class="btn btn-primary hh-btn-full" type="submit">Log in</button>' +
        '<small class="switch">New here? <a data-mode="signup">Create an account</a></small>';
    } else {
      form.innerHTML =
        field('Full name', 'text', 'auth-name', 'e.g. Patricia M.') +
        field('Email', 'email', 'auth-email', 'you@example.com') +
        '<div class="hh-form-row">' +
          field('Phone', 'tel', 'auth-phone', 'e.g. 0764 250 125') +
          field('Delivery address / area', 'text', 'auth-addr', 'e.g. Kabula, Lyantonde') +
        '</div>' +
        field('Password', 'password', 'auth-pass', 'Min. 4 characters') +
        '<div class="hh-field err" id="authErr"></div>' +
        '<button class="btn btn-primary hh-btn-full" type="submit">Create account</button>' +
        '<small class="switch">Already a member? <a data-mode="login">Log in</a></small>';
    }
    form.querySelectorAll('.switch a').forEach(a => a.addEventListener('click', () => { authMode = a.dataset.mode; paintAuth(); }));
  }
  function field(label, type, id, ph) {
    return '<div class="hh-field"><label for="' + id + '">' + label + '</label><input id="' + id + '" type="' + type + '" placeholder="' + esc(ph) + '" autocomplete="off"></div>';
  }
  function submitAuth(e) {
    e.preventDefault();
    const err = $('#authErr');
    const fail = (msg) => { if (err) err.textContent = msg; };
    const email = ($('#auth-email').value || '').trim().toLowerCase();
    const pass = ($('#auth-pass').value || '').trim();
    const accts = store.accounts();
    if (!/^\S+@\S+\.\S+$/.test(email)) return fail('Please enter a valid email.');
    if (authMode === 'signup') {
      const name = ($('#auth-name').value || '').trim();
      const phone = ($('#auth-phone').value || '').trim();
      const address = ($('#auth-addr').value || '').trim();
      if (name.length < 2) return fail('Please enter your name.');
      if (pass.length < 4) return fail('Password must be at least 4 characters.');
      if (accts[email]) return fail('That email already has an account — try logging in.');
      accts[email] = { name, password: pass, phone, address };
      store.saveAccounts(accts);
      finishAuth({ name, email, phone, address });
    } else {
      const acc = accts[email];
      if (!acc || acc.password !== pass) return fail('Email or password is incorrect.');
      finishAuth({ name: acc.name, email, phone: acc.phone || '', address: acc.address || '', membership: acc.membership || null });
    }
  }
  function finishAuth(user) {
    store.setUser(user);
    renderAccount();
    closeModal();
    toast('Welcome, ' + user.name.split(/\s+/)[0] + ' 🐂');
    const cb = afterAuth; afterAuth = null;
    if (cb) setTimeout(() => cb(user), 320);
  }

  /* ============================================================
     CART reading (shares localStorage with the page's cart)
     ============================================================ */
  const CART_KEY = 'hh_cart_v1';
  function readCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch (e) { return {}; }
  }
  function cartItems() { return Object.values(readCart()); }
  function cartTotal() { return cartItems().reduce((s, it) => s + it.qty * it.price, 0); }

  /* ============================================================
     3) CHECKOUT FLOW  (gate → payment → address → confirm)
     ============================================================ */
  function startCheckout() {
    if (cartItems().length === 0) return;
    const u = store.user();
    // Membership purchases still require an account (login requirement unchanged).
    const hasMembership = cartItems().some(it => it.membership && TIERS[it.membership]);
    if (!u && hasMembership) {
      openAuth('login', () => openPayment(), 'Please log in or sign up to purchase a membership.');
      return;
    }
    // Everyone else may check out as a guest or signed in.
    openPayment();
  }

  function orderSummaryHTML() {
    const items = cartItems();
    const lines = items.map(it =>
      '<div class="co-line"><span>' + esc(it.name) + ' × ' + it.qty + '</span><span>' + fmtUGX(it.qty * it.price) + '</span></div>'
    ).join('');
    return '<div class="co-summary"><div class="co-lines">' + lines + '</div>' +
      '<div class="co-tot"><span>Total</span><span>' + fmtUGX(cartTotal()) + '</span></div></div>';
  }

  function openPayment(prefill) {
    const u = store.user();
    const prof = prefill || u || { name: '', email: '', phone: '', address: '' };
    const guestBanner = u ? '' :
      '<div class="co-login-note" id="coLoginNote">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>' +
        '<span><a id="coLoginLink" role="button" tabindex="0">Log in</a> to use your saved information, or fill in below.</span>' +
      '</div>';
    const m = openModal(
      closeX +
      '<div class="co-checkout">' +
        '<aside class="co-aside">' +
          '<span class="eyebrow" style="background:rgba(45,106,79,.12);color:var(--primary-green);">Checkout</span>' +
          '<h3>Payment &amp; delivery</h3>' +
          '<p>Pay now via mobile money. We dispatch once your payment is confirmed.</p>' +
        '</aside>' +
        '<div class="co-main">' +
          guestBanner +
          '<div class="co-sec-label">ORDER SUMMARY</div>' +
          orderSummaryHTML() +
          '<div class="co-sec-label">PAYMENT METHOD</div>' +
          '<div class="pay-methods">' +
            payMethod('mtn', 'MTN<br>MoMo', 'MTN Mobile Money', 'Pay to +256764250125', true) +
            payMethod('airtel', 'Airtel<br>Money', 'Airtel Money', 'Pay to 0707 021 806', false) +
          '</div>' +
          '<div class="co-sec-label">DELIVERY DETAILS</div>' +
          '<form id="payForm" novalidate>' +
            '<div class="hh-form-row">' +
              fieldV('Full name', 'text', 'co-name', prof.name) +
              fieldV('Phone', 'tel', 'co-phone', prof.phone) +
            '</div>' +
            fieldV('Email (for your receipt)', 'email', 'co-email', prof.email) +
            fieldV('Delivery address / area', 'text', 'co-addr', prof.address) +
            '<div class="hh-form-row">' +
              fieldV('District', 'text', 'co-district', prof.district || 'Kabula') +
              fieldV('Landmark (optional)', 'text', 'co-landmark', prof.landmark || '') +
            '</div>' +
            '<div class="hh-field err" id="payErr"></div>' +
            '<button class="btn btn-primary hh-btn-full" type="submit">Pay now · ' + fmtUGX(cartTotal()) + '</button>' +
            '<small class="switch" style="color:var(--text-muted);">Free delivery on orders over UGX 100,000 · Kabula Village</small>' +
          '</form>' +
        '</div>' +
      '</div>'
    );
    // Guest "Log in" shortcut → authenticate, then reopen checkout pre-filled
    const loginLink = $('#coLoginLink');
    if (loginLink) {
      const goLogin = () => openAuth('login', () => openPayment(), 'Log in to auto-fill your saved delivery details.');
      loginLink.addEventListener('click', goLogin);
      loginLink.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goLogin(); } });
    }
    // payment method selection
    let method = 'mtn';
    m.querySelectorAll('.pay-method').forEach(pm => {
      pm.addEventListener('click', () => {
        m.querySelectorAll('.pay-method').forEach(x => x.classList.remove('sel'));
        pm.classList.add('sel');
        pm.querySelector('input').checked = true;
        method = pm.dataset.method;
      });
    });
    $('#payForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#co-name').value.trim();
      const phone = $('#co-phone').value.trim();
      const addr = $('#co-addr').value.trim();
      const email = $('#co-email').value.trim();
      const err = $('#payErr');
      if (name.length < 2) return (err.textContent = 'Please enter your name.');
      if (!/[0-9]{7,}/.test(phone.replace(/\s/g, ''))) return (err.textContent = 'Please enter a valid phone number.');
      if (email && !/^\S+@\S+\.\S+$/.test(email)) return (err.textContent = 'Please enter a valid email, or leave it blank.');
      if (addr.length < 3) return (err.textContent = 'Please enter a delivery address.');
      const details = { method, name, phone, addr, email, district: $('#co-district').value.trim(), landmark: $('#co-landmark').value.trim() };
      // Security gate: re-confirm identity if checking out as a guest, or if the
      // buyer edited any of their saved name / phone / delivery details. A signed-in
      // buyer who changed nothing goes straight through.
      const cu = store.user();
      const changed = !cu ||
        (name !== ((cu.name || '').trim())) ||
        (phone !== ((cu.phone || '').trim())) ||
        (addr !== ((cu.address || '').trim()));
      if (changed) confirmIdentity(details);
      else openPaymentRequest(details);
    });
  }

  /* ---- Security re-confirmation before a payment request is sent ----
     Guest → must log in (or sign up). Signed-in buyer who edited details →
     must re-enter their password. Either way, the typed delivery details are
     preserved and carried through to the payment step. */
  function confirmIdentity(details) {
    const u = store.user();
    if (u && u.email) {
      const accts = store.accounts();
      const hasPass = !!(accts[u.email] && accts[u.email].password);
      openModal(
        '<div class="hh-modal-head">' + closeX +
          '<span class="eyebrow" style="background:rgba(45,106,79,.12);color:var(--primary-green);">Confirm identity</span>' +
          '<h3>Confirm it\u2019s you</h3>' +
          '<p>You changed your delivery details, so for your security please re-enter your password before we send the payment request.</p>' +
        '</div>' +
        '<div class="hh-modal-body">' +
          '<form id="reauthForm" novalidate>' +
            '<p class="reauth-as">Signed in as <strong>' + esc(u.email) + '</strong></p>' +
            field('Password', 'password', 'reauth-pass', hasPass ? 'Your account password' : 'No password on file — leave blank') +
            '<div class="hh-field err" id="reauthErr"></div>' +
            '<button class="btn btn-primary hh-btn-full" type="submit">Confirm &amp; continue</button>' +
            '<button class="btn btn-ghost hh-btn-full" id="reauthBack" type="button" style="margin-top:10px;">Back to details</button>' +
          '</form>' +
        '</div>'
      );
      const back = $('#reauthBack');
      if (back) back.addEventListener('click', () => openPayment(prefillFrom(details)));
      $('#reauthForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const pass = ($('#reauth-pass').value || '').trim();
        const err = $('#reauthErr');
        if (hasPass && accts[u.email].password !== pass) return (err.textContent = 'Incorrect password. Please try again.');
        openPaymentRequest(details);
      });
    } else {
      // Guest checkout — require a login (or sign-up) before paying, then continue.
      openAuth('login', () => openPaymentRequest(details), 'Log in to confirm your order before we send the payment request.');
    }
  }
  function prefillFrom(d) {
    return { name: d.name, phone: d.phone, email: d.email, address: d.addr, district: d.district, landmark: d.landmark };
  }
  function payMethod(id, logo, title, sub, sel) {
    return '<label class="pay-method' + (sel ? ' sel' : '') + '" data-method="' + id + '">' +
      '<input type="radio" name="paymethod" value="' + id + '"' + (sel ? ' checked' : '') + '>' +
      '<span class="pm-logo pm-' + id + '">' + logo + '</span>' +
      '<span class="pm-info"><strong>' + title + '</strong><span>' + sub + '</span></span>' +
    '</label>';
  }
  function fieldV(label, type, id, val) {
    return '<div class="hh-field"><label for="' + id + '">' + label + '</label><input id="' + id + '" type="' + type + '" value="' + esc(val || '') + '"></div>';
  }

  function nextOrderRef() {
    // Format: HH-YYYYMMDD-NNN with a per-day sequential counter (localStorage)
    const d = new Date();
    const ymd = d.getFullYear().toString() +
      String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0');
    const KEY = 'hh_order_seq';
    let seq = {};
    try { seq = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { seq = {}; }
    const n = (seq[ymd] || 0) + 1;
    seq[ymd] = n;
    // keep only the latest day to avoid unbounded growth
    localStorage.setItem(KEY, JSON.stringify({ [ymd]: n }));
    return 'HH-' + ymd + '-' + String(n).padStart(3, '0');
  }

  function openPaymentRequest(details) {
    const total = cartTotal();
    const isMTN = details.method === 'mtn';
    const methodName = isMTN ? 'MTN Mobile Money' : 'Airtel Money';
    const prefill = details.phone || (store.user() && store.user().phone) || '';
    const m = openModal(
      '<div class="hh-modal-head">' + closeX +
        '<span class="eyebrow" style="background:rgba(45,106,79,.12);color:var(--primary-green);">Payment</span>' +
        '<h3>Pay ' + fmtUGX(total) + '</h3>' +
        '<p>We\u2019ve sent a ' + esc(methodName) + ' request to your phone. Approve it to confirm this order \u2014 we arrange delivery once payment is received.</p>' +
      '</div>' +
      '<div class="hh-modal-body">' +
        '<div class="co-push">' +
          '<span class="co-push-ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2.5"/><line x1="11" y1="18" x2="13" y2="18"/></svg></span>' +
          '<div class="co-push-txt"><strong>Payment request sent to your phone</strong>' +
            '<p>A request for <strong>' + fmtUGX(total) + '</strong> was sent' + (prefill ? ' to <strong>' + esc(prefill) + '</strong>' : ' to your phone') + '. Open your ' + esc(methodName) + ' app or check for the USSD prompt, then enter your PIN to approve. After paying, tap \u201cI have paid\u201d below.</p>' +
          '</div>' +
        '</div>' +
        orderSummaryHTML() +
        '<form id="momoForm" novalidate>' +
          fieldV('Your ' + methodName + ' number', 'tel', 'momo-num', prefill) +
          '<div style="background:var(--bg-secondary);border:1px solid var(--border-soft);border-radius:12px;padding:14px 16px;margin:6px 0 14px;">' +
            '<div style="font-weight:700;color:var(--text-primary);margin-bottom:6px;">How to pay</div>' +
            '<p style="font-size:.9rem;color:var(--text-secondary);margin-bottom:10px;">Send payment of <strong>' + fmtUGX(total) + '</strong> to:</p>' +
            '<div style="display:flex;flex-direction:column;gap:8px;">' +
              '<div style="display:flex;justify-content:space-between;gap:12px;font-weight:700;' + (isMTN ? 'color:var(--primary-green);' : 'color:var(--text-secondary);') + '"><span>MTN MoMo</span><span>+256764250125</span></div>' +
              '<div style="display:flex;justify-content:space-between;gap:12px;font-weight:700;' + (!isMTN ? 'color:var(--terracotta);' : 'color:var(--text-secondary);') + '"><span>Airtel Money</span><span>0707 021 806</span></div>' +
            '</div>' +
            '<p style="font-size:.85rem;color:var(--text-muted);margin-top:12px;">Then tap <strong>\u201cI have paid\u201d</strong> to confirm. You\u2019ll get a WhatsApp &amp; email confirmation right away.</p>' +
          '</div>' +
          '<div class="hh-field err" id="momoErr"></div>' +
          '<button class="btn btn-primary hh-btn-full" type="submit">I have paid</button>' +
          '<button class="btn btn-ghost hh-btn-full" id="momoBack" type="button" style="margin-top:10px;">Back to details</button>' +
        '</form>' +
      '</div>'
    );
    const back = $('#momoBack');
    if (back) back.addEventListener('click', () => openPayment());
    $('#momoForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const num = $('#momo-num').value.trim();
      const err = $('#momoErr');
      if (!/[0-9]{7,}/.test(num.replace(/\s/g, ''))) return (err.textContent = 'Please enter the mobile money number you paid from.');
      confirmOrder(Object.assign({}, details, { momo: num }));
    });
  }

  function confirmOrder(details) {
    const u = store.user() || {};
    const items = cartItems();
    const total = cartTotal();
    const ref = nextOrderRef();
    const email = (details.email || u.email || '').trim();
    const order = {
      ref, email: email, date: new Date().toISOString(),
      items: items.map(it => ({ name: it.name, qty: it.qty, price: it.price })),
      total, method: details.method, delivery: details
    };
    const orders = store.orders(); orders.push(order); store.saveOrders(orders);

    // ---- Remember delivery details on the signed-in profile (for auto-fill) ----
    if (u && u.email) {
      u.name = details.name || u.name;
      u.phone = details.phone || u.phone;
      u.address = details.addr || u.address;
      store.setUser(u);
      const acc = store.accounts();
      if (acc[u.email]) {
        acc[u.email].name = u.name;
        acc[u.email].phone = u.phone;
        acc[u.email].address = u.address;
        store.saveAccounts(acc);
      }
    }

    // ---- Membership tagging: any membership item in this order tags the profile ----
    const memItems = items.filter(it => it.membership && TIERS[it.membership]);
    if (memItems.length) {
      let best = u.membership || null;
      memItems.forEach(it => { if (!best || TIERS[it.membership].rank > TIERS[best].rank) best = it.membership; });
      u.membership = best;
      u.membershipSince = Date.now();
      u.membershipExpires = oneYearFrom(u.membershipSince); // tag valid for exactly one year
      store.setUser(u);
      const accts = store.accounts();
      if (u.email && accts[u.email]) {
        accts[u.email].membership = best;
        accts[u.email].membershipSince = u.membershipSince;
        accts[u.email].membershipExpires = u.membershipExpires;
        store.saveAccounts(accts);
      }
      renderAccount();
      updateTierBadges();
      toast('Membership activated: ' + TIERS[best].name + ' 🎉');
    }

    // clear the page cart + refresh its UI
    localStorage.setItem(CART_KEY, JSON.stringify({}));
    syncPageCart();

    const methodName = details.method === 'mtn' ? 'MTN Mobile Money' : 'Airtel Money';
    const DELIVERY_ESTIMATE = 'Delivery within 24–48 hours in Kabula Village';
    const THANK_YOU = 'Thank you for supporting Horns & Heritage – a family ranch since 1947.';
    const summaryLines = items.map(it => '• ' + it.name + ' × ' + it.qty + ' = ' + fmtUGX(it.qty * it.price));

    // ---- WhatsApp confirmation (order summary + delivery estimate + thanks) ----
    const waLines = ['Hello Horns & Heritage,', '', 'Order ' + ref + ' confirmed:', ''];
    summaryLines.forEach(l => waLines.push(l));
    waLines.push('', 'Total: ' + fmtUGX(total), 'Paid via: ' + methodName + (details.momo ? ' (' + details.momo + ')' : ''),
      'Deliver to: ' + details.name + ', ' + details.addr + (details.district ? ', ' + details.district : ''),
      'Phone: ' + details.phone, '', DELIVERY_ESTIMATE, '', THANK_YOU);
    const waURL = 'https://wa.me/256764250125?text=' + encodeURIComponent(waLines.join('\n'));

    // ---- Email confirmation (prefilled receipt to the customer) ----
    const mailBody = [
      'Hi ' + details.name.split(/\s+/)[0] + ',', '',
      'Thank you for your order with Horns & Heritage.',
      'Order number: ' + ref, '',
      'Order summary:',
      ...summaryLines, '',
      'Total: ' + fmtUGX(total),
      'Payment: ' + methodName + ' — paid',
      'Deliver to: ' + details.addr + (details.district ? ', ' + details.district : ''), '',
      DELIVERY_ESTIMATE, '', THANK_YOU, '',
      'Horns & Heritage · hello@hornsheritage.ug'
    ].join('\n');
    const mailURL = 'mailto:' + encodeURIComponent(email) +
      '?subject=' + encodeURIComponent('Horns & Heritage — Order ' + ref) +
      '&body=' + encodeURIComponent(mailBody);
    const emailBtn = email
      ? '<a class="btn btn-secondary" href="' + mailURL + '">Email me a receipt</a>'
      : '';

    openModal(
      '<div class="hh-modal-body"><div class="co-done">' +
        '<div class="co-check"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>' +
        '<h3>Order confirmed!</h3>' +
        '<p>Thank you, ' + esc(details.name.split(/\s+/)[0]) + '. We\'ve received your ' +
          (details.method === 'mtn' ? 'MTN Mobile Money' : 'Airtel Money') + ' payment and will dispatch your order.</p>' +
        '<p class="co-ref">Order ' + esc(ref) + ' · ' + fmtUGX(total) + '</p>' +
        '<p class="co-eta">' + DELIVERY_ESTIMATE + '</p>' +
        '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:22px;">' +
          '<a class="btn btn-primary" href="' + waURL + '" target="_blank" rel="noopener">Send copy on WhatsApp</a>' +
          emailBtn +
          '<button class="btn btn-ghost" data-close type="button">Done</button>' +
        '</div>' +
      '</div></div>'
    );
    overlay.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModal));
  }

  function openOrders() {
    const u = store.user(); if (!u) return openAuth('login');
    const orders = store.orders().filter(o => o.email === u.email).reverse();
    let body;
    if (!orders.length) {
      body = '<p style="color:var(--text-secondary);text-align:center;padding:24px 0;">No orders yet. Browse The Shop to place your first order.</p>';
    } else {
      body = orders.map(o => {
        const lines = o.items.map(it => '<div class="co-line"><span>' + esc(it.name) + ' × ' + it.qty + '</span><span>' + fmtUGX(it.qty * it.price) + '</span></div>').join('');
        const d = new Date(o.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        return '<div class="co-summary"><div class="co-line" style="font-weight:700;color:var(--primary-green);"><span>' + esc(o.ref) + '</span><span>' + d + '</span></div>' + lines +
          '<div class="co-tot"><span>' + (o.method === 'mtn' ? 'MTN MoMo' : 'Airtel Money') + '</span><span>' + fmtUGX(o.total) + '</span></div></div>';
      }).join('');
    }
    openModal(
      '<div class="hh-modal-head">' + closeX +
        '<span class="eyebrow" style="background:rgba(201,113,76,.12);color:var(--terracotta);">Account</span>' +
        '<h3>My Orders</h3></div>' +
      '<div class="hh-modal-body">' + body + '</div>'
    );
  }

  /* ============================================================
     Hook the existing checkout button (replace its WhatsApp-only
     handler with the gated flow) + keep page cart UI in sync.
     ============================================================ */
  function syncPageCart() {
    // Prefer the page's own authoritative renderer — it rebuilds the item
    // rows, total AND empty-state correctly from storage. (Our old partial
    // refresh wiped the rows without rebuilding them, leaving a blank drawer
    // with a stale total.)
    if (typeof window.hhSyncCart === 'function') {
      window.hhSyncCart();
    } else {
      // Fallback: legacy partial refresh.
      const items = cartItems();
      const count = items.reduce((s, it) => s + it.qty, 0);
      const countEl = $('#cartCount');
      if (countEl) { countEl.textContent = count; countEl.classList.toggle('visible', count > 0); }
      const totalEl = $('#cartTotal');
      if (totalEl) totalEl.textContent = fmtUGX(cartTotal());
      const itemsEl = $('#cartItems');
      if (itemsEl) {
        itemsEl.querySelectorAll('.cart-item').forEach(n => n.remove());
        const empty = $('#cartEmpty');
        if (empty) empty.style.display = items.length ? 'none' : '';
      }
    }
    // Keep the LIVE checkout button (it was replaced via cloneNode in
    // hookCheckout, so the page's stale reference can't toggle it).
    const checkout = $('#cartCheckout');
    if (checkout) checkout.disabled = cartItems().length === 0;
  }

  function hookCheckout() {
    const btn = $('#cartCheckout');
    if (!btn) return;
    // clone to drop the page's existing WhatsApp click listener
    const fresh = btn.cloneNode(true);
    fresh.innerHTML =
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg> Proceed to Checkout';
    btn.parentNode.replaceChild(fresh, btn);
    fresh.addEventListener('click', () => {
      // close the cart sidebar first, then run the flow
      const sb = $('#cartSidebar'), ov = $('#cartOverlay');
      if (sb) sb.classList.remove('open');
      if (ov) ov.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(startCheckout, 180);
    });
    // update the helper line under the button
    const foot = fresh.closest('.cart-foot');
    if (foot) { const sm = foot.querySelector('small'); if (sm) sm.textContent = 'Sign in required · pay via MTN or Airtel on delivery'; }
  }

  /* gentle bag bounce on the nav cart when an item is added */
  function watchAdds() {
    $$('.add-to-cart').forEach(b => b.addEventListener('click', () => {
      if (window.hhBagBounce) window.hhBagBounce();
    }));
  }

  /* member-login form in the Membership section → use real auth */
  function hookMemberLogin() {
    const form = document.querySelector('#member-login form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      openAuth('login');
    }, { once: false });
  }

  /* ---------- Shop unit selectors (per g / per kg) ---------- */
  function initUnitSelectors() {
    $$('.unit-select').forEach(sel => {
      const body = sel.closest('.product-body');
      if (!body) return;
      const price = body.querySelector('.price');
      const base = parseFloat(price && price.dataset.baseKg);
      if (!price || isNaN(base)) return;
      sel.addEventListener('change', () => {
        const u = sel.value;
        const val = u === 'g' ? base / 1000 : base;
        const label = u === 'g' ? '/ gram (g)' : '/ kilogram (kg)';
        price.dataset.unit = u;
        price.innerHTML = 'UGX ' + Math.round(val).toLocaleString('en-US') + ' <small class="unit">' + label + '</small>';
      });
    });
  }

  /* ---------- Track inquiry clicks (for the admin dashboard) ---------- */
  const INQ_KEY = 'hh_inquiries';
  function trackInquiry(name) {
    let data = {};
    try { data = JSON.parse(localStorage.getItem(INQ_KEY)) || {}; } catch (e) { data = {}; }
    data[name] = (data[name] || 0) + 1;
    localStorage.setItem(INQ_KEY, JSON.stringify(data));
  }

  /* ---------- WhatsApp "Inquire" links on cattle listings ---------- */
  function initInquire() {
    $$('.inquire-wa').forEach(a => {
      const name = a.dataset.name || 'this listing';
      const msg = 'Hi, I am interested in ' + name + '. Please share more details and negotiation options.';
      a.href = 'https://wa.me/256764250125?text=' + encodeURIComponent(msg);
      a.target = '_blank';
      a.rel = 'noopener';
      a.addEventListener('click', () => trackInquiry(name));
    });
    // Featured Bull of the Month button keeps its own pre-filled message
    $$('.inquire-bull').forEach(a => {
      a.addEventListener('click', () => trackInquiry(a.dataset.name || 'Featured Bull of the Month'));
    });
  }

  /* ---------- "Continue Shopping" button in the empty cart ---------- */
  function hookContinueShopping() {
    const btn = $('#continueShopping');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const sb = $('#cartSidebar'), ov = $('#cartOverlay');
      if (sb) { sb.classList.remove('open'); sb.setAttribute('aria-hidden', 'true'); }
      if (ov) ov.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  /* ---------- Membership: login gate → cart → paid tag ---------- */
  function hookMembership() {
    $$('.choose-tier').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        chooseMembership(btn.dataset.tier);
      });
    });
  }
  function chooseMembership(tier) {
    if (!TIERS[tier]) return;
    if (!store.user()) {
      openAuth('login', () => addMembershipToCart(tier), 'Please login or sign up to view membership plans and purchase.');
      return;
    }
    addMembershipToCart(tier);
  }
  function addMembershipToCart(tier) {
    const t = TIERS[tier];
    if (!t) return;
    if (window.addToCart) {
      window.addToCart({ id: 'membership-' + tier, name: t.name + ' Membership', priceText: t.priceText, price: t.price, img: null, membership: tier });
    }
    // open the cart sidebar so the user can checkout
    const sb = $('#cartSidebar'), ov = $('#cartOverlay');
    if (sb) { sb.classList.add('open'); sb.setAttribute('aria-hidden', 'false'); }
    if (ov) ov.classList.add('open');
    document.body.style.overflow = 'hidden';
    toast(t.name + ' membership added — checkout to activate');
  }
  function updateTierBadges() {
    pruneExpiredMembership();
    $$('.tier-paid-pill').forEach(p => p.remove());
    const u = store.user();
    if (!u || !u.membership) return;
    const card = document.getElementById('tier-' + u.membership);
    if (card) {
      const pill = document.createElement('span');
      pill.className = 'tier-paid-pill';
      pill.textContent = '✓ Active – Paid';
      card.appendChild(pill);
    }
  }

  /* ---------- boot ---------- */
  function boot() {
    initCarousel();
    renderAccount();
    hookCheckout();
    watchAdds();
    hookMemberLogin();
    initUnitSelectors();
    initInquire();
    hookContinueShopping();
    hookMembership();
    updateTierBadges();
    // keep checkout enabled state correct on open
    const cartBtn = $('#cartBtn');
    if (cartBtn) cartBtn.addEventListener('click', () => setTimeout(syncPageCart, 30));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
