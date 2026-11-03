'use strict';
/* Ritual scrub-scroll: wheel advances steps when section is in view */
(function () {
  var section = document.getElementById('ritual');
  if (!section) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var total = document.querySelectorAll('#usage-panels .usage-panel').length || 6;
  var locked = false;

  // Progress bar under step nav
  var nav = section.querySelector('.usage-nav');
  var barWrap = document.createElement('div');
  barWrap.className = 'ritual-scrub-progress';
  barWrap.setAttribute('aria-hidden', 'true');
  barWrap.innerHTML = '<span></span>';
  if (nav) nav.after(barWrap);
  var bar = barWrap.querySelector('span');

  var hint = document.createElement('p');
  hint.className = 'scrub-hint';
  hint.textContent = 'Scroll or swipe to move through the ritual steps';
  barWrap.after(hint);

  function setProgress() {
    var step = typeof usageStep === 'number' ? usageStep : 0;
    if (bar) bar.style.width = ((step + 1) / total * 100) + '%';
  }
  setProgress();

  function go(delta) {
    if (typeof showUsageStep !== 'function') return;
    var step = typeof usageStep === 'number' ? usageStep : 0;
    var next = Math.max(0, Math.min(total - 1, step + delta));
    if (next === step) return false;
    locked = true;
    showUsageStep(next);
    setProgress();
    setTimeout(function () { locked = false; }, 420);
    return true;
  }

  section.addEventListener('wheel', function (e) {
    var rect = section.getBoundingClientRect();
    var inView = rect.top < window.innerHeight * 0.55 && rect.bottom > window.innerHeight * 0.35;
    if (!inView || locked) return;
    if (e.deltaY > 12) {
      if (go(1)) e.preventDefault();
    } else if (e.deltaY < -12) {
      if (go(-1)) e.preventDefault();
    }
  }, { passive: false });

  document.querySelectorAll('[data-step], #usage-prev, #usage-next').forEach(function (el) {
    el.addEventListener('click', function () { setTimeout(setProgress, 60); });
  });
})();
