'use strict';
/* Pin ritual section: wheel changes step */
(function () {
  function getSetter() {
    if (typeof window.showUsageStep === 'function') return window.showUsageStep;
    if (typeof window.setUsageStep === 'function') return window.setUsageStep;
    return null;
  }

  function start() {
    // Native touch scrolling should never be wheel-trapped or pinned by this legacy script.
    if (window.matchMedia('(max-width: 900px), (prefers-reduced-motion: reduce)').matches) return;
    var section = document.getElementById('ritual');
    if (!section || section.dataset.scrubReady) return;
    var setter = getSetter();
    if (!setter) {
      setTimeout(start, 60);
      return;
    }
    section.dataset.scrubReady = '1';

    var total = document.querySelectorAll('#usage-panels .usage-panel').length || 6;
    var locked = false;

    var sticky = document.createElement('div');
    sticky.className = 'ritual-sticky-wrap';
    var move = [];
    var child = section.firstElementChild;
    while (child) {
      var next = child.nextElementSibling;
      if (child.tagName === 'DETAILS') break;
      if (child.classList && child.classList.contains('ritual-scrub-spacer')) break;
      move.push(child);
      child = next;
    }
    move.forEach(function (el) { sticky.appendChild(el); });
    section.insertBefore(sticky, section.firstChild);

    var nav = sticky.querySelector('.usage-nav');
    var barWrap = document.createElement('div');
    barWrap.className = 'ritual-scrub-progress';
    barWrap.innerHTML = '<span></span>';
    var bar = barWrap.querySelector('span');
    var hint = document.createElement('p');
    hint.className = 'scrub-hint';
    hint.textContent = 'Scroll to open the next ritual step';
    if (nav) {
      nav.after(barWrap);
      barWrap.after(hint);
    }

    function currentStep() {
      return typeof window.usageStep === 'number' ? window.usageStep : 0;
    }
    function setBar() {
      if (bar) bar.style.width = ((currentStep() + 1) / total * 100) + '%';
    }
    setBar();

    function go(delta) {
      var step = currentStep();
      var next = Math.max(0, Math.min(total - 1, step + delta));
      if (next === step) return false;
      locked = true;
      setter(next);
      setBar();
      setTimeout(function () { locked = false; }, 380);
      return true;
    }

    function inRitualZone() {
      var r = sticky.getBoundingClientRect();
      return r.top <= 120 && r.bottom >= window.innerHeight * 0.45;
    }

    window.addEventListener('wheel', function (e) {
      if (!inRitualZone() || locked) return;
      var step = currentStep();
      var down = e.deltaY > 8;
      var up = e.deltaY < -8;
      if (!down && !up) return;

      if (down && step < total - 1) {
        e.preventDefault();
        go(1);
      } else if (up && step > 0) {
        e.preventDefault();
        go(-1);
      }
    }, { passive: false });

    document.querySelectorAll('[data-step], #usage-prev, #usage-next').forEach(function (el) {
      el.addEventListener('click', function () { setTimeout(setBar, 50); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
