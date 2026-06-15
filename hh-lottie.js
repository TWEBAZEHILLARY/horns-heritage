/* ============================================================
   Horns & Heritage — Lottie animations
   Six small, on-brand looping animations rendered with lottie-web.
   Self-contained animation data (no external assets) so they work
   offline on any static host. Lottie has no audio = muted by design.
   ============================================================ */
(function () {
  'use strict';

  // ---- brand palette as Lottie [r,g,b,1] (0..1) ----
  function c(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1];
  }
  const GREEN = c('#2D6A4F');
  const GREEN2 = c('#40916C');
  const GOLD = c('#D4A02B');
  const GOLD_L = c('#E8B84E');
  const TERRA = c('#C9714C');
  const RUST = c('#B8512C');
  const CREAM = c('#FEF3D6');
  const DARK = c('#3D2A1A');

  // ---- property helpers ----
  const S = (k) => ({ a: 0, k });                          // static
  const EASE_O = { x: [0.4], y: [0] };
  const EASE_I = { x: [0.6], y: [1] };
  // animated property from [ [t, value], ... ]; value may be number or array
  function A(pairs) {
    const k = pairs.map((p, idx) => {
      const o = { t: p[0], s: Array.isArray(p[1]) ? p[1] : [p[1]] };
      if (idx < pairs.length - 1) { o.o = EASE_O; o.i = EASE_I; }
      return o;
    });
    return { a: 1, k };
  }

  // ---- shape primitives ----
  const ellipse = (cx, cy, w, h) => ({ ty: 'el', p: S([cx, cy]), s: S([w, h]), d: 1 });
  const rect = (cx, cy, w, h, r = 0) => ({ ty: 'rc', p: S([cx, cy]), s: S([w, h]), r: S(r), d: 1 });
  const star = (cx, cy, pts, outer, inner, rot = 0) => ({
    ty: 'sr', sy: 1, pt: S(pts), p: S([cx, cy]), r: S(rot),
    or: S(outer), ir: S(inner), os: S(0), is: S(0), d: 1
  });
  const path = (verts, ins, outs, closed) => ({
    ty: 'sh', ks: S({ c: closed, v: verts, i: ins, o: outs }), d: 1
  });
  const fill = (col, op = 100) => ({ ty: 'fl', c: S(col), o: S(op), r: 1 });
  const stroke = (col, w, op = 100) => ({ ty: 'st', c: S(col), o: S(op), w: S(w), lc: 2, lj: 2, ml: 4 });
  const tr = (opts = {}) => Object.assign({
    ty: 'tr', p: S(opts.p || [0, 0]), a: S(opts.a || [0, 0]),
    s: S(opts.s || [100, 100]), r: S(opts.r || 0), o: S(opts.o || 100)
  });
  // a group = shapes + paint(s) + transform
  const group = (items) => ({ ty: 'gr', it: items });

  function layer(shapes, ks, op) {
    return {
      ddd: 0, ind: 1, ty: 4, nm: 'l', sr: 1, ao: 0,
      ks: Object.assign({ o: S(100), r: S(0), p: S([50, 50]), a: S([50, 50]), s: S([100, 100]) }, ks),
      shapes, ip: 0, op, st: 0, bm: 0
    };
  }
  function comp(layers, op) {
    return { v: '5.7.4', fr: 30, ip: 0, op, w: 100, h: 100, nm: 'a', ddd: 0, assets: [], layers };
  }

  // ============================================================
  // 1. SHOPPING BAG — gentle bob (cart icon)
  // ============================================================
  function bag() {
    const op = 75;
    const bodyG = group([ rect(50, 60, 46, 42, 7), fill(GREEN), tr() ]);
    const flapG = group([ rect(50, 41, 40, 12, 4), fill(GREEN2), tr() ]);
    // handle as open arc (stroke)
    const handle = group([
      path(
        [[34, 42], [50, 26], [66, 42]],
        [[0, 0], [-10, 0], [0, 0]],
        [[0, 0], [10, 0], [0, 0]],
        false
      ),
      stroke(GOLD, 5), tr()
    ]);
    const dot = group([ ellipse(50, 62, 9, 9), fill(GOLD_L), tr() ]);
    const ks = {
      a: S([50, 70]),
      s: A([[0, [100, 100]], [22, [104, 96]], [40, [98, 104]], [75, [100, 100]]]),
      p: A([[0, [50, 70]], [22, [50, 66]], [40, [50, 71]], [75, [50, 70]]])
    };
    return comp([ layer([flapG, handle, bodyG, dot], ks, op) ], op);
  }

  // ============================================================
  // 2. COW — Ankole longhorn head, gentle nod (Buy & Sell Cattle)
  // ============================================================
  function cow() {
    const op = 90;
    const hornL = group([
      path([[40, 44], [30, 30], [21, 15]], [[0, 0], [6, 6], [4, 8]], [[0, 0], [-6, -6], [-2, -5]], false),
      stroke(GOLD, 5.5), tr()
    ]);
    const hornR = group([
      path([[60, 44], [70, 30], [79, 15]], [[0, 0], [-6, 6], [-4, 8]], [[0, 0], [6, -6], [2, -5]], false),
      stroke(GOLD, 5.5), tr()
    ]);
    const earL = group([ ellipse(30, 52, 16, 11), fill(CREAM), tr({ r: -25 }) ]);
    const earR = group([ ellipse(70, 52, 16, 11), fill(CREAM), tr({ r: 25 }) ]);
    const head = group([ ellipse(50, 60, 42, 40), fill(CREAM), tr() ]);
    const muzzle = group([ ellipse(50, 72, 26, 18), fill(TERRA), tr() ]);
    const nostrilL = group([ ellipse(44, 73, 5, 7), fill(RUST), tr() ]);
    const nostrilR = group([ ellipse(56, 73, 5, 7), fill(RUST), tr() ]);
    const eyeL = group([ ellipse(40, 56, 7, 7), fill(DARK), tr() ]);
    const eyeR = group([ ellipse(60, 56, 7, 7), fill(DARK), tr() ]);
    // nod = rotation around top of neck
    const ks = {
      a: S([50, 40]), p: S([50, 40]),
      r: A([[0, 0], [30, -5], [60, 5], [90, 0]])
    };
    return comp([ layer([eyeL, eyeR, nostrilL, nostrilR, muzzle, head, earL, earR, hornL, hornR], ks, op) ], op);
  }

  // ============================================================
  // 3. LEAF — gentle sway (From pasture to pantry)
  // ============================================================
  function leaf() {
    const op = 100;
    const blade = group([
      path([[50, 14], [74, 50], [50, 86], [26, 50]],
        [[0, 0], [0, -20], [0, 0], [0, 20]],
        [[0, 0], [0, 20], [0, 0], [0, -20]], true),
      fill(GREEN2), tr()
    ]);
    const midrib = group([
      path([[50, 20], [50, 82]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], false),
      stroke(GREEN, 2.5), tr()
    ]);
    const stem = group([
      path([[50, 82], [50, 94]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], false),
      stroke(GREEN, 3), tr()
    ]);
    const ks = {
      a: S([50, 88]), p: S([50, 88]),
      r: A([[0, -9], [50, 9], [100, -9]])
    };
    return comp([ layer([midrib, blade, stem], ks, op) ], op);
  }

  // ============================================================
  // 4. DELIVERY TRUCK — drive bob + spinning wheels (delivery notice)
  // ============================================================
  function truck() {
    const op = 60;
    // wheels as their own layers so they can spin
    function wheel(cx) {
      const ks = {
        a: S([cx, 76]), p: S([cx, 76]),
        r: A([[0, 0], [60, 360]])
      };
      // linear spin (override easing -> use linear by flat tangents)
      ks.r = { a: 1, k: [{ t: 0, s: [0], o: { x: [0.333], y: [0.333] }, i: { x: [0.667], y: [0.667] } }, { t: 60, s: [360] }] };
      const tyre = group([ ellipse(cx, 76, 19, 19), fill(DARK), tr() ]);
      const hub = group([ ellipse(cx, 76, 8, 8), fill(CREAM), tr() ]);
      const spoke = group([ rect(cx, 76, 16, 2.4, 1), fill(DARK), tr() ]);
      return { ddd: 0, ind: 1, ty: 4, nm: 'w', sr: 1, ao: 0, ks: Object.assign({ o: S(100) }, ks), shapes: [spoke, hub, tyre], ip: 0, op, st: 0, bm: 0 };
    }
    // body bob
    const bodyKs = { a: S([50, 50]), p: A([[0, [50, 50]], [15, [50, 48.5]], [30, [50, 50]], [45, [50, 48.5]], [60, [50, 50]]]) };
    const cargo = group([ rect(36, 50, 46, 34, 4), fill(GREEN), tr() ]);
    const cargoLine = group([ rect(36, 50, 46, 3, 0), fill(GREEN2), tr() ]);
    const cab = group([ rect(72, 56, 24, 22, 4), fill(TERRA), tr() ]);
    const win = group([ rect(72, 51, 16, 9, 2), fill(CREAM), tr() ]);
    const bumper = group([ rect(85, 66, 4, 8, 1), fill(RUST), tr() ]);
    const bodyLayer = { ddd: 0, ind: 2, ty: 4, nm: 'b', sr: 1, ao: 0, ks: Object.assign({ o: S(100), r: S(0), s: S([100, 100]), a: S([50, 50]) }, bodyKs), shapes: [cargoLine, cargo, win, cab, bumper], ip: 0, op, st: 0, bm: 0 };
    return comp([ wheel(28), wheel(64), bodyLayer ], op);
  }

  // ============================================================
  // 5. SPARKLE STAR — twinkle (Gold "Most chosen" card)
  // ============================================================
  function sparkle() {
    const op = 75;
    const big = {
      ddd: 0, ind: 1, ty: 4, nm: 's', sr: 1, ao: 0,
      ks: {
        o: A([[0, 70], [37, 100], [75, 70]]),
        r: A([[0, 0], [75, 90]]),
        p: S([52, 50]), a: S([52, 50]),
        s: A([[0, [78, 78]], [37, [116, 116]], [75, [78, 78]]])
      },
      shapes: [ group([ star(52, 50, 4, 30, 9), fill(GOLD), tr() ]) ],
      ip: 0, op, st: 0, bm: 0
    };
    const dot1 = {
      ddd: 0, ind: 2, ty: 4, nm: 'd1', sr: 1, ao: 0,
      ks: { o: A([[0, 0], [20, 100], [45, 0], [75, 0]]), p: S([0, 0]), a: S([0, 0]), s: A([[0, [60, 60]], [20, [110, 110]], [45, [60, 60]]]) },
      shapes: [ group([ star(82, 26, 4, 11, 3.5), fill(GOLD_L), tr() ]) ],
      ip: 0, op, st: 0, bm: 0
    };
    const dot2 = {
      ddd: 0, ind: 3, ty: 4, nm: 'd2', sr: 1, ao: 0,
      ks: { o: A([[0, 0], [30, 0], [50, 100], [70, 0], [75, 0]]), p: S([0, 0]), a: S([0, 0]), s: A([[30, [60, 60]], [50, [105, 105]], [70, [60, 60]]]) },
      shapes: [ group([ star(22, 74, 4, 9, 3), fill(GOLD_L), tr() ]) ],
      ip: 0, op, st: 0, bm: 0
    };
    return comp([ dot1, dot2, big ], op);
  }

  // ============================================================
  // 6. HEART — heartbeat pulse (Heritage Membership)
  //    built from two lobe ellipses + a rotated square (reliable, clean)
  // ============================================================
  function heart() {
    const op = 70;
    const lobeL = group([ ellipse(38, 40, 38, 38), fill(TERRA), tr() ]);
    const lobeR = group([ ellipse(62, 40, 38, 38), fill(TERRA), tr() ]);
    const point = group([ rect(50, 58, 38, 38, 4), fill(TERRA), tr({ a: [50, 58], p: [50, 58], r: 45 }) ]);
    const ks = {
      a: S([50, 50]), p: S([50, 50]),
      s: A([[0, [100, 100]], [12, [118, 118]], [26, [100, 100]], [38, [110, 110]], [52, [100, 100]], [70, [100, 100]]])
    };
    return comp([ layer([point, lobeL, lobeR], ks, op) ], op);
  }

  const ANIM = { bag, cow, leaf, truck, sparkle, heart };

  // ============================================================
  // Mount: find [data-lottie] elements and render the matching anim
  // ============================================================
  const instances = {};
  function mountAll() {
    if (!window.lottie) return;
    document.querySelectorAll('[data-lottie]').forEach((el) => {
      const key = el.getAttribute('data-lottie');
      if (!ANIM[key] || el.dataset.mounted) return;
      el.dataset.mounted = '1';
      try {
        const anim = window.lottie.loadAnimation({
          container: el,
          renderer: 'svg',
          loop: true,
          autoplay: !el.hasAttribute('data-paused'),
          animationData: ANIM[key]()
        });
        instances[key] = instances[key] || [];
        instances[key].push(anim);
      } catch (e) { /* fail silent — text stays intact */ }
    });
  }

  // Expose a quick "pop" for the cart bag when an item is added
  window.hhBagBounce = function () {
    document.querySelectorAll('[data-lottie="bag"]').forEach((el) => {
      el.style.transition = 'transform .18s cubic-bezier(.18,.89,.32,1.28)';
      el.style.transform = 'scale(1.35)';
      setTimeout(() => { el.style.transform = 'scale(1)'; }, 200);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountAll);
  } else {
    mountAll();
  }
  // re-run shortly after in case lottie CDN loads late
  window.addEventListener('load', mountAll);
  setTimeout(mountAll, 600);
})();
