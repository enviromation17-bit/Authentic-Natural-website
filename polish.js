'use strict';
/* Clean premium ambient: leaves + soft glow + scroll parallax + hero slider */
(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqMobile = window.matchMedia ? window.matchMedia('(max-width: 720px)') : null;
  var isMobile = mqMobile ? mqMobile.matches : false;

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

  function setupAmbient() {
    if (document.querySelector('.ambient-nature')) return;

    var layer = document.createElement('div');
    layer.className = 'ambient-nature' + (isMobile ? ' is-mobile' : ' is-desktop');
    layer.setAttribute('aria-hidden', 'true');

    // Soft brand glow orbs
    var orbs = document.createElement('div');
    orbs.className = 'ambient-orbs';
    for (var o = 1; o <= 3; o++) {
      var orb = document.createElement('span');
      orb.className = 'ambient-orb ambient-orb-' + o;
      orbs.appendChild(orb);
    }
    layer.appendChild(orbs);

    // Leaves — optimized counts
    if (!reduceMotion) {
      var count = isMobile ? 8 : 14;
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

        var left = Math.random() * 100;
        leaf.style.left = left + '%';
        leaf.style.bottom = (-8 - Math.random() * 20) + '%';
        leaf.style.setProperty('--delay', (Math.random() * 14).toFixed(1) + 's');
        leaf.style.setProperty('--dur', (12 + Math.random() * 14).toFixed(1) + 's');
        leaf.style.setProperty('--x', ((Math.random() - 0.5) * 80).toFixed(0) + 'px');
        leaf.style.setProperty('--rot', (80 + Math.random() * 200).toFixed(0) + 'deg');
        leaf.style.setProperty('--op', (0.22 + Math.random() * 0.28).toFixed(2));
        layer.appendChild(leaf);
      }
    }

    document.body.prepend(layer);

    if (mqMobile) {
      mqMobile.addEventListener('change', function (e) {
        isMobile = e.matches;
        layer.classList.toggle('is-mobile', isMobile);
        layer.classList.toggle('is-desktop', !isMobile);
      });
    }
  }

  function setupScrollParallax() {
    if (reduceMotion) return;
    var layer = document.querySelector('.ambient-nature');
    if (!layer) return;
    var ticking = false;
    var maxShift = isMobile ? 60 : 120;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY || 0;
        var shift = Math.min(y * (isMobile ? 0.06 : 0.1), maxShift);
        layer.style.transform = 'translate3d(0,' + (-shift) + 'px,0)';
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function setupFooterLeaves() {
    var footer = document.querySelector('.site-footer');
    if (!footer || footer.querySelector('.leaf-field')) return;
    if (reduceMotion) return;
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
    setupAmbient();
    setupWordShift();
    setupHeroSlider();
    setupFooterLeaves();
    setupScrollParallax();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
