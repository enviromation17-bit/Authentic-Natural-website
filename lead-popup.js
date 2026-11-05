'use strict';
/* Client-side WhatsApp enquiry handoff. No silent data collection or storage. */
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
  // The footer has its own contact action: hide the floating launcher in that area.
  const footer = document.querySelector('.site-footer.footer-redesigned');
  if (footer && 'IntersectionObserver' in window) {
    const footerObserver = new IntersectionObserver(entries => {
      const visible = entries.some(entry => entry.isIntersecting);
      openButton.classList.toggle('lead-launcher-hidden', visible);
      openButton.setAttribute('aria-hidden', visible ? 'true' : 'false');
      openButton.tabIndex = visible ? -1 : 0;
    }, {threshold:0,rootMargin:'0px 0px 0px 0px'});
    footerObserver.observe(footer);
  }
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
    const tab = window.open(url, '_blank');
    if (tab) tab.opener = null;
    else window.location.assign(url);
    close();
  });
})();
