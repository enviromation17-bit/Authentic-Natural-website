# Authentic Naturals — WhatsApp CRM and reply assistant

## Implementation scope
Source is implemented in GitHub, but **incoming WhatsApp messages are not live** until the owner finishes Meta and Cloudflare setup:
- **Official Meta WhatsApp Business Platform webhook:** `/api/webhooks/whatsapp`, handled by `cloudflare/whatsapp.js`.
- **Webhook GET verification:** exact `WA_VERIFY_TOKEN`; **POST authentication:** HMAC SHA-256 using the private `WA_APP_SECRET` and `x-hub-signature-256` header.
- **Phone-number restriction:** accepts only events matching `WA_PHONE_NUMBER_ID`.
- **D1 CRM inbox:** `whatsapp_conversations`, `whatsapp_messages` with deduplicated provider message IDs. New inbound conversations produce a `whatsapp_webhook` service lead; this **does not mean marketing consent**.
- **Dashboard:** authorized `/admin/` shows WhatsApp conversations, messages, integration status and suggestions.
- **Reply assistant (initial):** deterministic, stock-verified suggestion drafts for availability, price and usage; a human must review, copy and send manually.
- **No outbound API sends, WhatsApp chatbot auto-replies, AI model billing, or marketing automation** are enabled. No Meta keys are included in GitHub.

## 1. Cloudflare D1 binding and schema (owner has already created database)
Database: `authentic-naturals-crm`; database ID `7436d07e-be61-4bd5-8db0-219aae1de421`.

The repository `wrangler.jsonc` now contains the exact `DB` binding and database ID. **Do not recreate the database.**

Apply both SQL files, IN ORDER, to this EXISTING remote D1 database:
```bash
npx wrangler d1 execute authentic-naturals-crm --remote --file=cloudflare/schema.sql
npx wrangler d1 execute authentic-naturals-crm --remote --file=cloudflare/whatsapp-schema.sql
```
Both schemas use `CREATE TABLE IF NOT EXISTS` so they can be applied to this newly created empty D1. Verify using the actual Cloudflare D1 SQL console or authenticated Wrangler:
```bash
npx wrangler d1 execute authentic-naturals-crm --remote --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
npx wrangler d1 execute authentic-naturals-crm --remote --command="SELECT sku,title,on_hand,allocated,is_verified FROM products;"
```
Do not treat local Wrangler/SQLite tables as proof that the production D1 has been initialized.

Before deploying, confirm the worker's GitHub integration uses the repository's `main` branch, build command `npm run build` or `node scripts/build-cloudflare.mjs`, and deploy command `npx wrangler deploy`. The Cloudflare Worker script is `cloudflare/worker.js` and the static site is `dist/`.

## 2. Staff authentication (required before using customer data)
Set up a Cloudflare Zero Trust **Access self-hosted application** protecting `anaturalsintl.com/admin*` and configure its allow policy for specific approved business-owner email(s). Also protect `/api/admin/*` using the same Access application/policy or a second equivalent Access policy. Never rely on hiding a public dashboard URL.
- In the deployed Worker, set `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD` and `ADMIN_EMAILS` to the exact Access application details.
- The Worker independently verifies the JWT signature, audience, issuer and email allowlist on all admin endpoints.
- Enable MFA on the owner's email/login account.
- Verify `/api/admin/leads`, `/api/admin/whatsapp/conversations`, and `/admin/` reject anonymous requests.

Also create `RATE_SECRET` as a private Worker secret (32+ random bytes). The public lead intake is intentionally unavailable without it.

## 3. Meta WhatsApp Business Platform (must be an authorized business setup)
Create or connect an official Meta Developer app with the **WhatsApp** product, approved business phone/phone number ID and authorized WhatsApp Business Account. Follow Meta's current provider onboarding requirements.

Configure the Worker secrets (Settings → Variables & Secrets; secret values never go in GitHub, screenshot, or chat):
- `WA_VERIFY_TOKEN`: owner-generated long random string used for webhook subscription verification (secret).
- `WA_APP_SECRET`: the **Meta app secret** from the Meta developer console (secret).
- `WA_PHONE_NUMBER_ID`: the exact authorized business phone number ID (not the visible phone number).

Set Meta WhatsApp webhook callback URL:
`https://anaturalsintl.com/api/webhooks/whatsapp`

Enter the exact `WA_VERIFY_TOKEN` when Meta requests the verification token. Subscribe to the WhatsApp **messages** webhook field for the relevant WhatsApp Business Account and connect the correct phone number. This verifies the incoming webhook; it does not automatically grant permission to send.

Meta must send valid `x-hub-signature-256` header for POST. Never disable signature verification to "make it work".

## 4. Testing
1. Verify D1 schemas exist and `/api/stock` responds without invented availability.
2. Configure Access and test approved and denied users. Avoid real customer data until controls are verified.
3. Configure Meta webhook secrets and subscribe. Meta's verification challenge should succeed.
4. Send a **test message** from a separate phone to the business number; confirm one conversation and one inbound message in the protected dashboard.
5. Re-deliver the same webhook ID to confirm no duplicate messages.
6. Use **Suggest a response**; confirm the draft is based on verified stock. Copy and send manually through your authorized business channel.
7. Confirm status, inventory count and waitlist remain separate from direct WhatsApp messages. No automatic sale should be created.
8. Set a retention policy for customer phone numbers, notes and chat content; implement deletion requests, backups, and role access controls before broad rollout.

## 5. Optional future AI + sending
An actual WhatsApp AI conversational agent needs an explicit business authorization and an appropriate model/provider with privacy and cost controls, and approved outbound Meta messages integration. Start with **human approval for every send**; only then introduce low-risk automated FAQs with safeguards:
- Answer only from verified stock/pricing/product usage knowledge.
- Ask the owner before order confirmation, cancellation, payment requests, medical/health claims, refunds, or customer-data changes.
- Apply WhatsApp opt-in rules, allowed messaging windows and approved template policies.
- Keep retries, deduplication, human handoff, opt-out, logs and rate limits.
- Never store Meta credentials or model API keys in public repository files.

## Setup state
- D1 database created by owner: YES.
- D1 ID binding committed in GitHub: YES.
- Schema applied to **remote** database: NOT YET VERIFIED.
- Cloudflare Access approved email/secret settings: NOT YET VERIFIED.
- Meta WhatsApp Business app, webhook verification and signature secret: NOT YET CONFIGURED.
- Actual live inbound WhatsApp messages in CRM: NOT YET VERIFIED.
- Assistant: source provides staff-review rule-based drafts; **not an autonomous AI model**.
