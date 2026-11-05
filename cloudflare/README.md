# Authentic Naturals — Cloudflare inventory and CRM (implementation status)

This repository now has an **implemented but not yet activated** Cloudflare Workers + D1 backend.

## Current deployment boundary (important)
- Storefront: static assets from `dist/` via Cloudflare Workers.
- Server handler: `cloudflare/worker.js`, providing `GET /api/stock`, `POST /api/leads.php`, private `/admin/`, and `/api/admin/*`.
- Dashboard: `cloudflare/admin-page.js`, rendered ONLY after verifying a signed Cloudflare Access JWT, audience, issuer, and an approved staff email.
- Database schema and atomic inventory triggers: `cloudflare/schema.sql`.
- The D1 database ID and binding **have not been added** because the owner's Cloudflare D1 instance does not yet exist in this workspace.
- No admin login has been configured in Cloudflare Zero Trust; it is intentionally denied until Access credentials are configured.
- As long as D1 is absent, the public website shows **availability unverified**, not fabricated quantities.
- WhatsApp currently uses clickable `wa.me` links; it does not receive inbound messages, send replies, or automatically log direct WhatsApp conversations.

## Step 1 — Create the database
1. Cloudflare dashboard → **Storage & databases → D1 SQL Database → Create database**.
2. Choose `authentic-naturals-crm`, Free plan.
3. Copy the database ID (UUID) from its Overview, **not a secret**.
4. Add a D1 binding to the project's `wrangler.jsonc`, using the REAL ID:
   ```json
   "d1_databases": [
     {
       "binding": "DB",
       "database_name": "authentic-naturals-crm",
       "database_id": "REPLACE_WITH_REAL_D1_DATABASE_ID"
     }
   ]
   ```
   **Do not deploy this placeholder.** Create the actual D1 binding first.
5. Use Wrangler or Cloudflare SQL console to apply `cloudflare/schema.sql` on the production D1 database. CLI example (using authenticated Wrangler):
   `npx wrangler d1 execute authentic-naturals-crm --remote --file=cloudflare/schema.sql`
6. Verify `products`, `leads`, and `inventory_movements` tables exist and that the seeded product `AN-HAIR-OIL-100` has `is_verified=0`.
7. Deploy/redeploy the Worker from GitHub after DB binding and schema exist.

## Step 2 — Secure the dashboard using Cloudflare Access
1. Cloudflare Zero Trust → Access → Applications. Create a self-hosted application for `anaturalsintl.com/admin*`.
2. Allow only the actual owner's approved email address(es). Use email OTP or stronger supported authentication.
3. Identify the Access application AUD tag and team domain, such as `yourteam.cloudflareaccess.com`.
4. In the **authentic-natural-website** Worker → Settings → Variables and Secrets, configure:
   - `ACCESS_TEAM_DOMAIN`: exact team domain ending `.cloudflareaccess.com`.
   - `ACCESS_AUD`: exact Access application audience tag.
   - `ADMIN_EMAILS`: comma-separated approved staff email addresses.
   - `RATE_SECRET`: a private random 32+ byte secret, stored as a **Secret**. Generate locally; never share or commit it.
5. Worker verifies signed RS256 Access JWT, issuer, audience, and email on **every** private dashboard/API request. The public cannot obtain private data merely by guessing `/admin` or calling the admin API.
6. Test with an approved and an unapproved email. Check `/api/admin/leads` returns 403 without the Access token.
7. Protect Access login against account takeover: keep staff email accounts secured with MFA. Review and enable Cloudflare Access login logging.

## Step 3 — Verify stock and enquiries
1. Log into `https://anaturalsintl.com/admin/` with an approved email. Enter the **real physical stock quantity** (initially unverified; not assumed).
2. The public store shows:
   - *In stock* if verified available quantity > 0.
   - *Out of stock* and a restock/waitlist request if verified available quantity is 0.
   - *Availability unverified* if DB is missing, not configured, or owner has not entered stock.
3. Test order requests from the public site:
   - In-stock request = `pending_review`; does **not** reserve stock.
   - Out-of-stock request = `waitlist`; no promised restock date.
   - Staff confirmation = conditional database-triggered inventory allocation.
   - Confirmed → cancelled = allocation released.
   - Confirmed → fulfilled = physical stock decremented and allocation released.
4. Check staff list, lead status updates, and CSV export (avoid spreadsheet formula injection).
5. Run `bash cloudflare/test-inventory.sh` locally with SQLite, and check the GitHub Actions "Validate Cloudflare image build" run.
6. Back up/export D1 before migrations. Review consent/privacy notice, retention, deletion procedures and anti-spam abuse controls before real customer launch.

## WhatsApp, other channels, and AI assistant — roadmap
Current:
- Website enquiry/order forms can save **consented** leads through the Worker once D1 is active.
- WhatsApp click-to-chat works without paid API access.
- **Direct messages received on WhatsApp, Instagram or TikTok are not automatically recorded** by this phase.

Next phase (only with explicit setup and provider authorization):
1. Use the **official WhatsApp Business Platform Cloud API** with an authorized business phone number, Meta app, webhook signature verification, and securely stored credentials.
2. Normalize webhook messages into the same `leads` table with channel and external-message ID (deduplicate by provider ID), subject to privacy rules.
3. Add a controlled reply assistant, starting with verified inventory, pricing, shipping, and ritual FAQs. Never claim confirmed stock, delivery dates or medical hair-growth outcomes without grounded data.
4. Require staff approval for payments, cancellations, refunds, sensitive questions, and actions involving customer information. Respect WhatsApp messaging windows, template approval and opt-in requirements.
5. Add Instagram/TikTok leads only via permitted provider APIs or manually, never through unauthorized scraping.
6. Optional open-source/AI model integration after backend reliability and cost controls are proven.

## Later migration to HostBreak
D1 uses SQLite; HostBreak PHP/MySQL files are preserved under `hostbreak/` but **not included in the Cloudflare public build**. Export D1 data to CSV/SQL, transform for MySQL, test migration and inventory reconciliation before switching the domain. Protect historical contact records and maintain export backups.

**Never put a real staff password, Meta access token, Cloudflare private token, database credential, or customer data into GitHub.**
