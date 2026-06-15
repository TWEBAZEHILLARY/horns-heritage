/* ============================================================
   Horns & Heritage — Sales Dashboard Command Centre
   Admin-only enhancement. Reads the SAME localStorage the
   storefront already writes; stores its own admin metadata
   under new keys. Does NOT modify any customer-facing page.

   Storefront keys (read):
     hh_orders        [{ref,email,date,items:[{name,qty,price}],total,method,delivery:{name,phone,addr,district}}]
     hh_inquiries     {itemName: clickCount}
     hh_cart_v1       {id:{name,qty,price,...}}   (this device's live cart)
     hh_user          {name,email,phone,...}
     hh_accounts      {email:{name,phone,...}}

   Admin-only keys (written by this dashboard):
     hh_order_status  {ref:{status,payment,reason,updatedAt}}
     hh_stock         {productId:{stock,threshold}}
     hh_goal          number (monthly UGX target)
     hh_inquiry_status{itemName:{status,updatedAt}}
     hh_cart_meta     {sig,firstSeen}
   ============================================================ */
(function () {
  'use strict';

  /* ---- config ---- */
  var SUPPLIER_WA = '256764250125';   // restock contact (edit to your supplier)
  var DEFAULT_GOAL = 10000000;        // UGX 10M monthly target

  var K = {
    orders: 'hh_orders', inq: 'hh_inquiries', cart: 'hh_cart_v1',
    user: 'hh_user', accts: 'hh_accounts',
    status: 'hh_order_status', stock: 'hh_stock', goal: 'hh_goal',
    inqStatus: 'hh_inquiry_status', cartMeta: 'hh_cart_meta'
  };

  /* product catalog (mirrors storefront app.js — read-only seed for stock) */
  var CATALOG = [
    { id:'p1', name:'Ankole Premium Beef Steak', cat:'meat', unit:'per kg' },
    { id:'p2', name:'Ankole Tenderloin', cat:'meat', unit:'per kg' },
    { id:'p3', name:'Fresh Cow Milk', cat:'dairy', unit:'per litre' },
    { id:'p4', name:'Eshabwe — Ghee Sauce', cat:'dairy', unit:'500ml jar' },
    { id:'p5', name:'Yogurt — Cultured Plain', cat:'dairy', unit:'500ml' },
    { id:'p6', name:'Aged Cheese Wheel', cat:'dairy', unit:'400g wheel' },
    { id:'p7', name:'Goat Meat — Fresh Cuts', cat:'goat', unit:'per kg' },
    { id:'p8', name:'Goat Liver — Premium', cat:'goat', unit:'500g' },
    { id:'p9', name:'Goat Milk', cat:'goat', unit:'per litre' },
    { id:'p10', name:'Beef Ribs — BBQ Cut', cat:'meat', unit:'per kg' },
    { id:'p11', name:'Mulokonyi — Beef Bones', cat:'meat', unit:'per kg' },
    { id:'p12', name:'Heritage Gift Box', cat:'gift', unit:'per box' },
    { id:'p13', name:'Beef Liver', cat:'meat', unit:'500g' },
    { id:'p14', name:'Goat Ribs', cat:'goat', unit:'per kg' },
    { id:'p15', name:'Butter — Hand-Churned', cat:'dairy', unit:'250g' },
    { id:'p16', name:"Founders' Box", cat:'gift', unit:'limited' }
  ];
  var CATTLE_NAMES = ['Ankole Longhorn','Ankole Cross','Friesian Dairy Cross','Yearling Bull',
    'Boer Goat','Mubende Indigenous','Saanen Dairy','Kid (Young Goat)'];

  /* default opening stock (admin can edit; persisted after first edit) */
  var DEFAULT_STOCK = { p1:24, p2:9, p3:60, p4:14, p5:30, p6:7, p7:18, p8:12,
    p9:25, p10:11, p11:40, p12:5, p13:16, p14:8, p15:6, p16:3 };

  /* ---- tiny utils ---- */
  function $(id) { return document.getElementById(id); }
  function read(key, fb) { try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fb : v; } catch (e) { return fb; } }
  function write(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
  function fmtUGX(n) { return 'UGX ' + Math.round(n || 0).toLocaleString('en-US'); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]; }); }
  function startOfDay(d) { var x = new Date(d); x.setHours(0,0,0,0); return x; }
  function startOfWeek(d) { var x = startOfDay(d); var day = x.getDay(); x.setDate(x.getDate() - (day === 0 ? 6 : day - 1)); return x; }
  function startOfMonth(d) { var x = startOfDay(d); x.setDate(1); return x; }
  function fmtDate(d) { return new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }); }
  function fmtDateTime(d) { return new Date(d).toLocaleString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }); }
  function normPhone(p) {
    var s = String(p || '').replace(/[^0-9]/g, '');
    if (!s) return '';
    if (s.indexOf('256') === 0) return s;
    if (s.charAt(0) === '0') return '256' + s.slice(1);
    if (s.charAt(0) === '7') return '256' + s;
    return s;
  }

  /* ---- data access ---- */
  function getOrders() { var a = read(K.orders, []); return Array.isArray(a) ? a : []; }
  function getInquiries() { var o = read(K.inq, {}); return (o && typeof o === 'object') ? o : {}; }
  function getStatusMap() { return read(K.status, {}); }
  function getStatus(ref) {
    var m = getStatusMap();
    return m[ref] || { status: 'pending', payment: 'paid', reason: '', updatedAt: null };
  }
  function setStatus(ref, patch) {
    var m = getStatusMap();
    var cur = m[ref] || { status: 'pending', payment: 'paid', reason: '' };
    m[ref] = Object.assign({}, cur, patch, { updatedAt: new Date().toISOString() });
    write(K.status, m);
  }
  function orderKey(o) { return o.ref || (o.date + '|' + o.total); }
  function custKey(o) {
    var d = o.delivery || {};
    return (o.email || d.phone || d.name || 'guest').toString().toLowerCase().trim();
  }
  function custName(o) { var d = o.delivery || {}; return d.name || o.email || 'Guest customer'; }
  function custPhone(o) { var d = o.delivery || {}; return d.phone || ''; }
  function itemsSummary(o, max) {
    var its = o.items || [];
    var parts = its.map(function (it) { return esc(it.name) + ' ×' + (it.qty || 1); });
    if (max && parts.length > max) return parts.slice(0, max).join(', ') + ' +' + (parts.length - max) + ' more';
    return parts.join(', ') || '—';
  }
  function itemCount(o) { return (o.items || []).reduce(function (s, it) { return s + (it.qty || 0); }, 0); }

  /* ============================================================
     PENDING ORDERS
     ============================================================ */
  var poFilter = { date: 'all', status: 'open', from: '', to: '' };

  function inDateRange(d) {
    var t = new Date(d), now = new Date();
    if (poFilter.date === 'today') return t >= startOfDay(now);
    if (poFilter.date === 'week') return t >= startOfWeek(now);
    if (poFilter.date === 'month') return t >= startOfMonth(now);
    if (poFilter.date === 'custom') {
      if (poFilter.from && t < new Date(poFilter.from + 'T00:00:00')) return false;
      if (poFilter.to && t > new Date(poFilter.to + 'T23:59:59')) return false;
      return true;
    }
    return true;
  }
  function matchesStatus(st) {
    if (poFilter.status === 'all') return true;
    if (poFilter.status === 'open') return st === 'pending' || st === 'confirmed';
    return st === poFilter.status;
  }

  function openCount() {
    return getOrders().filter(function (o) {
      var st = getStatus(orderKey(o)).status;
      return st === 'pending' || st === 'confirmed';
    }).length;
  }

  var STATUS_LABEL = { pending:'Pending', confirmed:'Confirmed', delivered:'Delivered', cancelled:'Cancelled' };
  var PAY_LABEL = { paid:'Paid · awaiting dispatch', awaiting:'Awaiting payment' };

  function pendingCard(o) {
    var ref = orderKey(o);
    var s = getStatus(ref);
    var st = s.status, pay = s.payment || 'paid';
    var actions = '';
    var view = '<button class="act act-ghost" data-cc="view" data-ref="' + esc(ref) + '">' + icon('eye') + 'View</button>';
    if (st === 'pending') {
      actions =
        '<button class="act act-confirm" data-cc="confirm" data-ref="' + esc(ref) + '">' + icon('check') + 'Confirm order</button>' +
        '<button class="act act-deliver" data-cc="deliver" data-ref="' + esc(ref) + '">' + icon('truck') + 'Mark delivered</button>' +
        '<button class="act act-cancel" data-cc="cancel" data-ref="' + esc(ref) + '">' + icon('x') + 'Cancel</button>' + view;
    } else if (st === 'confirmed') {
      actions =
        '<button class="act act-deliver" data-cc="deliver" data-ref="' + esc(ref) + '">' + icon('truck') + 'Mark delivered</button>' +
        '<button class="act act-cancel" data-cc="cancel" data-ref="' + esc(ref) + '">' + icon('x') + 'Cancel</button>' + view;
    } else {
      actions = '<button class="act act-ghost" data-cc="reopen" data-ref="' + esc(ref) + '">' + icon('undo') + 'Reopen</button>' + view;
    }
    var cls = st === 'delivered' ? ' is-delivered' : (st === 'cancelled' ? ' is-cancelled' : '');
    return '<div class="po-card' + cls + '">' +
      '<div class="po-top">' +
        '<button class="po-id" data-cc="view" data-ref="' + esc(ref) + '">' + esc(o.ref || '(no ref)') + '</button>' +
        '<div class="po-pills">' +
          '<span class="pill pill-' + st + '">' + STATUS_LABEL[st] + '</span>' +
          '<span class="pill pill-' + (pay === 'awaiting' ? 'awaiting' : 'paid') + '">' + PAY_LABEL[pay] + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="po-meta">' +
        '<div><strong>' + esc(custName(o)) + '</strong>' + (custPhone(o) ? ' · ' + esc(custPhone(o)) : '') + '</div>' +
        '<div class="po-total"><strong>' + fmtUGX(o.total) + '</strong></div>' +
        '<div>Placed ' + fmtDate(o.date) + '</div>' +
      '</div>' +
      '<div class="po-items"><b>Items:</b> ' + itemsSummary(o, 6) + '</div>' +
      '<div class="act-row">' + actions + '</div>' +
    '</div>';
  }

  function renderPending() {
    var host = $('poList'); if (!host) return;
    var orders = getOrders().slice().sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
    var filtered = orders.filter(function (o) {
      return inDateRange(o.date) && matchesStatus(getStatus(orderKey(o)).status);
    });
    var cnt = $('poCount');
    if (cnt) cnt.textContent = filtered.length + (filtered.length === 1 ? ' order' : ' orders');

    if (!orders.length) {
      host.innerHTML = '<div class="empty">No orders recorded on this device yet.<br>Orders placed at checkout appear here automatically.</div>';
    } else if (!filtered.length) {
      host.innerHTML = '<div class="empty">No orders match these filters. Widen the date range or status.</div>';
    } else {
      host.innerHTML = filtered.map(pendingCard).join('');
    }
    // sidebar + topbar badges
    var n = openCount();
    ['pendingBadge', 'pendingBadgeTop'].forEach(function (id) {
      var b = $(id); if (!b) return;
      if (n > 0) { b.classList.add('show'); b.style.display = ''; b.textContent = n > 99 ? '99+' : n; }
      else { b.classList.remove('show'); b.style.display = 'none'; }
    });
  }

  /* ---- order detail modal ---- */
  function findOrder(ref) {
    return getOrders().filter(function (o) { return orderKey(o) === ref; })[0];
  }
  function openDetail(ref) {
    var o = findOrder(ref); if (!o) return;
    var s = getStatus(ref); var d = o.delivery || {};
    var itemLines = (o.items || []).map(function (it) {
      return '<div class="cc-itemline"><span>' + esc(it.name) + ' <b>×' + (it.qty || 1) + '</b></span><span>' + fmtUGX((it.price || 0) * (it.qty || 1)) + '</span></div>';
    }).join('') || '<div class="cc-itemline">No line items recorded.</div>';

    var payToggle = s.payment === 'awaiting'
      ? '<button class="act act-deliver" data-cc="markpaid" data-ref="' + esc(ref) + '">' + icon('check') + 'Mark as paid</button>'
      : '<button class="act act-ghost" data-cc="markawait" data-ref="' + esc(ref) + '">' + icon('clock') + 'Mark awaiting payment</button>';

    var body =
      '<div class="po-pills" style="margin-bottom:14px;">' +
        '<span class="pill pill-' + s.status + '">' + STATUS_LABEL[s.status] + '</span>' +
        '<span class="pill pill-' + (s.payment === 'awaiting' ? 'awaiting' : 'paid') + '">' + PAY_LABEL[s.payment || 'paid'] + '</span>' +
      '</div>' +
      '<div class="cc-detail-row"><span class="k">Customer</span><span class="v">' + esc(custName(o)) + '</span></div>' +
      '<div class="cc-detail-row"><span class="k">Phone</span><span class="v">' + esc(d.phone || '—') + '</span></div>' +
      '<div class="cc-detail-row"><span class="k">Email</span><span class="v">' + esc(o.email || '—') + '</span></div>' +
      '<div class="cc-detail-row"><span class="k">Deliver to</span><span class="v">' + esc((d.addr || '—') + (d.district ? ', ' + d.district : '')) + '</span></div>' +
      '<div class="cc-detail-row"><span class="k">Payment method</span><span class="v">' + (o.method === 'mtn' ? 'MTN MoMo' : (o.method === 'airtel' ? 'Airtel Money' : '—')) + '</span></div>' +
      '<div class="cc-detail-row"><span class="k">Placed</span><span class="v">' + fmtDateTime(o.date) + '</span></div>' +
      (s.reason ? '<div class="cc-detail-row"><span class="k">Cancel reason</span><span class="v">' + esc(s.reason) + '</span></div>' : '') +
      '<div style="margin:16px 0 4px;font-weight:800;color:var(--text-primary);">Items</div>' + itemLines +
      '<div class="cc-detail-row" style="margin-top:6px;border-top:1px solid var(--border-soft);"><span class="k">Order total</span><span class="v" style="font-family:var(--serif);font-size:1.1rem;">' + fmtUGX(o.total) + '</span></div>' +
      '<div class="act-row" style="margin-top:16px;">' + payToggle + '</div>' +
      '<div class="cc-modal-acts">' +
        (s.status === 'pending' ? '<button class="btn" data-cc="confirm" data-ref="' + esc(ref) + '">Confirm order</button>' : '') +
        (s.status !== 'delivered' && s.status !== 'cancelled' ? '<button class="btn btn-ghost" data-cc="deliver" data-ref="' + esc(ref) + '">Mark delivered</button>' : '') +
        (s.status !== 'cancelled' ? '<button class="btn btn-ghost" data-cc="cancel" data-ref="' + esc(ref) + '" style="color:var(--rust);">Cancel order</button>' : '') +
      '</div>';
    showModal('Order ' + esc(o.ref || ''), itemCount(o) + ' items · ' + fmtUGX(o.total), body);
  }

  /* ---- confirmation (WhatsApp + email to customer) ---- */
  function openConfirmDispatch(ref) {
    var o = findOrder(ref); if (!o) return;
    var d = o.delivery || {};
    var lines = ['Hello ' + (d.name ? d.name.split(/\s+/)[0] : 'there') + ',', '',
      'Your Horns & Heritage order ' + (o.ref || '') + ' is confirmed.', '',
      'Order summary:'];
    (o.items || []).forEach(function (it) { lines.push('• ' + it.name + ' × ' + (it.qty || 1)); });
    lines.push('', 'Total: ' + fmtUGX(o.total),
      'Deliver to: ' + (d.addr || '') + (d.district ? ', ' + d.district : ''),
      '', 'We are arranging delivery (within 24–48 hours in Kabula Village).',
      '', 'Thank you for supporting Horns & Heritage — a family ranch since 1947.');
    var msg = lines.join('\n');
    var wa = normPhone(d.phone);
    var waURL = 'https://wa.me/' + (wa || '256764250125') + '?text=' + encodeURIComponent(msg);
    var mail = o.email
      ? 'mailto:' + encodeURIComponent(o.email) + '?subject=' + encodeURIComponent('Horns & Heritage — Order ' + (o.ref || '') + ' confirmed') + '&body=' + encodeURIComponent(msg)
      : '';
    var body =
      '<p style="color:var(--text-secondary);font-size:0.92rem;margin:0 0 16px;">Order <b>' + esc(o.ref || '') + '</b> is marked <b>Confirmed</b>. Send the customer their confirmation now:</p>' +
      '<div class="cc-modal-acts">' +
        '<a class="btn" href="' + waURL + '" target="_blank" rel="noopener">' + icon('whatsapp') + ' WhatsApp confirmation</a>' +
        (mail ? '<a class="btn btn-ghost" href="' + mail + '">Email receipt</a>' : '') +
      '</div>' +
      '<button class="act act-ghost" data-cc="copyconfirm" data-ref="' + esc(ref) + '" style="margin-top:14px;">' + icon('copy') + 'Copy message text</button>' +
      '<p class="cc-help" style="margin-top:14px;">' + (wa ? 'Opens WhatsApp to <b>' + esc(d.phone) + '</b>.' : 'No customer phone on file — opens a blank WhatsApp message you can address manually.') + '</p>';
    window.__ccConfirmMsg = msg;
    showModal('Send confirmation', 'Order ' + esc(o.ref || ''), body);
  }

  /* ============================================================
     PERFORMANCE / MONTHLY GOAL
     ============================================================ */
  function getGoal() { var g = read(K.goal, DEFAULT_GOAL); return (typeof g === 'number' && g > 0) ? g : DEFAULT_GOAL; }
  function renderGoal() {
    var host = $('goalBody'); if (!host) return;
    var orders = getOrders();
    var now = new Date(), mFrom = startOfMonth(now);
    var monthRev = 0, monthOrders = 0;
    orders.forEach(function (o) { if (new Date(o.date) >= mFrom) { monthRev += (o.total || 0); monthOrders += 1; } });
    var goal = getGoal();
    var pct = Math.min(100, Math.round((monthRev / goal) * 100));
    var rawPct = Math.round((monthRev / goal) * 100);
    var dayOfMonth = now.getDate();
    var daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    var dailyAvg = monthRev / Math.max(1, dayOfMonth);
    var projected = dailyAvg * daysInMonth;
    var remaining = Math.max(0, goal - monthRev);
    var monthName = now.toLocaleDateString('en-GB', { month: 'long' });

    host.innerHTML =
      '<div class="goal-head">' +
        '<div><div class="goal-now">' + fmtUGX(monthRev) + '</div>' +
          '<div class="goal-of">of <input type="text" id="goalInput" value="' + goal.toLocaleString('en-US') + '" inputmode="numeric"> UGX target · ' + monthName + '</div></div>' +
        '<div style="text-align:right;"><div class="goal-now" style="color:' + (rawPct >= 100 ? 'var(--gold-dark)' : 'var(--primary-green)') + ';">' + rawPct + '%</div>' +
          '<div class="goal-of">' + monthOrders + ' orders so far</div></div>' +
      '</div>' +
      '<div class="progress' + (rawPct >= 100 ? ' over' : '') + '"><i style="width:' + pct + '%"></i></div>' +
      '<div class="goal-stats">' +
        '<div class="goal-stat"><div class="gv">' + fmtUGX(dailyAvg) + '</div><div class="gl">Daily average</div></div>' +
        '<div class="goal-stat"><div class="gv">' + fmtUGX(projected) + '</div><div class="gl">Projected ' + monthName + '</div></div>' +
        '<div class="goal-stat"><div class="gv">' + fmtUGX(remaining) + '</div><div class="gl">Left to target</div></div>' +
      '</div>';
    var gi = $('goalInput');
    if (gi) {
      gi.addEventListener('change', function () {
        var v = parseInt(String(gi.value).replace(/[^0-9]/g, ''), 10);
        if (v && v > 0) { write(K.goal, v); renderGoal(); toast('Monthly target updated'); }
      });
    }
  }

  /* ============================================================
     LOW STOCK
     ============================================================ */
  function getStock() {
    var s = read(K.stock, null);
    if (!s || typeof s !== 'object') { s = {}; CATALOG.forEach(function (p) { s[p.id] = { stock: DEFAULT_STOCK[p.id] != null ? DEFAULT_STOCK[p.id] : 20, threshold: 10 }; }); }
    CATALOG.forEach(function (p) { if (!s[p.id]) s[p.id] = { stock: DEFAULT_STOCK[p.id] != null ? DEFAULT_STOCK[p.id] : 20, threshold: 10 }; });
    return s;
  }
  function renderStock() {
    var host = $('stockBody'); if (!host) return;
    var stock = getStock();
    var rows = CATALOG.map(function (p) {
      var s = stock[p.id], lvl = s.stock, th = s.threshold || 10;
      return { p: p, lvl: lvl, th: th, low: lvl <= th, crit: lvl <= Math.ceil(th / 2) };
    }).filter(function (r) { return r.low; })
      .sort(function (a, b) { return a.lvl - b.lvl; });

    var lowCnt = $('stockCount');
    if (lowCnt) lowCnt.textContent = rows.length + (rows.length === 1 ? ' item low' : ' items low');

    if (!rows.length) {
      host.innerHTML = '<div class="empty">All products are above their reorder threshold. Nothing to restock.</div>';
    } else {
      host.innerHTML = rows.map(function (r) {
        var pctFill = Math.max(6, Math.min(100, Math.round((r.lvl / Math.max(1, r.th * 2)) * 100)));
        var cls = r.crit ? 'crit' : 'low';
        var note = encodeURIComponent('Hello, this is Horns & Heritage. We need to restock: ' + r.p.name + ' (currently ' + r.lvl + ' ' + r.p.unit + '). Please advise availability.');
        return '<div class="stk-row ' + cls + '">' +
          '<div class="stk-name">' + esc(r.p.name) + '<span>' + esc(r.p.unit) + ' · reorder at ' + r.th + '</span></div>' +
          '<div class="stk-level">' +
            '<div class="stk-bar"><i style="width:' + pctFill + '%"></i></div>' +
            '<input class="stk-num" type="number" min="0" value="' + r.lvl + '" data-cc="stock" data-id="' + r.p.id + '" aria-label="Stock for ' + esc(r.p.name) + '">' +
          '</div>' +
          '<a class="act act-deliver" href="https://wa.me/' + SUPPLIER_WA + '?text=' + note + '" target="_blank" rel="noopener">' + icon('whatsapp') + 'Restock</a>' +
        '</div>';
      }).join('');
    }

    // high-demand cattle (available, high inquiry volume)
    var cattleHost = $('stockCattle'); if (!cattleHost) return;
    var inq = getInquiries();
    var demand = CATTLE_NAMES.map(function (n) { return { name: n, n: inq[n] || 0 }; })
      .filter(function (x) { return x.n >= 3; }).sort(function (a, b) { return b.n - a.n; });
    // fall back: any inquiry not matching a product, treated as cattle interest
    if (!demand.length) {
      var prodNames = {}; CATALOG.forEach(function (p) { prodNames[p.name] = 1; });
      demand = Object.keys(inq).filter(function (k) { return !prodNames[k]; })
        .map(function (k) { return { name: k, n: inq[k] }; })
        .sort(function (a, b) { return b.n - a.n; }).slice(0, 4);
    }
    if (!demand.length) {
      cattleHost.innerHTML = '<div class="empty" style="padding:22px;">No high-demand cattle yet. Animals with many "Inquire" clicks will surface here.</div>';
    } else {
      cattleHost.innerHTML = demand.map(function (x) {
        var note = encodeURIComponent('Horns & Heritage — strong interest in ' + x.name + ' (' + x.n + ' inquiries). Confirm availability / next steps.');
        return '<div class="stk-row low">' +
          '<div class="stk-name">' + esc(x.name) + '<span>' + x.n + ' inquiries · marked Available</span></div>' +
          '<div class="stk-level"><span class="stk-flag">High demand</span></div>' +
          '<a class="act act-deliver" href="https://wa.me/' + SUPPLIER_WA + '?text=' + note + '" target="_blank" rel="noopener">' + icon('whatsapp') + 'Follow up</a>' +
        '</div>';
      }).join('');
    }
  }

  /* ============================================================
     ABANDONED CART (this device)
     ============================================================ */
  function getCartObj() { var c = read(K.cart, {}); return (c && typeof c === 'object') ? c : {}; }
  function cartItemsArr() { return Object.keys(getCartObj()).map(function (k) { return getCartObj()[k]; }); }
  function trackCartMeta() {
    var items = cartItemsArr();
    var sig = items.map(function (it) { return (it.name || '') + ':' + (it.qty || 0); }).sort().join('|');
    var meta = read(K.cartMeta, null);
    if (!items.length) { if (meta) write(K.cartMeta, null); return null; }
    if (!meta || meta.sig !== sig) { meta = { sig: sig, firstSeen: Date.now() }; write(K.cartMeta, meta); }
    return meta;
  }
  function renderCart() {
    var host = $('cartBody'); if (!host) return;
    var items = cartItemsArr();
    var meta = trackCartMeta();
    var TWO_H = 2 * 60 * 60 * 1000;
    if (!items.length || !meta) {
      host.innerHTML = '<div class="empty">No active cart on this device. Abandoned carts appear when items sit unpaid for 2+ hours.</div>';
      return;
    }
    var ageMs = Date.now() - meta.firstSeen;
    var abandoned = ageMs >= TWO_H;
    var total = items.reduce(function (s, it) { return s + (it.price || 0) * (it.qty || 1); }, 0);
    var u = read(K.user, null);
    var contact = u ? (u.name ? u.name + (u.phone ? ' · ' + u.phone : '') + (u.email ? ' · ' + u.email : '') : (u.email || u.phone || '')) : 'Guest (not signed in)';
    var ageLabel = abandoned ? (Math.floor(ageMs / 3600000) + 'h idle') : ('active ' + Math.max(1, Math.floor(ageMs / 60000)) + 'm');
    var lines = items.map(function (it) { return esc(it.name) + ' ×' + (it.qty || 1); }).join(', ');

    host.innerHTML =
      '<div class="cart-card">' +
        '<div class="cart-top">' +
          '<div><strong style="color:var(--text-primary);">' + esc(contact) + '</strong>' +
            '<div style="font-size:0.8rem;color:var(--text-muted);">' + items.length + ' item' + (items.length === 1 ? '' : 's') + ' · ' + fmtUGX(total) + '</div></div>' +
          '<span class="cart-age" style="' + (abandoned ? '' : 'color:var(--secondary-green);') + '">' + (abandoned ? icon('clock') : '') + ' ' + ageLabel + '</span>' +
        '</div>' +
        '<div class="cart-items"><b>In cart:</b> ' + lines + '</div>' +
        '<div class="act-row">' +
          '<button class="act act-confirm" data-cc="remind">' + icon('copy') + 'Copy reminder message</button>' +
          (u && u.phone ? '<a class="act act-deliver" href="https://wa.me/' + normPhone(u.phone) + '?text=' + encodeURIComponent(reminderMsg()) + '" target="_blank" rel="noopener">' + icon('whatsapp') + 'WhatsApp customer</a>' : '') +
        '</div>' +
      '</div>' +
      (abandoned ? '' : '<p class="cc-help">This cart is still active (under 2h). It will be flagged as abandoned if it stays unpaid past 2 hours.</p>');
  }
  function reminderMsg() {
    var items = cartItemsArr();
    var lines = items.map(function (it) { return '• ' + it.name + ' ×' + (it.qty || 1); }).join('\n');
    return 'Hello from Horns & Heritage 🐂\n\nYou left items in your cart:\n' + lines + '\n\nComplete your order now and we\u2019ll arrange fresh delivery within 24–48 hours. Reply here if you need any help!';
  }

  /* ============================================================
     TOP CUSTOMERS (lifetime value)
     ============================================================ */
  function renderCustomers() {
    var host = $('custBody'); if (!host) return;
    var orders = getOrders();
    var map = {};
    orders.forEach(function (o) {
      var k = custKey(o);
      if (!map[k]) map[k] = { name: custName(o), phone: custPhone(o), spent: 0, count: 0 };
      map[k].spent += (o.total || 0); map[k].count += 1;
      if (!map[k].phone && custPhone(o)) map[k].phone = custPhone(o);
    });
    var list = Object.keys(map).map(function (k) { return map[k]; })
      .sort(function (a, b) { return b.spent - a.spent; }).slice(0, 8);
    if (!list.length) {
      host.innerHTML = '<div class="empty">No customer orders yet. Lifetime value builds as orders come in.</div>';
      return;
    }
    host.innerHTML = list.map(function (c, i) {
      return '<div class="cust-row">' +
        '<span class="cust-rank">' + (i + 1) + '</span>' +
        '<div class="cust-who"><strong>' + esc(c.name) + '</strong><span>' + esc(c.phone || 'No phone on file') + '</span></div>' +
        '<div class="cust-val"><b>' + fmtUGX(c.spent) + '</b><span>' + c.count + (c.count === 1 ? ' order' : ' orders') + '</span></div>' +
      '</div>';
    }).join('');
  }

  /* ============================================================
     WHATSAPP INQUIRY LOG
     ============================================================ */
  var INQ_STATUS = ['new', 'contacted', 'converted', 'lost'];
  var INQ_LABEL = { new:'New', contacted:'Contacted', converted:'Converted', lost:'Lost' };
  function getInqStatusMap() { return read(K.inqStatus, {}); }
  function setInqStatus(name, status) {
    var m = getInqStatusMap();
    m[name] = { status: status, updatedAt: new Date().toISOString() };
    write(K.inqStatus, m);
  }
  function renderInquiryLog() {
    var host = $('inqLogBody'); if (!host) return;
    var inq = getInquiries();
    var sm = getInqStatusMap();
    var rows = Object.keys(inq).map(function (name) {
      return { name: name, clicks: inq[name], st: (sm[name] && sm[name].status) || 'new', when: sm[name] && sm[name].updatedAt };
    }).sort(function (a, b) { return b.clicks - a.clicks; });
    if (!rows.length) {
      host.innerHTML = '<tr><td colspan="5" class="empty">No WhatsApp inquiries recorded yet. Clicks on "Inquire" buttons appear here.</td></tr>';
      return;
    }
    host.innerHTML = rows.map(function (r) {
      var opts = INQ_STATUS.map(function (s) { return '<option value="' + s + '"' + (s === r.st ? ' selected' : '') + '>' + INQ_LABEL[s] + '</option>'; }).join('');
      return '<tr>' +
        '<td><strong>' + esc(r.name) + '</strong></td>' +
        '<td class="num">' + r.clicks + '</td>' +
        '<td><span class="pill pill-' + r.st + '">' + INQ_LABEL[r.st] + '</span></td>' +
        '<td>' + (r.when ? fmtDateTime(r.when) : '—') + '</td>' +
        '<td class="num">' +
          '<div class="act-row" style="justify-content:flex-end;">' +
            (r.st === 'new' ? '<button class="act act-deliver" data-cc="contacted" data-name="' + esc(r.name) + '">Mark contacted</button>' : '') +
            '<select class="inq-status" data-cc="inqset" data-name="' + esc(r.name) + '">' + opts + '</select>' +
          '</div>' +
        '</td>' +
      '</tr>';
    }).join('');
  }

  /* ============================================================
     DAILY REPORT
     ============================================================ */
  function newSignupsToday() {
    var accts = read(K.accts, {});
    var today = startOfDay(new Date()).getTime();
    var n = 0, total = 0, dated = false;
    Object.keys(accts || {}).forEach(function (k) {
      total++;
      var a = accts[k] || {};
      var t = a.createdAt || a.created || a.since || a.joined;
      if (t) { dated = true; if (startOfDay(new Date(t)).getTime() === today) n++; }
    });
    return { today: dated ? n : null, total: total };
  }
  function buildReport() {
    var orders = getOrders();
    var now = new Date(), dFrom = startOfDay(now), wFrom = startOfWeek(now);
    var todayRev = 0, todayCnt = 0;
    orders.forEach(function (o) { if (new Date(o.date) >= dFrom) { todayRev += (o.total || 0); todayCnt++; } });
    var pending = openCount();
    // top product this week
    var qty = {};
    orders.forEach(function (o) { if (new Date(o.date) >= wFrom) (o.items || []).forEach(function (it) { qty[it.name] = (qty[it.name] || 0) + (it.qty || 0); }); });
    var topProd = Object.keys(qty).sort(function (a, b) { return qty[b] - qty[a]; })[0];
    // top cattle inquiry
    var inq = getInquiries();
    var topInq = Object.keys(inq).sort(function (a, b) { return inq[b] - inq[a]; })[0];
    var sign = newSignupsToday();
    return {
      dateLabel: now.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' }),
      todayRev: todayRev, todayCnt: todayCnt, pending: pending,
      topProd: topProd ? topProd + ' (' + qty[topProd] + ' sold)' : '—',
      topInq: topInq ? topInq + ' (' + inq[topInq] + ' inquiries)' : '—',
      signups: sign.today != null ? String(sign.today) : (sign.total + ' total customers')
    };
  }
  function reportText() {
    var r = buildReport();
    return [
      'HORNS & HERITAGE — DAILY SALES SNAPSHOT',
      r.dateLabel, '----------------------------------------',
      "Today's revenue:   " + fmtUGX(r.todayRev) + ' (' + r.todayCnt + ' orders)',
      'Pending orders:    ' + r.pending,
      'Top product:       ' + r.topProd,
      'Top cattle inquiry: ' + r.topInq,
      'New signups:       ' + r.signups,
      '----------------------------------------',
      'Generated ' + new Date().toLocaleString('en-GB')
    ].join('\n');
  }
  function fillReportDOM() {
    var r = buildReport(); var host = $('ccReport'); if (!host) return;
    host.innerHTML =
      '<div style="font-family:var(--serif);font-size:1.6rem;color:#1B4D3E;margin-bottom:2px;">Horns &amp; Heritage</div>' +
      '<div style="font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#9B8A77;font-size:0.8rem;margin-bottom:18px;">Daily Sales Snapshot · ' + esc(r.dateLabel) + '</div>' +
      '<table style="width:100%;border-collapse:collapse;font-size:1rem;">' +
        rrow("Today's revenue", fmtUGX(r.todayRev) + ' · ' + r.todayCnt + ' orders') +
        rrow('Pending orders', String(r.pending)) +
        rrow('Top product (this week)', r.topProd) +
        rrow('Top cattle inquiry', r.topInq) +
        rrow('New signups', r.signups) +
      '</table>' +
      '<p style="margin-top:22px;color:#9B8A77;font-size:0.8rem;">Generated ' + esc(new Date().toLocaleString('en-GB')) + ' · Horns &amp; Heritage admin</p>';
    function rrow(k, v) { return '<tr><td style="padding:11px 0;border-bottom:1px solid #E8DDD0;color:#6B5744;font-weight:600;">' + esc(k) + '</td><td style="padding:11px 0;border-bottom:1px solid #E8DDD0;text-align:right;font-weight:700;color:#3D2A1A;">' + esc(v) + '</td></tr>'; }
  }

  /* ============================================================
     MODAL + TOAST + ICONS
     ============================================================ */
  function icon(n) {
    var p = {
      check: '<path d="M20 6 9 17l-5-5"/>',
      x: '<path d="M18 6 6 18M6 6l12 12"/>',
      truck: '<path d="M1 3h15v13H1zM16 8h4l3 3v5h-7"/><circle cx="5.5" cy="18.5" r="1.5"/><circle cx="18.5" cy="18.5" r="1.5"/>',
      eye: '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>',
      undo: '<path d="M3 7v6h6"/><path d="M3 13a9 9 0 1 0 3-7.7L3 8"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
      whatsapp: '<path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.5A10 10 0 1 0 12 2z"/><path d="M8.5 8.5c0 4 3 7 7 7" stroke-width="1.4"/>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (p[n] || '') + '</svg>';
  }
  function showModal(title, sub, bodyHTML) {
    var ov = $('ccModal'); if (!ov) return;
    ov.querySelector('.cc-modal').innerHTML =
      '<div class="cc-modal-head"><div><h3>' + title + '</h3>' + (sub ? '<div class="sub">' + sub + '</div>' : '') + '</div>' +
      '<button class="cc-x" data-cc="closemodal">' + icon('x') + '</button></div>' +
      '<div class="cc-modal-body">' + bodyHTML + '</div>';
    ov.classList.add('show');
  }
  function closeModal() { var ov = $('ccModal'); if (ov) ov.classList.remove('show'); }
  var toastTimer;
  function toast(msg) {
    var t = $('ccToast'); if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2400);
  }
  function copyText(txt, okMsg) {
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast(okMsg || 'Copied to clipboard'); } catch (e) { toast('Copy failed — select manually'); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(function () { toast(okMsg || 'Copied to clipboard'); }, fallback);
    } else fallback();
  }

  /* ============================================================
     EVENT WIRING (delegated)
     ============================================================ */
  function onClick(e) {
    var el = e.target.closest('[data-cc]'); if (!el) return;
    var act = el.getAttribute('data-cc');
    var ref = el.getAttribute('data-ref');
    if (act === 'view') { openDetail(ref); }
    else if (act === 'confirm') { setStatus(ref, { status: 'confirmed', payment: 'paid' }); closeModal(); ccRender(); openConfirmDispatch(ref); }
    else if (act === 'deliver') { setStatus(ref, { status: 'delivered' }); closeModal(); ccRender(); toast('Order marked delivered'); }
    else if (act === 'reopen') { setStatus(ref, { status: 'pending' }); ccRender(); toast('Order reopened'); }
    else if (act === 'markpaid') { setStatus(ref, { payment: 'paid' }); openDetail(ref); ccRender(); }
    else if (act === 'markawait') { setStatus(ref, { payment: 'awaiting' }); openDetail(ref); ccRender(); }
    else if (act === 'cancel') { openCancel(ref); }
    else if (act === 'docancel') {
      var rsn = ($('ccReasonInput') && $('ccReasonInput').value || '').trim();
      setStatus(ref, { status: 'cancelled', reason: rsn }); closeModal(); ccRender(); toast('Order cancelled');
    }
    else if (act === 'copyconfirm') { copyText(window.__ccConfirmMsg || '', 'Confirmation message copied'); }
    else if (act === 'remind') { copyText(reminderMsg(), 'Reminder message copied'); }
    else if (act === 'contacted') { setInqStatus(el.getAttribute('data-name'), 'contacted'); renderInquiryLog(); toast('Marked as contacted'); }
    else if (act === 'closemodal') { closeModal(); }
    else if (act === 'report') { openReport(); }
    else if (act === 'copyreport') { copyText(reportText(), 'Report copied to clipboard'); }
    else if (act === 'printreport') { fillReportDOM(); window.print(); }
  }
  function openCancel(ref) {
    var o = findOrder(ref);
    var body =
      '<label class="cc-label">Reason (optional)</label>' +
      '<textarea class="cc-reason" id="ccReasonInput" placeholder="e.g. Customer requested cancellation, out of stock, duplicate order…"></textarea>' +
      '<div class="cc-modal-acts">' +
        '<button class="btn" data-cc="docancel" data-ref="' + esc(ref) + '" style="background:var(--rust);">Cancel this order</button>' +
        '<button class="btn btn-ghost" data-cc="closemodal">Keep order</button>' +
      '</div>';
    showModal('Cancel order ' + esc(o ? o.ref : ''), 'This marks the order cancelled', body);
  }
  function openReport() {
    var r = buildReport();
    var body =
      '<div class="cc-detail-row"><span class="k">Date</span><span class="v">' + esc(r.dateLabel) + '</span></div>' +
      '<div class="cc-detail-row"><span class="k">Today\u2019s revenue</span><span class="v">' + fmtUGX(r.todayRev) + ' · ' + r.todayCnt + ' orders</span></div>' +
      '<div class="cc-detail-row"><span class="k">Pending orders</span><span class="v">' + r.pending + '</span></div>' +
      '<div class="cc-detail-row"><span class="k">Top product</span><span class="v">' + esc(r.topProd) + '</span></div>' +
      '<div class="cc-detail-row"><span class="k">Top cattle inquiry</span><span class="v">' + esc(r.topInq) + '</span></div>' +
      '<div class="cc-detail-row"><span class="k">New signups</span><span class="v">' + esc(r.signups) + '</span></div>' +
      '<div class="cc-modal-acts">' +
        '<button class="btn" data-cc="printreport">' + icon('copy') + ' Print / Save as PDF</button>' +
        '<button class="btn btn-ghost" data-cc="copyreport">Copy as text</button>' +
      '</div>';
    showModal('Daily sales snapshot', r.dateLabel, body);
  }

  function onChange(e) {
    var el = e.target;
    if (el.matches('input.stk-num[data-cc="stock"]')) {
      var id = el.getAttribute('data-id');
      var v = Math.max(0, parseInt(el.value, 10) || 0);
      var s = getStock(); s[id] = s[id] || { threshold: 10 }; s[id].stock = v; write(K.stock, s);
      renderStock(); toast('Stock updated');
    } else if (el.matches('select.inq-status[data-cc="inqset"]')) {
      setInqStatus(el.getAttribute('data-name'), el.value); renderInquiryLog(); toast('Inquiry status updated');
    }
  }

  /* ---- pending filter controls ---- */
  function wireFilters() {
    var sSeg = $('poStatusSeg'), dSeg = $('poDateSeg'), range = $('poRange');
    if (sSeg) sSeg.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-v]'); if (!b) return;
      poFilter.status = b.getAttribute('data-v');
      sSeg.querySelectorAll('button').forEach(function (x) { x.classList.toggle('active', x === b); });
      renderPending();
    });
    if (dSeg) dSeg.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-v]'); if (!b) return;
      poFilter.date = b.getAttribute('data-v');
      dSeg.querySelectorAll('button').forEach(function (x) { x.classList.toggle('active', x === b); });
      if (range) range.classList.toggle('show', poFilter.date === 'custom');
      renderPending();
    });
    var pf = $('poFrom'), pt = $('poTo');
    if (pf) pf.addEventListener('change', function () { poFilter.from = pf.value; renderPending(); });
    if (pt) pt.addEventListener('change', function () { poFilter.to = pt.value; renderPending(); });
  }

  /* ============================================================
     MASTER RENDER + INIT
     ============================================================ */
  function ccRender() {
    renderPending(); renderGoal(); renderStock(); renderCart(); renderCustomers(); renderInquiryLog();
  }
  window.ccRender = ccRender;

  function init() {
    wireFilters();
    document.addEventListener('click', onClick);
    document.addEventListener('change', onChange);
    var rb = $('reportBtn'); if (rb) rb.addEventListener('click', openReport);
    var ov = $('ccModal'); if (ov) ov.addEventListener('click', function (e) { if (e.target === ov) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
    // existing refresh button also refreshes our modules
    var refresh = $('refreshBtn'); if (refresh) refresh.addEventListener('click', ccRender);
    // re-render when storefront writes in another tab
    window.addEventListener('storage', function (e) { if (e.key && e.key.indexOf('hh_') === 0) ccRender(); });
    // render when dashboard is unlocked
    var dash = $('dash');
    if (dash) {
      var mo = new MutationObserver(function () { if (dash.classList.contains('show')) ccRender(); });
      mo.observe(dash, { attributes: true, attributeFilter: ['class'] });
      if (dash.classList.contains('show')) ccRender();
    }
    ccRender();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
