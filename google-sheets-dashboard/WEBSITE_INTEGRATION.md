# Website → Google Sheets CRM → WhatsApp handoff

## Scope
The storefront has two consent-based forms:
- **WhatsApp enquiry**: Name, phone, city, topic, message → **Leads** tab.
- **Oil checkout / Continue on WhatsApp**: Name, phone, city, delivery address, payment method, quantity → **Leads + Orders** tabs.

The website opens the `wa.me` handoff after attempting to save. Users still must press **Send** inside WhatsApp; opening the link is not proof that a message was sent. A saved checkout request is **Pending**, not a confirmed purchase. No automatic inventory reduction occurs.

Only people who **actively submit** the form and agree to the order/enquiry data-use consent are saved. Anonymous visitors cannot be identified or messaged simply because they browse the website. Promotional opt-in is a separate, optional checkbox, recorded in Leads Notes. Never send unsolicited promotional WhatsApp messages or treat service consent as marketing consent.

## What has been committed
- `../app.js`: sends address/payment and clear confirmation wording.
- `../lead-popup.js`: requires a callback phone number and captures separate marketing opt-in.
- `../lead-capture.js`: calls **only same-origin /api/leads**, no direct Apps Script URL or duplicate backend submissions.
- `../index.html`: no stock-availability notices, includes voluntary consent fields.
- `../cloudflare/worker.js`: server-side Apps Script forwarding; no CRM secret in frontend; reports actual save success/failure; no D1 fallback for /api/leads.
- `WebsiteIntake.gs`: standalone public lead intake under the real CRM Google account, with deduplication and structured order rows.
- `Index.html` (dashboard): Leads → **WhatsApp reply** button opens manual customer-service chat.

## Setup — important (not deployed automatically)

1. In Google account `arh2k26@gmail.com`, open the **existing website intake** Apps Script project (the one previously deployed separately from your private CRM dashboard).
2. Replace the existing collection `Code.gs` content with **`WebsiteIntake.gs`**. **Do not** paste this into the private CRM dashboard Apps Script project; it has a different `doGet` and authorization model.
3. Set the intake script's Script Properties:
   - `CRM_SPREADSHEET_ID = 1zVjFnQx8CcKmYQ38Y76G8Tyg9j7yC38QrneQw3lNfyo`
   - `CRM_SHARED_SECRET =` a new strong, random 32+ byte token. Keep it private.
4. Deploy > Manage deployments > Edit > New version. Execute as **Me** (owner of Sheet), access **Anyone** because the Cloudflare Worker server calls it (it cannot present an interactive Google login). Authorization is performed with `CRM_SHARED_SECRET`. Do not publicize the endpoint or embed secret in website HTML.
5. In Cloudflare Worker **authentic-natural-website**, configure **encrypted secrets**:
   - `CRM_SCRIPT_URL =` the **website intake** Apps Script `/exec` URL, NOT the private dashboard URL.
   - `CRM_SHARED_SECRET =` exactly the same random token configured in the intake Apps Script.
6. Deploy Worker changes from the GitHub `main` branch with existing build/deploy procedure, then test on a staging URL before switching production traffic. Do not enable old D1 lead intake as an alternate destination.
7. Check the target Google Sheet contains `Leads` and `Orders` with exactly the headers defined in `WebsiteIntake.gs`. If not, stop and reconcile the column mapping before live submissions.
8. Submit one test enquiry and one test checkout from the actual website with consent. Confirm the records are created: enquiry in Leads, checkout in Leads **and** Orders. Verify quantities and delivery notes, and confirm exactly one row per request ID. Use a controlled test, then remove test rows only if safe.
9. Test invalid/missing consent and a simulated intake outage. Failed saves must be reported without claiming success. The WhatsApp handoff remains available for manual contact.
10. Check the client dashboard (private Apps Script) reads new records; new code is live only after you copy the updated dashboard Index.html and publish a new dashboard version.

## Operational cautions
- The source currently has a **fixed product and price**: `AN-HAIR-OIL-100`, PKR 1,499. Do not automatically claim inventory availability or sale confirmation from these entries.
- Google Sheets is not a high-volume CRM; set up limited retention, protect sharing permissions, avoid sharing data outside the business, and apply server-side rate limiting in Cloudflare.
- Shared secret is not a substitute for request throttling. Google Apps Script web apps cannot reliably provide custom HTTP error statuses; the Worker checks JSON `ok`.
- WhatsApp customer service follow-up is manual. Bulk/automated messaging requires the official Meta API and applicable opt-in/template rules.
- `stock-ui.js` is retained for compatibility, but HTML stock notices were removed. Inventory is managed privately in the CRM dashboard.
- This process does not identify people who haven't voluntarily submitted their data.
