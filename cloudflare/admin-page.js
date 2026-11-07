/* Private dashboard HTML is returned only after a valid D1 password session. */
const escapeHtml = text => String(text).replace(/[&<>"']/g,c=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
})[c]);
export function adminPage(nonce,owner) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Authentic Naturals · Private Operations</title>
<style nonce="${nonce}">
:root{--green:#173f2d;--sage:#dceada;--bg:#f4f7f0;--line:#dde7dc}*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--green);font:14px/1.55 system-ui,sans-serif}
button,input,textarea,select{font:inherit}button{cursor:pointer}
button:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #94bf97;outline-offset:2px}
header{display:flex;gap:15px;align-items:center;justify-content:space-between;padding:20px clamp(16px,4vw,55px);background:white;border-bottom:1px solid var(--line)}
.logo{font-size:12px;letter-spacing:.12em;font-weight:900}.identity{font-size:12px;color:#65826a;max-width:45vw;overflow:hidden;text-overflow:ellipsis}
main{max-width:1400px;margin:0 auto;padding:30px clamp(14px,4vw,48px)}
h1{font:400 clamp(35px,5vw,65px)/1.15 Georgia,serif;letter-spacing:-.04em;margin:10px 0}
h2{font:400 28px/1.2 Georgia,serif;margin:0 0 20px}.muted{color:#6c8471}.overline{font-size:11px;letter-spacing:.14em;color:#668369;font-weight:800}
.notice{padding:13px 16px;border-radius:11px;background:#e4eee3;color:#3b6042;margin:20px 0}
.stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:28px 0}
.stat,.panel{background:#fff;border-radius:18px;padding:21px;border:1px solid var(--line);box-shadow:0 10px 24px #27492a0b}
.stat strong{display:block;font:400 42px Georgia,serif;margin-top:12px}.stat span{font-size:12px;color:#69816f}
.columns{display:grid;grid-template-columns:minmax(270px,.8fr) minmax(0,1.7fr);gap:16px}
label{display:grid;gap:7px;font-weight:750;font-size:12px;margin-bottom:15px}
input,select,textarea{padding:12px;border-radius:10px;border:1px solid #bfd0bf;background:#fff;color:#224b32;min-width:0}
button{border:0;border-radius:10px;padding:10px 13px;background:#22563c;color:#fff;font-weight:700}
button.secondary{background:#e8f0e5;color:#255839}
button:disabled{opacity:.42;cursor:not-allowed}.actions{display:flex;gap:8px;flex-wrap:wrap}
.toolbar{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin:28px 0 14px}
.list{display:grid;gap:12px}
.lead{background:#fff;border:1px solid var(--line);padding:18px;border-radius:15px}
.lead-head{display:flex;justify-content:space-between;gap:10px;align-items:start;flex-wrap:wrap}
.lead h3{font:700 16px/1.3 system-ui;margin:0}
.lead small{color:#809083}.lead-meta{color:#6b816f;font-size:12px;margin:7px 0}
.lead-notes{white-space:pre-wrap;overflow-wrap:anywhere;margin:12px 0;font-size:13px}
.lead-controls{display:flex;gap:8px;flex-wrap:wrap;align-items:end}
.lead-controls label{margin:0;min-width:130px;flex:1}.lead-controls button{min-height:42px}
#feedback{position:sticky;top:0;z-index:10;color:#18492c;background:#e6f1e4;border-radius:8px;padding:10px 12px;min-height:36px}
.bubble{display:inline-block;background:#e2efe0;color:#365e3c;border-radius:100px;padding:3px 9px;font-size:10px;font-weight:700}
@media(max-width:820px){.columns{grid-template-columns:1fr}.stats{grid-template-columns:repeat(3,minmax(0,1fr))}.stat{padding:13px}.stat strong{font-size:32px}}
@media(max-width:450px){.stats{grid-template-columns:1fr 1fr}.identity{font-size:10px}.lead-controls label{flex-basis:100%}}
</style></head>
<body><header><div class="logo">AUTHENTIC NATURALS · OPERATIONS</div><div class="identity">Signed in: ${escapeHtml(owner)} <button id="logout" type="button" class="secondary" style="margin-left:12px;padding:6px 10px">Sign out</button></div></header>
<main>
<div class="overline">PRIVATE CLIENT WORKSPACE</div><h1>Leads & inventory.</h1>
<p class="muted">Manage website enquiries, waitlist requests, pending orders and physical inventory from one secure workspace.</p>
<p class="notice">No automated WhatsApp messages are sent. An order is confirmed only after staff approval and sufficient stock is reserved.</p>
<div id="feedback" role="status" aria-live="polite">Loading dashboard…</div>
<section class="stats" aria-label="Lead overview">
<div class="stat"><span>Total leads</span><strong id="total">—</strong></div>
<div class="stat"><span>Awaiting review</span><strong id="pending">—</strong></div>
<div class="stat"><span>Waitlist requests</span><strong id="waitlist">—</strong></div>
</section>
<div class="columns">
<section class="panel"><h2>Stock control</h2>
<div id="stock-display" class="notice">Loading inventory…</div>
<form id="stock-form"><label>Physical units on hand
<input id="on-hand" name="onHand" type="number" min="0" max="100000" step="1" required></label>
<label>Restock update (optional; no unverified ETA)
<textarea id="restock" name="restockNote" rows="3" maxlength="160" placeholder="e.g. Next batch awaiting confirmation"></textarea></label>
<button type="submit">Save verified inventory</button></form>
<p class="muted">Confirmed orders reserve units. Fulfilled orders deduct physical units; cancelled confirmed orders release reservations.</p>
</section>
<section class="panel"><h2>How to manage orders</h2>
<p>New requests enter <strong>pending review</strong>. When stock is zero they enter the <strong>waitlist</strong>.</p>
<p>Confirm an order only after speaking with the customer; the database checks available stock and reserves the required units automatically.</p>
<p>Change confirmed orders to <strong>fulfilled</strong> when dispatched, or <strong>cancelled</strong> to release stock.</p>
<p>Leads from direct WhatsApp messages are not captured automatically yet. Only website submissions are ingested at this stage.</p>
</section></div>
<section class="panel" id="whatsapp-inbox" style="margin-top:22px">
<div class="toolbar" style="margin:0 0 16px">
 <div><h2 style="margin:0">WhatsApp inbox</h2><p class="muted">Official Meta webhook · Incoming messages and staff-reviewed reply suggestions</p></div>
 <button type="button" id="wa-refresh" class="secondary">Refresh inbox</button>
</div>
<p class="notice" id="wa-connection-status">Checking WhatsApp integration status…</p><p class="muted">Suggestions are rules-based drafts, not automatic replies. Never send unreviewed messages.</p>
<div class="columns">
 <div><h3>Conversations</h3><div id="wa-conversations" class="list"><p class="muted">Loading…</p></div></div>
 <div><h3 id="wa-selected">Select a conversation</h3><div id="wa-messages" class="list"><p class="muted">No conversation selected.</p></div>
 <div style="margin-top:16px">
 <button type="button" id="wa-suggest" disabled>Suggest a response</button>
 <label style="margin-top:14px">Review and copy draft<textarea id="wa-draft" rows="5" maxlength="4000" placeholder="Suggestions appear here. Review before sending."></textarea></label>
 <button type="button" class="secondary" id="wa-copy">Copy draft</button>
 <p class="muted">The dashboard does not send WhatsApp messages; use your authorized business messaging application to respond manually.</p>
 </div></div>
</div></section>
<div class="toolbar"><h2>Customer enquiries</h2><div class="actions"><button id="refresh" type="button" class="secondary">Refresh</button><button id="export" type="button" class="secondary">Export CSV</button></div></div>
<div id="leads" class="list"><p class="muted">Loading leads…</p></div>
</main>
<script nonce="${nonce}">
'use strict';
const $=s=>document.querySelector(s);
const F=$('#feedback');
$('#logout').addEventListener('click',async()=>{
 try { await api('/api/admin/logout','POST'); location.assign('/admin/'); }
 catch(e){ F.textContent='Could not sign out: '+e.message; }
});
let records=[];
const statuses=['new','contacted','qualified','won','lost'];
const flow={pending_review:['confirmed','cancelled'],waitlist:['confirmed','cancelled'],confirmed:['fulfilled','cancelled']};
async function api(path,method='GET',data){
 const res=await fetch(path,{method,credentials:'same-origin',
  headers:{'Content-Type':'application/json','X-Requested-With':'XMLHttpRequest'},
  body:data?JSON.stringify(data):undefined,cache:'no-store'});
 const result=await res.json().catch(()=>({error:'Invalid server response'}));
 if(!res.ok||!result.ok)throw Error(result.error||'Request failed');
 return result;
}
function text(tag,value,className){
 const el=document.createElement(tag);el.textContent=String(value??'');
 if(className)el.className=className;return el;
}
function notify(msg){F.textContent=msg}
function option(select,value,label,selected){
 const el=document.createElement('option');el.value=value;el.textContent=label;
 el.selected=value===selected;select.append(el);
}
function field(label,choices,current){
 const wrapper=document.createElement('label');wrapper.append(text('span',label));
 const select=document.createElement('select');
 for(const choice of choices)option(select,choice,choice.replaceAll('_',' '),current);
 wrapper.append(select);return{wrapper,select};
}
async function refresh(){
 try{
  const [summary,leads]=await Promise.all([api('/api/admin/summary'),api('/api/admin/leads')]);
  $('#total').textContent=summary.counts.total||0;
  $('#pending').textContent=summary.counts.pending||0;
  $('#waitlist').textContent=summary.counts.waitlist||0;
  const p=summary.product;
  if(p){
    $('#stock-display').textContent=
      (p.is_verified?'Verified':'NOT VERIFIED')+' · Physical: '+p.on_hand+
      ' · Reserved: '+p.allocated+' · Available: '+(p.on_hand-p.allocated);
    $('#on-hand').value=p.on_hand;$('#restock').value=p.restock_note||'';
  }
  records=leads.leads||[];
  const container=$('#leads');container.replaceChildren();
  if(!records.length)container.append(text('p','No leads received yet.','muted'));
  for(const item of records){
    const article=document.createElement('article');article.className='lead';
    const head=document.createElement('div');head.className='lead-head';
    const name=document.createElement('div');
    name.append(text('h3',item.name),text('small',item.phone+' · '+item.city));
    head.append(name,text('span',item.source+' · '+item.created_at,'bubble'));
    article.append(head,text('p',item.topic+' · Qty '+item.quantity+' · Order: '+item.order_status,'lead-meta'));
    article.append(text('p',item.notes,'lead-notes'));
    const controls=document.createElement('div');controls.className='lead-controls';
    const stage=field('Lead stage',statuses,item.status);controls.append(stage.wrapper);
    let order=null;
    if(item.order_status!=='not_order'){
      order=field('Order status',[item.order_status,...(flow[item.order_status]||[])],item.order_status);
      controls.append(order.wrapper);
    }
    const save=text('button','Save update');save.type='button';
    save.addEventListener('click',async()=>{
      save.disabled=true;notify('Saving…');
      try{
        await api('/api/admin/lead','POST',{
          id:item.id,status:stage.select.value,orderStatus:order?order.select.value:item.order_status
        });await refresh();notify('Lead updated.');
      }catch(e){notify(e.message);save.disabled=false;}
    });
    controls.append(save);article.append(controls);container.append(article);
  }
  notify('Dashboard loaded.');
 }catch(e){notify('Cannot load records: '+e.message);}
}
$('#stock-form').addEventListener('submit',async e=>{
 e.preventDefault();const button=e.currentTarget.querySelector('button');button.disabled=true;
 notify('Updating stock…');
 try{
  await api('/api/admin/stock','POST',{onHand:Number($('#on-hand').value),
   restockNote:$('#restock').value});await refresh();notify('Verified stock updated.');
 }catch(error){notify(error.message);}finally{button.disabled=false;}
});
$('#refresh').addEventListener('click',refresh);
$('#export').addEventListener('click',()=>{
 const fields=['id','created_at','source','name','phone','city','topic','notes','quantity','status','order_status'];
 const cell=value=>{
   let v=String(value??'');if(/^[=+@\\-\\t\\r]/.test(v))v="'"+v;
   return '"'+v.replaceAll('"','""')+'"';
 };
 const csv=[fields.join(','),...records.map(item=>fields.map(key=>cell(item[key])).join(','))].join('\\r\\n');
 const url=URL.createObjectURL(new Blob(['\\ufeff'+csv],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='authentic-naturals-leads.csv';
 a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
});
let selectedWA='';
async function loadWhatsApp(){
 const container=$('#wa-conversations');
 try{
  const status=await api('/api/admin/whatsapp/status');
  $('#wa-connection-status').textContent=status.webhookConfigured
    ? 'Meta webhook credentials configured. Inbound messages will appear when your WhatsApp Business webhook subscription is active. Outbound replies remain manual.'
    : 'Meta webhook not connected. Configure WA_APP_SECRET, WA_VERIFY_TOKEN, WA_PHONE_NUMBER_ID and subscribe the webhook in your Meta app.';
 }catch(e){$('#wa-connection-status').textContent='Inbox database setup incomplete: '+e.message;}

 try{
  const data=await api('/api/admin/whatsapp/conversations');
  const conversations=data.conversations||[];
  container.replaceChildren();
  if(!conversations.length)container.append(text('p','No inbound conversations yet. Configure Meta webhook secrets to activate.','muted'));
  for(const item of conversations){
   const button=document.createElement('button');
   button.type='button';button.className='secondary';
   button.style.cssText='width:100%;text-align:left;white-space:normal';
   button.textContent=(item.display_name||'WhatsApp customer')+' · +'+item.phone+
     ' · '+(item.preview||'Message received').slice(0,100);
   button.addEventListener('click',()=>openWhatsApp(item));
   container.append(button);
  }
 }catch(error){container.replaceChildren(text('p','Inbox unavailable: '+error.message,'muted'));}
}
async function openWhatsApp(item){
 selectedWA=item.id;
 $('#wa-selected').textContent=(item.display_name||'Customer')+' · +'+item.phone;
 $('#wa-suggest').disabled=false;
 $('#wa-draft').value='';
 const container=$('#wa-messages');
 container.replaceChildren(text('p','Loading messages…','muted'));
 try{
  const data=await api('/api/admin/whatsapp/messages?conversation='+encodeURIComponent(item.id));
  container.replaceChildren();
  for(const message of data.messages||[]){
   const card=document.createElement('div');card.className='lead';
   card.append(text('small',message.direction+' · '+message.created_at));
   card.append(text('p',message.body,'lead-notes'));
   container.append(card);
  }
  if(!container.children.length)container.append(text('p','No messages.','muted'));
 }catch(e){container.replaceChildren(text('p',e.message,'muted'));}
}
$('#wa-refresh').addEventListener('click',loadWhatsApp);
$('#wa-suggest').addEventListener('click',async()=>{
 if(!selectedWA)return;
 try{
  const data=await api('/api/admin/whatsapp/reply-draft?conversation='+encodeURIComponent(selectedWA));
  $('#wa-draft').value=data.draft||'';
  notify('Rule-based draft prepared for manual staff review. Nothing was sent.');
 }catch(e){notify(e.message);}
});
$('#wa-copy').addEventListener('click',async()=>{
 const draft=$('#wa-draft').value.trim();
 if(!draft){notify('No reply draft to copy.');return;}
 try{
  await navigator.clipboard.writeText(draft);
  notify('Draft copied. Review it before sending via your authorized WhatsApp account.');
 }catch(e){notify('Copy unavailable. Select and copy the draft manually.');}
});
loadWhatsApp();
refresh();
</script></body></html>`;
}
