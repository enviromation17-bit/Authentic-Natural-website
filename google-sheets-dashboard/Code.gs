/** Authentic Naturals CRM Dashboard — separate Apps Script project.
 * Deploy Web app: Execute as USER ACCESSING, access ANYONE WITH GOOGLE ACCOUNT.
 * Script Property ADMIN_EMAILS: comma-separated approved Google emails (required).
 * Share spreadsheet with approved operators as editors. No anonymous access.
 */
// Actual production spreadsheet provided by the owner. Script Property may override it.
const DEFAULT_CRM_SPREADSHEET_ID = '1zVjFnQx8CcKmYQ38Y76G8Tyg9j7yC38QrneQw3lNfyo';
const DEFAULT_ADMIN_EMAILS = ['arh2k26@gmail.com'];
function crmSpreadsheetId_() {
  const id = (PropertiesService.getScriptProperties().getProperty('CRM_SPREADSHEET_ID') || DEFAULT_CRM_SPREADSHEET_ID).trim();
  if (!/^[A-Za-z0-9_-]{25,}$/.test(id)) throw new Error('CRM_SPREADSHEET_ID is missing or invalid');
  return id;
}
const HEADERS = {
  Leads: ['Lead ID','Created At','Customer Name','Phone','City','Source','Product SKU','Quantity','Message','Status','Consent','Notes'],
  Orders: ['Order ID','Created At','Lead ID','Customer Name','Phone','Product SKU','Quantity','Unit Price (PKR)','Total (PKR)','Order Status','Payment Status','Delivery City','Notes'],
  Inventory: ['SKU','Product','Unit Price (PKR)','Stock On Hand','Reserved','Available','Verified','Last Updated'],
  WhatsApp: ['Message ID','Received At','Customer Name','Phone','Direction','Message','Status','Lead ID']
};
const ENUMS = {
  Leads: {9:['New','Contacted','Qualified','Won','Lost']},
  Orders: {9:['Pending','Confirmed','Cancelled','Fulfilled'],10:['Unpaid','Paid','Refunded']},
  Inventory: {6:['Yes','No']},
  WhatsApp: {4:['Inbound','Outbound'],6:['New','Replied','Closed']}
};
function currentAdmin_() {
  const configured = PropertiesService.getScriptProperties().getProperty('ADMIN_EMAILS');
  const allow = (configured == null ? DEFAULT_ADMIN_EMAILS.join(',') : configured)
    .split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
  const email = (Session.getActiveUser().getEmail() || '').trim().toLowerCase();
  // Fail closed if Google doesn't reveal the identity or no allowlist exists.
  if (!allow.length || !email || allow.indexOf(email) === -1) throw new Error('Access denied. Sign in with an approved Google account.');
  return email;
}
function doGet() {
  try { currentAdmin_(); }
  catch (e) { return HtmlService.createHtmlOutput('<main style="font:16px system-ui;padding:40px;max-width:540px"><h2>Authentic Naturals · Access denied</h2><p>Sign in with an approved Google account. Ask the owner to check ADMIN_EMAILS and spreadsheet sharing.</p></main>').setTitle('CRM · Access denied'); }
  return HtmlService.createHtmlOutputFromFile('Index').setTitle('Authentic Naturals CRM')
    .addMetaTag('viewport','width=device-width, initial-scale=1');
}
function sheet_(tab) {
  if (!HEADERS[tab]) throw new Error('Invalid CRM tab');
  const sh=SpreadsheetApp.openById(crmSpreadsheetId_()).getSheetByName(tab);
  if (!sh) throw new Error('Missing tab: '+tab);
  const header=sh.getRange(1,1,1,HEADERS[tab].length).getDisplayValues()[0];
  if (header.join('|') !== HEADERS[tab].join('|')) throw new Error('Unexpected columns in '+tab+'; refusing to write');
  return sh;
}
function readTab_(tab) {
  const sh=sheet_(tab), last=sh.getLastRow(), width=HEADERS[tab].length;
  if(last<=1) return [];
  return sh.getRange(2,1,Math.min(last-1,2000),width).getDisplayValues().filter(r=>String(r[0]).trim());
}
function dashboardData() {
  const email=currentAdmin_();
  const leads=readTab_('Leads'),orders=readTab_('Orders'),inventory=readTab_('Inventory'),wa=readTab_('WhatsApp');
  return {email,sheetUrl:'https://docs.google.com/spreadsheets/d/'+crmSpreadsheetId_()+'/edit',leads,orders,inventory,whatsapp:wa,stats:{
    leads:leads.length,newLeads:leads.filter(r=>r[9]==='New').length,
    pending:orders.filter(r=>r[9]==='Pending').length,orders:orders.length,
    sales:orders.filter(r=>r[9]==='Fulfilled'&&r[10]==='Paid').reduce((s,r)=>s+(Number(String(r[8]).replace(/,/g,''))||0),0),
    lowStock:inventory.filter(r=>r[0]&&r[6]==='Yes'&&Number(r[5])<5).length,
    messages:wa.length
  }};
}
function clean_(value,max) {
  const s=String(value==null?'':value).trim().slice(0,max);
  return /^[=+@\-\t\r]/.test(s) ? "'"+s : s;
}
function integer_(value,min,max,label) {
  const n=Number(value);
  if (!Number.isSafeInteger(n)||n<min||n>max) throw new Error('Invalid '+label);
  return n;
}
function enum_(value,options,label) {
  const v=String(value||'');if(options.indexOf(v)===-1)throw new Error('Invalid '+label);return v;
}
function locked_(fn) {
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(12000)) throw new Error('CRM is busy; retry.');
  try{return fn();}finally{lock.releaseLock();}
}
function writeLead(input) {
  const email=currentAdmin_();
  return locked_(()=>{
    const name=clean_(input.name,100),message=clean_(input.message,1500);
    if(name.length<2||message.length<3)throw new Error('Name and message required');
    const id='L-'+Utilities.getUuid().slice(0,12);
    const sh=sheet_('Leads');
    sh.appendRow([id,new Date(),name,clean_(input.phone,40),clean_(input.city,100),'manual',clean_(input.sku,80),integer_(input.quantity||1,1,20,'quantity'),message,'New',input.consent===true?'Yes':'No',clean_(input.notes,500)]);
    return {ok:true,id,actor:email};
  });
}
function createOrder(input) {
  currentAdmin_();
  return locked_(()=>{
    const name=clean_(input.name,100),phone=clean_(input.phone,40),sku=clean_(input.sku,80);
    if(name.length<2||!phone||!sku) throw new Error('Customer, phone and SKU required');
    const quantity=integer_(input.quantity,1,100,'quantity'),unit=integer_(input.unitPrice,0,100000000,'price');
    const sh=sheet_('Orders');const next=sh.getLastRow()+1;
    const id='O-'+Utilities.getUuid().slice(0,12);
    sh.appendRow([id,new Date(),clean_(input.leadId,100),name,phone,sku,quantity,unit,quantity*unit,'Pending','Unpaid',clean_(input.city,100),clean_(input.notes,500)]);
    // Order creation never reserves inventory; human must reconcile stock separately.
    return {ok:true,id,row:next};
  });
}
function addMessage(input) {
  currentAdmin_();
  return locked_(()=>{
    const phone=clean_(input.phone,40),body=clean_(input.message,2000);
    if(!phone||!body) throw new Error('Phone and message required');
    const id='M-'+Utilities.getUuid().slice(0,12);
    sheet_('WhatsApp').appendRow([id,new Date(),clean_(input.name,100),phone,enum_(input.direction||'Inbound',ENUMS.WhatsApp[4],'direction'),body,'New',clean_(input.leadId,100)]);
    return {ok:true,id};
  });
}
function updateStatus(tab,id,field,value) {
  currentAdmin_();
  if (!['Leads','Orders','WhatsApp'].includes(tab)) throw new Error('Invalid tab');
  const column = tab==='Leads'&&field==='status'?9:tab==='Orders'&&field==='status'?9:tab==='Orders'&&field==='payment'?10:tab==='WhatsApp'&&field==='status'?6:-1;
  if(column<0)throw new Error('Invalid field');
  const next=enum_(value,ENUMS[tab][column],field);
  return locked_(()=>{
    const sh=sheet_(tab),last=sh.getLastRow();
    if(last<=1)throw new Error('Record not found');
    const ids=sh.getRange(2,1,last-1,1).getDisplayValues();
    const index=ids.findIndex(r=>r[0]===String(id));
    if(index<0)throw new Error('Record not found');
    // Status updates are bookkeeping only; they never automatically reserve or deduct stock.
    sh.getRange(index+2,column+1).setValue(next);
    return {ok:true};
  });
}
function updateStock(sku,stock,reserved,verified) {
  currentAdmin_();
  return locked_(()=>{
    stock=integer_(stock,0,1000000,'stock');reserved=integer_(reserved,0,stock,'reserved');
    verified=enum_(verified,['Yes','No'],'verified');
    const sh=sheet_('Inventory'),last=sh.getLastRow();
    const ids=last>1?sh.getRange(2,1,last-1,1).getDisplayValues():[];
    const index=ids.findIndex(r=>r[0]===String(sku));
    if(index<0)throw new Error('Product not found');
    const row=index+2;
    sh.getRange(row,4,1,2).setValues([[stock,reserved]]);
    sh.getRange(row,6).setFormula('=MAX(0,D'+row+'-E'+row+')');
    sh.getRange(row,7,1,2).setValues([[verified,new Date()]]);
    return {ok:true};
  });
}

/**
 * Run ONLY from the Apps Script editor while signed into the intended admin
 * Google account. This does not bypass the web-app authorization.
 * View > Execution log for the result. Never publish logs publicly.
 */
function diagnoseAdminAccess() {
  const props = PropertiesService.getScriptProperties();
  const actualEmail = String(Session.getActiveUser().getEmail() || '').trim().toLowerCase();
  const configuredEmails = props.getProperty('ADMIN_EMAILS');
  const approved = (configuredEmails == null ? DEFAULT_ADMIN_EMAILS.join(',') : configuredEmails)
    .split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
  const report = {
    emailAvailable: !!actualEmail,
    activeEmail: actualEmail || '[Google did not supply the email]',
    emailAllowlisted: !!actualEmail && approved.includes(actualEmail),
    configuredEmailListOverridesDefault: configuredEmails != null,
    configuredSheetOverridesDefault: props.getProperty('CRM_SPREADSHEET_ID') != null,
    spreadsheetIdValid: false,
    spreadsheetAccessible: false,
    requiredTabsAvailable: false,
    note: 'Editor identity is not definitive proof of the deployed web-app identity; test /exec separately.'
  };
  try {
    const spreadsheetId = crmSpreadsheetId_();
    report.spreadsheetIdValid = true;
    const ss = SpreadsheetApp.openById(spreadsheetId);
    report.spreadsheetAccessible = true;
    report.requiredTabsAvailable = Object.keys(HEADERS).every(name => !!ss.getSheetByName(name));
  } catch (err) {
    report.sheetCheckError = String(err.message || err).slice(0, 180);
  }
  console.log(JSON.stringify(report, null, 2));
  return report;
}
