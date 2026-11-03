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
  $('#gallery-image').src = 'assets/' + button.dataset.image;
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
    card.append(number, title, p); grid.append(card);
  });
  $('#ingredient-count').textContent = filtered.length ? `${filtered.length} ingredient guides` : 'No matching ingredients. Try another name or choose all ingredients.';
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
const usageTrack = document.getElementById('usage-panels');
const usagePanels = [...usageTrack.querySelectorAll('.usage-panel')];
const usageButtons = [...document.querySelectorAll('[data-step]')];
const usagePrev = document.getElementById('usage-prev');
const usageNext = document.getElementById('usage-next');
const usageStatus = document.getElementById('usage-status');

function updateUsageControls(index) {
  usageStep = Math.max(0, Math.min(usagePanels.length - 1, index));
  usageButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === usageStep)));
  usagePrev.disabled = usageStep === 0;
  usageNext.disabled = usageStep === usagePanels.length - 1;
  usageStatus.textContent = 'Step ' + (usageStep + 1) + ' of ' + usagePanels.length;
}
function showUsageStep(index) {
  updateUsageControls(index);
  const target = usagePanels[usageStep];
  usageTrack.scrollTo({left: target.offsetLeft - usageTrack.offsetLeft, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
}
usageButtons.forEach((button, i) => button.addEventListener('click', () => showUsageStep(i)));
usagePrev.addEventListener('click', () => showUsageStep(usageStep - 1));
usageNext.addEventListener('click', () => showUsageStep(usageStep + 1));
let usageScrollFrame = 0;
usageTrack.addEventListener('scroll', () => {
  if (usageScrollFrame) cancelAnimationFrame(usageScrollFrame);
  usageScrollFrame = requestAnimationFrame(() => {
    const x = usageTrack.scrollLeft;
    const left = usageTrack.getBoundingClientRect().left;
    let index = 0;
    let closest = Infinity;
    usagePanels.forEach((panel, i) => {
      const distance = Math.abs(panel.getBoundingClientRect().left - left);
      if (distance < closest) { closest = distance; index = i; }
    });
    updateUsageControls(index);
  });
}, {passive:true});
updateUsageControls(0);
