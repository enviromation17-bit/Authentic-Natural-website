'use strict';
/* Client-side WhatsApp enquiry handoff + CRM save. */
(function () {
  const openButton = document.getElementById('lead-popup-open');
  const dialog = document.getElementById('lead-popup');
  const closeButton = document.getElementById('lead-popup-close');
  const form = document.getElementById('lead-popup-form');
  if (!openButton || !dialog || !form || !closeButton) return;
  const WHATSAPP = '923248019501';
  let lastTrigger = openButton;
  const open = (trigger = openButton) => {
    lastTrigger = trigger;
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    document.documentElement.classList.add('lead-popup-visible');
    const field = form.elements.namedItem('lead_name');
    if (field && typeof field.focus === 'function') field.focus();
  };
  const close = () => {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    document.documentElement.classList.remove('lead-popup-visible');
    if (lastTrigger && lastTrigger.isConnected) lastTrigger.focus({preventScroll:true});
  };
  openButton.addEventListener('click', function (event) {event.preventDefault();open(openButton);});
  document.querySelectorAll('[data-open-lead]').forEach(button => {
    button.addEventListener('click', function(event) {
      event.preventDefault();
      open(button);
    });
  });
  const footer = document.querySelector('.site-footer.footer-redesigned');
  if (footer && 'IntersectionObserver' in window) {
    const footerObserver = new IntersectionObserver(entries => {
      const visible = entries.some(entry => entry.isIntersecting);
      openButton.classList.toggle('lead-launcher-hidden', visible);
      openButton.setAttribute('aria-hidden', visible ? 'true' : 'false');
      openButton.tabIndex = visible ? -1 : 0;
    }, { threshold: 0.15 });
    footerObserver.observe(footer);
  }
  closeButton.addEventListener('click', function (event) { event.preventDefault(); close(); });
  dialog.addEventListener('cancel', function (event) { event.preventDefault(); close(); });

  // Route product WhatsApp buttons through the enquiry form so every lead is captured
  document.querySelectorAll('#direct-whatsapp, a.floating-whatsapp, a[href*="wa.me/923248019501"]').forEach(function (link) {
    if (link.closest('#lead-popup') || link.closest('#order-form') || link.closest('#cart-dialog')) return;
    link.addEventListener('click', function (event) {
      if (link.id === 'direct-whatsapp' || link.classList.contains('floating-whatsapp') || link.hasAttribute('data-open-lead')) {
        event.preventDefault();
        open(link);
      }
    });
  });

  const status = document.getElementById('lead-save-status');
  const formButton = form.querySelector('[type="submit"]');
  function showStatus(message, kind) {
    if(!status) return;
    status.textContent = message;
    status.dataset.result = kind || '';
    status.setAttribute('role','status');
    status.setAttribute('aria-live','polite');
  }
  function clearWhatsAppLink() {
    const old = document.getElementById('lead-whatsapp-ready');
    if(old) old.remove();
  }
  function offerWhatsApp(url) {
    clearWhatsAppLink();
    const link = document.createElement('a');
    link.id = 'lead-whatsapp-ready';
    link.className = 'lead-popup-send';
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Open WhatsApp ↗';
    link.style.cssText = 'display:inline-flex;margin-top:12px;align-items:center;justify-content:center;text-decoration:none;';
    if(status) status.insertAdjacentElement('afterend',link);
  }
  form.addEventListener('input',()=>{clearWhatsAppLink();});
  form.addEventListener('invalid', event => {
    const field = event.target;
    if(field && field.name === 'capture_consent'){
      showStatus('Please agree to share your enquiry details so we can save and respond.','invalid');
    } else {
      showStatus('Please fill out the required fields before continuing.','invalid');
    }
  },true);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const value = name => String(form.elements.namedItem(name)?.value || '').trim();
    const customer = value('lead_name').slice(0,80);
    const phone = value('lead_phone').slice(0,32);
    const city = value('lead_city').slice(0,80);
    const topic = value('lead_topic').slice(0,80);
    const enquiry = value('lead_message').slice(0,900);
    const agreed = Boolean(form.elements.namedItem('capture_consent')?.checked);
    if(!customer || !phone || !enquiry || !agreed){
      showStatus('Please complete the form and confirm consent.','invalid');
      return;
    }
    if (value('website')) {
      showStatus('Unable to submit. Please contact the team directly.','error');
      return;
    }
    const message = [
      'Hello Authentic Naturals!','','*New website enquiry*',
      '*Name:* ' + customer,'*Phone:* ' + phone,
      city ? '*City:* ' + city : '',
      '*Interested in:* ' + topic,
      '*Question:* ' + enquiry,'','Sent using the Authentic Naturals website.'
    ].filter(Boolean).join('\n');
    const url='https://wa.me/'+WHATSAPP+'?text='+encodeURIComponent(message);
    clearWhatsAppLink();
    if(formButton) formButton.disabled=true;
    showStatus('Saving your enquiry to the CRM…','saving');
    try {
      const response = window.ANLeadCapture
        ? await window.ANLeadCapture.submit({
            source:'enquiry',name:customer,phone,city,topic,notes:enquiry,
            quantity:1,consent:true,
            marketingConsent:Boolean(form.elements.namedItem('marketing_consent')?.checked)
          })
        : {saved:false,reason:'Form service unavailable'};
      if(response.saved) {
        showStatus('Your enquiry was saved. Open WhatsApp and press Send to contact our team.','success');
      }else{
        showStatus('We could not save your enquiry ('+(response.reason||'service unavailable')+'). You can still contact us on WhatsApp.','error');
      }
    }catch(error){
      console.error('Enquiry submission failed:',error);
      showStatus('Could not save your enquiry. Please use WhatsApp to contact our team.','error');
    }finally{
      if(formButton) formButton.disabled=false;
      offerWhatsApp(url);
    }
  });

})();
