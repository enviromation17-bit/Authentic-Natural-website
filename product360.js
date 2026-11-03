'use strict';
/* Drag-to-spin 360 product stage — single photo, full Y-axis rotation with depth */
(function () {
  function setupStage(container, img) {
    if (!container || !img || container.dataset.spinReady) return;
    container.dataset.spinReady = '1';
    container.classList.add('spin-stage');

    // Structure: stage > turntable > product img + shadow
    var stage = document.createElement('div');
    stage.className = 'spin-stage-inner';
    var table = document.createElement('div');
    table.className = 'spin-turntable';
    var shadow = document.createElement('div');
    shadow.className = 'spin-shadow';
    var badge = document.createElement('div');
    badge.className = 'spin-badge';
    badge.innerHTML = '<span>360°</span><small>Drag to rotate</small>';

    // Move image into turntable
    var parent = img.parentNode;
    var next = img.nextSibling;
    table.appendChild(img);
    table.appendChild(shadow);
    stage.appendChild(table);
    stage.appendChild(badge);
    if (next) parent.insertBefore(stage, next);
    else parent.appendChild(stage);

    var rotY = -18;
    var rotX = 8;
    var dragging = false;
    var lastX = 0;
    var lastY = 0;
    var auto = true;
    var autoDir = 1;
    var raf = 0;

    function render() {
      table.style.transform =
        'rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
      // Soft lighting shift
      var light = 50 + Math.sin((rotY * Math.PI) / 180) * 18;
      img.style.filter =
        'drop-shadow(0 28px 40px rgba(30,50,35,0.22)) brightness(' +
        (0.96 + Math.abs(Math.cos((rotY * Math.PI) / 180)) * 0.06) +
        ')';
    }

    function tick() {
      if (auto && !dragging) {
        rotY += 0.35 * autoDir;
        if (rotY > 28) autoDir = -1;
        if (rotY < -28) autoDir = 1;
        render();
      }
      raf = requestAnimationFrame(tick);
    }

    function onDown(e) {
      dragging = true;
      auto = false;
      container.classList.add('is-spinning');
      lastX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      lastY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      e.preventDefault();
    }
    function onMove(e) {
      if (!dragging) return;
      var x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      var y = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      var dx = x - lastX;
      var dy = y - lastY;
      lastX = x;
      lastY = y;
      rotY += dx * 0.45;
      rotX = Math.max(-12, Math.min(18, rotX - dy * 0.2));
      render();
    }
    function onUp() {
      dragging = false;
      container.classList.remove('is-spinning');
      // gentle auto resume after pause
      setTimeout(function () {
        if (!dragging) auto = true;
      }, 2200);
    }

    stage.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    stage.addEventListener('touchstart', onDown, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);

    // Double-click resets
    stage.addEventListener('dblclick', function () {
      rotY = -18;
      rotX = 8;
      auto = true;
      render();
    });

    render();
    raf = requestAnimationFrame(tick);
  }

  function init() {
    // Shop gallery product
    var galleryImg = document.getElementById('gallery-image');
    var galleryBox = document.querySelector('.gallery .main-image');
    if (galleryImg && galleryBox) setupStage(galleryBox, galleryImg);

    // Hero product
    var heroPhoto = document.querySelector('.hero-photo');
    var heroImg = heroPhoto && heroPhoto.querySelector('img');
    if (heroImg && heroPhoto) setupStage(heroPhoto, heroImg);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
