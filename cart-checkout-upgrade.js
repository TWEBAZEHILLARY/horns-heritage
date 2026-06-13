/* ════════════════════════════════════════════════════════════════
   HORNS & HERITAGE — Checkout refresh (behaviour)
   Additive only. Adds a subtle "saved" cue to checkout fields that
   were auto-filled from the signed-in profile. Never touches product
   data, prices, totals, or the cart/checkout logic itself.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var PREFILL_IDS = ['co-name', 'co-phone', 'co-addr'];

  function flagPrefilled(form) {
    PREFILL_IDS.forEach(function (id) {
      var el = form.querySelector('#' + id);
      if (el && el.value && el.value.trim()) el.classList.add('co-prefilled');
    });
  }

  // Clear the cue the moment the user edits a flagged field.
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t && t.classList && t.classList.contains('co-prefilled')) {
      t.classList.remove('co-prefilled');
    }
  });

  function init() {
    // Watch for the checkout delivery form appearing, then flag auto-fills.
    new MutationObserver(function () {
      var form = document.getElementById('payForm');
      if (form && !form.dataset.coFlagged) {
        form.dataset.coFlagged = '1';
        flagPrefilled(form);
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
