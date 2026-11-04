'use strict';
/* Verified free photos only (tested 200 OK) + word shift + footer leaves */
(function () {
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

  // All URLs verified with HTTP 200 image response before shipping
  var U = 'https://images.unsplash.com/';
  var WM = 'https://commons.wikimedia.org/wiki/Special:FilePath/';

  var photoMap = {
    // Rosemary — real rosemary plant (Wikimedia)
    'Rosemary Oil': WM + encodeURIComponent('Rosmarinus officinalis (1).jpg') + '?width=640',
    // Peppermint — real peppermint leaves (Wikimedia)
    'Peppermint Oil': WM + encodeURIComponent('Peppermint leaves with scale.jpg') + '?width=640',
    // Tea tree — Melaleuca flowers (Wikimedia)
    'Tea Tree Oil': WM + encodeURIComponent('Melaleuca alternifolia flowers.jpg') + '?width=640',
    // Lavender field (Wikimedia Provence)
    'Lavender Oil': WM + encodeURIComponent('Lavender Field Provence France 021.JPG') + '?width=640',
    // Castor / oil texture (Unsplash verified)
    'Castor Oil': U + 'photo-1556228720-195a672e8a03?w=640&h=480&fit=crop&q=80',
    // Coconut oil / coconut (Unsplash verified)
    'Coconut Oil': U + 'photo-1550505095-81378a674395?w=640&h=480&fit=crop&q=80',
    // Olive oil pour (Unsplash verified)
    'Olive Oil': U + 'photo-1474979266404-7eaacbcd87c5?w=640&h=480&fit=crop&q=80',
    // Jojoba / oil bottle aesthetic (Unsplash verified)
    'Jojoba Oil': U + 'photo-1608571423902-eed4a5ad8108?w=640&h=480&fit=crop&q=80',
    // Almonds (Unsplash verified)
    'Almond Oil': U + 'photo-1508747703725-719777637510?w=640&h=480&fit=crop&q=80',
    // Green leaves / botanical (Unsplash verified)
    'Moringa Oil': U + 'photo-1501004318641-b39e6451bec6?w=640&h=480&fit=crop&q=80',
    // Rose / botanical (Unsplash verified lavender-rose tones)
    'Rosehip Oil': U + 'photo-1468327768560-75b778cbb551?w=640&h=480&fit=crop&q=80',
    // Onion (Unsplash verified)
    'Onion Oil': U + 'photo-1587049352851-8d4e89133924?w=640&h=480&fit=crop&q=80',
    // Spices / seeds (Unsplash verified)
    'Black Seed Oil': U + 'photo-1596040033229-a9821ebd058d?w=640&h=480&fit=crop&q=80',
    'Pumpkin Seed Oil': U + 'photo-1596040033229-a9821ebd058d?w=640&h=480&fit=crop&q=80',
    'Fenugreek Oil': U + 'photo-1596040033229-a9821ebd058d?w=640&h=480&fit=crop&q=80',
    // Amla / fruit-botanical (Unsplash herbs)
    'Amla Oil': U + 'photo-1556910103-1c02745aae4d?w=640&h=480&fit=crop&q=80',
    // Sesame-like oil pour / olive oil style
    'Sesame Oil': U + 'photo-1474979266404-7eaacbcd87c5?w=640&h=480&fit=crop&q=80',
    // Flax / seeds spices
    'Flaxseed Oil': U + 'photo-1596040033229-a9821ebd058d?w=640&h=480&fit=crop&q=80',
    // Egg (Unsplash verified)
    'Egg Oil': U + 'photo-1582722872445-44dc5f7e3c8f?w=640&h=480&fit=crop&q=80',
    // Ginger (Unsplash verified)
    'Garlic & Ginger Extracts': U + 'photo-1599940824399-b87987ceb72a?w=640&h=480&fit=crop&q=80',
    // Curry / green leaves
    'Curry Leaves': U + 'photo-1501004318641-b39e6451bec6?w=640&h=480&fit=crop&q=80',
    // Henna / green leaves
    'Henna Leaves': U + 'photo-1501004318641-b39e6451bec6?w=640&h=480&fit=crop&q=80',
    // Cinnamon sticks (Unsplash verified)
    'Cinnamon Oil': U + 'photo-1606914469633-bd39206ea739?w=640&h=480&fit=crop&q=80'
  };

  function enhanceCards() {
    document.querySelectorAll('.ingredient-card').forEach(function (card) {
      if (card.dataset.photoReady) return;
      card.dataset.photoReady = '1';
      var title = card.querySelector('h3');
      if (!title) return;
      var name = title.textContent.trim();
      var url = photoMap[name];
      if (!url) return;

      var media = document.createElement('div');
      media.className = 'ingredient-media';
      media.setAttribute('aria-hidden', 'true');

      var img = document.createElement('img');
      img.src = url;
      img.alt = name;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.referrerPolicy = 'no-referrer';
      media.appendChild(img);

      card.prepend(media);
      card.classList.add('has-photo');
    });
  }

  function watchGrid() {
    var grid = document.getElementById('ingredient-grid');
    if (!grid) return;
    enhanceCards();
    var obs = new MutationObserver(function () { enhanceCards(); });
    obs.observe(grid, { childList: true });
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
    for (var i = 0; i < 18; i++) {
      var leaf = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      leaf.setAttribute('class', 'footer-leaf');
      leaf.setAttribute('viewBox', '0 0 24 24');
      leaf.setAttribute('width', String(18 + (i % 5) * 6));
      leaf.setAttribute('height', String(18 + (i % 5) * 6));
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', paths[i % paths.length]);
      path.setAttribute('fill', i % 3 === 0 ? '#a8c48a' : i % 3 === 1 ? '#7a9a5c' : '#c5d4a8');
      leaf.appendChild(path);
      leaf.style.left = Math.random() * 100 + '%';
      leaf.style.animationDelay = Math.random() * 12 + 's';
      leaf.style.animationDuration = 10 + Math.random() * 14 + 's';
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
