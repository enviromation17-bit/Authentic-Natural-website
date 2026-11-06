'use strict';
/* Saves website enquiries and orders to the CRM before WhatsApp opens.
 * Tries Cloudflare /api/leads, then /api/leads.php (HostBreak).
 * Optional: meta[name="an-sheets-intake"] content="https://script.google.com/.../exec"
 */
window.ANLeadCapture = {
  async submit(details) {
    if (!details || details.consent !== true) return { saved: false, reason: 'consent' };
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      return { saved: false, reason: 'not-secure' };
    }

    const payload = {
      source: details.source === 'order' ? 'order' : 'enquiry',
      name: String(details.name || '').trim().slice(0, 100),
      phone: String(details.phone || '').trim().slice(0, 40),
      city: String(details.city || '').trim().slice(0, 100),
      topic: String(details.topic || 'Hair Repair & Revive Growth Oil').trim().slice(0, 100),
      notes: String(details.notes || '').trim().slice(0, 1200),
      payment: String(details.payment || '').trim().slice(0, 40),
      quantity: Math.max(1, Math.min(20, Number(details.quantity) || 1)),
      consent: true,
      website: '',
      idempotencyKey: details.idempotencyKey || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()))
    };

    if (payload.name.length < 2 || payload.notes.length < 3) {
      return { saved: false, reason: 'invalid' };
    }

    const endpoints = ['/api/leads', '/api/leads.php'];
    const sheetsMeta = document.querySelector('meta[name="an-sheets-intake"]');
    if (sheetsMeta && sheetsMeta.content) endpoints.push(sheetsMeta.content.trim());

    for (const url of endpoints) {
      const result = await postOnce(url, payload);
      if (result.saved) return result;
    }
    return { saved: false, reason: 'unavailable' };
  }
};

async function postOnce(url, payload) {
  const abort = new AbortController();
  const timeout = setTimeout(function () { abort.abort(); }, 4000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'same-origin',
      cache: 'no-store',
      body: JSON.stringify(payload),
      signal: abort.signal
    });
    const data = await res.json().catch(function () { return null; });
    if (res.ok && data && data.ok === true) {
      return {
        saved: true,
        id: data.lead_id || data.id,
        orderStatus: data.orderStatus,
        availability: data.availability
      };
    }
    return { saved: false, reason: (data && data.error) || 'unavailable' };
  } catch (_) {
    return { saved: false, reason: 'unavailable' };
  } finally {
    clearTimeout(timeout);
  }
}
