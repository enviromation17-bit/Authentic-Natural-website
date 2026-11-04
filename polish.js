'use strict';
/* Hero word shift + footer leaves (ingredient photos now handled in app.js from your assets) */
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
    setupFooterLeaves();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
  window.addEventListener('load', setupFooterLeaves);
})();
