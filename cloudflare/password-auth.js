/* Single-owner password login for the existing Cloudflare D1 CRM.
 * No passwords in source or Worker bindings. Password verifier and sessions in D1.
 */
const CORS_HEADERS={
  'cache-control':'no-store','x-content-type-options':'nosniff',
  'referrer-policy':'no-referrer','x-frame-options':'DENY'
};
const encoder=new TextEncoder();
async function digestHex(value) {
 const b=await crypto.subtle.digest('SHA-256',encoder.encode(value));
 return [...new Uint8Array(b)].map(n=>n.toString(16).padStart(2,'0')).join('');
}
const b64url=bytes=>btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
function fromB64(value) {
 return Uint8Array.from(atob(String(value).replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));
}
const deny=(message,status=401)=>new Response(JSON.stringify({ok:false,error:message}),{
 status,headers:{...CORS_HEADERS,'content-type':'application/json'}
});
const currentTime=()=>Math.floor(Date.now()/1000);
function sameOrigin(req) {
 const url=new URL(req.url);
 return url.protocol==='https:'&&req.headers.get('Origin')===url.origin &&
        req.headers.get('X-Requested-With')==='XMLHttpRequest';
}
function requestCookie(req) {
 const c=req.headers.get('Cookie')||'';
 return c.match(/(?:^|;\s*)an_crm_session=([^;]+)/)?.[1]||'';
}
export async function sessionOwner(req,env) {
 if(!env.DB)return null;
 const value=requestCookie(req);
 if(!/^[A-Za-z0-9_-]{40,60}$/.test(value))return null;
 const key=await digestHex(value);
 try{
  const result=await env.DB.prepare(`SELECT u.username FROM crm_auth_sessions s
   INNER JOIN crm_auth_users u ON s.user_id=u.username
   WHERE s.token_hash=? AND s.expires_at>? LIMIT 1`).bind(key,currentTime()).first();
  return result?.username||null;
 }catch{return null;}
}
async function derivePassword(password,salt,iterations) {
 const key=await crypto.subtle.importKey('raw',encoder.encode(password),
   'PBKDF2',false,['deriveBits']);
 return new Uint8Array(await crypto.subtle.deriveBits({
   name:'PBKDF2',salt:fromB64(salt),iterations,hash:'SHA-256'
 },key,256));
}
function equalBytes(a,b) {
 if(a.length!==b.length)return false;
 let difference=0;
 for(let i=0;i<a.length;i++)difference|=a[i]^b[i];
 return difference===0;
}
function cookie(token,maxAge) {
 return 'an_crm_session='+token+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age='+maxAge;
}
export async function passwordLogin(req,env) {
 if(req.method!=='POST')return deny('Method not allowed',405);
 if(!sameOrigin(req))return deny('Invalid request origin',403);
 if(!env.DB)return deny('CRM database not configured',503);
 let input;
 try{
  if(Number(req.headers.get('content-length')||0)>4096)return deny('Invalid request',400);
  input=await req.json();
 }catch{return deny('Invalid request',400);}
 const username=String(input?.username||'').trim().toLowerCase();
 const password=String(input?.password||'');
 if(!/^[a-z0-9_-]{3,32}$/.test(username)||!password||password.length>256)
   return deny('Invalid credentials');
 try{
  const ip=req.headers.get('CF-Connecting-IP')||'unknown';
  const ipKey=await digestHex('auth-rate:'+ip);
  const now=currentTime();
  const attempts=await env.DB.prepare('SELECT failures,reset_at FROM crm_auth_attempts WHERE ip_hash=?')
    .bind(ipKey).first();
  if(attempts&&attempts.reset_at>now&&attempts.failures>=5)
    return deny('Too many attempts. Try again later.',429);
  const user=await env.DB.prepare('SELECT username,salt,verifier,iterations FROM crm_auth_users WHERE username=?')
    .bind(username).first();
  let valid=false;
  if(user&&Number.isInteger(user.iterations)&&user.iterations>=200000&&user.iterations<=1000000){
   const actual=await derivePassword(password,user.salt,user.iterations);
   valid=equalBytes(actual,fromB64(user.verifier));
  }
  if(!valid) {
   await env.DB.prepare(`INSERT INTO crm_auth_attempts(ip_hash,failures,reset_at)
      VALUES(?,1,?) ON CONFLICT(ip_hash) DO UPDATE SET
      failures=CASE WHEN reset_at<=? THEN 1 ELSE failures+1 END,
      reset_at=CASE WHEN reset_at<=? THEN excluded.reset_at ELSE reset_at END`)
      .bind(ipKey,now+900,now,now).run();
   return deny('Invalid credentials');
  }
  await env.DB.prepare('DELETE FROM crm_auth_attempts WHERE ip_hash=?').bind(ipKey).run();
  const raw=b64url(crypto.getRandomValues(new Uint8Array(32)));
  const hash=await digestHex(raw),seconds=60*60*24*14;
  await env.DB.prepare(`INSERT INTO crm_auth_sessions(token_hash,user_id,created_at,expires_at)
   VALUES(?,?,?,?)`).bind(hash,username,now,now+seconds).run();
  return new Response(JSON.stringify({ok:true}),{
   headers:{...CORS_HEADERS,'content-type':'application/json','Set-Cookie':cookie(raw,seconds)}
  });
 }catch(error) {
  console.error('CRM authentication error',String(error).slice(0,120));
  return deny('Login temporarily unavailable',503);
 }
}
export async function passwordLogout(req,env) {
 if(req.method!=='POST')return deny('Method not allowed',405);
 if(!sameOrigin(req))return deny('Invalid request origin',403);
 const token=requestCookie(req);
 if(token&&env.DB){
  const hash=await digestHex(token);
  await env.DB.prepare('DELETE FROM crm_auth_sessions WHERE token_hash=?').bind(hash).run();
 }
 return new Response(JSON.stringify({ok:true}),{
   headers:{...CORS_HEADERS,'content-type':'application/json','Set-Cookie':cookie('',0)}
 });
}
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function loginPage(nonce) {
 return `<!doctype html><html lang="en"><head><meta charset="utf-8">
 <meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
 <title>Authentic Naturals CRM · Sign in</title>
 <style>
 :root{color-scheme:light}*{box-sizing:border-box}
 body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f2f5ef;
  color:#1d3b2b;font:15px/1.5 system-ui,sans-serif;padding:20px}
 main{width:min(100%,430px);background:#fff;padding:clamp(24px,5vw,40px);border:1px solid #dce7db;
  border-radius:24px;box-shadow:0 24px 65px #1b403014}
 .eyebrow{color:#52785d;letter-spacing:.15em;font-size:11px;font-weight:800}
 h1{font:400 40px/1.15 Georgia,serif;margin:14px 0 10px}
 p{color:#5e7264;margin-bottom:28px}
 label{display:grid;gap:8px;margin:18px 0;font-size:13px;font-weight:700}
 input{width:100%;padding:13px;border-radius:12px;border:1px solid #c6d5c8;font:inherit}
 button{width:100%;border:0;border-radius:12px;background:#25563c;color:#fff;padding:14px;
 font:700 15px system-ui;cursor:pointer}
 button:disabled{opacity:.55}
 #feedback{min-height:24px;color:#a33b27;margin:12px 0;font-size:13px}
 </style></head><body><main><div class="eyebrow">AUTHENTIC NATURALS · PRIVATE CRM</div>
 <h1>Welcome back.</h1><p>One secure login for customer enquiries and orders.</p>
 <form id="login"><label>Username<input name="username" autocomplete="username" required value="owner"></label>
 <label>Password<input type="password" name="password" autocomplete="current-password" required minlength="12"></label>
 <button type="submit">Sign in</button><div id="feedback" role="status" aria-live="polite"></div></form></main>
 <script nonce="${nonce}">
 const form=document.getElementById('login'),status=document.getElementById('feedback');
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(!form.reportValidity())return;
  const button=form.querySelector('button');button.disabled=true;status.textContent='Signing in…';
  try{
   const response=await fetch('/api/admin/login',{method:'POST',credentials:'same-origin',
    headers:{'Content-Type':'application/json','X-Requested-With':'XMLHttpRequest'},
    body:JSON.stringify({username:form.elements.username.value,password:form.elements.password.value})});
   const result=await response.json();
   if(!response.ok||!result.ok)throw Error(result.error||'Login failed');
   location.replace('/admin/');
  }catch(error){status.textContent=error.message||'Login failed';button.disabled=false}
 });
 </script></body></html>`;
}
