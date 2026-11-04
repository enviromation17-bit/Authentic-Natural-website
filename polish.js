'use strict';
/* Smooth scroll + parallax + ambient + reveals + hero + ritual autoplay */
(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqMobile = window.matchMedia ? window.matchMedia('(max-width: 720px)') : null;
  var isMobile = mqMobile ? mqMobile.matches : false;

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

  function setupWordShift() {
    var h1 = document.getElementById('hero-title');
    if (!h1) return;
    var em = h1.querySelector('em');
    if (!em) return;
    var words = ['a little more care.', 'softer, smoother hair.', 'time for yourself.', 'natural everyday care.'];
    var i = 0;
    em.classList.add('word-shift');
    if (reduceMotion) return;
    setInterval(function () {
      em.classList.add('is-out');
      setTimeout(function () {
        i = (i + 1) % words.length;
        em.textContent = words[i];
        em.classList.remove('is-out');
        em.classList.add('is-in');
        setTimeout(function () { em.classList.remove('is-in'); }, 400);
      }, 300);
    }, 3400);
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
      timer = setInterval(function () { go(index + 1); }, 4800);
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

  function setupRitualAutoplay() {
    // The ritual is scroll/user-controlled. Autoplay fights the scrub and adds timers.
    return;
    var section = document.getElementById('ritual');
    var total = 6;
    var step = 0;
    var timer = null;
    var manual = false;

    function setter() {
      return window.setUsageStep || window.showUsageStep || null;
    }

    function go(i) {
      var fn = setter();
      if (!fn) return;
      step = ((i % total) + total) % total;
      fn(step);
    }

    function start() {
      stop();
      if (reduceMotion || manual) return;
      timer = setInterval(function () {
        go(step + 1);
      }, 5200);
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    document.querySelectorAll('.usage-nav [data-step], #usage-prev, #usage-next').forEach(function (el) {
      el.addEventListener('click', function () {
        step = typeof window.usageStep === 'number' ? window.usageStep : step;
        stop();
        manual = true;
        setTimeout(function () {
          manual = false;
          start();
        }, 8000);
      });
    });

    if (section) {
      section.addEventListener('mouseenter', stop);
      section.addEventListener('mouseleave', function () {
        if (!manual) start();
      });
    }

    function tryStart() {
      if (!setter()) {
        setTimeout(tryStart, 80);
        return;
      }
      if ('IntersectionObserver' in window && section) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) start();
            else stop();
          });
        }, { threshold: 0.25 });
        io.observe(section);
      } else {
        start();
      }
    }
    tryStart();
  }

  function setupAmbient() {
    // Avoid continuous blur/leaf compositing on small devices.
    if (isMobile || reduceMotion) return;
    if (document.querySelector('.ambient-nature')) return;

    var layer = document.createElement('div');
    layer.className = 'ambient-nature' + (isMobile ? ' is-mobile' : ' is-desktop');
    layer.setAttribute('aria-hidden', 'true');

    var far = document.createElement('div');
    far.className = 'parallax-layer parallax-far';
    var mid = document.createElement('div');
    mid.className = 'parallax-layer parallax-mid';
    var near = document.createElement('div');
    near.className = 'parallax-layer parallax-near';

    var orbs = document.createElement('div');
    orbs.className = 'ambient-orbs';
    for (var o = 1; o <= 3; o++) {
      var orb = document.createElement('span');
      orb.className = 'ambient-orb ambient-orb-' + o;
      orbs.appendChild(orb);
    }
    far.appendChild(orbs);

    var shapes = document.createElement('div');
    shapes.className = 'ambient-shapes';
    for (var s = 1; s <= 4; s++) {
      var sh = document.createElement('span');
      sh.className = 'ambient-shape ambient-shape-' + s;
      shapes.appendChild(sh);
    }
    mid.appendChild(shapes);

    if (!reduceMotion) {
      var count = isMobile ? 8 : 15;
      var paths = [
        'M12 2C8 8 4 12 12 22C20 12 16 8 12 2Z',
        'M10 3C6 9 3 14 12 21C18 13 16 7 10 3Z',
        'M14 2C9 7 5 13 12 22C19 14 18 6 14 2Z'
      ];
      var colors = ['#9bb87e', '#7a9a5c', '#b8c99a', '#8fad70'];

      for (var i = 0; i < count; i++) {
        var leaf = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        leaf.setAttribute('class', 'ambient-leaf');
        leaf.setAttribute('viewBox', '0 0 24 24');
        var size = (isMobile ? 12 : 14) + (i % 4) * 4;
        leaf.setAttribute('width', String(size));
        leaf.setAttribute('height', String(size));
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', paths[i % paths.length]);
        path.setAttribute('fill', colors[i % colors.length]);
        leaf.appendChild(path);
        leaf.style.left = Math.random() * 100 + '%';
        leaf.style.bottom = (-10 - Math.random() * 25) + '%';
        leaf.style.setProperty('--delay', (Math.random() * 16).toFixed(1) + 's');
        leaf.style.setProperty('--dur', (14 + Math.random() * 16).toFixed(1) + 's');
        leaf.style.setProperty('--x', ((Math.random() - 0.5) * 90).toFixed(0) + 'px');
        leaf.style.setProperty('--rot', (90 + Math.random() * 220).toFixed(0) + 'deg');
        leaf.style.setProperty('--op', (0.2 + Math.random() * 0.3).toFixed(2));
        near.appendChild(leaf);
      }
    }

    layer.appendChild(far);
    layer.appendChild(mid);
    layer.appendChild(near);
    document.body.prepend(layer);

    if (mqMobile) {
      mqMobile.addEventListener('change', function (e) {
        isMobile = e.matches;
        layer.classList.toggle('is-mobile', isMobile);
        layer.classList.toggle('is-desktop', !isMobile);
      });
    }
  }

  function setupParallax() {
    if (reduceMotion || isMobile) return;
    var far = document.querySelector('.parallax-far');
    var mid = document.querySelector('.parallax-mid');
    var near = document.querySelector('.parallax-near');
    var heroCopy = document.querySelector('.hero-copy');
    var heroSlider = document.querySelector('.hero-slider, .hero-photo');
    var ticking = false;
    var speedFar = isMobile ? 0.04 : 0.08;
    var speedMid = isMobile ? 0.07 : 0.14;
    var speedNear = isMobile ? 0.1 : 0.2;
    var maxY = isMobile ? 80 : 160;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY || 0;
        var clamped = Math.min(y, 1200);
        if (far) far.style.transform = 'translate3d(0,' + Math.min(clamped * speedFar, maxY * 0.5) + 'px,0)';
        if (mid) mid.style.transform = 'translate3d(0,' + Math.min(clamped * speedMid, maxY * 0.7) + 'px,0)';
        if (near) near.style.transform = 'translate3d(0,' + (-Math.min(clamped * speedNear * 0.5, maxY * 0.4)) + 'px,0)';
        // GSAP owns the new hero stage. Never apply competing scroll transforms.
        if (document.documentElement.classList.contains('has-gsap-hero')) {
          if (heroCopy) heroCopy.style.transform = '';
          if (heroSlider) heroSlider.style.transform = '';
        } else if (!isMobile && y < 700) {
          if (heroCopy) heroCopy.style.transform = 'translate3d(0,' + (clamped * 0.06) + 'px,0)';
          if (heroSlider) heroSlider.style.transform = 'translate3d(0,' + (clamped * 0.03) + 'px,0)';
        } else {
          if (heroCopy) heroCopy.style.transform = '';
          if (heroSlider) heroSlider.style.transform = '';
        }
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function setupReveals() {
    var selectors = [
      '.section', '.benefit-strip', '.section-heading', '.ingredient-card',
      '.usage-panel', '.story-layout', '.video-section', '.faq details',
      '.closing', '.product-info', '.gallery'
    ];
    var nodes = document.querySelectorAll(selectors.join(','));
    if (!nodes.length) return;

    nodes.forEach(function (el, i) {
      el.classList.add('reveal');
      if (el.classList.contains('ingredient-card') || el.classList.contains('usage-panel')) {
        el.style.transitionDelay = ((i % 8) * 0.05) + 's';
      }
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      nodes.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    nodes.forEach(function (el) { io.observe(el); });

    var hero = document.querySelector('.hero');
    if (hero) {
      hero.classList.add('reveal', 'is-visible');
      hero.querySelectorAll('.hero-copy, .hero-slider, .hero-photo').forEach(function (k, idx) {
        k.classList.add('reveal', 'is-visible');
        k.style.transitionDelay = (0.1 + idx * 0.12) + 's';
      });
    }
  }

  function watchIngredientGrid() {
    var grid = document.getElementById('ingredient-grid');
    if (!grid || !('MutationObserver' in window)) return;
    var mo = new MutationObserver(function () {
      var cards = grid.querySelectorAll('.ingredient-card:not(.reveal)');
      cards.forEach(function (card, i) {
        card.classList.add('reveal');
        card.style.transitionDelay = (i % 8) * 0.04 + 's';
        if (reduceMotion) {
          card.classList.add('is-visible');
          return;
        }
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { card.classList.add('is-visible'); });
        });
      });
    });
    mo.observe(grid, { childList: true });
  }

  function setupFooterLeaves() {
    if (isMobile || reduceMotion) return;
    var footer = document.querySelector('.site-footer');
    if (!footer || footer.querySelector('.leaf-field') || reduceMotion) return;
    var field = document.createElement('div');
    field.className = 'leaf-field';
    field.setAttribute('aria-hidden', 'true');
    var paths = [
      'M12 2C8 8 4 12 12 22C20 12 16 8 12 2Z',
      'M10 3C6 9 3 14 12 21C18 13 16 7 10 3Z'
    ];
    var count = isMobile ? 6 : 12;
    for (var i = 0; i < count; i++) {
      var leaf = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      leaf.setAttribute('class', 'footer-leaf');
      leaf.setAttribute('viewBox', '0 0 24 24');
      leaf.setAttribute('width', String(14 + (i % 4) * 5));
      leaf.setAttribute('height', String(14 + (i % 4) * 5));
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', paths[i % paths.length]);
      path.setAttribute('fill', i % 2 === 0 ? '#a8c48a' : '#7a9a5c');
      leaf.appendChild(path);
      leaf.style.left = Math.random() * 100 + '%';
      leaf.style.animationDelay = (Math.random() * 10).toFixed(1) + 's';
      leaf.style.animationDuration = (9 + Math.random() * 12).toFixed(1) + 's';
      leaf.style.opacity = String(0.2 + Math.random() * 0.35);
      field.appendChild(leaf);
    }
    footer.insertBefore(field, footer.firstChild);
  }

  function start() {
    setupSmoothScroll();
    setupAmbient();
    setupWordShift();
    setupHeroSlider();
    setupRitualAutoplay();
    // Keep the brand footer still and readable; floating leaves overlap its columns.
    setupParallax();
    setupReveals();
    watchIngredientGrid();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
