'use strict';
/* Real ingredient photos on hover + hero word shift + footer leaves */
(function () {
  // Hero word shift
  function setupWordShift() {
    var h1 = document.getElementById('hero-title');
    if (!h1) return;
    var em = h1.querySelector('em');
    if (!em) return;
    var words = ['a little more care.', 'softer, smoother hair.', 'time for yourself.', 'natural everyday care.'];
    var i = 0;
    em.classList.add('word-shift');
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

  // Real botanical / oil photos (Unsplash, free to use)
  var photoMap = {
    'Rosemary Oil': 'https://images.unsplash.com/photo-1515586007058-55376348f21f?w=640&h=480&fit=crop&q=80',
    'Peppermint Oil': 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=640&h=480&fit=crop&q=80',
    'Tea Tree Oil': 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=640&h=480&fit=crop&q=80',
    'Lavender Oil': 'https://images.unsplash.com/photo-1499002238440-d024cdb93963?w=640&h=480&fit=crop&q=80',
    'Castor Oil': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=640&h=480&fit=crop&q=80',
    'Coconut Oil': 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=640&h=480&fit=crop&q=80',
    'Olive Oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=640&h=480&fit=crop&q=80',
    'Jojoba Oil': 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=640&h=480&fit=crop&q=80',
    'Almond Oil': 'https://images.unsplash.com/photo-1508747703725-719777637510?w=640&h=480&fit=crop&q=80',
    'Moringa Oil': 'https://images.unsplash.com/photo-1466692476866-aef1dfb1e735?w=640&h=480&fit=crop&q=80',
    'Rosehip Oil': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=640&h=480&fit=crop&q=80',
    'Onion Oil': 'https://images.unsplash.com/photo-1518977956812-cd3d41ea4d16?w=640&h=480&fit=crop&q=80',
    'Black Seed Oil': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=640&h=480&fit=crop&q=80',
    'Pumpkin Seed Oil': 'https://images.unsplash.com/photo-1568584711070-0f5a0d6e0f0a?w=640&h=480&fit=crop&q=80',
    'Fenugreek Oil': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=640&h=480&fit=crop&q=80',
    'Amla Oil': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=640&h=480&fit=crop&q=80',
    'Sesame Oil': 'https://images.unsplash.com/photo-1635321595217-b18c6f0c4b8e?w=640&h=480&fit=crop&q=80',
    'Flaxseed Oil': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=640&h=480&fit=crop&q=80',
    'Egg Oil': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=640&h=480&fit=crop&q=80',
    'Garlic & Ginger Extracts': 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=640&h=480&fit=crop&q=80',
    'Curry Leaves': 'https://images.unsplash.com/photo-1466692476866-aef1dfb1e735?w=640&h=480&fit=crop&q=80',
    'Henna Leaves': 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=640&h=480&fit=crop&q=80',
    'Cinnamon Oil': 'https://images.unsplash.com/photo-1553452118-073c5f751c5a?w=640&h=480&fit=crop&q=80'
  };
  var fallback = 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=640&h=480&fit=crop&q=80';

  function enhanceCards() {
    document.querySelectorAll('.ingredient-card').forEach(function (card) {
      if (card.dataset.photoReady) return;
      card.dataset.photoReady = '1';
      var title = card.querySelector('h3');
      if (!title) return;
      var name = title.textContent.trim();
      var url = photoMap[name] || fallback;

      var media = document.createElement('div');
      media.className = 'ingredient-media';
      media.setAttribute('aria-hidden', 'true');

      var img = document.createElement('img');
      img.src = url;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.referrerPolicy = 'no-referrer';
      media.appendChild(img);

      card.prepend(media);
      card.classList.add('has-photo');

      // Preload on first hover for faster show
      card.addEventListener('mouseenter', function () {
        if (!img.complete) {
          var pre = new Image();
          pre.src = url;
        }
      }, { once: true });
    });
  }

  function watchGrid() {
    var grid = document.getElementById('ingredient-grid');
    if (!grid) return;
    enhanceCards();
    var obs = new MutationObserver(function () { enhanceCards(); });
    obs.observe(grid, { childList: true });
  }

  // Animated green leaves in footer
  function setupFooterLeaves() {
    var footer = document.querySelector('.site-footer');
    if (!footer || footer.querySelector('.leaf-field')) return;

    var field = document.createElement('div');
    field.className = 'leaf-field';
    field.setAttribute('aria-hidden', 'true');

    var leafPaths = [
      'M12 2C8 8 4 12 12 22C20 12 16 8 12 2Z',
      'M10 3C6 9 3 14 12 21C18 13 16 7 10 3Z',
      'M14 2C9 7 5 13 12 22C19 14 18 6 14 2Z'
    ];

    for (var i = 0; i < 18; i++) {
      var leaf = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      leaf.setAttribute('class', 'footer-leaf');
      leaf.setAttribute('viewBox', '0 0 24 24');
      leaf.setAttribute('width', String(18 + (i % 5) * 6));
      leaf.setAttribute('height', String(18 + (i % 5) * 6));
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', leafPaths[i % leafPaths.length]);
      path.setAttribute('fill', i % 3 === 0 ? '#a8c48a' : i % 3 === 1 ? '#7a9a5c' : '#c5d4a8');
      leaf.appendChild(path);

      leaf.style.left = (Math.random() * 100) + '%';
      leaf.style.animationDelay = (Math.random() * 12) + 's';
      leaf.style.animationDuration = (10 + Math.random() * 14) + 's';
      leaf.style.opacity = String(0.25 + Math.random() * 0.45);
      field.appendChild(leaf);
    }

    footer.insertBefore(field, footer.firstChild);
  }

  function start() {
    setupWordShift();
    watchGrid();
    setupFooterLeaves();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
  window.addEventListener('load', function () {
    enhanceCards();
    setupFooterLeaves();
  });
})();
