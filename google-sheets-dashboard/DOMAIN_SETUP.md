# Authentic Naturals CRM subdomain (temporary redirect)

## Goal
Allow visiting `https://crm.anaturalsintl.com` to open the existing Google Apps Script dashboard.

This is a **redirect, not custom-domain hosting**. After navigation the URL becomes the Google Apps Script URL. Authentication remains with Google and the allowlist configured in the dashboard Apps Script.

## Deployment
1. Cloudflare dashboard > Workers & Pages > Create Worker, name it `authentic-naturals-crm-entry`.
2. Deploy the exact contents of `crm-redirect.js` (this is a standalone Worker; do **not** replace `authentic-natural-website`).
3. Open that Worker's Settings > Domains & Routes > Add custom domain and enter `crm.anaturalsintl.com`.
4. Ensure the domain `anaturalsintl.com` is in the Cloudflare account and DNS is correctly delegated to Cloudflare. If the subdomain already has conflicting DNS or routes, review before changing them.
5. Test `https://crm.anaturalsintl.com` in a private browser: it should redirect to the Google login/dashboard. Test with both approved and unapproved Google accounts.
6. Do not pass secrets in redirect URLs. No API tokens or Sheets data are stored in this Worker.

## Security
- The redirect does not authenticate users, hide or secure Apps Script, or keep the branded URL in the address bar.
- Authentication is enforced by Apps Script; verify the dashboard deployment executes as the accessing user, requires sign-in, and denies emails not on its allowlist.
- Never deploy a public 'execute as me' dashboard relying on client-side email checking.
- Existing storefront Worker, D1 and website routes remain untouched.

For a dashboard that stays entirely under `crm.anaturalsintl.com`, build a separately hosted app with a server-side identity provider and protected Google Sheets API. A blind reverse proxy to Google Apps Script is not a safe replacement.
