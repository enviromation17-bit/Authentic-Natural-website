/* Authentic Naturals static storefront */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const PRICE = 1499;
let qty = 1;
const bagStore = {
  get: () => { try { return localStorage.getItem('an-bag'); } catch (_) { return null; } },
  set: value => { try { localStorage.setItem('an-bag',String(value)); } catch (_) {} },
  clear: () => { try { localStorage.removeItem('an-bag'); } catch (_) {} }
};
let bagQty = Math.max(0, Math.min(20, Number(bagStore.get() || 0) || 0));
let filter = 'all';

const ingredients = [
  ['Rosemary Oil', 'Supports scalp care and healthier looking hair.', 'scalp'],
  ['Peppermint Oil', 'A cooling sensation for a refreshed, clean feeling scalp.', 'scalp'],
  ['Tea Tree Oil', 'Helps cleanse the scalp and supports comfort and freshness.', 'scalp'],
  ['Lavender Oil', 'Conditions the scalp with a calming aromatic experience.', 'scalp'],
  ['Castor Oil', 'Moisturizes strands and supports thicker looking hair.', 'softness'],
  ['Coconut Oil', 'Conditions hair for softness, smoothness and shine.', 'softness'],
  ['Olive Oil', 'Conditioning care to help improve manageability.', 'softness'],
  ['Jojoba Oil', 'Moisturizes the scalp and promotes softer feeling hair.', 'scalp'],
  ['Almond Oil', 'Nourishes dry hair and supports shine and softness.', 'softness'],
  ['Moringa Oil', 'Conditions the hair and scalp for healthy looking hair.', 'scalp'],
  ['Rosehip Oil', 'Nourishes the scalp and helps improve softness.', 'scalp'],
  ['Onion Oil', 'Traditionally used to nourish roots and support stronger looking hair.', 'scalp'],
  ['Black Seed Oil', 'Traditionally valued for scalp nourishment and healthy looking hair.', 'scalp'],
  ['Pumpkin Seed Oil', 'Contributes conditioning support for softer strands.', 'softness'],
  ['Fenugreek Oil', 'Supports scalp comfort and softer feeling hair.', 'scalp'],
  ['Amla Oil', 'Traditional botanical care for healthier looking hair.', 'scalp'],
  ['Sesame Oil', 'Helps condition and soften dry hair.', 'softness'],
  ['Flaxseed Oil', 'Supports softness and manageable strands.', 'softness'],
  ['Egg Oil', 'Traditional conditioning support for hair feel.', 'softness'],
  ['Garlic & Ginger Extracts', 'Aromatic botanicals used in traditional hair rituals.', 'scalp'],
  ['Curry Leaves', 'Botanical leaves used in traditional hair care preparations.', 'scalp'],
  ['Henna Leaves', 'Traditional botanical for hair care rituals.', 'softness'],
  ['Cinnamon Oil', 'Warm aromatic oil used in traditional scalp blends.', 'scalp']
];

const A = 'public/assets/';
const ingredientPhotos = {
  'Rosemary Oil': A + 'david-clode-cDu0ZO4vfNw-unsplash.jpg',
  'Peppermint Oil': A + 'anna-hliamshyna-VDR-uVIHP_8-unsplash.jpg',
  'Tea Tree Oil': A + 'rashid-New8EgKnSds-unsplash.jpg',
  'Lavender Oil': A + 'olga-volkovitskaia-SCBaOBxjGCY-unsplash.jpg',
  'Castor Oil': A + 'images.jfif',
  'Coconut Oil': A + 'coconet oil.jfif',
  'Olive Oil': A + 'roberta-sorge-uOBApnN_K7w-unsplash.jpg',
  'Jojoba Oil': A + 'jojoba_oil_image_e1028b7f-e55d-4c58-ba71-e66bddcb721c.webp',
  'Almond Oil': A + 'elisabeth-rosenak-kAWWYOq1cIs-unsplash.jpg',
  'Moringa Oil': A + 'Moringa-oil-1.webp',
  'Rosehip Oil': A + 'what-is-rosehip-oil_81627fa3-3990-4ded-a6e9-1b0ab9bc5da2.webp',
  'Onion Oil': A + 'abhishek-hajare-D9h2-RxM1rE-unsplash.jpg',
  'Black Seed Oil': A + 'black seed oil.jfif',
  'Pumpkin Seed Oil': A + 'pumpkin-seed-oil-1314450543.webp',
  'Fenugreek Oil': A + 'feungreek oil.jfif',
  'Amla Oil': A + 'amla oil.jfif',
  'Sesame Oil': A + 'sesame_oil-.webp',
  'Flaxseed Oil': A + 'flexseed oil.jfif',
  'Egg Oil': A + 'gfdc5-1.jpg',
  'Garlic & Ginger Extracts': A + 'garlic-ginger-1296x728-header (1).avif',
  'Curry Leaves': A + 'fresh-curry-leaves_.webp',
  'Henna Leaves': A + 'Henna_Leaves_Kedia_Organic.webp',
  'Cinnamon Oil': A + 'marta-matyszczyk-yGFJqsMKeJ4-unsplash.jpg'
};

function money(n) {
  return 'Rs. ' + Number(n).toLocaleString('en-PK');
}
function renderBag() {
  $('#bag-count').textContent = String(bagQty);
  const empty = $('#empty-bag');
  const filled = $('#filled-bag');
  if (bagQty <= 0) { empty.hidden = false; filled.hidden = true; return; }
  empty.hidden = true; filled.hidden = false;
  $('#cart-quantity').textContent = String(bagQty);
  $('#subtotal').textContent = money(bagQty * PRICE);
  $('#total').textContent = money(bagQty * PRICE);
}
function renderQuantity() { $('#quantity').textContent = String(qty); }
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}
/* Visibility-driven images: do not fetch entire ingredient/gallery libraries on first load.
   Begin fetching ahead of the viewport, show a stable color until decoded, and handle broken paths. */
const imageObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    imageObserver.unobserve(entry.target);
    loadPhoto(entry.target);
  });
}, {rootMargin:'700px 350px 700px 350px', threshold:0}) : null;
function loadPhoto(img) {
  const src = img.dataset.src;
  if (!src) return;
  img.removeAttribute('data-src');
  img.loading = 'eager';
  img.decoding = 'async';
  img.addEventListener('load', () => {
    img.classList.add('photo-ready');
    img.parentElement?.classList.add('photo-loaded');
  }, {once:true});
  img.addEventListener('error', () => {
    if (img.dataset.fallbackAttempted === 'true') {
      // Preserve the reserved card and visible text; never show a broken-image icon.
      img.removeAttribute('src');
      img.classList.add('photo-unavailable');
      img.parentElement?.classList.add('photo-unavailable');
      return;
    }
    img.dataset.fallbackAttempted = 'true';
    img.src = A + 'botanicals.png';
  });
  img.src = src;
  if (img.complete && img.naturalWidth) {
    img.classList.add('photo-ready');
    img.parentElement?.classList.add('photo-loaded');
  }
}
function watchPhoto(img) {
  if (!img.dataset.src) return;
  if (imageObserver) imageObserver.observe(img);
  else loadPhoto(img);
}

function renderIngredients() {
  const query = ($('#ingredient-search').value || '').trim().toLowerCase();
  const filtered = ingredients.filter(([name, , tag]) => {
    const matchFilter = filter === 'all' || tag === filter;
    const matchQuery = !query || name.toLowerCase().includes(query);
    return matchFilter && matchQuery;
  });
  const grid = $('#ingredient-grid');
  // Release no-longer-visible filtered cards before scheduling their downloads.
  if (imageObserver) grid.querySelectorAll('img[data-src]').forEach(img => imageObserver.unobserve(img));
  grid.replaceChildren();
  filtered.forEach(([name, description], index) => {
    const card = document.createElement('article');
    card.className = 'ingredient-card has-photo';
    card.dataset.ingredient = name;

    const media = document.createElement('div');
    media.className = 'ingredient-media';
    media.setAttribute('aria-hidden', 'true');
    const img = document.createElement('img');
    img.dataset.src = ingredientPhotos[name] || (A + 'botanicals.png');
    img.width = 360;
    img.height = 240;
    img.alt = name;
    img.loading = 'lazy';
    img.decoding = 'async';
    media.appendChild(img);

    const number = document.createElement('span');
    number.textContent = String(index + 1).padStart(2, '0');
    number.setAttribute('aria-hidden', 'true');
    const title = document.createElement('h3');
    title.textContent = name;
    const p = document.createElement('p');
    // Make the key cosmetic-care benefit visible, without injecting HTML strings.
    const benefitTerms = [
      'softness', 'smoothness', 'shine', 'scalp care', 'scalp comfort',
      'cooling sensation', 'refreshed', 'freshness', 'conditioning',
      'condition hair', 'condition and soften', 'softer', 'nourish',
      'manageable', 'manageability', 'healthy looking hair',
      'aromatic', 'traditional hair', 'dryness'
    ];
    const term = benefitTerms.find(term =>
      description.toLowerCase().includes(term.toLowerCase())
    );
    if (term) {
      const indexOfBenefit = description.toLowerCase().indexOf(term.toLowerCase());
      const highlighted = document.createElement('strong');
      highlighted.className = 'copy-accent';
      highlighted.textContent = description.slice(indexOfBenefit, indexOfBenefit + term.length);
      p.append(
        document.createTextNode(description.slice(0,indexOfBenefit)),
        highlighted,
        document.createTextNode(description.slice(indexOfBenefit + term.length))
      );
    } else {
      p.textContent = description;
    }
    const details = document.createElement('button');
    details.type = 'button';
    details.className = 'ingredient-explore';
    details.textContent = 'Explore benefits ↗';
    details.setAttribute('aria-label', 'Explore ' + name + ' in hair care');
    details.addEventListener('click', (e) => {
      e.stopPropagation();
      openIngredientDetail(name, description);
    });
    card.addEventListener('click', (event) => {
      if (!event.target.closest('button')) openIngredientDetail(name, description);
    });
    card.append(media, number, title, p, details);
    grid.append(card);
    watchPhoto(img);
  });
  $('#ingredient-count').textContent = filtered.length
    ? `${filtered.length} ingredient guides`
    : 'No matching ingredients. Try another name or choose all ingredients.';
}

function openIngredientDetail(name, description) {
  const ingredientDialog = document.getElementById('ingredient-dialog');
  if (!ingredientDialog) return;
  const lower = name.toLowerCase();
  const image = ingredientPhotos[name] || (A + 'botanicals.png');
  document.getElementById('ingredient-detail-title').textContent = name;
  document.getElementById('ingredient-detail-benefit').textContent = description;
  document.getElementById('ingredient-detail-description').textContent =
    'In cosmetic hair care, ' + name.toLowerCase() + ' is featured as part of a botanical oil blend. ' +
    (lower.includes('coconut') ? 'Coconut oil is commonly used to condition hair and help reduce dryness.' :
    lower.includes('rosemary') ? 'Rosemary provides an aromatic botanical element for scalp care rituals.' :
    lower.includes('almond') ? 'Almond oil is valued for its light conditioning feel and natural shine support.' :
    lower.includes('olive') ? 'Olive oil is a classic conditioning oil used to soften dry hair.' :
    lower.includes('lavender') ? 'Lavender adds a calming botanical aroma often used in scalp-care rituals.' :
    lower.includes('jojoba') ? 'Jojoba closely resembles natural skin oils and is used to condition the scalp.' :
    lower.includes('castor') ? 'Castor oil is a rich traditional oil used to coat and condition strands.' :
    'The ingredient is included for traditional hair or scalp-care use; specific results are not guaranteed.');
  const photo = document.getElementById('ingredient-detail-image');
  photo.onerror = function() {
    this.onerror = null;
    this.src = A + 'botanicals.png';
  };
  photo.src = image;
  photo.alt = 'Photograph of ' + name;
  ingredientDialog.showModal();
}

$('#ingredient-search').addEventListener('input', renderIngredients);
document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => {
  filter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach((b) => {
    b.classList.toggle('active', b === button);
    b.setAttribute('aria-pressed', String(b === button));
  });
  renderIngredients();
}));
$('#year').textContent = new Date().getFullYear();

$('#plus').addEventListener('click', () => { qty = Math.min(10, qty + 1); renderQuantity(); });
$('#minus').addEventListener('click', () => { qty = Math.max(1, qty - 1); renderQuantity(); });
$('#add-cart').addEventListener('click', () => {
  bagQty = Math.min(20, bagQty + qty);
  bagStore.set(bagQty);
  renderBag();
  toast('Added to bag');
});
$('#open-cart').addEventListener('click', () => $('#cart-dialog').showModal());
$$('[data-close]').forEach((btn) => btn.addEventListener('click', () => {
  const id = btn.getAttribute('data-close');
  const el = document.getElementById(id);
  if (el && el.close) el.close();
}));
$('#cart-plus') && $('#cart-plus').addEventListener('click', () => {
  bagQty = Math.min(20, bagQty + 1);
  bagStore.set(bagQty);
  renderBag();
});
$('#cart-minus') && $('#cart-minus').addEventListener('click', () => {
  bagQty = Math.max(0, bagQty - 1);
  bagStore.set(bagQty);
  renderBag();
});
$('#remove-item') && $('#remove-item').addEventListener('click', () => {
  bagQty = 0;
  bagStore.set(0);
  renderBag();
});
$('#order-form') && $('#order-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const text = encodeURIComponent(
    'Hello Authentic Naturals, I would like to order Hair Repair & Revive Growth Oil.\n' +
    'Qty: ' + bagQty + '\nName: ' + fd.get('customer') + '\nPhone: ' + fd.get('phone') +
    '\nCity: ' + fd.get('city') + '\nAddress: ' + fd.get('address') + '\nPayment: ' + fd.get('payment')
  );
  window.open('https://wa.me/923248019501?text=' + text, '_blank');
});
$('#privacy-open') && $('#privacy-open').addEventListener('click', () => $('#privacy-dialog').showModal());
$('#clear-data') && $('#clear-data').addEventListener('click', () => {
  bagStore.clear();
  bagQty = 0;
  renderBag();
  toast('Saved bag cleared');
});

let usageStep = 0;
const usageTrack = document.getElementById('usage-panels');
const usageButtons = $$('[data-step]');
function setUsageStep(step) {
  usageStep = Math.max(0, Math.min(5, step));
  window.usageStep = usageStep;
  if (usageTrack) usageTrack.style.transform = 'translateX(-' + usageStep * 100 + '%)';
  usageButtons.forEach((b) => {
    const active = Number(b.dataset.step) === usageStep;
    b.setAttribute('aria-pressed', String(active));
  });
  const status = $('#usage-status');
  if (status) status.textContent = 'Step ' + (usageStep + 1) + ' of 6';
  const prev = $('#usage-prev');
  const next = $('#usage-next');
  if (prev) prev.disabled = usageStep === 0;
  if (next) next.disabled = usageStep === 5;
}
// Expose for scrub.js + polish.js autoplay
window.setUsageStep = setUsageStep;
window.showUsageStep = setUsageStep;
window.usageStep = usageStep;

usageButtons.forEach((b) => b.addEventListener('click', () => setUsageStep(Number(b.dataset.step))));
$('#usage-prev') && $('#usage-prev').addEventListener('click', () => setUsageStep(usageStep - 1));
$('#usage-next') && $('#usage-next').addEventListener('click', () => setUsageStep(usageStep + 1));
setUsageStep(0);

// Video is user-controlled: never download or autoplay it merely on scrolling.
const video = document.querySelector('.video-section video');
if (video) {
  video.autoplay = false;
  video.preload = 'none';
  video.pause();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !video.paused) video.pause();
  });
}

renderBag();
renderQuantity();
renderIngredients();
// Watch gallery images once at startup, including horizontal scroll visibility.
$$('.botanical-look-item img[data-src]').forEach(watchPhoto);
