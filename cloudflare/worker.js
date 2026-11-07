import { adminPage } from './admin-page.js';
import { webhook, whatsappAdminApi } from './whatsapp.js';
import { sessionOwner, passwordLogin, passwordLogout, loginPage } from './password-auth.js';

const SKU = 'AN-HAIR-OIL-100';
const allowedSources = new Set(['enquiry','order']);
const allowedStages = new Set(['new','contacted','qualified','won','lost']);
const validOrderTransitions = {
  pending_review: new Set(['confirmed','cancelled']),
  waitlist: new Set(['confirmed','cancelled']),
  confirmed: new Set(['fulfilled','cancelled'])
};

const json = (data,status=200,headers={}) => new Response(JSON.stringify(data),{
  status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',
    'x-content-type-options':'nosniff',...headers}
});
const fail = (message,status) => json({ok:false,error:message},status);
const clip = (value,max) => typeof value === 'string' ? value.trim().slice(0,max) : '';
const secure = request => new URL(request.url).protocol === 'https:';
function validOrigin(request) {
  const origin=request.headers.get('origin');
  return origin && origin === new URL(request.url).origin;
}
function configured(env) {
  return Boolean(env.DB);
}
async function hashIp(value) {
  // Daily hashed IP identifier for short-lived anti-spam control in private D1.
  const period=new Date().toISOString().slice(0,10);
  const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(period+':'+value));
  return [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
const security={
  'x-content-type-options':'nosniff',
  'referrer-policy':'no-referrer',
  'x-frame-options':'DENY',
  'cache-control':'no-store'
};
async function publicStock(env) {
  if (!env.DB) return json({ok:false,availability:'unverified',message:'Stock availability is being confirmed.'},503);
  try{
    const row=await env.DB.prepare('SELECT on_hand,allocated,is_verified,restock_note,updated_at FROM products WHERE sku=?').bind(SKU).first();
    if (!row || !row.is_verified) return json({ok:true,availability:'unverified',message:'Stock availability is being confirmed.'});
    const left=Math.max(0,row.on_hand-row.allocated);
    return json({ok:true,availability:left>0?'in_stock':'out_of_stock',
      available:left,restockNote:clip(row.restock_note,160),
      updatedAt:row.updated_at});
  }catch{return fail('Inventory temporarily unavailable',503);}
}
async function capture(request,env) {
  if(!configured(env)) return fail('Lead capture is not configured',503);
  if(request.method!=='POST')return fail('Method not allowed',405);
  if(!secure(request)||!validOrigin(request)||request.headers.get('X-Requested-With')!=='XMLHttpRequest')
    return fail('Invalid request origin',403);
  if(!request.headers.get('content-type')?.startsWith('application/json'))return fail('JSON required',415);
  if(Number(request.headers.get('content-length')||'0')>8192)return fail('Request too large',413);
  let body;
  try{body=await request.json();}catch{return fail('Invalid JSON',400);}
  if(!body||typeof body!=='object'||Array.isArray(body))return fail('Invalid request',400);
  if(body.website)return json({ok:true,received:true},202);
  if(body.consent!==true)return fail('Consent required',422);
  const source=clip(body.source,20);
  const name=clip(body.name,100);
  const phone=clip(body.phone,40),city=clip(body.city,100);
  const topic=clip(body.topic,100),notes=clip(body.notes,1200);
  const marketingConsent=body.marketingConsent===true?'Yes':'No';
  const quantity=Math.min(20,Math.max(1,Math.trunc(Number(body.quantity)||1)));
  const idempotency=clip(body.idempotencyKey,90);
  if(!allowedSources.has(source)||name.length<2||phone.length<7||notes.length<3)return fail('Valid name, phone and message required',422);
  if(source==='order'&&(!phone||!city))return fail('Phone and city required for order request',422);
  const ipHash=await hashIp(request.headers.get('CF-Connecting-IP')||'unknown');
  const recent=await env.DB.prepare("SELECT COUNT(*) AS n FROM leads WHERE ip_hash=? AND created_at>=datetime('now','-1 hour')").bind(ipHash).first();
  if((recent?.n||0)>=6)return fail('Too many requests; please contact us via WhatsApp',429);
  try{
    const stock=await env.DB.prepare('SELECT on_hand,allocated,is_verified FROM products WHERE sku=?').bind(SKU).first();
    if(!stock)return fail('Product not configured',503);
    const availability=stock.is_verified
      ? (stock.on_hand-stock.allocated>=quantity?'in_stock':'out_of_stock'):'unverified';
    const orderStatus=source==='order'
      ? (availability==='out_of_stock'?'waitlist':'pending_review'):'not_order';
    const leadId=crypto.randomUUID();
    await env.DB.prepare(`INSERT INTO leads
      (id,source,name,phone,city,topic,notes,quantity,order_status,sku,consent_at,idempotency_key,ip_hash)
      VALUES(?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,?,?)`)
      .bind(leadId,source==='order'?(orderStatus==='waitlist'?'website_waitlist':'website_order'):'website_enquiry',
        name,phone,city,topic,notes+' | Marketing opt-in: '+marketingConsent,quantity,orderStatus,
        source==='order'?SKU:null,idempotency||null,ipHash).run();
    return json({ok:true,lead_id:leadId,orderStatus,availability,
      message: orderStatus==='waitlist'
        ? 'Added to the enquiry waitlist. Restock timing is not confirmed.'
        : 'Request received. Orders require staff confirmation.'},201);
  }catch(error){
    if(String(error).includes('UNIQUE constraint')&&idempotency){
      const previous=await env.DB.prepare('SELECT id,order_status FROM leads WHERE idempotency_key=?').bind(idempotency).first();
      if(previous)return json({ok:true,lead_id:previous.id,orderStatus:previous.order_status,duplicate:true});
    }
    console.error('Lead intake failed',String(error).slice(0,150));
    return fail('Unable to save enquiry; please use WhatsApp',503);
  }
}

async function adminApi(request,env,path) {
  const owner=await sessionOwner(request,env);
  if(!owner)return fail('Staff access required',403);
  if(!env.DB)return fail('D1 binding is not configured',503);
  if(path.startsWith('/api/admin/whatsapp/'))return whatsappAdminApi(request,env,path);
  if(request.method==='GET'&&path==='/api/admin/summary'){
    const [counts,product]=await env.DB.batch([
      env.DB.prepare("SELECT COUNT(*) AS total,SUM(CASE WHEN order_status='pending_review' THEN 1 ELSE 0 END) AS pending,SUM(CASE WHEN order_status='waitlist' THEN 1 ELSE 0 END) AS waitlist FROM leads"),
      env.DB.prepare('SELECT sku,title,price_pkr,on_hand,allocated,is_verified,restock_note,updated_at FROM products WHERE sku=?').bind(SKU)
    ]);
    return json({ok:true,counts:counts.results[0],product:product.results[0]||null});
  }
  if(request.method==='GET'&&path==='/api/admin/leads'){
    const rows=await env.DB.prepare('SELECT id,created_at,source,name,phone,city,topic,notes,quantity,status,order_status FROM leads ORDER BY created_at DESC LIMIT 250').all();
    return json({ok:true,leads:rows.results});
  }
  if(!['POST','PATCH'].includes(request.method))return fail('Not found',404);
  if(!validOrigin(request)||request.headers.get('X-Requested-With')!=='XMLHttpRequest')return fail('Invalid origin',403);
  let data;try{data=await request.json();}catch{return fail('Invalid JSON',400);}
  if(path==='/api/admin/stock'){
    const amount=Number(data.onHand);
    const note=clip(data.restockNote,160);
    if(!Number.isInteger(amount)||amount<0||amount>100000)return fail('Enter valid physical stock count',422);
    const result=await env.DB.prepare('UPDATE products SET on_hand=?,is_verified=1,restock_note=?,updated_at=CURRENT_TIMESTAMP WHERE sku=? AND allocated<=?')
      .bind(amount,note,SKU,amount).run();
    if(!result.meta.changes)return fail('Cannot lower physical stock below already confirmed allocations',409);
    await env.DB.prepare('INSERT INTO inventory_movements(id,sku,delta,reason,actor) VALUES(?,?,?,?,?)')
      .bind(crypto.randomUUID(),SKU,0,'physical_count_set_to_'+amount,owner).run();
    return json({ok:true});
  }
  if(path==='/api/admin/lead'){
    const id=clip(data.id,80);
    const status=clip(data.status,24);
    const orderStatus=clip(data.orderStatus,30);
    const lead=await env.DB.prepare('SELECT status,order_status,quantity FROM leads WHERE id=?').bind(id).first();
    if(!lead)return fail('Lead not found',404);
    if(status&&!allowedStages.has(status))return fail('Invalid lead stage',422);
    if(orderStatus&&orderStatus!==lead.order_status &&
      !validOrderTransitions[lead.order_status]?.has(orderStatus))return fail('Order transition not allowed',422);
    try{
      if(orderStatus&&orderStatus!==lead.order_status){
        // SQLite triggers atomically enforce available inventory on confirmation,
        // and adjust allocations on cancellation / fulfilment.
        await env.DB.prepare('UPDATE leads SET status=?,order_status=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND order_status=?')
          .bind(status||lead.status,orderStatus,id,lead.order_status).run();
      }else{
        await env.DB.prepare('UPDATE leads SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?')
          .bind(status||lead.status,id).run();
      }
      return json({ok:true});
    }catch(error){
      if(String(error).includes('insufficient stock'))return fail('Insufficient inventory; restock before confirming',409);
      throw error;
    }
  }
  return fail('Not found',404);
}
export default {
  async fetch(request,env) {
    const path=new URL(request.url).pathname;
    try{
      if(path==='/api/webhooks/whatsapp')return webhook(request,env);
      if(path==='/api/stock')return publicStock(env);
      if(path==='/api/leads.php'||path==='/api/leads')return capture(request,env);
      if(path==='/api/admin/login')return passwordLogin(request,env);
      if(path==='/api/admin/logout')return passwordLogout(request,env);
      if(path==='/admin'||path==='/admin/'){
        if(!env.DB)return new Response('Connect the D1 database to enable the dashboard.',{status:503,headers:security});
        const owner=await sessionOwner(request,env);
        const nonce=crypto.randomUUID().replace(/-/g,'');
        const html=owner?adminPage(nonce,owner):loginPage(nonce);
        return new Response(html,{headers:{...security,'content-type':'text/html; charset=utf-8',
          'content-security-policy':"default-src 'none'; script-src 'nonce-"+nonce+"'; style-src 'unsafe-inline'; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"}});
      }
      if(path.startsWith('/api/admin/'))return adminApi(request,env,path);
      return env.ASSETS.fetch(request);
    }catch(error){
      console.error('CRM API error',String(error).slice(0,150));
      return fail('Service temporarily unavailable',503);
    }
  }
};
