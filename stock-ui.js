'use strict';
/* Simple product status — no unverified stock warnings on the storefront. */
(() => {
  const label = document.getElementById('stock-availability');
  const cartNote = document.getElementById('cart-stock-note');
  const add = document.getElementById('add-cart');
  if (label) {
    label.dataset.stock = 'ready';
    label.textContent = 'Ready to order · Free delivery across Pakistan';
  }
  if (cartNote) {
    cartNote.hidden = true;
    cartNote.textContent = '';
  }
  if (add) add.textContent = 'Add to bag ↗';
  window.ANStock = {
    current: { availability: 'in_stock', available: null, restockNote: '' },
    refresh: function () {
      return Promise.resolve(window.ANStock.current);
    }
  };
})();
