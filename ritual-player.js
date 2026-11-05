'use strict';
/* Six-step ritual carousel: user-driven swipe + automatic progression only in view. */
(function () {
  function init() {
    const section = document.getElementById('ritual');
    const carousel = section?.querySelector('.usage-carousel');
    const track = document.getElementById('usage-panels');
    const panels = track ? [...track.querySelectorAll('.usage-panel')] : [];
    const toggle = document.getElementById('usage-autoplay-toggle');
    const previous = document.getElementById('usage-prev');
    const next = document.getElementById('usage-next');
    if (!section || !carousel || !track || !toggle || !panels.length || typeof window.setUsageStep !== 'function') return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const total = panels.length;
    const INTERVAL = 5600;
    const MANUAL_BREAK = 9000;
    let inView = false;
    let paused = reducedMotion.matches;
    let focused = false;
    let keyboardFocus = false;
    let pending = 0;
    let lastInteraction = 0;
    let pointerStart = null;

    function current() {
      return Math.max(0, Math.min(total - 1, Number(window.usageStep) || 0));
    }
    function updateToggle() {
      toggle.setAttribute('aria-pressed', String(!paused));
      toggle.textContent = paused ? '▶ Play slides' : 'Ⅱ Pause slides';
      toggle.setAttribute('aria-label', paused ? 'Play ritual slides automatically' : 'Pause ritual autoplay');
    }
    function stopTimer() {
      if (pending) clearTimeout(pending);
      pending = 0;
    }
    function shouldPlay() {
      return !paused && !reducedMotion.matches && !document.hidden && inView &&
        !focused && Date.now() - lastInteraction >= MANUAL_BREAK;
    }
    function queueNext() {
      stopTimer();
      if (paused || reducedMotion.matches || !inView || document.hidden || focused) return;
      const delay = Math.max(INTERVAL, MANUAL_BREAK - (Date.now() - lastInteraction));
      pending = window.setTimeout(() => {
        pending = 0;
        if (!shouldPlay()) { queueNext(); return; }
        // Seamlessly restart at step 1 after step 6; never stop at the last slide.
        const step = (current() + 1) % total;
        window.setUsageStep(step);
        preloadNext();
        queueNext();
      }, delay);
    }
    function preloadNext() {
      const image = panels[(current() + 1) % total]?.querySelector('img');
      if (image) image.loading = 'eager';
    }
    function manualStep(step) {
      window.setUsageStep((step + total) % total);
      lastInteraction = Date.now();
      preloadNext();
      queueNext();
    }

    section.querySelectorAll('[data-step], #usage-prev, #usage-next').forEach(button => {
      button.addEventListener('click', () => {
        lastInteraction = Date.now();
        preloadNext();
        queueNext();
      });
    });
    toggle.addEventListener('click', () => {
      paused = !paused;
      if (!paused) lastInteraction = 0;
      updateToggle();
      queueNext();
    });

    carousel.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      pointerStart = { x:event.clientX, y:event.clientY, time:Date.now(), pointerId:event.pointerId };
    }, {passive:true});
    carousel.addEventListener('pointerup', event => {
      if (!pointerStart || event.pointerId !== pointerStart.pointerId) return;
      const dx = event.clientX - pointerStart.x;
      const dy = event.clientY - pointerStart.y;
      const elapsed = Date.now() - pointerStart.time;
      pointerStart = null;
      // Horizontal gestures only; never trap normal vertical page scrolling.
      if (Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy) * 1.3 || elapsed > 1400) return;
      manualStep(current() + (dx < 0 ? 1 : -1));
      carousel.dataset.justSwiped = '1';
      window.setTimeout(() => { delete carousel.dataset.justSwiped; }, 150);
    }, {passive:true});
    carousel.addEventListener('pointercancel', () => { pointerStart = null; });
    carousel.addEventListener('click', event => {
      if (carousel.dataset.justSwiped && event.target.closest('a')) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);
    track.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight') { event.preventDefault(); manualStep(current() + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); manualStep(current() - 1); }
    });
    // Only keyboard focus pauses autoplay. Clicking a control shouldn't leave
    // the slideshow frozen indefinitely just because the button retains focus.
    section.addEventListener('pointerdown', () => {
      keyboardFocus = false;
      if (focused) { focused = false; queueNext(); }
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Tab') keyboardFocus = true;
    });
    section.addEventListener('focusin', () => {
      if (keyboardFocus) { focused = true; stopTimer(); }
    });
    section.addEventListener('focusout', () => {
      // Delay until focus has moved, so tabbing within section stays paused.
      window.setTimeout(() => { focused = keyboardFocus && section.contains(document.activeElement); queueNext(); }, 0);
    });
    document.addEventListener('visibilitychange', queueNext);
    reducedMotion.addEventListener?.('change', event => {
      if (event.matches) paused = true;
      updateToggle(); queueNext();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        inView = entries.some(entry => entry.isIntersecting);
        if (inView) preloadNext();
        queueNext();
      }, {threshold:0.2}).observe(section);
    } else {
      inView = true;
    }
    updateToggle();
    queueNext();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
