/**
 * Authentic Naturals CRM domain entrypoint.
 * Deploy as a SEPARATE Cloudflare Worker on crm.anaturalsintl.com.
 * Does not replace the website Worker or implement authentication.
 * Google Apps Script remains responsible for Google login and data access.
 */
const DESTINATION = "https://script.google.com/macros/s/AKfycbwpIXSAjOZq3pSznM9PlfbVmwcOg_NeQkDD2zg5dzaxDs66Pdun2ABilX0BB3pi_rIL/exec";
export default {
  async fetch(request) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    }
    return new Response(null, {
      status: 302,
      headers: {
        Location: DESTINATION,
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff"
      }
    });
  }
};
