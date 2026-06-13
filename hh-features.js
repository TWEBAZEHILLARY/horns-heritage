/* ============================================================
   Horns & Heritage — Featured Bull of the Week countdown
   Counts down to the next Monday 00:00 (local time) and resets
   automatically every week. Additive only.
   ============================================================ */
(function () {
  'use strict';

  function nextResetDate() {
    // Next Monday at 00:00 local time. If it's already Monday, roll to the
    // following Monday so the offer always shows a full fresh week on reset.
    const now = new Date();
    const day = now.getDay();              // 0 = Sun, 1 = Mon, ...
    let daysUntilMon = (8 - day) % 7;      // days to next Monday (0 if today is Mon)
    if (daysUntilMon === 0) daysUntilMon = 7;
    const reset = new Date(now);
    reset.setDate(now.getDate() + daysUntilMon);
    reset.setHours(0, 0, 0, 0);
    return reset;
  }

  function format(ms) {
    if (ms < 0) ms = 0;
    const totalSec = Math.floor(ms / 1000);
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (d > 0) return d + 'd ' + h + 'h ' + m + 'm';
    if (h > 0) return h + 'h ' + m + 'm ' + s + 's';
    return m + 'm ' + s + 's';
  }

  function init() {
    const el = document.getElementById('fbCountdownTime');
    if (!el) return;

    let target = nextResetDate();

    function tick() {
      const now = new Date();
      let diff = target - now;
      if (diff <= 0) {
        target = nextResetDate();  // weekly reset
        diff = target - now;
      }
      el.textContent = format(diff);
    }

    tick();
    setInterval(tick, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
