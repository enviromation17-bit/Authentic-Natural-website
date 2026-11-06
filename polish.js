'use strict';
/* Mobile safety + CSS inject + reveals */
(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqMobile = window.matchMedia ? window.matchMedia('(max-width: 720px)') : null;
  var isMobile = mqMobile ? mqMobile.matches : false;

  function injectMobileCss() {
    if (document.querySelector('link[data-mobile-fix]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'mobile-fix.css?v=20261106-mobile2';
    link.setAttribute('data-mobile-fix', '1');
    document.head.appendChild(link);
  }

  /* Phones: remove huge pin-spacer blank zones left by older hero-scrub builds */
  function neutralizeMobilePinGaps() {
    if (!isMobile) return;
    function clean() {
      if (window.ScrollTrigger && typeof window.ScrollTrigger.getAll === 'function') {
        window.ScrollTrigger.getAll().forEach(function (t) {
          try { t.kill(true); } catch (e) {}
        });
      }
      document.querySelectorAll('.pin-spacer').forEach(function (spacer) {
        var pinned = spacer.querySelector('.hero-scrub-stage, #gsap-hero-stage');
        if (pinned && spacer.parentNode) {
          spacer.parentNode.insertBefore(pinned, spacer);
        }
        if (spacer.parentNode) spacer.parentNode.removeChild(spacer);
      });
      var stage = document.getElementById('gsap-hero-stage');
      if (stage) {
        stage.style.position = 'relative';
        stage.style.top = 'auto';
        stage.style.width = '100%';
        stage.style.transform = 'none';
      }
      document.documentElement.classList.add('hero-mobile-autoplay');
    }
    // Run after hero-scrub.js may have created triggers
    setTimeout(clean, 400);
    setTimeout(clean, 1200);
    window.addEventListener('load', function () { setTimeout(clean, 200); });
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

  function start() {
    injectMobileCss();
    neutralizeMobilePinGaps();
    setupSmoothScroll();
    setupHeroSlider();
    setupReveals();
    watchIngredientGrid();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
