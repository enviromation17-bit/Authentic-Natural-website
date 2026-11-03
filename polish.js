'use strict';
/* Hero word shift + ingredient hover photos */
(function () {
  // --- Word shift on hero headline ---
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

  // --- Ingredient photos (Unsplash) on hover ---
  var photoMap = {
    'Rosemary Oil': 'https://images.unsplash.com/photo-1515586007058-55376348f21f?w=480&q=80',
    'Peppermint Oil': 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=480&q=80',
    'Tea Tree Oil': 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=480&q=80',
    'Lavender Oil': 'https://images.unsplash.com/photo-1499002238440-d024cdb93963?w=480&q=80',
    'Castor Oil': 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=480&q=80',
    'Coconut Oil': 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=480&q=80',
    'Olive Oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=480&q=80',
    'Jojoba Oil': 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=480&q=80',
    'Almond Oil': 'https://images.unsplash.com/photo-1508747703725-719777637510?w=480&q=80',
    'Moringa Oil': 'https://images.unsplash.com/photo-1466692476866-aef1dfb1e735?w=480&q=80',
    'Rosehip Oil': 'https://images.unsplash.com/photo-1499002238440-d024cdb93963?w=480&q=80',
    'Onion Oil': 'https://images.unsplash.com/photo-1518977956812-cd3d41ea4d16?w=480&q=80',
    'Black Seed Oil': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=480&q=80',
    'Pumpkin Seed Oil': 'https://images.unsplash.com/photo-1568584711070-0f5a0d6e0f0a?w=480&q=80',
    'Fenugreek Oil': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=480&q=80',
    'Amla Oil': 'https://images.unsplash.com/photo-1466692476866-aef1dfb1e735?w=480&q=80',
    'Sesame Oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=480&q=80',
    'Flaxseed Oil': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=480&q=80',
    'Egg Oil': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=480&q=80',
    'Garlic & Ginger Extracts': 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=480&q=80',
    'Curry Leaves': 'https://images.unsplash.com/photo-1466692476866-aef1dfb1e735?w=480&q=80',
    'Henna Leaves': 'https://images.unsplash.com/photo-1466692476866-aef1dfb1e735?w=480&q=80',
    'Cinnamon Oil': 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=480&q=80'
  };
  var fallback = 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=480&q=80';

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
      media.style.backgroundImage = 'url(' + url + ')';
      card.prepend(media);
      card.classList.add('has-photo');
    });
  }

  // Re-run after app.js renders ingredients
  function watchGrid() {
    var grid = document.getElementById('ingredient-grid');
    if (!grid) return;
    enhanceCards();
    var obs = new MutationObserver(function () { enhanceCards(); });
    obs.observe(grid, { childList: true });
  }

  function start() {
    setupWordShift();
    watchGrid();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
  window.addEventListener('load', enhanceCards);
})();
