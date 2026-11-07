# Single-password CRM + website lead capture (Cloudflare D1)

**Status: source code committed; NOT yet deployed or tested against your live D1.**

This implementation deliberately **does not use Google service-account secrets**. It stores new website leads in the existing Cloudflare D1 database. The private admin dashboard at `https://anaturalsintl.com/admin/` uses one username `owner` and a password you choose locally. Browser sessions persist for 14 days unless you sign out or change the password. Passwords are never kept in plaintext, logged, or put into the GitHub repository.

**Important:** This is a separate D1 dashboard. It does NOT automatically update the previously created Google Sheets CRM or Apps Script dashboard. Existing Google Sheets and Apps Script files remain untouched. If you want Google Sheets to show these new leads later, a separate export/sync step will be needed.

## Safe deployment plan

1. Verify the live D1 database `authentic-naturals-crm` still has existing `products` and `leads` tables. Run read-only:
   `SELECT name FROM sqlite_master WHERE type='table' AND name IN ('products','leads','inventory_movements');`
   Do not reapply the original schema blindly if tables already exist. Existing records must be preserved.
2. In the repository root, run `node scripts/setup-crm-password.mjs` using Node 20+. Enter a strong new password twice. Nothing appears while typing; this creates **.local/auth-owner.sql** with a salted PBKDF2 verifier, not your password.
3. Create ONLY login tables in your existing D1 using:
   `npx wrangler d1 execute authentic-naturals-crm --remote --file cloudflare/password-auth-schema.sql`
4. Apply the generated password verifier:
   `npx wrangler d1 execute authentic-naturals-crm --remote --file .local/auth-owner.sql`
   Alternatively open Cloudflare D1 Console and paste each SQL file's contents in order. Do not copy `.local/auth-owner.sql` to GitHub or share publicly.
5. Ensure `products` and `leads` tables exist. If they don't, stop: reconcile against the original `cloudflare/schema.sql` and confirm you are on the correct D1 database before any schema initialization.
6. Create a staging preview (not production) from GitHub `main`, run `npm ci` or `npm install`, `npm run build`, and deploy the existing Worker via `npx wrangler deploy` to the appropriate target when authorized. The Wrangler config is `wrangler.jsonc`; preserve the existing `DB` and `ASSETS` bindings.
7. Test `/admin/` without a cookie: you should see password sign-in. Sign in with **owner** and your local password. Check the Leads and inventory page and sign out. Invalid login attempts should be rate-limited.
8. Submit ONE consented test enquiry from the storefront using your own test data. Check that the lead appears under `/admin/`; retrying the exact same idempotency key should not create another row. Then test an order request. Never use real customer data for staging tests.
9. Only after success, deploy to production. Set a Cloudflare WAF rate limit on `POST /api/leads` and `POST /api/admin/login`. Keep HTTPS enabled.
10. Consider backing up D1 before running migrations. Do not expose the `/admin/` route publicly without password setup.

## Files

- `cloudflare/password-auth-schema.sql`: adds auth/session/throttle tables; does not change leads or product tables.
- `scripts/setup-crm-password.mjs`: offline hidden password prompt, generates salted verifier SQL.
- `cloudflare/password-auth.js`: D1-backed login, 14-day HttpOnly Secure SameSite=Lax cookie, session validation and login throttling.
- `cloudflare/worker.js`: public website enquiries/orders go to existing D1 (no Google service account). Private dashboard uses the new password session.
- `cloudflare/admin-page.js`: existing inventory and lead-stage dashboard, now with Sign out.
- `lead-popup.js`, `lead-capture.js`, `app.js`: storefront submission interface unchanged.

## Security and operational limitations

- Secure hashing uses PBKDF2-SHA256, 310,000 iterations, per-user random salt; the database holds only the verifier.
- Store a long, unique password in a password manager. There is no password-recovery email; you can re-run the local generator and apply a new verifier SQL to reset it, which invalidates existing sessions.
- Public submissions require consent; promotional WhatsApp opt-in remains separate. The CRM does not send WhatsApp messages automatically.
- Enquiries require name, phone, and message. Checkout requires name, phone, city, and quantity. Website app.js puts delivery address/payment in the notes.
- The D1 rate check allows a maximum of six lead submissions per IP hash per hour. This is a basic protection, not a replacement for Cloudflare WAF.
- CRM sessions are stored in D1; losing database contents invalidates sessions. Never expose the auth tables publicly.
- The previous Google service-account Worker secrets are no longer needed by this implementation; leave them unchanged until production is fully verified, then review their access and revoke unused keys.
- If the original D1 trigger schema is still missing or corrupted, some order status changes may fail; do not assume order stock transitions are safe until tested.
