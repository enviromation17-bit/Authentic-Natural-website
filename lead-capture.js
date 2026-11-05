'use strict';
/* A safe, optional same-origin bridge for HostBreak PHP backend.
 * GitHub Pages remains storefront-only, and WhatsApp works without the backend.
 * The browser never receives DB credentials or staff access.
 */
window.ANLeadCapture = {
  async submit(details) {
    if (!details || details.consent !== true) return {saved:false,reason:'consent'};
    if (location.hostname.endsWith('.github.io') || location.protocol !== 'https:') {
      return {saved:false,reason:'not-configured'};
    }
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 2500);
    try {
      const res = await fetch('/api/leads.php',{
        method:'POST',
        headers:{'Content-Type':'application/json','X-Requested-With':'XMLHttpRequest'},
        credentials:'same-origin',cache:'no-store',
        body:JSON.stringify({...details,website:''}),
        signal:abort.signal
      });
      const data = await res.json().catch(()=>null);
      if (res.ok && data?.ok === true) return {saved:true,id:data.lead_id};
      return {saved:false,reason:data?.error || 'unavailable'};
    } catch (_) {
      return {saved:false,reason:'unavailable'};
    } finally {
      clearTimeout(timeout);
    }
  }
};
