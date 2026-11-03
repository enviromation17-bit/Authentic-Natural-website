'use strict';
const $ = (s) => document.querySelector(s);
const price = 1499;
const storageKey = 'authentic-naturals-bag-v1';
const clamp = (n) => Math.max(0, Math.min(20, Number.isFinite(Number(n)) ? Math.trunc(Number(n)) : 0));
let bag = 0;
try { bag = clamp(localStorage.getItem(storageKey)); } catch {}
const saveBag = () => { try { localStorage.setItem(storageKey, String(bag)); } catch {} };

const ingredients = [
  { name: 'Coconut Oil', benefit: 'softness', note: 'Softens and conditions hair' },
  { name: 'Olive Oil', benefit: 'softness', note: 'Adds softness and shine' },
  { name: 'Castor Oil', benefit: 'scalp', note: 'Supports scalp comfort' },
  { name: 'Jojoba Oil', benefit: 'softness', note: 'Lightweight conditioning' },
  { name: 'Tea Tree Oil', benefit: 'scalp', note: 'Fresh scalp feel' },
  { name: 'Lavender Oil', benefit: 'scalp', note: 'Calming aroma' },
  { name: 'Rosemary Oil', benefit: 'scalp', note: 'Traditional scalp care' },
  { name: 'Peppermint Oil', benefit: 'scalp', note: 'Cooling sensation' },
  { name: 'Rosehip Oil', benefit: 'softness', note: 'Nourishing care' },
  { name: 'Moringa Oil', benefit: 'softness', note: 'Lightweight nourishment' },
  { name: 'Orange Oil', benefit: 'softness', note: 'Fresh citrus note' },
  { name: 'Almond Oil', benefit: 'softness', note: 'Softens hair strands' },
  { name: 'Egg Oil', benefit: 'softness', note: 'Traditional conditioning' },
  { name: 'Cinnamon Oil', benefit: 'scalp', note: 'Warm aromatic care' },
  { name: 'Onion Oil', benefit: 'scalp', note: 'Traditional scalp blend' },
  { name: 'Poppy Seed Oil', benefit: 'softness', note: 'Gentle conditioning' },
  { name: 'Pumpkin Seed Oil', benefit: 'softness', note: 'Nourishing plant oil' },
  { name: 'Coriander Oil', benefit: 'scalp', note: 'Herbal freshness' },
  { name: 'Ushna Oil', benefit: 'scalp', note: 'Traditional care oil' },
  { name: 'Amla', benefit: 'softness', note: 'Ayurvedic hair tonic' },
  { name: 'Reetha and Shikakai Oil', benefit: 'softness', note: 'Gentle cleansing oils' },
  { name: 'Sesame Oil', benefit: 'softness', note: 'Classic hair oil' },
  { name: 'Fenugreek Seed Oil', benefit: 'scalp', note: 'Traditional seed oil' },
  { name: 'Nagarmotha Oil', benefit: 'scalp', note: 'Herbal scalp care' },
  { name: 'Flaxseed Oil', benefit: 'softness', note: 'Lightweight nourishment' },
  { name: 'Ginger', benefit: 'scalp', note: 'Warming botanical' },
  { name: 'Garlic', benefit: 'scalp', note: 'Traditional botanical' },
  { name: 'Black Seed', benefit: 'scalp', note: 'Traditional seed care' },
  { name: 'Henna Leaves', benefit: 'softness', note: 'Traditional leaf care' },
  { name: 'Curry Leaves', benefit: 'softness', note: 'Traditional leaf care' },
];

function updateBagUI() {
  const countEls = document.querySelectorAll('[data-bag-count]');
  countEls.forEach((el) => { el.textContent = String(bag); });
  const totalEl = document.getElementById('bag-total');
  if (totalEl) totalEl.textContent = 'Rs. ' + (bag * price).toLocaleString('en-PK');
  const empty = document.getElementById('bag-empty');
  const filled = document.getElementById('bag-filled');
  if (empty && filled) {
    empty.hidden = bag > 0;
    filled.hidden = bag === 0;
  }
  saveBag();
}

function openBag() {
  const drawer = document.getElementById('bag-drawer');
  const overlay = document.getElementById('bag-overlay');
  if (drawer) drawer.classList.add('open');
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeBag() {
  const drawer = document.getElementById('bag-drawer');
  const overlay = document.getElementById('bag-overlay');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function addToBag(qty) {
  bag = clamp(bag + (qty || 1));
  updateBagUI();
  openBag();
}

function setBag(n) {
  bag = clamp(n);
  updateBagUI();
}

function orderWhatsApp() {
  if (bag < 1) return;
  const msg = encodeURIComponent(
    'Hello Authentic Naturals,\n\nI would like to order:\n• Hair Repair & Revive Growth Oil × ' +
      bag +
      '\nTotal: Rs. ' +
      (bag * price).toLocaleString('en-PK') +
      '\n\nPlease confirm availability and delivery.'
  );
  window.open('https://wa.me/923248019501?text=' + msg, '_blank', 'noopener');
}

// Ingredient grid
function renderIngredients(filter, search) {
  const grid = document.getElementById('ingredient-grid');
  const countEl = document.getElementById('ingredient-count');
  if (!grid) return;
  const q = (search || '').trim().toLowerCase();
  const list = ingredients.filter((ing) => {
    const matchFilter = filter === 'all' || ing.benefit === filter;
    const matchSearch =
      !q ||
      ing.name.toLowerCase().includes(q) ||
      ing.note.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });
  grid.innerHTML = list
    .map(
      (ing) =>
        `<article class="ingredient-card"><h3>${ing.name}</h3><p>${ing.note}</p><span class="tag">${ing.benefit === 'softness' ? 'Softness & shine' : 'Scalp care'}</span></article>`
    )
    .join('');
  if (countEl) {
    countEl.textContent =
      list.length === 0
        ? 'No matching ingredients.'
        : `Showing ${list.length} of ${ingredients.length} ingredients`;
  }
}

// Usage steps
let usageStep = 0;
const usageSteps = 6;
function showUsageStep(i) {
  usageStep = ((i % usageSteps) + usageSteps) % usageSteps;
  document.querySelectorAll('[data-usage-step]').forEach((el, idx) => {
    el.hidden = idx !== usageStep;
  });
  document.querySelectorAll('[data-usage-dot]').forEach((el, idx) => {
    el.classList.toggle('active', idx === usageStep);
  });
}

// Image zoom
function openZoom(src, alt) {
  const modal = document.getElementById('zoom-modal');
  const img = document.getElementById('zoom-img');
  if (!modal || !img) return;
  img.src = src;
  img.alt = alt || '';
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeZoom() {
  const modal = document.getElementById('zoom-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  updateBagUI();
  renderIngredients('all', '');

  document.querySelectorAll('[data-add-bag]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const qty = Number(btn.getAttribute('data-add-bag')) || 1;
      addToBag(qty);
    });
  });

  const bagOpenBtn = document.getElementById('bag-open');
  if (bagOpenBtn) bagOpenBtn.addEventListener('click', openBag);
  const bagCloseBtn = document.getElementById('bag-close');
  if (bagCloseBtn) bagCloseBtn.addEventListener('click', closeBag);
  const bagOverlay = document.getElementById('bag-overlay');
  if (bagOverlay) bagOverlay.addEventListener('click', closeBag);

  const bagMinus = document.getElementById('bag-minus');
  const bagPlus = document.getElementById('bag-plus');
  if (bagMinus) bagMinus.addEventListener('click', () => setBag(bag - 1));
  if (bagPlus) bagPlus.addEventListener('click', () => setBag(bag + 1));

  const orderBtn = document.getElementById('bag-order');
  if (orderBtn) orderBtn.addEventListener('click', orderWhatsApp);

  // Filters
  let currentFilter = 'all';
  document.querySelectorAll('[data-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentFilter = btn.getAttribute('data-filter') || 'all';
      document.querySelectorAll('[data-filter]').forEach((b) => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      const search = document.getElementById('ingredient-search');
      renderIngredients(currentFilter, search ? search.value : '');
    });
  });

  const searchInput = document.getElementById('ingredient-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderIngredients(currentFilter, searchInput.value);
    });
  }

  // Usage nav
  showUsageStep(0);
  const prev = document.getElementById('usage-prev');
  const next = document.getElementById('usage-next');
  if (prev) prev.addEventListener('click', () => showUsageStep(usageStep - 1));
  if (next) next.addEventListener('click', () => showUsageStep(usageStep + 1));
  document.querySelectorAll('[data-usage-dot]').forEach((dot, idx) => {
    dot.addEventListener('click', () => showUsageStep(idx));
  });

  // Zoom
  document.querySelectorAll('[data-zoom]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const src = el.getAttribute('href') || el.getAttribute('src');
      const alt = el.getAttribute('alt') || '';
      if (src) openZoom(src, alt);
    });
  });
  const zoomClose = document.getElementById('zoom-close');
  const zoomModal = document.getElementById('zoom-modal');
  if (zoomClose) zoomClose.addEventListener('click', closeZoom);
  if (zoomModal) {
    zoomModal.addEventListener('click', (e) => {
      if (e.target === zoomModal) closeZoom();
    });
  }

  // Mobile nav
  const menuBtn = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      menuBtn.setAttribute(
        'aria-expanded',
        mobileNav.classList.contains('open') ? 'true' : 'false'
      );
    });
    mobileNav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }
});
