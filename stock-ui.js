'use strict';
/* Availability is server-authoritative. Never fabricate quantities or restock dates. */
(() => {
 const label=document.getElementById('stock-availability');
 const cartNote=document.getElementById('cart-stock-note');
 const add=document.getElementById('add-cart');
 const direct=document.getElementById('direct-whatsapp');
 if(!label||!add)return;
 const stock={availability:'unverified',available:null,restockNote:''};
 window.ANStock={current:stock,refresh};
 function paint(){
  const status=stock.availability;
  label.dataset.stock=status;
  if(status==='in_stock'){
   label.textContent='In stock · '+stock.available+' currently available · Orders confirmed by our team.';
   add.textContent='Add to bag ↗';
  }else if(status==='out_of_stock'){
   label.textContent='Currently out of stock. Request a place on the waitlist. Restock timing will be confirmed by our team.'+
    (stock.restockNote?' '+stock.restockNote:'');
   add.textContent='Request on waitlist ↗';
  }else{
   label.textContent='Stock availability is being verified. Contact our team before expecting confirmation.';
   add.textContent='Request availability ↗';
  }
  if(cartNote)cartNote.textContent=status==='out_of_stock'
   ?'Currently out of stock. You may request a waitlist place; this is not a confirmed order.'
   :status==='in_stock'
    ?'Availability is subject to confirmation when our team reviews your order.'
    :'Stock has not been verified yet. We will confirm availability before accepting an order.';
  if(direct&&status!=='in_stock'){
   const message=status==='out_of_stock'
    ?'Hello Authentic Naturals, could you please add me to the restock waitlist for Hair Repair & Revive Growth Oil 100 ml?'
    :'Hello Authentic Naturals, please confirm availability of Hair Repair & Revive Growth Oil 100 ml.';
   direct.href='https://wa.me/923248019501?text='+encodeURIComponent(message);
   direct.setAttribute('aria-label','Ask Authentic Naturals about product availability');
  }
 }
 async function refresh(){
  try{
   const controller=new AbortController();
   const timeout=setTimeout(()=>controller.abort(),3500);
   let res;
   try{res=await fetch('/api/stock',{cache:'no-store',signal:controller.signal});}
   finally{clearTimeout(timeout);}
   const data=await res.json();
   stock.availability=data.ok&&['in_stock','out_of_stock'].includes(data.availability)
     ?data.availability:'unverified';
   stock.available=Number.isFinite(data.available)?data.available:null;
   stock.restockNote=typeof data.restockNote==='string'?data.restockNote.slice(0,160):'';
  }catch{stock.availability='unverified';stock.available=null;stock.restockNote='';}
  paint();
  return stock;
 }
 paint();
 refresh();
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
})();
