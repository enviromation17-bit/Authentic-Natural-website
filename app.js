'use strict';
const $ = (s) => document.querySelector(s);
const price = 1499;
const storageKey = 'authentic-naturals-bag-v1';
const clamp = (n) => Math.max(0, Math.min(20, Number.isFinite(Number(n)) ? Math.trunc(Number(n)) : 0));
let bag = 0;
try { bag = clamp(localStorage.getItem(storageKey)); } catch {}
let quantity = 1;
const money = (n) => 'Rs. ' + n.toLocaleString('en-PK');
let toastTimer;
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3000); }
function renderBag() {
  $('#bag-count').textContent = String(bag);
  $('#empty-bag').hidden = bag > 0;
  $('#filled-bag').hidden = bag === 0;
  $('#cart-quantity').textContent = String(bag);
  $('#subtotal').textContent = money(bag * price);
  $('#total').textContent = money(bag * price);
  $('#cart-plus').disabled = bag >= 20;
  try { localStorage.setItem(storageKey, String(bag)); } catch {}
}
function renderQuantity() {
  $('#quantity').textContent = String(quantity);
  $('#minus').disabled = quantity <= 1;
  $('#plus').disabled = quantity >= 20;
  const text = `Hello Authentic Naturals, I’d like to order ${quantity} ${quantity === 1 ? 'bottle' : 'bottles'} of Hair Repair & Revive Growth Oil, 100 ml. The total is ${money(quantity * price)} with free delivery across Pakistan. Please confirm availability and payment details.`;
  $('#direct-whatsapp').href = 'https://wa.me/923248019501?text=' + encodeURIComponent(text);
}
$('#minus').addEventListener('click', () => { quantity = Math.max(1, quantity - 1); renderQuantity(); });
$('#plus').addEventListener('click', () => { quantity = Math.min(20, quantity + 1); renderQuantity(); });
$('#add-cart').addEventListener('click', () => { if (bag + quantity > 20) { toast('Your bag can hold up to 20 bottles. Contact us for larger orders.'); return; } bag += quantity; renderBag(); $('#cart-dialog').showModal(); });
$('#open-cart').addEventListener('click', () => $('#cart-dialog').showModal());
$('#cart-minus').addEventListener('click', () => { bag = clamp(bag - 1); renderBag(); });
$('#cart-plus').addEventListener('click', () => { bag = clamp(bag + 1); renderBag(); });
$('#remove-item').addEventListener('click', () => { bag = 0; renderBag(); $('#order-form').reset(); });
document.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => document.getElementById(button.dataset.close).close()));
document.querySelectorAll('dialog').forEach((dialog) => dialog.addEventListener('click', (e) => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } }));
document.querySelectorAll('.thumbs button').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.thumbs button').forEach((b) => { b.classList.remove('selected'); b.setAttribute('aria-pressed', 'false'); });
  button.classList.add('selected'); button.setAttribute('aria-pressed', 'true');
  $('#gallery-image').src = 'public/assets/' + button.dataset.image;
  $('#gallery-image').alt = button.querySelector('img').alt;
}));
$('#zoom-image').addEventListener('click', () => { $('#large-image').src = $('#gallery-image').src; $('#large-image').alt = $('#gallery-image').alt; $('#image-dialog').classList.remove('original-size'); $('#toggle-image-size').textContent = 'Zoom to original size'; $('#toggle-image-size').setAttribute('aria-pressed', 'false'); $('#image-dialog').showModal(); });
$('#toggle-image-size').addEventListener('click', () => { const full = $('#image-dialog').classList.toggle('original-size'); $('#toggle-image-size').textContent = full ? 'Fit photo to screen' : 'Zoom to original size'; $('#toggle-image-size').setAttribute('aria-pressed', String(full)); const pane = document.querySelector('.image-scroll'); pane.scrollLeft = full ? Math.max(0, 1254 * 0.36 - pane.clientWidth / 2) : 0; pane.scrollTop = full ? 420 : 0; });
$('#privacy-open').addEventListener('click', () => $('#privacy-dialog').showModal());
$('#clear-data').addEventListener('click', () => { bag = 0; renderBag(); try { localStorage.removeItem(storageKey); } catch {} $('#order-form').reset(); toast('Saved bag cleared.'); });
$('#order-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!bag || !event.currentTarget.reportValidity()) return;
  const data = new FormData(event.currentTarget);
  const clean = (key) => String(data.get(key) || '').trim().replace(/[\u0000-\u001f\u007f]/g, ' ');
  if (['customer', 'phone', 'city', 'address'].some((key) => !clean(key))) { toast('Please complete your delivery details.'); return; }
  const message = `Hello Authentic Naturals, I would like to request an order.\n\nHair Repair & Revive Growth Oil, 100 ml\nQuantity: ${bag}\nUnit price: ${money(price)}\nDelivery: Free across Pakistan\nTotal: ${money(bag * price)}\n\nName: ${clean('customer')}\nPhone: ${clean('phone')}\nCity: ${clean('city')}\nAddress: ${clean('address')}\nPreferred payment: ${clean('payment')}\n\nPlease confirm availability, delivery timing, payment instructions and return terms. I understand this is an order request awaiting your confirmation.`;
  const url = 'https://wa.me/923248019501?text=' + encodeURIComponent(message);
  window.open(url, '_blank', 'noopener,noreferrer');
});
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
  ['Pumpkin Seed Oil', 'Contributes to scalp conditioning and a hair care routine.', 'scalp'],
  ['Fenugreek Oil', 'Traditional nourishment for conditioned, stronger looking hair.', 'scalp'],
  ['Amla Oil', 'A traditional Ayurvedic ingredient for shine and stronger looking hair.', 'softness'],
  ['Sesame Oil', 'Conditions hair and supports moisture retention.', 'softness'],
  ['Flaxseed Oil', 'Helps smooth strands, manage frizz and support shine.', 'softness'],
  ['Egg Oil', 'Conditions and nourishes hair for a smoother looking texture.', 'softness'],
  ['Garlic & Ginger Extracts', 'Traditionally used to support a nourished scalp care routine.', 'scalp'],
  ['Curry Leaves', 'A traditional ingredient for hair and scalp nourishment.', 'scalp'],
  ['Henna Leaves', 'Natural conditioning care for shine and smoothness.', 'softness'],
  ['Cinnamon Oil', 'A warming sensory experience in scalp care routines.', 'scalp']
];
let filter = 'all';
function renderIngredients() {
  const query = $('#ingredient-search').value.toLowerCase().trim();
  const filtered = ingredients.filter(([name, , category]) => (filter === 'all' || category === filter) && name.toLowerCase().includes(query));
  const grid = $('#ingredient-grid'); grid.replaceChildren();
  filtered.forEach(([name, description], index) => {
    const card = document.createElement('article'); card.className = 'ingredient-card';
    const number = document.createElement('span'); number.textContent = String(index + 1).padStart(2, '0'); number.setAttribute('aria-hidden', 'true');
    const title = document.createElement('h3'); title.textContent = name;
    const p = document.createElement('p'); p.textContent = description;
    const details = document.createElement('button');
    details.type = 'button'; details.className = 'ingredient-explore';
    details.textContent = 'Explore benefits ↗';
    details.setAttribute('aria-label', 'Explore ' + name + ' in hair care');
    details.addEventListener('click', () => openIngredientDetail(name, description));
    card.append(number, title, p, details); grid.append(card);
  });
  $('#ingredient-count').textContent = filtered.length ? `${filtered.length} ingredient guides` : 'No matching ingredients. Try another name or choose all ingredients.';
}
const ingredientPhotoSet = {
  rosemary: 'https://images.unsplash.com/photo-1582745741856-1a5d68158ba3?auto=format&fit=crop&w=950&q=80',
  coconut: 'https://images.unsplash.com/photo-1646230153819-2f1a3651a6d4?auto=format&fit=crop&w=950&q=80',
  oils: 'https://images.unsplash.com/photo-1781552163129-3643d42d84ab?auto=format&fit=crop&w=950&q=80'
};
function openIngredientDetail(name, description) {
  const ingredientDialog = document.getElementById('ingredient-dialog');
  const lower = name.toLowerCase();
  let image = ingredientPhotoSet.oils;
  if (lower.includes('rosemary') || lower.includes('mint') || lower.includes('herb')) image = ingredientPhotoSet.rosemary;
  if (lower.includes('coconut')) image = ingredientPhotoSet.coconut;
  document.getElementById('ingredient-detail-title').textContent = name;
  document.getElementById('ingredient-detail-benefit').textContent = description;
  document.getElementById('ingredient-detail-description').textContent =
    'In cosmetic hair care, ' + name.toLowerCase() + ' is featured as part of a botanical oil blend. ' +
    (lower.includes('coconut') ? 'Coconut oil is commonly used to condition hair and help reduce dryness.' :
    lower.includes('rosemary') ? 'Rosemary provides an aromatic botanical element. Research on hair growth is limited and does not establish that this finished blend grows hair.' :
    'The ingredient is included for traditional hair or scalp-care use; specific results are not guaranteed.');
  const photo = document.getElementById('ingredient-detail-image');
  photo.src = image;
  photo.alt = lower.includes('rosemary') ? 'Illustrative photograph of rosemary herbs' : lower.includes('coconut') ? 'Illustrative photograph of fresh coconuts' : 'Illustrative photograph of botanical oil and herbs';
  ingredientDialog.showModal();
}
$('#ingredient-search').addEventListener('input', renderIngredients);
document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => {
  filter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach((b) => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
  renderIngredients();
}));
$('#year').textContent = new Date().getFullYear();
renderBag(); renderQuantity(); renderIngredients();

let usageStep = 0;
const ritualSection = document.getElementById('ritual');
const ritualStage = ritualSection.querySelector('.ritual-sticky');
const usageTrack = document.getElementById('usage-panels');
const usagePanels = [...usageTrack.querySelectorAll('.usage-panel')];
const usageButtons = [...document.querySelectorAll('[data-step]')];
const usagePrev = document.getElementById('usage-prev');
const usageNext = document.getElementById('usage-next');
const usageStatus = document.getElementById('usage-status');
const ritualProgressFill = document.getElementById('ritual-progress-fill');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let ritualFrame = 0;
function updateUsageUI(index) {
  usageStep = Math.max(0, Math.min(usagePanels.length - 1, index));
  usageTrack.style.transform = 'translate3d(-' + (usageStep * 100) + '%,0,0)';
  usageButtons.forEach((button,i) => button.setAttribute('aria-pressed', String(i === usageStep)));
  usagePanels.forEach((panel,i) => {
    panel.setAttribute('aria-hidden',String(i !== usageStep));
    if ('inert' in panel) panel.inert = i !== usageStep;
  });
  usagePrev.disabled = usageStep === 0;
  usageNext.disabled = usageStep === usagePanels.length - 1;
  usageStatus.textContent = 'Step ' + (usageStep + 1) + ' of ' + usagePanels.length;
  ritualProgressFill.style.width = ((usageStep+1) / usagePanels.length * 100) + '%';
  usageButtons[usageStep].scrollIntoView && usageButtons[usageStep].scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
}
function ritualScrollRange() {
  return Math.max(1, ritualSection.offsetHeight - ritualStage.offsetHeight);
}
function syncRitualToScroll() {
  ritualFrame = 0;
  if (reducedMotion.matches) return;
  const progress = Math.max(0, Math.min(1, -ritualSection.getBoundingClientRect().top / ritualScrollRange()));
  const index = Math.min(usagePanels.length - 1, Math.floor(progress * usagePanels.length));
  if (index !== usageStep) updateUsageUI(index);
}
function requestRitualSync() {
  if (!ritualFrame) ritualFrame = requestAnimationFrame(syncRitualToScroll);
}
function showUsageStep(index) {
  const target = Math.max(0, Math.min(index, usagePanels.length - 1));
  if (reducedMotion.matches) { updateUsageUI(target); return; }
  const position = ritualSection.getBoundingClientRect().top + window.scrollY +
    ritualScrollRange() * (target === usagePanels.length - 1 ? .99 : (target + .14) / usagePanels.length);
  window.scrollTo({top:position,behavior:'smooth'});
  updateUsageUI(target);
}
usageButtons.forEach((button,i) => button.addEventListener('click', () => showUsageStep(i)));
usagePrev.addEventListener('click', () => showUsageStep(usageStep - 1));
usageNext.addEventListener('click', () => showUsageStep(usageStep + 1));
let gestureStartX=0, gestureStartY=0;
usageTrack.addEventListener('touchstart',e => {
  gestureStartX=e.changedTouches[0].clientX; gestureStartY=e.changedTouches[0].clientY;
},{passive:true});
usageTrack.addEventListener('touchend',e => {
  const dx=gestureStartX-e.changedTouches[0].clientX;
  const dy=gestureStartY-e.changedTouches[0].clientY;
  if(Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)*1.25) showUsageStep(usageStep+(dx>0?1:-1));
},{passive:true});
usageTrack.addEventListener('keydown',e => {
  if(e.key==='ArrowRight'){e.preventDefault();showUsageStep(usageStep+1);}
  if(e.key==='ArrowLeft'){e.preventDefault();showUsageStep(usageStep-1);}
});
window.addEventListener('scroll',requestRitualSync,{passive:true});
window.addEventListener('resize',requestRitualSync,{passive:true});
updateUsageUI(0);
requestRitualSync();

/* Lightweight progressive enhancement: reveal elements only when an observer is available.
   The shopping bag, ingredient filters, and ritual carousel remain untouched. */
(() => {
  const motionAllowed = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!motionAllowed || !('IntersectionObserver' in window)) return;
  const targets = document.querySelectorAll(
    '.section-heading, .product-info, .gallery, .story-layout, .video-section > div, .faq > div, .footer-intro, .footer-main'
  );
  const observer = new IntersectionObserver((entries, instance) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      instance.unobserve(entry.target);
    }
  }, {threshold:0.06, rootMargin:'0px 0px 40px 0px'});
  targets.forEach((element) => {
    element.classList.add('reveal-ready');
    observer.observe(element);
  });
})();
