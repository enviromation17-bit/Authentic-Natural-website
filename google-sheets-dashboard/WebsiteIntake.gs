/**
 * Authentic Naturals public WEBSITE intake (separate from the private CRM dashboard).
 * Paste into the EXISTING lead-capture Apps Script deployment, not the admin dashboard.
 *
 * Required Script Properties:
 *   CRM_SHARED_SECRET - same long random value as Cloudflare Worker secret
 *   CRM_SPREADSHEET_ID - spreadsheet owned by the actual CRM account
 *
 * Deploy Web App: Execute as me; Anyone. Never share the token with the browser.
 * Only call this endpoint from the Cloudflare Worker server-to-server proxy.
 */
const REQUIRED = {
  Leads:['Lead ID','Created At','Customer Name','Phone','City','Source','Product SKU','Quantity','Message','Status','Consent','Notes'],
  Orders:['Order ID','Created At','Lead ID','Customer Name','Phone','Product SKU','Quantity','Unit Price (PKR)','Total (PKR)','Order Status','Payment Status','Delivery City','Notes']
};
const PRODUCT_SKU='AN-HAIR-OIL-100', PRODUCT_PRICE=1499;

function crmReply_(payload){
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
function safeField_(v,max){
  const value=String(v===undefined||v===null?'':v).trim().slice(0,max);
  return /^[=+@\-\t\r]/.test(value)?"'"+value:value;
}
function store_(book,name){
  const s=book.getSheetByName(name);
  if(!s)throw new Error('Missing CRM sheet: '+name);
  const expected=REQUIRED[name];
  if(s.getRange(1,1,1,expected.length).getDisplayValues()[0].join('|')!==expected.join('|'))
    throw new Error('CRM columns do not match: '+name);
  return s;
}
function findId_(sheet,id){
  const n=sheet.getLastRow()-1;
  if(n<=0)return false;
  return !!sheet.getRange(2,1,n,1).createTextFinder(id).matchEntireCell(true).findNext();
}
function doPost(e){
  const prop=PropertiesService.getScriptProperties();
  const secret=prop.getProperty('CRM_SHARED_SECRET');
  const spreadsheetId=prop.getProperty('CRM_SPREADSHEET_ID');
  if(!secret||!spreadsheetId)return crmReply_({ok:false,error:'CRM not configured'});
  let input;
  try{input=JSON.parse(e.postData.contents);}catch(_){return crmReply_({ok:false,error:'Invalid request'});}
  if(!input||typeof input!=='object'||Array.isArray(input)||String(input.token||'')!==secret)
    return crmReply_({ok:false,error:'Unauthorized'});
  if(input.website)return crmReply_({ok:true,ignored:true});
  if(input.consent!==true)return crmReply_({ok:false,error:'Consent required'});
  const source=String(input.source||'');
  if(!['website_enquiry','website_order'].includes(source))
    return crmReply_({ok:false,error:'Invalid source'});
  const requestId=String(input.requestId||'').trim();
  if(!/^[A-Za-z0-9_-]{8,100}$/.test(requestId))return crmReply_({ok:false,error:'Invalid request ID'});
  const name=safeField_(input.name,100);
  const phone=safeField_(input.phone,40);
  const city=safeField_(input.city,100);
  const message=safeField_(input.message,1200);
  const address=safeField_(input.address,400);
  const payment=safeField_(input.payment,40);
  const quantity=Number(input.quantity);
  if(name.length<2||phone.length<7||message.length<3||!Number.isSafeInteger(quantity)||quantity<1||quantity>20)
    return crmReply_({ok:false,error:'Missing required contact details'});
  if(source==='website_order'&&(!city||!address))
    return crmReply_({ok:false,error:'City and delivery address required'});
  const leadId='W-'+requestId;
  const orderId='WO-'+requestId;
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(15000))return crmReply_({ok:false,error:'Busy, try again'});
  try{
    const book=SpreadsheetApp.openById(spreadsheetId);
    const leads=store_(book,'Leads');
    const orders=source==='website_order'?store_(book,'Orders'):null;
    let leadExists=findId_(leads,leadId);
    if(!leadExists){
      leads.appendRow([
        leadId,new Date(),name,phone,city,source,PRODUCT_SKU,quantity,
        message,'New','Yes',source==='website_order'?'Order request; not confirmed':'Website WhatsApp enquiry'
      ]);
    }
    if(orders&&!findId_(orders,orderId)){
      const notes=safeField_('Address: '+address+' | Payment method: '+payment+' | Request: '+message,1000);
      orders.appendRow([orderId,new Date(),leadId,name,phone,PRODUCT_SKU,quantity,PRODUCT_PRICE,
        quantity*PRODUCT_PRICE,'Pending','Unpaid',city,notes]);
    }
    return crmReply_({ok:true,id:leadId,orderId:orders?orderId:null,duplicate:leadExists});
  }catch(err){
    console.error('CRM intake failed',String(err).slice(0,160));
    return crmReply_({ok:false,error:'Unable to save enquiry'});
  }finally{lock.releaseLock();}
}
