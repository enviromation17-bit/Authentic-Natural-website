'use strict';
/* Smooth scroll + mobile CSS inject + reveals */
(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqMobile = window.matchMedia ? window.matchMedia('(max-width: 720px)') : null;
  var isMobile = mqMobile ? mqMobile.matches : false;

  function injectMobileCss() {
    if (document.querySelector('link[data-mobile-fix]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'mobile-fix.css?v=20261106-mobile1';
    link.setAttribute('data-mobile-fix', '1');
    document.head.appendChild(link);
  }

  function setupSmoothScroll() {
    document.documentElement.style.scrollBehavior = reduceMotion ? 'auto' : 'smooth';
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var header = document.querySelector('.header');
      var offset = header ? header.offsetHeight + 12 : 80;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  function setupHeroSlider() {
    var root = document.getElementById('hero-slider');
    if (!root) return;
    var slides = root.querySelectorAll('.hero-slide');
    var dots = root.querySelectorAll('[data-dot]');
    var prev = root.querySelector('.hero-prev');
    var next = root.querySelector('.hero-next');
    if (!slides.length) return;
    var index = 0;
    var timer = null;
    var total = slides.length;

    function go(i) {
      index = (i + total) % total;
      slides.forEach(function (s, n) { s.classList.toggle('is-active', n === index); });
      dots.forEach(function (d, n) { d.classList.toggle('is-active', n === index); });
    }
    function start() {
      stop();
      if (reduceMotion) return;
      timer = setInterval(function () {
        if (document.documentElement.classList.contains('has-gsap-hero')) { stop(); return; }
        if (!document.hidden) go(index + 1);
      }, 4800);
    }
    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    if (prev) prev.addEventListener('click', function () { go(index - 1); start(); });
    if (next) next.addEventListener('click', function () { go(index + 1); start(); });
    dots.forEach(function (d) {
      d.addEventListener('click', function () {
        go(Number(d.getAttribute('data-dot')) || 0);
        start();
      });
    });

    var startX = 0;
    root.addEventListener('touchstart', function (e) {
      startX = e.changedTouches[0].clientX;
      stop();
    }, { passive: true });
    root.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      start();
    }, { passive: true });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    go(0);
    start();
  }

  function setupReveals() {
    var selectors = [
      '.section', '.benefit-strip', '.section-heading', '.ingredient-card',
      '.usage-panel', '.story-layout', '.video-section', '.faq details',
      '.closing', '.product-info', '.gallery', '.brand-manifesto'
    ];
    var nodes = document.querySelectorAll(selectors.join(','));
    if (!nodes.length) return;

    // On mobile, always show content (avoids blank invisible sections)
    if (isMobile || reduceMotion || !('IntersectionObserver' in window)) {
      nodes.forEach(function (el) {
        el.classList.add('reveal', 'is-visible');
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    nodes.forEach(function (el, i) {
      el.classList.add('reveal');
      if (el.classList.contains('ingredient-card') || el.classList.contains('usage-panel')) {
        el.style.transitionDelay = ((i % 8) * 0.05) + 's';
      }
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

    nodes.forEach(function (el) { io.observe(el); });

    // Safety: force-visible anything still hidden after 2.5s
    setTimeout(function () {
      nodes.forEach(function (el) {
        if (!el.classList.contains('is-visible')) el.classList.add('is-visible');
      });
    }, 2500);
  }

  function watchIngredientGrid() {
    var grid = document.getElementById('ingredient-grid');
    if (!grid || !('MutationObserver' in window)) return;
    var mo = new MutationObserver(function () {
      var cards = grid.querySelectorAll('.ingredient-card');
      cards.forEach(function (card) {
        card.classList.add('reveal', 'is-visible');
        if (isMobile) {
          card.style.opacity = '1';
          card.style.transform = 'none';
        }
      });
    });
    mo.observe(grid, { childList: true });
  }

  function setupFooterLeaves() {
    if (reduceMotion || isMobile || !('IntersectionObserver' in window)) return;
    var footer = document.querySelector('.site-footer.footer-redesigned');
    if (!footer || footer.querySelector('.premium-leaf-field')) return;
    var field = document.createElement('div');
    field.className = 'premium-leaf-field';
    field.setAttribute('aria-hidden', 'true');
    var count = 7;
    for (var i = 0; i < count; i++) {
      var leaf = document.createElement('span');
      leaf.className = 'premium-leaf';
      leaf.innerHTML = '<svg viewBox="0 0 24 32" width="22" height="28" aria-hidden="true" focusable="false"><path d="M12 1C5 7 1 17 8 26c7 0 15-8 12-18C18 5 15 3 12 1Z" fill="currentColor"/><path d="M7 29Q12 18 17 11" stroke="#e6f6d9" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>';
      leaf.style.left = (6 + (i * 88 / count)) + '%';
      leaf.style.setProperty('--leaf-delay', '-' + (i * 2.9) + 's');
      leaf.style.setProperty('--leaf-duration', (12 + i * 1.4) + 's');
      leaf.style.setProperty('--leaf-size', (19 + (i%3)*5) + 'px');
      field.appendChild(leaf);
    }
    footer.insertBefore(field, footer.firstChild);
  }

  function start() {
    injectMobileCss();
    setupSmoothScroll();
    setupHeroSlider();
    setupFooterLeaves();
    setupReveals();
    watchIngredientGrid();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
