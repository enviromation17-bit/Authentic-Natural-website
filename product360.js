'use strict';
/* Lightweight, accessible product photo viewer.
   No continuous animation frames or device-specific fake 3D rotation. */
(function () {
  function init() {
    const trigger = document.getElementById('zoom-image');
    const galleryImage = document.getElementById('gallery-image');
    const dialog = document.getElementById('image-dialog');
    const large = document.getElementById('large-image');
    const sizeToggle = document.getElementById('toggle-image-size');
    if (!trigger || !galleryImage || !dialog || !large) return;
    let originalSize = false;
    trigger.addEventListener('click', () => {
      large.src = galleryImage.currentSrc || galleryImage.src;
      large.alt = galleryImage.alt;
      dialog.querySelector('.image-toolbar a')?.setAttribute('href',large.src);
      originalSize = false;
      large.classList.remove('image-original-size');
      dialog.classList.remove('original-size');
      if (sizeToggle) sizeToggle.textContent = 'Zoom to original size';
      if (!dialog.open) dialog.showModal();
    });
    if (sizeToggle) sizeToggle.addEventListener('click', () => {
      originalSize = !originalSize;
      large.classList.toggle('image-original-size', originalSize);
      dialog.classList.toggle('original-size', originalSize);
      sizeToggle.textContent = originalSize ? 'Fit image to window' : 'Zoom to original size';
    });
    dialog.addEventListener('click', event => {
      if (event.target === dialog) dialog.close();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
