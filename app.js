
'use strict';
const PRODUCTS=[{id:'hair-oil-100',name:'Authentic Naturals Hair Oil',size:'100 ml',price:null,image:'assets/hero.webp',description:'A botanical hair-oiling ritual, thoughtfully made in Pakistan.'}];
const $=(s,scope=document)=>scope.querySelector(s);
const money=n=>n==null?'Price on request':new Intl.NumberFormat('en-PK',{style:'currency',currency:'PKR',maximumFractionDigits:0}).format(n);
const safeCart=()=>{try{const x=JSON.parse(localStorage.getItem('an-cart-v1')||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch{return {}}};
let cart=safeCart();
function persist(){try{localStorage.setItem('an-cart-v1',JSON.stringify(cart))}catch{}renderCart()}
function addCart(id,quantity=1){if(!PRODUCTS.some(p=>p.id===id))return;cart[id]=Math.min(99,Math.max(0,(Number(cart[id])||0)+quantity));persist();openCart()}
function setCart(id,quantity){if(!PRODUCTS.some(p=>p.id===id))return;if(quantity<=0)delete cart[id];else cart[id]=Math.min(99,quantity);persist()}
function openCart(){$('#cartDrawer')?.classList.add('open');$('#cartOverlay')?.classList.add('open');$('#cartDrawer')?.setAttribute('aria-hidden','false');$('#cartClose')?.focus();document.body.style.overflow='hidden'}
function closeCart(){$('#cartDrawer')?.classList.remove('open');$('#cartOverlay')?.classList.remove('open');$('#cartDrawer')?.setAttribute('aria-hidden','true');document.body.style.overflow=''}
function renderCart(){let count=0;const lines=$('#cartLines');if(lines)lines.replaceChildren();for(const p of PRODUCTS){let q=Math.min(99,Math.max(0,Number(cart[p.id])||0));if(!q)continue;count+=q;if(lines){const row=document.createElement('div');row.className='cart-line';const img=document.createElement('img');img.src=p.image;img.alt=p.name;const detail=document.createElement('div');const title=document.createElement('strong');title.textContent=p.name;const info=document.createElement('p');info.className='muted';info.textContent=p.size+' · '+money(p.price);const actions=document.createElement('div');actions.className='cart-actions';const minus=document.createElement('button');minus.textContent='−';minus.setAttribute('aria-label','Remove one');minus.onclick=()=>setCart(p.id,q-1);const number=document.createElement('span');number.textContent=String(q);const plus=document.createElement('button');plus.textContent='+';plus.setAttribute('aria-label','Add one');plus.onclick=()=>setCart(p.id,q+1);actions.append(minus,number,plus);detail.append(title,info,actions);row.append(img,detail);lines.append(row)}}if(lines&&!count){const p=document.createElement('p');p.className='muted';p.textContent='Your bag is empty. Explore the ritual.';lines.append(p)}document.querySelectorAll('[data-cart-count]').forEach(el=>el.textContent=String(count));const checkout=$('#checkout');if(checkout)checkout.disabled=!count}
function orderSummary(){const rows=PRODUCTS.filter(p=>Number(cart[p.id])>0).map(p=>`${p.name} (${p.size}) × ${cart[p.id]}`);return `Hello Authentic Naturals, I'd like to order:\n${rows.join('\n')}\nPlease confirm prices, shipping and payment options in Pakistan.`}
document.addEventListener('DOMContentLoaded',()=>{
 renderCart();
 document.querySelectorAll('[data-cart-open]').forEach(el=>el.addEventListener('click',openCart));
 $('#cartClose')?.addEventListener('click',closeCart);$('#cartOverlay')?.addEventListener('click',closeCart);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCart()});
 document.querySelectorAll('[data-add]').forEach(el=>el.addEventListener('click',()=>addCart(el.dataset.add,Number($('#quantityValue')?.textContent)||1)));
 $('#qtyMinus')?.addEventListener('click',()=>{$('#quantityValue').textContent=String(Math.max(1,Number($('#quantityValue').textContent)-1))});
 $('#qtyPlus')?.addEventListener('click',()=>{$('#quantityValue').textContent=String(Math.min(99,Number($('#quantityValue').textContent)+1))});
 $('#checkout')?.addEventListener('click',async()=>{const message=orderSummary();try{await navigator.clipboard.writeText(message);$('#checkoutStatus').textContent='Order summary copied. Send it to our official Facebook page to confirm your order.'}catch{$('#checkoutStatus').textContent=message} });
 const nav=$('.nav');const navUpdate=()=>nav?.classList.toggle('scrolled',scrollY>60);navUpdate();addEventListener('scroll',navUpdate,{passive:true});
 const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
 const cardObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');cardObserver.unobserve(e.target)}}),{threshold:.12});
 document.querySelectorAll('.motion-cards article').forEach(el=>cardObserver.observe(el));
 const heroVideo=document.querySelector('.hero-video');
 if(heroVideo){heroVideo.muted=true;heroVideo.play().catch(()=>{});document.addEventListener('visibilitychange',()=>{if(document.hidden)heroVideo.pause();else heroVideo.play().catch(()=>{})});}
 initCinema();
});
function initCinema(){
 const section=document.querySelector('#cinema'),video=document.querySelector('#cinemaVideo');
 if(!section||!video)return;
 const titles=['From nature, with care.','Meet the golden ritual.','The beauty of consistency.','Care starts at the roots.'];
 const subs=['Discover Authentic Naturals Hair Oil.','A closer look at the bottle and its golden texture.','Apply, massage, wait and wash.','Explore the full ritual and product details.'];
 let raf=0,progress=0,ready=false;
 video.addEventListener('loadedmetadata',()=>{ready=true;update()},{once:true});
 function update(){
  const r=section.getBoundingClientRect(),distance=Math.max(1,section.offsetHeight-innerHeight);
  progress=Math.max(0,Math.min(1,-r.top/distance));
  const stage=Math.min(3,Math.floor(progress*4));
  const title=document.querySelector('#cinemaTitle'),sub=document.querySelector('#cinemaSub');
  if(title&&title.textContent!==titles[stage]){title.textContent=titles[stage];sub.textContent=subs[stage]}
  const bar=document.querySelector('#cinemaProgress'),count=document.querySelector('#cinemaCount');
  if(bar)bar.style.width=(progress*100)+'%';
  if(count)count.textContent=String(Math.round(progress*95)+1).padStart(2,'0')+' / 96';
  if(ready&&Number.isFinite(video.duration)&&video.duration>0){
    const t=Math.min(video.duration-0.04,progress*video.duration);
    if(Math.abs(video.currentTime-t)>.065)try{video.currentTime=t}catch{}
  }
 }
 function request(){if(!raf)raf=requestAnimationFrame(()=>{raf=0;update()})}
 addEventListener('scroll',request,{passive:true});addEventListener('resize',request);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)request()});
 video.pause();request();
}

document.addEventListener('DOMContentLoaded',()=>{
 const video=document.getElementById('heroVideo');
 const sound=document.getElementById('heroSound');
 const playback=document.getElementById('heroPlayback');
 if(video){
  // Browsers generally disallow unmuted autoplay; a user gesture enables sound.
  video.muted=true;
  video.play().catch(()=>{if(playback)playback.textContent='▶ PLAY'});
  sound?.addEventListener('click',()=>{
   video.muted=!video.muted;
   sound.setAttribute('aria-pressed',String(!video.muted));
   sound.textContent=video.muted?'◖))  PLAY WITH SOUND':'◖))  MUTE SOUND';
   if(video.paused)video.play().catch(()=>{});
  });
  playback?.addEventListener('click',()=>{
   if(video.paused){video.play().then(()=>{playback.textContent='Ⅱ PAUSE'}).catch(()=>{})}
   else{video.pause();playback.textContent='▶ PLAY'}
  });
 }
 const stage=document.querySelector('.ingredient-story');
 const img=document.getElementById('ingredientImage');
 if(!stage||!img)return;
 const items=[
  ['Amla.','Indian gooseberry','Traditionally used in hair-care preparations; the fruit naturally contains antioxidant compounds.','amla'],
  ['Kalonji.','Nigella seeds','A traditional botanical used in hair-oiling blends. Cosmetic effects depend on the finished formulation.','kalonji'],
  ['Coconut.','Coconut oil','Commonly used to condition hair and reduce friction during grooming.','coconut'],
  ['Fenugreek.','Methi seeds','Often included in traditional hair-care recipes for a conditioning ritual.','fenugreek'],
  ['Rosemary.','Rosemary herb','An aromatic botanical used in many scalp-care routines; inclusion and concentration must be confirmed.','rosemary']
 ];
 let current=-1;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const update=()=>{
  const rect=stage.getBoundingClientRect();
  const distance=Math.max(1,stage.offsetHeight-innerHeight);
  const progress=Math.max(0,Math.min(1,-rect.top/distance));
  const next=Math.min(items.length-1,Math.floor(progress*items.length));
  if(next!==current){
   current=next;const d=items[next];
   if(!reduced)img.classList.add('swap');
   const nextSrc='assets/ingredient-'+d[3]+'.webp';
   const pre=new Image();pre.src=nextSrc;
   const apply=()=>{img.src=nextSrc;img.alt='Illustrative photograph of '+d[1];img.classList.remove('swap')};
   if(pre.complete)apply();else{pre.onload=apply;pre.onerror=apply}
   document.getElementById('ingredientName').textContent=d[0];
   document.getElementById('ingredientLatin').textContent=d[1];
   document.getElementById('ingredientBenefit').textContent=d[2];
   document.getElementById('ingredientIndex').textContent=String(next+1).padStart(2,'0')+' / 05 — BOTANICAL STUDY';
  }
  document.getElementById('ingredientBar').style.width=(progress*100)+'%';
 };
 let scheduled=false;
 const onScroll=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;update()})};
 window.addEventListener('scroll',onScroll,{passive:true});
 window.addEventListener('resize',onScroll);
 update();
});
