# Authentic Naturals: connect existing Worker directly to existing Google Sheet

**No new Apps Script project and no changes to the private dashboard are needed.** The storefront continues to POST to `/api/leads`; the existing Cloudflare Worker authenticates directly to Google Sheets API.

## Changed code (committed, not guaranteed deployed)
- `cloudflare/worker.js` — validates same-origin, JSON and consent, then calls Google Sheets helper.
- `cloudflare/google-sheets.js` — Google OAuth service-account JWT, header validation, read-based duplicate checks and append into existing Leads / Orders tabs.
- Website HTML, form layout, dashboard HTML and dashboard `Code.gs` unchanged.

## Account owner setup
1. Open [Google Cloud console](https://console.cloud.google.com/) with `arh2k26@gmail.com`. Create or select a Cloud project.
2. APIs & Services > Library > **Google Sheets API** > Enable.
3. IAM & Admin > Service Accounts > Create Service Account named `authentic-naturals-crm`. No broad Google Cloud project role is needed to write a Sheet shared with that account.
4. Select the service account, Keys > Add Key > Create new key > JSON (if organization policy permits it). Keep downloaded JSON private and never commit to GitHub.
5. Open the existing Google Sheet `1zVjFnQx8CcKmYQ38Y76G8Tyg9j7yC38QrneQw3lNfyo` > Share > add that service account's email as **Editor** (share the file, not the entire Google Drive).
6. Cloudflare dashboard > Workers & Pages > `authentic-natural-website` > Settings > Variables and Secrets:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` = the JSON `client_email`.
   - `GOOGLE_PRIVATE_KEY` = the JSON `private_key` including BEGIN/END PRIVATE KEY markers, stored as a Worker **Secret**. The helper accepts either actual newlines or escaped `\\n`.
7. Make a staging Worker deployment from the current GitHub `main`, then test a consented test enquiry and test checkout. Confirm that the Sheet tabs `Leads` and `Orders` have the exact first-row headers in `cloudflare/google-sheets.js`. The dashboard reads those same tabs automatically.
8. Confirm that a WhatsApp enquiry creates one Leads row and a checkout creates one Leads row **plus** one Pending Orders row. Check that duplicated request IDs are not duplicated under sequential retries. Do not treat the checkout as a paid or confirmed order.
9. Confirm error handling when credentials are absent and when the target file is inaccessible. Review Worker logs without customer data or secrets.
10. Enable a Cloudflare WAF rate-limit rule for `POST /api/leads` to prevent spreadsheet spam or quota exhaustion before production rollout. The read-based duplicate check is not atomic under simultaneous requests; add a stronger idempotency store if the system sees parallel submissions.

## Notes
- Secure Google-account login remains part of the existing private Apps Script dashboard.
- No Google Apps Script web app is called by the Worker in this implementation. `CRM_SCRIPT_URL` and `CRM_SHARED_SECRET` are not used for the new intake.
- The service account has the Google Sheets scope but its file access is limited by what you share to its email address.
- Service account JSON keys are sensitive; rotate and revoke them if exposed. Google recommends keyless federation where practical.
- Keep the WebsiteIntake.gs file only as historical reference; do not deploy it for this direct API method.
- The integration is *source committed*, not verified live. Until secrets, service account sharing and deployment are complete, website enquiries may still fail to save.
