import { createRemoteJWKSet, jwtVerify } from 'jose';
import { adminPage } from './admin-page.js';
import { webhook, whatsappAdminApi } from './whatsapp.js';

const SKU = 'AN-HAIR-OIL-100';
const allowedSources = new Set(['enquiry','order']);
const allowedStages = new Set(['new','contacted','qualified','won','lost']);
const validOrderTransitions = {
  pending_review: new Set(['confirmed','cancelled']),
  waitlist: new Set(['confirmed','cancelled']),
  confirmed: new Set(['fulfilled','cancelled'])
};
const identityKeys = new Map();
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
  return Boolean(env.DB && env.RATE_SECRET);
}
async function hashIp(value,env) {
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.RATE_SECRET),
    {name:'HMAC',hash:'SHA-256'},false,['sign']);
  const period=new Date().toISOString().slice(0,10);
  const bytes=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(period+':'+value));
  return [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
async function authorize(request,env) {
  const domain=clip(env.ACCESS_TEAM_DOMAIN,180).replace(/^https?:\/\//,'').replace(/\/$/,'');
  const audience=clip(env.ACCESS_AUD,150);
  const allow=(env.ADMIN_EMAILS||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
  if (!domain || !domain.endsWith('.cloudflareaccess.com') || !audience || allow.length===0) return null;
  const raw=request.headers.get('Cf-Access-Jwt-Assertion')
    || request.headers.get('cookie')?.match(/(?:^|;\s*)CF_Authorization=([^;]+)/)?.[1];
  if(!raw) return null;
  try{
    let keyset=identityKeys.get(domain);
    if(!keyset){
      keyset=createRemoteJWKSet(new URL('https://'+domain+'/cdn-cgi/access/certs'));
      identityKeys.set(domain,keyset);
    }
    const {payload}=await jwtVerify(raw,keyset,{issuer:'https://'+domain,audience,algorithms:['RS256']});
    const email=String(payload.email||'').toLowerCase();
    return allow.includes(email)?email:null;
  }catch{return null;}
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
  const quantity=Math.min(20,Math.max(1,Math.trunc(Number(body.quantity)||1)));
  const idempotency=clip(body.idempotencyKey,90);
  if(!allowedSources.has(source)||name.length<2||notes.length<3)return fail('Valid name and message required',422);
  if(source==='order'&&(!phone||!city))return fail('Phone and city required for order request',422);
  const ipHash=await hashIp(request.headers.get('CF-Connecting-IP')||'unknown',env);
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
        name,phone,city,topic,notes,quantity,orderStatus,
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

/** Google Sheets is the sole destination for website enquiry/order capture when configured.
 * Secrets remain in Cloudflare Worker bindings and never reach the browser.
 */
async function captureToSheets(request,env){
  if(!env.CRM_SCRIPT_URL||!env.CRM_SHARED_SECRET)
    return fail('Website CRM intake is not connected yet',503);
  if(request.method!=='POST')return fail('Method not allowed',405);
  if(!secure(request)||!validOrigin(request)||request.headers.get('X-Requested-With')!=='XMLHttpRequest')
    return fail('Invalid request origin',403);
  if(!request.headers.get('content-type')?.startsWith('application/json'))
    return fail('JSON required',415);
  const raw=await request.text();
  if(raw.length>8192)return fail('Request too large',413);
  let input;
  try{input=JSON.parse(raw)}catch{return fail('Invalid JSON',400)}
  if(!input||typeof input!=='object'||Array.isArray(input))return fail('Invalid request',400);
  if(input.website)return json({ok:false,error:'Invalid submission'},422);
  if(input.consent!==true)return fail('Consent required',422);
  const source=clip(input.source,20);
  if(!allowedSources.has(source))return fail('Invalid source',422);
  const name=clip(input.name,100),phone=clip(input.phone,40),city=clip(input.city,100);
  const notes=clip(input.notes,1200),address=clip(input.address,400);
  const payment=clip(input.payment,40);
  const quantity=Number(input.quantity);
  if(name.length<2||phone.length<7||notes.length<3||!Number.isInteger(quantity)||quantity<1||quantity>20)
    return fail('Name, phone, message and quantity required',422);
  if(source==='order'&&(!city||!address))return fail('Delivery city and address required',422);
  const url=String(env.CRM_SCRIPT_URL);
  let parsed;
  try{parsed=new URL(url)}catch{return fail('CRM endpoint misconfigured',503)}
  if(parsed.protocol!=='https:'||parsed.hostname!=='script.google.com'||!/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(parsed.pathname))
    return fail('CRM endpoint misconfigured',503);
  // Do not accept caller-supplied URL or token.
  const requestId=clip(input.idempotencyKey,100)||crypto.randomUUID();
  const payload={
    token:env.CRM_SHARED_SECRET,requestId,
    source:source==='order'?'website_order':'website_enquiry',
    name,phone,city,message:notes,address,payment,quantity,consent:true,
    marketingConsent:input.marketingConsent===true,
    website:''
  };
  try{
    const response=await fetch(parsed.toString(),{
      method:'POST',headers:{'content-type':'application/json'},
      body:JSON.stringify(payload),redirect:'follow',
      signal:AbortSignal.timeout(10000)
    });
    if(!response.ok)return fail('CRM service unavailable',503);
    const result=await response.json();
    if(!result||result.ok!==true||result.ignored===true)
      return fail('Unable to save enquiry to CRM',503);
    return json({ok:true,lead_id:result.id,order_id:result.orderId||null,
      destination:'google_sheets',orderStatus:source==='order'?'pending_review':'not_order'},201);
  }catch(error){
    console.error('Sheets intake unavailable:',String(error).slice(0,100));
    return fail('Unable to save enquiry to CRM',503);
  }
}

async function adminApi(request,env,path) {
  const owner=await authorize(request,env);
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
      if(path==='/api/leads.php'||path==='/api/leads')return captureToSheets(request,env);
      if(path==='/admin'||path==='/admin/'){
        const owner=await authorize(request,env);
        if(!owner)return new Response('Dashboard requires an approved Cloudflare Access login and Worker authorization.',{status:403,headers:security});
        if(!env.DB)return new Response('Connect the D1 database to enable the dashboard.',{status:503,headers:security});
        const nonce=crypto.randomUUID().replace(/-/g,'');
        return new Response(adminPage(nonce,owner),{headers:{...security,'content-type':'text/html; charset=utf-8',
          'content-security-policy':"default-src 'none'; script-src 'nonce-"+nonce+"'; style-src 'nonce-"+nonce+"'; connect-src 'self'; form-action 'none'; base-uri 'none'; frame-ancestors 'none'"}});
      }
      if(path.startsWith('/api/admin/'))return adminApi(request,env,path);
      return env.ASSETS.fetch(request);
    }catch(error){
      console.error('CRM API error',String(error).slice(0,150));
      return fail('Service temporarily unavailable',503);
    }
  }
};
