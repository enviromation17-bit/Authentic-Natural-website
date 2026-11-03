'use strict';
/* Sticky ritual scrub: section pins while scroll advances steps 0..5 */
(function () {
  var section = document.getElementById('ritual');
  if (!section) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof showUsageStep !== 'function') {
    // wait for app.js
    window.addEventListener('load', init);
    return;
  }
  init();

  function init() {
    if (section.dataset.scrubReady) return;
    section.dataset.scrubReady = '1';
    section.classList.add('ritual-scrub-active');

    var total = document.querySelectorAll('#usage-panels .usage-panel').length || 6;

    // Wrap sticky content (heading + nav + carousel + pagination)
    var sticky = document.createElement('div');
    sticky.className = 'ritual-sticky-wrap';
    var kids = [];
    var node = section.firstElementChild;
    while (node) {
      var next = node.nextElementSibling;
      if (node.tagName === 'DETAILS') break;
      kids.push(node);
      node = next;
    }
    kids.forEach(function (el) { sticky.appendChild(el); });
    section.insertBefore(sticky, section.firstChild);

    // Progress bar + hint after nav
    var nav = sticky.querySelector('.usage-nav');
    var barWrap = document.createElement('div');
    barWrap.className = 'ritual-scrub-progress';
    barWrap.setAttribute('aria-hidden', 'true');
    barWrap.innerHTML = '<span></span>';
    var bar = barWrap.querySelector('span');
    var hint = document.createElement('p');
    hint.className = 'scrub-hint';
    hint.textContent = 'Scroll to move through the ritual steps';
    if (nav) {
      nav.after(barWrap);
      barWrap.after(hint);
    }

    // Tall spacer so user has scroll room for 6 steps while sticky holds
    var spacer = document.createElement('div');
    spacer.className = 'ritual-scrub-spacer';
    spacer.setAttribute('aria-hidden', 'true');
    spacer.style.height = (total * 70) + 'vh';
    spacer.style.pointerEvents = 'none';
    section.appendChild(spacer);

    function setProgress(step) {
      if (bar) bar.style.width = ((step + 1) / total * 100) + '%';
    }

    var lastStep = -1;
    function onScroll() {
      var rect = section.getBoundingClientRect();
      var sectionTop = window.scrollY + rect.top;
      var stickyH = sticky.offsetHeight || window.innerHeight * 0.7;
      var scrollable = Math.max(1, section.offsetHeight - stickyH - 40);
      var progressed = window.scrollY - sectionTop;
      var t = Math.min(1, Math.max(0, progressed / scrollable));
      var step = Math.min(total - 1, Math.floor(t * total));
      // near end lock last step
      if (t >= 0.92) step = total - 1;
      if (step !== lastStep) {
        lastStep = step;
        if (typeof showUsageStep === 'function') showUsageStep(step);
        setProgress(step);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();

    // Keep progress in sync when user clicks steps
    document.querySelectorAll('[data-step], #usage-prev, #usage-next').forEach(function (el) {
      el.addEventListener('click', function () {
        setTimeout(function () {
          var step = typeof usageStep === 'number' ? usageStep : 0;
          lastStep = step;
          setProgress(step);
        }, 40);
      });
    });
  }
})();
