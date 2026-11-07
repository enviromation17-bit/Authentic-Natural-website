'use strict';
/* Website enquiry and order capture using same-origin Cloudflare Worker /api/leads.
 * The Worker stores consented records in the private CRM D1 database.
 * No API credentials or customer records are stored in browser JavaScript.
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
      address: String(details.address || '').trim().slice(0, 400),
      marketingConsent: details.marketingConsent === true,
      quantity: Math.max(1, Math.min(20, Number(details.quantity) || 1)),
      consent: true,
      website: '',
      idempotencyKey: details.idempotencyKey || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()))
    };

    if (payload.name.length < 2 || payload.notes.length < 3) {
      return { saved: false, reason: 'invalid' };
    }

    // One official destination avoids split lead records and accidental duplicates.
    return await postOnce('/api/leads',payload);
  }
};

async function postOnce(url, payload) {
  const abort = new AbortController();
  const timeout = setTimeout(function () { abort.abort(); }, 18000);
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
        orderId: data.order_id || null,
        destination: data.destination,
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
