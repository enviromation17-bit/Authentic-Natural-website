# Authentic Naturals — Storefront & Google Sheets CRM Repair Report (2026-11-06)

## Scope and protections
- No deletion of customer records, Google Sheets tabs, Worker bindings or secrets.
- Storefront layout restored from the last known complete branded version (`2dd7c0414ce3`), retaining latest checkout forms, explicit contact consent, optional WhatsApp marketing consent, and Google Sheets lead-capture script references.
- Full original footer, hero, ritual controls and modal markup restored.
- Removed public stock-verification notices as requested; internal stock remains in the private CRM dashboard.
- Fixed the floating WhatsApp launcher so it does not obstruct the footer.
- Improved the private CRM dashboard's right-side active navigation label; unrelated dashboard business logic remains in place.

## Source-level checks completed
- HTML includes 75 unique IDs, no duplicates.
- Required IDs used by storefront scripts were present.
- Syntactic parsing passed for the main storefront JavaScript, hero, ritual, product, lead forms, Worker backend, and Apps Script dashboard frontend/backend.
- Website lead intake is routed to the same-origin Worker endpoint `/api/leads` and the intended server-to-server Google Sheets Apps Script flow.

## Live browser inspection
- Desktop storefront visited publicly: header, branded footer, and empty shopping bag worked in the observed browser session.
- WhatsApp launcher was visible on the right without obvious footer overlap in the desktop inspection.
- Browser could not switch to a true 390px mobile viewport. **Real phone testing remains necessary.**
- The authenticated Google Apps Script dashboard could not be tested end-to-end through the GitHub connection because the app belongs to a different Google account. Its source parsed successfully.

## Deployment steps
1. Publish current GitHub `main` to the existing Cloudflare website; do not replace the Worker with a new app.
2. Hard refresh desktop/mobile (or use private browsing) to bypass cached assets.
3. In a real 390px mobile viewport verify navigation, footer, floating WhatsApp, the shopping bag form and its scroll.
4. Test enquiry and checkout **with a controlled consented test contact** after `CRM_SCRIPT_URL` and `CRM_SHARED_SECRET` are configured, and verify exactly one enquiry row per request plus one Orders row for checkout.
5. For the private CRM app, copy latest `google-sheets-dashboard/Code.gs` and `Index.html` into the correct Apps Script dashboard project (HTML file must be named `Index`). Save, **Deploy > Manage deployments > Edit > New version**, then test login and create/update/delete on a test lead. Do not paste `WebsiteIntake.gs` into the dashboard project.
6. Confirm website and dashboard changes in a staging deploy before pushing public production traffic.

Do not claim Google Sheets intake is live until tests on the actual Sheet have been completed. Submitting a WhatsApp URL only pre-fills a message; the visitor must press Send, and the order remains pending until a staff member confirms it.
