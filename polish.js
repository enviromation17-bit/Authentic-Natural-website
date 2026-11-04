'use strict';
/* Premium ambient: photo backdrop + leaves + hero slider + scroll depth */
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
        setTimeout(function () { em.classList.remove('is-in'); }, 450);
      }, 320);
    }, 3200);
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
    layer.className = 'ambient-nature';
    layer.setAttribute('aria-hidden', 'true');

    /* Soft photo panels — brand product shots, blurred, different layout per device */
    var photos = document.createElement('div');
    photos.className = 'ambient-photos';

    var desktopShots = [
      { src: 'public/assets/botanicals.png', cls: 'ap-desk ap-1' },
      { src: 'public/assets/ritual.png', cls: 'ap-desk ap-2' },
      { src: 'public/assets/product.png', cls: 'ap-desk ap-3' }
    ];
    var mobileShots = [
      { src: 'public/assets/botanicals.png', cls: 'ap-mob ap-m1' },
      { src: 'public/assets/ritual.png', cls: 'ap-mob ap-m2' }
    ];

    desktopShots.forEach(function (item) {
      var fig = document.createElement('figure');
      fig.className = 'ambient-photo ' + item.cls;
      var img = document.createElement('img');
      img.src = item.src;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      fig.appendChild(img);
      photos.appendChild(fig);
    });
    mobileShots.forEach(function (item) {
      var fig = document.createElement('figure');
      fig.className = 'ambient-photo ' + item.cls;
      var img = document.createElement('img');
      img.src = item.src;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      fig.appendChild(img);
      photos.appendChild(fig);
    });
    layer.appendChild(photos);

    /* Soft color orbs */
    var orbs = document.createElement('div');
    orbs.className = 'ambient-orbs';
    for (var o = 0; o < 3; o++) {
      var orb = document.createElement('span');
      orb.className = 'ambient-orb ambient-orb-' + (o + 1);
      orbs.appendChild(orb);
    }
    layer.appendChild(orbs);

    /* Floating leaves */
    var leafCount = reduceMotion ? 0 : (isMobile ? 9 : 16);
    var paths = [
      'M12 2C8 8 4 12 12 22C20 12 16 8 12 2Z',
      'M10 3C6 9 3 14 12 21C18 13 16 7 10 3Z',
      'M14 2C9 7 5 13 12 22C19 14 18 6 14 2Z',
      'M12 3C7 6 5 14 12 21C19 14 17 6 12 3Z'
    ];
    var colors = ['#a8c48a', '#7a9a5c', '#c5d4a8', '#8fad70', '#b8c99a'];

    for (var i = 0; i < leafCount; i++) {
      var leaf = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      leaf.setAttribute('class', 'ambient-leaf');
      leaf.setAttribute('viewBox', '0 0 24 24');
      var size = (isMobile ? 13 : 15) + (i % 5) * 5;
      leaf.setAttribute('width', String(size));
      leaf.setAttribute('height', String(size));
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', paths[i % paths.length]);
      path.setAttribute('fill', colors[i % colors.length]);
      leaf.appendChild(path);
      leaf.style.left = Math.random() * 100 + '%';
      leaf.style.top = Math.random() * 100 + '%';
      leaf.style.animationDelay = Math.random() * 18 + 's';
      leaf.style.animationDuration = 16 + Math.random() * 20 + 's';
      leaf.style.opacity = String(0.16 + Math.random() * 0.26);
      leaf.style.setProperty('--drift', (Math.random() > 0.5 ? 1 : -1) * (18 + Math.random() * 36) + 'px');
      leaf.style.setProperty('--spin', 100 + Math.random() * 220 + 'deg');
      layer.appendChild(leaf);
    }

    /* Soft golden oil-drop particles (premium accent) */
    if (!reduceMotion) {
      var drops = isMobile ? 4 : 7;
      for (var d = 0; d < drops; d++) {
        var drop = document.createElement('span');
        drop.className = 'ambient-drop';
        drop.style.left = 10 + Math.random() * 80 + '%';
        drop.style.animationDelay = Math.random() * 12 + 's';
        drop.style.animationDuration = 10 + Math.random() * 10 + 's';
        layer.appendChild(drop);
      }
    }

    document.body.prepend(layer);

    if (mqMobile) {
      mqMobile.addEventListener('change', function (e) {
        isMobile = e.matches;
      });
    }
  }

  function setupScrollParallax() {
    if (reduceMotion) return;
    var layer = document.querySelector('.ambient-nature');
    var photos = document.querySelector('.ambient-photos');
    if (!layer) return;
    var ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY || 0;
        var shift = Math.min(y * 0.1, 160);
        layer.style.transform = 'translate3d(0,' + (shift * -0.3) + 'px,0)';
        if (photos) {
          photos.style.transform = 'translate3d(0,' + (shift * -0.15) + 'px,0)';
        }
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function setupFooterLeaves() {
    var footer = document.querySelector('.site-footer');
    if (!footer || footer.querySelector('.leaf-field')) return;
    var field = document.createElement('div');
    field.className = 'leaf-field';
    field.setAttribute('aria-hidden', 'true');
    var paths = [
      'M12 2C8 8 4 12 12 22C20 12 16 8 12 2Z',
      'M10 3C6 9 3 14 12 21C18 13 16 7 10 3Z',
      'M14 2C9 7 5 13 12 22C19 14 18 6 14 2Z'
    ];
    var count = isMobile ? 8 : 14;
    for (var i = 0; i < count; i++) {
      var leaf = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      leaf.setAttribute('class', 'footer-leaf');
      leaf.setAttribute('viewBox', '0 0 24 24');
      leaf.setAttribute('width', String(16 + (i % 5) * 5));
      leaf.setAttribute('height', String(16 + (i % 5) * 5));
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', paths[i % paths.length]);
      path.setAttribute('fill', i % 3 === 0 ? '#a8c48a' : i % 3 === 1 ? '#7a9a5c' : '#c5d4a8');
      leaf.appendChild(path);
      leaf.style.left = Math.random() * 100 + '%';
      leaf.style.animationDelay = Math.random() * 12 + 's';
      leaf.style.animationDuration = 10 + Math.random() * 14 + 's';
      leaf.style.opacity = String(0.22 + Math.random() * 0.35);
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
  window.addEventListener('load', setupFooterLeaves);
})();
