'use strict';
/* Free-orbit product object — ONE place only (shop gallery).
   Client can move the product in any direction to inspect it. */
(function () {
  function setupOrbit(container, img) {
    if (!container || !img || container.dataset.orbitReady) return;
    container.dataset.orbitReady = '1';
    container.classList.add('orbit-stage');

    // Isolate product as an object on a stage
    var stage = document.createElement('div');
    stage.className = 'orbit-stage-inner';
    stage.setAttribute('role', 'img');
    stage.setAttribute('aria-label', 'Interactive product. Drag to move in any direction.');

    var object = document.createElement('div');
    object.className = 'orbit-object';

    var shadow = document.createElement('div');
    shadow.className = 'orbit-floor-shadow';

    var hint = document.createElement('div');
    hint.className = 'orbit-hint';
    hint.innerHTML = '<strong>Move the product</strong><span>Drag in any direction to inspect</span>';

    // Detach image into the orbit object
    img.classList.add('orbit-product-img');
    img.removeAttribute('width');
    img.removeAttribute('height');
    object.appendChild(img);

    stage.appendChild(object);
    stage.appendChild(shadow);
    stage.appendChild(hint);

    // Place stage where the image / zoom button was
    var zoomBtn = container.querySelector('#zoom-image') || container.querySelector('.image-zoom');
    if (zoomBtn) {
      zoomBtn.replaceWith(stage);
    } else {
      container.insertBefore(stage, container.firstChild);
    }

    // Free orbit state (product orientation)
    var rotX = 8;
    var rotY = -22;
    var targetX = rotX;
    var targetY = rotY;
    var dragging = false;
    var lastX = 0;
    var lastY = 0;
    var velocityX = 0;
    var velocityY = 0;

    function apply() {
      object.style.transform =
        'rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg)';
      // Shadow stretches with angle
      var sx = 1 + Math.abs(rotY) / 90 * 0.25;
      var sy = 1 - Math.abs(rotX) / 40 * 0.15;
      shadow.style.transform =
        'translateX(-50%) scale(' + sx.toFixed(3) + ', ' + Math.max(0.55, sy).toFixed(3) + ')';
      shadow.style.opacity = String(0.35 + Math.abs(rotX) / 80);
    }

    function animate() {
      if (!dragging) {
        // inertia
        velocityX *= 0.92;
        velocityY *= 0.92;
        if (Math.abs(velocityX) > 0.01 || Math.abs(velocityY) > 0.01) {
          rotY += velocityY;
          rotX += velocityX;
          rotX = Math.max(-35, Math.min(35, rotX));
          apply();
        }
      }
      requestAnimationFrame(animate);
    }

    function pointerPos(e) {
      if (e.touches && e.touches[0]) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      return { x: e.clientX, y: e.clientY };
    }

    function onDown(e) {
      dragging = true;
      stage.classList.add('is-dragging');
      var p = pointerPos(e);
      lastX = p.x;
      lastY = p.y;
      velocityX = 0;
      velocityY = 0;
      e.preventDefault();
    }

    function onMove(e) {
      if (!dragging) return;
      var p = pointerPos(e);
      var dx = p.x - lastX;
      var dy = p.y - lastY;
      lastX = p.x;
      lastY = p.y;
      // Horizontal drag → rotate product left/right
      // Vertical drag → tilt product up/down
      rotY += dx * 0.55;
      rotX = Math.max(-35, Math.min(35, rotX - dy * 0.4));
      velocityY = dx * 0.25;
      velocityX = -dy * 0.15;
      apply();
      e.preventDefault();
    }

    function onUp() {
      dragging = false;
      stage.classList.remove('is-dragging');
    }

    stage.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    stage.addEventListener('touchstart', onDown, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);

    // Reset on double-click
    stage.addEventListener('dblclick', function () {
      rotX = 8;
      rotY = -22;
      velocityX = 0;
      velocityY = 0;
      apply();
    });

    apply();
    requestAnimationFrame(animate);
  }

  function init() {
    // Keep the standard product photograph on phones and tablets: no permanent RAF loop.
    if (window.matchMedia('(max-width: 900px), (prefers-reduced-motion: reduce)').matches) return;
    // ONLY shop product — not hero
    var galleryImg = document.getElementById('gallery-image');
    var galleryBox = document.querySelector('.gallery .main-image');
    if (galleryImg && galleryBox) {
      setupOrbit(galleryBox, galleryImg);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
