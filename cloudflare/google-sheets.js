/**
 * Authentic Naturals — Google Sheets API direct intake.
 * Only called by existing Cloudflare Worker; no client-side credentials.
 * Required Worker secrets:
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL
 *   GOOGLE_PRIVATE_KEY (PEM, as downloaded from Google Cloud)
 * No additional Google Apps Script project is needed.
 */
const SHEET_ID = '1zVjFnQx8CcKmYQ38Y76G8Tyg9j7yC38QrneQw3lNfyo';
const SKU = 'AN-HAIR-OIL-100', PRICE_PKR = 1499;
const HEADERS = {
  Leads: ['Lead ID','Created At','Customer Name','Phone','City','Source','Product SKU','Quantity','Message','Status','Consent','Notes'],
  Orders: ['Order ID','Created At','Lead ID','Customer Name','Phone','Product SKU','Quantity','Unit Price (PKR)','Total (PKR)','Order Status','Payment Status','Delivery City','Notes']
};
let cachedToken = null, cachedUntil = 0;
const utf8 = new TextEncoder();
const base64Url = bytes => btoa(String.fromCharCode(...bytes)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
function keyBytes(pem) {
  const body = String(pem||'').replace(/\\n/g,'\n').replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g,'');
  if(!/^[a-zA-Z0-9+/=]+$/.test(body)||body.length<100)throw new Error('Invalid signing key');
  return Uint8Array.from(atob(body),c=>c.charCodeAt(0));
}
async function googleToken(env) {
  if (cachedToken && Date.now() < cachedUntil) return cachedToken;
  const email=String(env.GOOGLE_SERVICE_ACCOUNT_EMAIL||'');
  if(!/^[^\s@]+@[^\s@]+\.iam\.gserviceaccount\.com$/.test(email)||!env.GOOGLE_PRIVATE_KEY)
    throw new Error('Service account credentials not configured');
  const key=await crypto.subtle.importKey('pkcs8',keyBytes(env.GOOGLE_PRIVATE_KEY),
    {name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);
  const now=Math.floor(Date.now()/1000);
  const header=base64Url(utf8.encode(JSON.stringify({alg:'RS256',typ:'JWT'})));
  const claim=base64Url(utf8.encode(JSON.stringify({
    iss:email,scope:'https://www.googleapis.com/auth/spreadsheets',
    aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3500
  })));
  const message=header+'.'+claim;
  const signature=base64Url(new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,utf8.encode(message))));
  const body=new URLSearchParams({
    grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion:message+'.'+signature
  });
  const response=await fetch('https://oauth2.googleapis.com/token',{
    method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:body.toString()
  });
  if(!response.ok)throw new Error('Google service account token request failed ('+response.status+')');
  const token=await response.json();
  if(!token.access_token)throw new Error('Google did not return an access token');
  cachedToken=token.access_token;
  cachedUntil=Date.now()+Math.max(0,(Number(token.expires_in)||3600)-120)*1000;
  return cachedToken;
}
async function sheetsRequest(env,method,tab,range,body,append=false) {
  const token=await googleToken(env);
  const address='https://sheets.googleapis.com/v4/spreadsheets/'+SHEET_ID+'/values/'+
    encodeURIComponent("'"+tab+"'!"+range)+
    (append?':append?valueInputOption=RAW&insertDataOption=INSERT_ROWS':'');
  const response=await fetch(address,{
    method,headers:{Authorization:'Bearer '+token,...(body?{'content-type':'application/json'}:{})},
    ...(body?{body:JSON.stringify(body)}:{})
  });
  if(!response.ok){
    // Never log response bodies: they may contain customer information.
    throw new Error('Google Sheets '+method+' '+tab+' failed ('+response.status+')');
  }
  return response.json();
}
const norm = (s,max=1200) => String(s==null?'':s).trim().slice(0,max);
async function hasId(env,tab,id) {
  const result=await sheetsRequest(env,'GET',tab,'A2:A50000');
  return (result.values||[]).some(row=>row[0]===id);
}
async function verifyHeaders(env,tab) {
  const found=await sheetsRequest(env,'GET',tab,'A1:'+ (tab==='Leads'?'L1':'M1'));
  const row=found.values?.[0]||[];
  if(row.join('|')!==HEADERS[tab].join('|'))throw new Error('Unexpected '+tab+' sheet headers');
}
async function appendRow(env,tab,values) {
  return sheetsRequest(env,'POST',tab,'A1:'+(tab==='Leads'?'L':'M'),{
    majorDimension:'ROWS',values:[values]
  },true);
}
export async function saveWebsiteLead(env,input) {
  if(!env.GOOGLE_SERVICE_ACCOUNT_EMAIL||!env.GOOGLE_PRIVATE_KEY)
    throw new Error('Google Sheets service account is not configured');
  const source=norm(input.source,20);
  if(!['enquiry','order'].includes(source))throw new Error('Invalid lead source');
  const name=norm(input.name,100),phone=norm(input.phone,40),
    city=norm(input.city,100),address=norm(input.address,400),
    payment=norm(input.payment,40),message=norm(input.notes,1200);
  const quantity=Number(input.quantity);
  if(name.length<2||phone.length<7||message.length<3||!Number.isInteger(quantity)||quantity<1||quantity>20)
    throw new Error('Name, phone, message and valid quantity are required');
  if(source==='order'&&(!city||!address))throw new Error('City and delivery address required');
  if(input.consent!==true)throw new Error('Customer consent required');

  const requestId=norm(input.idempotencyKey,100);
  if(!/^[a-zA-Z0-9_-]{8,100}$/.test(requestId))throw new Error('Invalid request ID');
  const leadId='W-'+requestId,orderId='WO-'+requestId;
  await verifyHeaders(env,'Leads');
  if(source==='order')await verifyHeaders(env,'Orders');
  const duplicate=await hasId(env,'Leads',leadId);
  if(!duplicate) {
    await appendRow(env,'Leads',[
      leadId,new Date().toISOString(),name,phone,city,
      source==='order'?'website_order':'website_enquiry',SKU,quantity,
      message,'New','Yes',(source==='order'?'Order request, not confirmed':'WhatsApp enquiry')+
      ' | Marketing opt-in: '+(input.marketingConsent===true?'Yes':'No')
    ]);
  }
  if(source==='order' && !await hasId(env,'Orders',orderId)) {
    await appendRow(env,'Orders',[
      orderId,new Date().toISOString(),leadId,name,phone,SKU,quantity,
      PRICE_PKR,quantity*PRICE_PKR,'Pending','Unpaid',city,
      'Address: '+address+' | Payment method: '+payment+' | '+message
    ]);
  }
  return {id:leadId,orderId:source==='order'?orderId:null,duplicate};
}
