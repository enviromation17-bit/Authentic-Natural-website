'use strict';
(function(){
 const rail=document.querySelector('.brand-rail');
 if(!rail)return;
 const links=[...rail.querySelectorAll('.rail-item')];
 const title=document.getElementById('rail-current-title');
 const targets=links.map(link=>({link,target:document.querySelector(link.getAttribute('href'))})).filter(x=>x.target);
 function active(link){
  links.forEach(item=>{
   const yes=item===link;
   item.classList.toggle('is-active',yes);
   if(yes)item.setAttribute('aria-current','location');
   else item.removeAttribute('aria-current');
  });
  if(title)title.textContent=link.dataset.railLabel||link.textContent.trim();
 }
 links.forEach(link=>link.addEventListener('click',()=>active(link)));
 if('IntersectionObserver' in window){
  const io=new IntersectionObserver(entries=>{
   const visible=entries.filter(x=>x.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
   if(!visible)return;
   const match=targets.find(x=>x.target===visible.target);
   if(match)active(match.link);
  },{rootMargin:'-15% 0px -65% 0px',threshold:[0,.1,.5]});
  targets.forEach(x=>io.observe(x.target));
 }
})();