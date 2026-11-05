/* Meta WhatsApp Business Platform intake and private CRM inbox.
 * No automatic outbound messages. Verified inbound messages only.
 * Never expose app secret, verify token, or business access token to the browser.
 */
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{
  'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'
}});
const textResponse=(body,status)=>new Response(body,{status,headers:{'Cache-Control':'no-store','Content-Type':'text/plain; charset=utf-8'}});
const safe=(value,max=500)=>typeof value==='string'?value.trim().slice(0,max):'';
const digits=(value)=>safe(value,32).replace(/[^0-9]/g,'').slice(0,16);
const noSecrets=(env)=>!env.WA_APP_SECRET || !env.WA_VERIFY_TOKEN || !env.WA_PHONE_NUMBER_ID || !env.DB;
async function validSignature(payload,header,secret){
  if(!header||!/^sha256=[a-f0-9]{64}$/i.test(header))return false;
  const bytes=new TextEncoder().encode(payload);
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const mac=new Uint8Array(await crypto.subtle.sign('HMAC',key,bytes));
  const expected=Uint8Array.from(header.slice(7).match(/../g),h=>parseInt(h,16));
  if(expected.length!==mac.length)return false;
  let diff=0;for(let i=0;i<mac.length;i++)diff|=expected[i]^mac[i];
  return diff===0;
}
function messageBody(msg){
  if(msg.type==='text')return safe(msg.text?.body,4000);
  if(msg.type==='button')return safe(msg.button?.text,300);
  if(msg.type==='interactive')return safe(msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title,300);
  return '[Customer sent a '+safe(msg.type||'non-text message',35)+' message. View it in WhatsApp Business.]';
}
export async function webhook(request,env){
  if(noSecrets(env))return textResponse('Webhook not configured',503);
  const url=new URL(request.url);
  if(request.method==='GET'){
    const mode=url.searchParams.get('hub.mode');
    const token=url.searchParams.get('hub.verify_token');
    const challenge=url.searchParams.get('hub.challenge');
    if(mode==='subscribe'&&token===env.WA_VERIFY_TOKEN&&challenge!==null&&challenge.length<400){
      return textResponse(challenge,200);
    }
    return textResponse('Forbidden',403);
  }
  if(request.method!=='POST')return textResponse('Method not allowed',405);
  const raw=await request.text();
  if(raw.length>200000)return textResponse('Payload too large',413);
  if(!await validSignature(raw,request.headers.get('x-hub-signature-256'),env.WA_APP_SECRET))return textResponse('Invalid signature',403);
  let data;try{data=JSON.parse(raw);}catch{return textResponse('Invalid payload',400);}
  if(data.object!=='whatsapp_business_account')return textResponse('Ignored',200);
  try{
    for(const entry of (Array.isArray(data.entry)?data.entry:[]).slice(0,10)){
      for(const change of (Array.isArray(entry.changes)?entry.changes:[]).slice(0,10)){
        if(change.field!=='messages')continue;
        const value=change.value||{};
        // Reject events for an unrelated WhatsApp Business phone.
        if(String(value.metadata?.phone_number_id||'')!==String(env.WA_PHONE_NUMBER_ID))continue;
        for(const msg of (Array.isArray(value.messages)?value.messages:[]).slice(0,15)){
          const providerId=safe(msg.id,190);
          const phone=digits(msg.from);
          if(!providerId.startsWith('wamid.') || phone.length<8)continue;
          const name=safe((value.contacts||[]).find(c=>digits(c.wa_id)===phone)?.profile?.name,100)||'WhatsApp customer';
          const body=messageBody(msg);
          const kind=safe(msg.type,40)||'unknown';
          const conversationId='wa:'+phone;
          const initialLeadId=crypto.randomUUID();
          const providerTimestamp=safe(msg.timestamp,24);
          // D1 batch executes statements atomically. Duplicates are ignored
          // via leads.idempotency_key and whatsapp_messages.id.
          await env.DB.batch([
            env.DB.prepare(`INSERT OR IGNORE INTO leads
              (id,source,name,phone,city,topic,notes,quantity,status,order_status,consent_at,idempotency_key)
              VALUES(?,'whatsapp_webhook',?,?,'','WhatsApp customer message',?,1,'new','not_order',CURRENT_TIMESTAMP,?)`)
              .bind(initialLeadId,name,phone,'Inbound service enquiry; no marketing opt-in. '+body.slice(0,900),'wa:contact:'+phone),
            env.DB.prepare(`INSERT INTO whatsapp_conversations
              (id,phone,display_name,lead_id,unread_count)
              VALUES(?,?,?,(SELECT id FROM leads WHERE idempotency_key=?),0)
              ON CONFLICT(phone) DO UPDATE SET
              display_name=excluded.display_name`)
              .bind(conversationId,phone,name,'wa:contact:'+phone),
            env.DB.prepare(`INSERT OR IGNORE INTO whatsapp_messages
              (id,conversation_id,direction,kind,body,provider_timestamp)
              VALUES(?,?,'inbound',?,?,?)`)
              .bind(providerId,conversationId,kind,body,providerTimestamp),
            env.DB.prepare(`UPDATE whatsapp_conversations SET
              last_message_at=CURRENT_TIMESTAMP,
              unread_count=(SELECT COUNT(*) FROM whatsapp_messages
                WHERE conversation_id=? AND direction='inbound')
              WHERE id=?`)
              .bind(conversationId,conversationId)
          ]);
        }
      }
    }
    return textResponse('EVENT_RECEIVED',200);
  }catch(error){
    console.error('WhatsApp webhook persistence error',String(error).slice(0,180));
    return textResponse('Temporary failure',503);
  }
}
export async function whatsappAdminApi(request,env,path){
  if(!env.DB)return json({ok:false,error:'Database not configured'},503);
  if(request.method==='GET'&&path==='/api/admin/whatsapp/status'){
    const connected=Boolean(env.WA_APP_SECRET&&env.WA_VERIFY_TOKEN&&env.WA_PHONE_NUMBER_ID);
    try{
      const row=await env.DB.prepare('SELECT COUNT(*) AS n FROM whatsapp_conversations').first();
      return json({ok:true,webhookConfigured:connected,conversationCount:row?.n||0,
        outboundConfigured:false,automaticReplies:false,
        assistantMode:'staff_reviewed_rules'});
    }catch{
      return json({ok:false,error:'WhatsApp tables not initialized'},503);
    }
  }
  if(request.method==='GET'&&path==='/api/admin/whatsapp/conversations'){
    const {results}=await env.DB.prepare(`SELECT c.id,c.phone,c.display_name,c.lead_id,
      c.last_message_at,c.unread_count,
      (SELECT body FROM whatsapp_messages m WHERE m.conversation_id=c.id
        ORDER BY m.created_at DESC,m.rowid DESC LIMIT 1) AS preview
      FROM whatsapp_conversations c ORDER BY c.last_message_at DESC LIMIT 100`).all();
    return json({ok:true,conversations:results});
  }
  if(request.method==='GET'&&path==='/api/admin/whatsapp/messages'){
    const id=safe(new URL(request.url).searchParams.get('conversation'),80);
    if(!id.startsWith('wa:')||id.length<11)return json({ok:false,error:'Invalid conversation'},422);
    const {results}=await env.DB.prepare(`SELECT id,direction,kind,body,created_at
      FROM whatsapp_messages WHERE conversation_id=? ORDER BY created_at DESC,rowid DESC LIMIT 100`).bind(id).all();
    return json({ok:true,messages:results.reverse()});
  }
  if(request.method==='GET'&&path==='/api/admin/whatsapp/reply-draft'){
    const id=safe(new URL(request.url).searchParams.get('conversation'),80);
    const record=await env.DB.prepare(`SELECT c.display_name,
      (SELECT body FROM whatsapp_messages WHERE conversation_id=c.id
       AND direction='inbound' ORDER BY created_at DESC,rowid DESC LIMIT 1) AS last_message
       FROM whatsapp_conversations c WHERE c.id=?`).bind(id).first();
    if(!record)return json({ok:false,error:'Conversation not found'},404);
    const product=await env.DB.prepare("SELECT is_verified,on_hand,allocated,price_pkr,restock_note FROM products WHERE sku='AN-HAIR-OIL-100'").first();
    const available=product?.is_verified?product.on_hand-product.allocated:null;
    const message=String(record.last_message||'').toLowerCase();
    const first=record.display_name && record.display_name!=='WhatsApp customer' ? 'Hello '+record.display_name+', ' : 'Hello, ';
    let draft='';
    let kind='general';
    if(/stock|available|restock|order|buy|purchase/.test(message)){
      kind='availability';
      draft=available===null?'our team is checking the latest stock availability. We will confirm before accepting your order.'
        :available>0?'our Hair Repair & Revive Growth Oil 100 ml is currently listed as available. Please share your quantity and city so our team can confirm your order.'
        :'the hair oil is currently out of stock. We can record your restock enquiry, but we cannot promise an exact restock date yet.';
    }else if(/price|cost|rate|pkr|rs\b/.test(message)){
      kind='price';
      draft='the listed price for Hair Repair & Revive Growth Oil 100 ml is Rs. '+(product?.price_pkr??1499)+'. Delivery is usually free within Pakistan; our team will confirm your final order details.';
    }else if(/how|use|apply|massage|routine/.test(message)){
      kind='usage';
      draft='for the hair-care ritual, dispense a small amount, apply it to your scalp and hair, massage gently, and wash thoroughly afterward. You can follow the six steps on our website.';
    }else{
      draft='thank you for messaging Authentic Naturals. Could you share your question or the product details you need? Our team will review and respond.';
    }
    return json({ok:true,draft:first+draft,kind,generatedBy:'approved_rules',sent:false,
      notice:'Staff must review and send this message manually. No AI provider or automated WhatsApp sending is connected.'});
  }
  return json({ok:false,error:'Not found'},404);
}
