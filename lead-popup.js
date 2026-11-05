'use strict';
/* Client-side WhatsApp enquiry handoff. No silent data collection or storage. */
(function () {
  const openButton = document.getElementById('lead-popup-open');
  const dialog = document.getElementById('lead-popup');
  const closeButton = document.getElementById('lead-popup-close');
  const form = document.getElementById('lead-popup-form');
  if (!openButton || !dialog || !form || !closeButton) return;
  const WHATSAPP = '923248019501';
  const open = () => {
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
    openButton.focus({preventScroll:true});
  };
  openButton.addEventListener('click', function (event) {event.preventDefault();open();});
  closeButton.addEventListener('click', close);
  dialog.addEventListener('close', () => document.documentElement.classList.remove('lead-popup-visible'));
  dialog.addEventListener('click', event => {
    if (event.target === dialog) close();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const value = name => String(form.elements.namedItem(name)?.value || '').trim();
    const customer = value('lead_name').slice(0,80);
    const phone = value('lead_phone').slice(0,32);
    const city = value('lead_city').slice(0,80);
    const topic = value('lead_topic').slice(0,80);
    const enquiry = value('lead_message').slice(0,900);
    if (!customer || !enquiry) return;
    const message = [
      'Hello Authentic Naturals!',
      '',
      '*New website enquiry*',
      '*Name:* ' + customer,
      phone ? '*Phone:* ' + phone : '',
      city ? '*City:* ' + city : '',
      '*Interested in:* ' + topic,
      '*Question:* ' + enquiry,
      '',
      'Sent using the Authentic Naturals website.'
    ].filter(Boolean).join('\n');
    const url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(message);
    // Open synchronously in the form's user gesture; popup blockers may prevent a new tab.
    const tab = window.open(url, '_blank', 'noopener,noreferrer');
    if (!tab) window.location.href = url;
    close();
  });
})();
