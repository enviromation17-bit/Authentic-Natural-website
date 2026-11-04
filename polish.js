'use strict';
/* Correct ingredient photos (Wikimedia Commons / free) + hero words + footer leaves */
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

  // Accurate free photos — one correct plant/source per ingredient
  // Prefer Wikimedia Commons (labeled botanicals, free license)
  var W = 'https://upload.wikimedia.org/wikipedia/commons/thumb/';
  var photoMap = {
    // Rosemary plant (Rosmarinus officinalis)
    'Rosemary Oil': W + 'f/f1/Rosmarinus_officinalis_%28Lamiaceae%29.jpg/640px-Rosmarinus_officinalis_%28Lamiaceae%29.jpg',
    // Peppermint leaves (Mentha × piperita)
    'Peppermint Oil': W + '6/6c/Peppermint_leaves_with_scale.jpg/640px-Peppermint_leaves_with_scale.jpg',
    // Tea tree / Melaleuca
    'Tea Tree Oil': W + '1/1c/Melaleuca_alternifolia.jpg/640px-Melaleuca_alternifolia.jpg',
    // Lavender field Provence
    'Lavender Oil': W + '3/35/Lavender_Field_Provence_France_021.JPG/640px-Lavender_Field_Provence_France_021.JPG',
    // Castor plant seeds (Ricinus)
    'Castor Oil': W + '8/8e/Ricinus_communis_seeds.jpg/640px-Ricinus_communis_seeds.jpg',
    // Coconut oil jar
    'Coconut Oil': W + '6/6d/Coconut_oil_2.jpg/640px-Coconut_oil_2.jpg',
    // Olive branch with olives
    'Olive Oil': W + '8/84/Olives_on_tree.jpg/640px-Olives_on_tree.jpg',
    // Jojoba seeds
    'Jojoba Oil': W + 'd/d7/Simmondsia_chinensis_seeds.jpg/640px-Simmondsia_chinensis_seeds.jpg',
    // Almonds
    'Almond Oil': W + '5/5c/Almonds.jpg/640px-Almonds.jpg',
    // Moringa leaves
    'Moringa Oil': W + '6/69/Moringa_oleifera_leaves.jpg/640px-Moringa_oleifera_leaves.jpg',
    // Rose hips
    'Rosehip Oil': W + 'a/a5/Rosa_canina_hips.jpg/640px-Rosa_canina_hips.jpg',
    // Onion
    'Onion Oil': W + '2/25/Onion_on_White.jpg/640px-Onion_on_White.jpg',
    // Black cumin / Nigella seeds
    'Black Seed Oil': W + '4/4e/Nigella_sativa_seeds.jpg/640px-Nigella_sativa_seeds.jpg',
    // Pumpkin seeds
    'Pumpkin Seed Oil': W + '9/9b/Pumpkin_seeds.jpg/640px-Pumpkin_seeds.jpg',
    // Fenugreek seeds
    'Fenugreek Oil': W + '9/9d/Fenugreek_seeds.jpg/640px-Fenugreek_seeds.jpg',
    // Amla / Indian gooseberry
    'Amla Oil': W + '1/1f/Amla_fruit.jpg/640px-Amla_fruit.jpg',
    // Sesame seeds
    'Sesame Oil': W + '0/08/Sesame_seeds.jpg/640px-Sesame_seeds.jpg',
    // Flax seeds
    'Flaxseed Oil': W + '6/6d/Flax_seed.jpg/640px-Flax_seed.jpg',
    // Eggs
    'Egg Oil': W + '5/5e/Chicken_egg.jpg/640px-Chicken_egg.jpg',
    // Ginger + garlic
    'Garlic & Ginger Extracts': W + '3/3e/Ginger_and_garlic.jpg/640px-Ginger_and_garlic.jpg',
    // Curry leaves
    'Curry Leaves': W + '4/4b/Curry_leaves.jpg/640px-Curry_leaves.jpg',
    // Henna leaves
    'Henna Leaves': W + 'd/d0/Henna_%28Lawsonia_inermis%29_leaves.jpg/640px-Henna_%28Lawsonia_inermis%29_leaves.jpg',
    // Cinnamon sticks
    'Cinnamon Oil': W + '3/3e/Cinnamon-other.jpg/640px-Cinnamon-other.jpg'
  };

  // Fallbacks if a Commons thumb 404s — still themed correctly via Unsplash search-style fixed IDs
  var fallbackMap = {
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
    'Pumpkin Seed Oil': 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=640&h=480&fit=crop&q=80',
    'Fenugreek Oil': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=640&h=480&fit=crop&q=80',
    'Amla Oil': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=640&h=480&fit=crop&q=80',
    'Sesame Oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=640&h=480&fit=crop&q=80',
    'Flaxseed Oil': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=640&h=480&fit=crop&q=80',
    'Egg Oil': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=640&h=480&fit=crop&q=80',
    'Garlic & Ginger Extracts': 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=640&h=480&fit=crop&q=80',
    'Curry Leaves': 'https://images.unsplash.com/photo-1466692476866-aef1dfb1e735?w=640&h=480&fit=crop&q=80',
    'Henna Leaves': 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=640&h=480&fit=crop&q=80',
    'Cinnamon Oil': 'https://images.unsplash.com/photo-1553452118-073c5f751c5a?w=640&h=480&fit=crop&q=80'
  };

  function enhanceCards() {
    document.querySelectorAll('.ingredient-card').forEach(function (card) {
      if (card.dataset.photoReady) return;
      card.dataset.photoReady = '1';
      var title = card.querySelector('h3');
      if (!title) return;
      var name = title.textContent.trim();
      var primary = photoMap[name] || fallbackMap[name];
      var secondary = fallbackMap[name] || primary;
      if (!primary) return;

      var media = document.createElement('div');
      media.className = 'ingredient-media';
      media.setAttribute('aria-hidden', 'true');

      var img = document.createElement('img');
      img.alt = name;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.referrerPolicy = 'no-referrer';
      img.src = primary;
      img.onerror = function () {
        if (img.dataset.fallback) return;
        img.dataset.fallback = '1';
        img.src = secondary;
      };
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
