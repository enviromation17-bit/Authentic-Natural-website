'use strict';
/* Authentic Naturals Lead Studio — isolated, single-tab DEMO.
   No network requests, external keys, localStorage, or automatic capture.
   Real production lead storage requires server-side authentication and authorization. */
(()=>{
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const icons={
 overview:'<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="11" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/>',
 leads:'<path d="M5 5h14v14H5z"/><path d="M9 9h6M9 13h6M9 17h4"/>',
 users:'<circle cx="9" cy="8" r="3"/><path d="M2.5 20v-2a6.5 6.5 0 0 1 13 0v2"/><path d="M17 5a3 3 0 0 1 0 6M19 14a5 5 0 0 1 2 4v2"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 11h18M8 16h4"/>',
 insights:'<path d="M3 20V10M8 20V4M13 20v-7M18 20V8M2 20h20"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M4 12a8 8 0 0 1 .5-2.8l-2-1.5 2-3.5 2.5 1A8 8 0 0 1 9.5 3l.5-2h4l.5 2A8 8 0 0 1 17 4.2l2.5-1 2 3.5-2 1.5A8 8 0 0 1 20 12a8 8 0 0 1-.5 2.8l2 1.5-2 3.5-2.5-1a8 8 0 0 1-2.5 1.2L14 22h-4l-.5-2A8 8 0 0 1 7 18.8l-2.5 1-2-3.5 2-1.5A8 8 0 0 1 4 12Z"/>'
};
$$('[data-icon]').forEach(el=>el.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+(icons[el.dataset.icon]||'')+'</svg>');
const today=()=>new Date().toISOString().slice(0,10);
const offset=(n)=>{const d=new Date();d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
let leads=[
 {id:'d1',name:'Demo customer 01',phone:'',source:'Website',status:'new',product:'Hair Repair & Revive Growth Oil',followup:offset(1),notes:'Example enquiry about ingredients.',created:offset(-1)},
 {id:'d2',name:'Demo customer 02',phone:'',source:'Instagram',status:'contacted',product:'Hair Repair & Revive Growth Oil',followup:offset(2),notes:'Asked about delivery time.',created:offset(-2)},
 {id:'d3',name:'Demo customer 03',phone:'',source:'WhatsApp',status:'qualified',product:'Hair Repair & Revive Growth Oil',followup:today(),notes:'Example interested customer.',created:offset(-3)},
 {id:'d4',name:'Demo customer 04',phone:'',source:'Referral',status:'won',product:'Hair Repair & Revive Growth Oil',followup:'',notes:'Example completed sale.',created:offset(-5)},
 {id:'d5',name:'Demo customer 05',phone:'',source:'TikTok',status:'new',product:'Hair Repair & Revive Growth Oil',followup:offset(3),notes:'Interested in product usage.',created:today()},
 {id:'d6',name:'Demo customer 06',phone:'',source:'Website',status:'lost',product:'Hair Repair & Revive Growth Oil',followup:'',notes:'Example closed enquiry.',created:offset(-8)}
];
let page='overview',search='', lastFocused=null;const pages={
 overview:['Overview','Your customer conversations, beautifully organized.'],
 leads:['Leads','Every enquiry, every stage, all in one place.'],
 customers:['Customers','The people behind every conversation.'],
 followups:['Follow-ups','Keep every important conversation moving.'],
 insights:['Insights','A clearer view of where customer interest comes from.'],
 settings:['Data & settings','Choose how you manage and export your leads.']
};
const statusLabels={new:'New',contacted:'Contacted',qualified:'Qualified',won:'Won',lost:'Lost'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const statusBadge=s=>'<span class="status '+esc(s)+'">'+esc(statusLabels[s]||s)+'</span>';
const filtered=()=>leads.filter(l=>( $('#view-filter').value==='all'||l.status===$('#view-filter').value )&&(!search||[l.name,l.source,l.product,l.notes,l.status].join(' ').toLowerCase().includes(search)));
const count=s=>leads.filter(x=>x.status===s).length;
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2600)}
function empty(message){return '<div class="empty"><strong>Nothing here yet.</strong><p>'+esc(message)+'</p></div>'}
function heading(title,aside=''){return '<div class="page-heading"><h2>'+esc(title)+'</h2><small>'+esc(aside)+'</small></div>'}
function recent(list=leads.slice(0,5)){return list.length?list.map(l=>'<div class="recent-row"><div class="avatar">'+esc(l.name.split(' ').slice(-1)[0].slice(0,2))+'</div><div class="recent-copy"><strong>'+esc(l.name)+'</strong><span>'+esc(l.source)+' · '+esc(l.created||'')+'</span></div>'+statusBadge(l.status)+'</div>').join(''):empty('Add a new demo lead to get started.')}
function metrics(){return '<div class="kpis">'+[
 ['Total leads',leads.length,'Across all sources','featured'],
 ['New enquiries',count('new'),'Awaiting first response',''],
 ['Qualified',count('qualified'),'Ready for the next step',''],
 ['Won',count('won'),'Marked as converted','']
].map(([k,v,n,cl])=>'<article class="kpi '+cl+'"><span class="kpi-label">'+k+'</span><strong>'+v+'</strong><div class="kpi-note">'+n+'</div></article>').join('')+'</div>'}
function bars(field){const values={};for(const lead of leads){const key=lead[field]||'Unknown';values[key]=(values[key]||0)+1}const entries=Object.entries(values).sort((a,b)=>b[1]-a[1]);const max=Math.max(1,...entries.map(x=>x[1]));return entries.length?entries.map(([k,n])=>'<div class="bar-row"><span class="bar-label">'+esc(field==='status'?(statusLabels[k]||k):k)+'</span><div class="bar-track"><span class="bar-fill" style="width:'+(n/max*100)+'%"></span></div><span class="bar-number">'+n+'</span></div>').join(''):empty('No data yet.')}
function overview(){return metrics()+heading('Your daily pulse','A quick view of your demo pipeline')+'<div class="two-col"><section class="surface fill"><div class="surface-heading"><h3>Recent conversations</h3><button type="button" class="small-link" data-navigate="leads">View all →</button></div>'+recent()+'</section><section class="surface fill"><div class="surface-heading"><h3>Lead sources</h3><span class="muted">Current workspace</span></div>'+bars('source')+'</section></div>'}
function table(list){return list.length?'<div class="table-scroll"><table><thead><tr><th>Customer</th><th>Source</th><th>Status</th><th>Follow-up</th><th>Created</th><th></th></tr></thead><tbody>'+list.map(l=>'<tr><td><span class="lead-name">'+esc(l.name)+'</span><span class="muted">'+esc(l.product)+'</span></td><td>'+esc(l.source)+'</td><td>'+statusBadge(l.status)+'</td><td>'+esc(l.followup||'—')+'</td><td>'+esc(l.created||'—')+'</td><td><button class="table-action" type="button" data-edit="'+esc(l.id)+'">Edit</button></td></tr>').join('')+'</tbody></table></div>':empty('Try another filter, or add a lead to this demo.')}
function leadPage(){return '<div class="surface">'+heading('Lead pipeline',filtered().length+' of '+leads.length+' records')+'<div class="table-tools"><input id="lead-search" type="search" placeholder="Search names, sources or notes…" aria-label="Search leads" value="'+esc(search)+'"><button class="btn btn-outline" type="button" data-add-lead>+ Add lead</button></div><div id="lead-results">'+table(filtered())+'</div></div>'}
function customers(){const names=[...new Set(leads.map(x=>x.name))];return '<div class="surface">'+heading('Customer directory',names.length+' example profiles')+'<div class="two-col" style="grid-template-columns:repeat(auto-fit,minmax(230px,1fr))">'+names.map(name=>{const subset=leads.filter(l=>l.name===name);return '<article class="surface" style="box-shadow:none"><div class="recent-row"><div class="avatar">'+esc(name.slice(-2))+'</div><div class="recent-copy"><strong>'+esc(name)+'</strong><span>'+subset.length+' conversation(s)</span></div></div><p class="muted">'+esc(subset[0].source)+' · '+esc(subset[0].product)+'</p>'+statusBadge(subset[0].status)+'</article>'}).join('')+'</div></div>'}
function followups(){const todo=leads.filter(l=>l.followup&&l.status!=='won'&&l.status!=='lost').sort((a,b)=>a.followup.localeCompare(b.followup));return '<div class="two-col"><section class="surface">'+heading('Upcoming follow-ups',todo.length+' scheduled')+(todo.length?todo.map(l=>'<div class="recent-row"><div class="avatar">✦</div><div class="recent-copy"><strong>'+esc(l.name)+'</strong><span>'+esc(l.notes)+'</span></div><span class="status '+(l.followup<=today()?'qualified':'new')+'">'+esc(l.followup)+'</span><button class="table-action" data-edit="'+esc(l.id)+'">Edit</button></div>').join(''):empty('No follow-ups scheduled.'))+'</section><aside class="surface"><h3>Keep it simple.</h3><p class="muted">Give each open conversation a next step. Follow-up dates in this demo are reminders on this page only; no notifications or messages are sent.</p><button class="btn btn-primary" data-add-lead>+ New lead</button></aside></div>'}
function insights(){const won=count('won');return '<div class="insight-hero"><span>CONVERSATION → CUSTOMER</span><strong>'+(leads.length?Math.round(won/leads.length*100):0)+'%</strong><p>Illustrative win rate for records marked Won. This is sample information, not actual business performance.</p></div>'+heading('Where your leads come from')+'<div class="two-col"><section class="surface"><h3>Lead sources</h3>'+bars('source')+'</section><section class="surface"><h3>Pipeline stage</h3>'+bars('status')+'</section></div>'}
function settings(){return '<div class="surface"><div class="setting-block"><h3>CSV files</h3><p>Bring sample data into this tab or download a CSV for a private Google Sheet. No credentials are placed in the website, no records are uploaded, and there is no automatic synchronization.</p><div class="setting-actions"><button id="settings-export" class="btn btn-primary" type="button">Export CSV</button><label class="btn btn-outline import-label" tabindex="0">Import CSV <input id="csv-file" type="file" accept=".csv,text/csv" aria-label="Import CSV"></label><button id="reset-demo" type="button" class="btn btn-outline">Reset sample data</button></div></div><div class="worksheet-note"><strong>Connecting Google Sheets safely</strong><span>Use this CSV to populate a private Google Sheet manually. To sync automatically, deploy an authenticated server endpoint with per-user permissions and secret storage; do not paste a Sheets API key or public Apps Script write URL into this frontend. The public store WhatsApp form currently prepares a message but does not save a lead.</span></div></div>'}
function render(){
 const [title,description]=pages[page];
 $('#page-title').innerHTML=esc(title)+'<span class="title-period">.</span>';
 $('#page-description').textContent=description;
 $$('.rail-link[data-page]').forEach(btn=>{const active=btn.dataset.page===page;btn.classList.toggle('active',active);if(active)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current')});
 $('#view-filter').closest('.select-wrap').hidden=page!=='leads';
 $('#content').innerHTML={overview,leads:leadPage,customers,followups,insights,settings}[page]();
}
function navigate(name){if(!pages[name])return;page=name;search='';$('#view-filter').value='all';render();window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'})}
function openEditor(id){
 const dialog=$('#lead-dialog'),form=$('#lead-form');form.reset();
 const found=leads.find(x=>x.id===id);
 form.elements.id.value=found?.id||'';
 for(const name of ['name','phone','source','status','product','followup','notes'])if(found&&form.elements[name])form.elements[name].value=found[name]||'';
 $('#editor-title').textContent=found?'Edit lead':'New lead';
 lastFocused=document.activeElement;
 if(!dialog.open)dialog.showModal();
 form.elements.name.focus();
}
function closeEditor(){const dialog=$('#lead-dialog');if(dialog.open)dialog.close();if(lastFocused?.isConnected)lastFocused.focus({preventScroll:true})}
$('#lead-form').addEventListener('submit',e=>{
 e.preventDefault();
 const form=e.currentTarget;if(!form.reportValidity())return;
 const values=Object.fromEntries(new FormData(form).entries());
 const old=leads.find(l=>l.id===values.id);
 const obj={id:old?.id||'manual-'+Date.now(),created:old?.created||today(),
 name:String(values.name||'').trim().slice(0,80),phone:String(values.phone||'').trim().slice(0,36),
 source:String(values.source||'Manual').slice(0,30),status:statusLabels[values.status]?values.status:'new',
 product:String(values.product||'').trim().slice(0,100),followup:String(values.followup||'').slice(0,10),
 notes:String(values.notes||'').trim().slice(0,1000)};
 if(!obj.name)return;
 if(old)Object.assign(old,obj);else leads.unshift(obj);
 closeEditor();render();toast('Saved in this tab only — not synced.');
});
$('#editor-close').addEventListener('click',closeEditor);$('#editor-cancel').addEventListener('click',closeEditor);
$('#lead-dialog').addEventListener('click',e=>{if(e.target===$('#lead-dialog'))closeEditor()});
document.addEventListener('click',e=>{
 const add=e.target.closest('[data-add-lead]');if(add){openEditor();return}
 const nav=e.target.closest('[data-page],[data-navigate]');if(nav){navigate(nav.dataset.page||nav.dataset.navigate);return}
 const edit=e.target.closest('[data-edit]');if(edit){openEditor(edit.dataset.edit);return}
 if(e.target.closest('#export-btn,#settings-export')){exportCsv();return}
 if(e.target.closest('#reset-demo')){leads=[];render();toast('Demo cleared. Reload to restore the sample.')};
});
$('#view-filter').addEventListener('change',render);
document.addEventListener('input',e=>{if(e.target.id==='lead-search'){search=e.target.value.toLowerCase();$('#lead-results').innerHTML=table(filtered())}});
function csvSafe(value){let str=String(value??'');if(/^[=+@\-\t\r]/.test(str))str="'"+str;return '"'+str.replaceAll('"','""')+'"'}
const columns=['id','name','phone','source','status','product','followup','notes','created'];
function exportCsv(){const lines=[columns.join(','),...leads.map(l=>columns.map(k=>csvSafe(l[k])).join(','))];const url=URL.createObjectURL(new Blob(['\ufeff'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='authentic-naturals-leads-demo.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Downloaded CSV — no cloud sync.')}
function parseCSV(text){
 const rows=[];let row=[],cell='',quote=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(quote){if(c==='"'&&text[i+1]==='"'){cell+='"';i++}else if(c==='"')quote=false;else cell+=c}
 else if(c==='"')quote=true;else if(c===','){row.push(cell);cell=''}else if(c==='\n'){row.push(cell.replace(/\r$/,''));rows.push(row);row=[];cell=''}else cell+=c}
 if(cell||row.length){row.push(cell);rows.push(row)}
 if(quote)throw Error('Unclosed CSV quote');
 return rows;
}
document.addEventListener('change',async e=>{
 if(e.target.id!=='csv-file')return;
 const file=e.target.files?.[0];if(!file)return;
 if(file.size>2000000){toast('CSV too large. Limit 2 MB.');e.target.value='';return}
 try{
  const rows=parseCSV((await file.text()).replace(/^\ufeff/,''));
  const header=rows.shift()?.map(x=>x.trim().toLowerCase());
  if(!header?.includes('name'))throw Error('A name column is required.');
  const imported=[];
  for(const row of rows.slice(0,500)){
   const value=key=>String(row[header.indexOf(key)]||'').trim();
   if(!value('name'))continue;
   const status=value('status').toLowerCase();
   imported.push({id:'import-'+imported.length+'-'+Date.now(),name:value('name').slice(0,80),
    phone:value('phone').slice(0,36),source:value('source').slice(0,30)||'Manual',
    status:statusLabels[status]?status:'new',product:value('product').slice(0,100),
    followup:value('followup').slice(0,10),notes:value('notes').slice(0,1000),created:value('created').slice(0,10)||today()});
  }
  leads=imported;render();toast('Imported '+imported.length+' rows into this tab only.');
 }catch(error){toast('Import failed: '+error.message)}
 e.target.value='';
});
render();
})();