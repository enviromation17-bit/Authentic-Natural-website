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
    if (!section || !carousel || !track || !panels.length) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const total = panels.length;
    const INTERVAL = 6200;
    const MANUAL_BREAK = 10000;
    let inView = false;
    let paused = reducedMotion.matches;
    let focused = false;
    let keyboardFocus = false;
    let pending = 0;
    let lastInteraction = 0;
    let pointerStart = null;

    function current() {
      return typeof window.usageStep === 'number' ? window.usageStep : 0;
    }

    function go(step) {
      if (typeof window.setUsageStep === 'function') window.setUsageStep(step);
      else if (typeof window.showUsageStep === 'function') window.showUsageStep(step);
    }

    function schedule() {
      window.clearTimeout(pending);
      if (paused || !inView || reducedMotion.matches || document.hidden) return;
      if (focused || keyboardFocus || Date.now() - lastInteraction < MANUAL_BREAK) {
        const delay = Math.max(INTERVAL, MANUAL_BREAK - (Date.now() - lastInteraction));
        pending = window.setTimeout(schedule, delay);
        return;
      }
      pending = window.setTimeout(() => {
        if (paused || !inView || document.hidden) return;
        const step = (current() + 1) % total;
        go(step);
        schedule();
      }, INTERVAL);
    }

    function warmNext() {
      const image = panels[(current() + 1) % total]?.querySelector('img');
      if (image && image.dataset.warmed !== '1') {
        image.loading = 'eager';
        image.dataset.warmed = '1';
      }
    }

    function markInteraction() {
      lastInteraction = Date.now();
      warmNext();
      schedule();
    }

    if (toggle) {
      toggle.addEventListener('click', () => {
        paused = !paused;
        toggle.setAttribute('aria-pressed', paused ? 'false' : 'true');
        schedule();
      });
    }
    if (previous) previous.addEventListener('click', () => { go(Math.max(0, current() - 1)); markInteraction(); });
    if (next) next.addEventListener('click', () => { go(Math.min(total - 1, current() + 1)); markInteraction(); });

    section.querySelectorAll('[data-step]').forEach((button) => {
      button.addEventListener('click', () => markInteraction());
    });

    carousel.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      pointerStart = { x: event.clientX, y: event.clientY, time: Date.now() };
    });
    carousel.addEventListener('pointerup', (event) => {
      if (!pointerStart) return;
      const dx = event.clientX - pointerStart.x;
      const dy = event.clientY - pointerStart.y;
      const elapsed = Date.now() - pointerStart.time;
      pointerStart = null;
      if (elapsed > 700 || Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      carousel.dataset.justSwiped = '1';
      window.setTimeout(() => { delete carousel.dataset.justSwiped; }, 150);
      go(dx < 0 ? Math.min(total - 1, current() + 1) : Math.max(0, current() - 1));
      markInteraction();
    });
    carousel.addEventListener('pointercancel', () => { pointerStart = null; });

    track.addEventListener('focusin', () => { focused = true; keyboardFocus = true; });
    track.addEventListener('focusout', () => {
      focused = false;
      keyboardFocus = false;
      schedule();
    });

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          inView = entry.isIntersecting && entry.intersectionRatio > 0.35;
          if (inView) {
            warmNext();
            schedule();
          } else {
            window.clearTimeout(pending);
          }
        });
      }, { threshold: [0.2, 0.35, 0.5] });
      io.observe(section);
    } else {
      inView = true;
      schedule();
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) window.clearTimeout(pending);
      else schedule();
    });

    reducedMotion.addEventListener?.('change', () => {
      paused = reducedMotion.matches;
      schedule();
    });

    warmNext();
    schedule();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
