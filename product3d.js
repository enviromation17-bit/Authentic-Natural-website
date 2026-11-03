'use strict';
/* Interactive 3D tilt on product photos — drag or move pointer */
(function () {
  function setupTilt(el) {
    if (!el || el.dataset.tiltReady) return;
    el.dataset.tiltReady = '1';
    el.classList.add('product-3d');

    var inner = el.querySelector('img') || el;
    var rect, cx, cy;
    var max = 14; // degrees

    function frame() {
      rect = el.getBoundingClientRect();
      cx = rect.left + rect.width / 2;
      cy = rect.top + rect.height / 2;
    }

    function apply(x, y) {
      frame();
      var dx = (x - cx) / (rect.width / 2);
      var dy = (y - cy) / (rect.height / 2);
      dx = Math.max(-1, Math.min(1, dx));
      dy = Math.max(-1, Math.min(1, dy));
      var rotY = dx * max;
      var rotX = -dy * max;
      inner.style.transform =
        'perspective(900px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) scale3d(1.04,1.04,1.04)';
      el.style.setProperty('--shine-x', ((dx + 1) * 50) + '%');
      el.style.setProperty('--shine-y', ((dy + 1) * 50) + '%');
    }

    function reset() {
      inner.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    }

    el.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch' && !el.classList.contains('is-dragging')) return;
      apply(e.clientX, e.clientY);
    });
    el.addEventListener('pointerleave', reset);
    el.addEventListener('pointerdown', function (e) {
      el.classList.add('is-dragging');
      try { el.setPointerCapture(e.pointerId); } catch (_) {}
      apply(e.clientX, e.clientY);
    });
    el.addEventListener('pointerup', function () {
      el.classList.remove('is-dragging');
      reset();
    });
    el.addEventListener('pointercancel', function () {
      el.classList.remove('is-dragging');
      reset();
    });
  }

  function init() {
    document.querySelectorAll('.gallery .main-image, .hero-photo').forEach(setupTilt);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* Autoplay product video (muted) when section is in view */
(function () {
  function init() {
    var section = document.querySelector('.video-section');
    var video = section && section.querySelector('video');
    if (!video) return;

    video.muted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.playsInline = true;
    video.setAttribute('loop', '');
    video.loop = true;
    // keep controls so user can unmute

    if (!('IntersectionObserver' in window)) {
      video.play().catch(function () {});
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          video.play().catch(function () {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.35 });

    obs.observe(section);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
