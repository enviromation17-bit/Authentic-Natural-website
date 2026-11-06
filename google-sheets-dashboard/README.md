# Authentic Naturals — Google Sheets CRM Dashboard

This is a separate **Google Apps Script** dashboard (not a GitHub Pages site). Copy `Code.gs` and `Index.html` into a new Apps Script project under the Google account holding the real Sheet.

## Deployment
1. Open the actual CRM spreadsheet in the correct Google account. It must contain the tabs `Dashboard`, `Leads`, `Orders`, `Inventory`, `WhatsApp`, `Settings`, with header names exactly matching `HEADERS` in `Code.gs`. If your actual sheet has different columns, align them before use.
2. Open Apps Script and create a **new project**; keep the existing enquiry collector deployed separately.
3. Paste `Code.gs` into the default script file; create an HTML file named `Index` and paste `Index.html`.
4. Go to **Project Settings > Script Properties** and add:
   - `CRM_SPREADSHEET_ID`: ID of the **correct Google Sheet**, which may live in a different account from ChatGPT.
   - `ADMIN_EMAILS`: comma-separated allowlisted Google account email addresses. Do not enter placeholders.
5. Share the actual Sheet as Editor with every authorized operator; the dashboard runs as the signed-in user.
6. Deploy > New deployment > Web app. Set **Execute as: User accessing the web app**; access: signed-in Google users permitted by your Google account settings. Never deploy the admin dashboard as an anonymous owner-executed app.
7. Open the `/exec` URL while signed into an allowed account and accept Google's permission prompt. Test an unapproved account to confirm access is denied.

Google's login normally persists while the user's Google session is active. There is no separate password database, permanent session promise, or WhatsApp API integration. Orders/inventory are recordkeeping only; order status does not automatically reserve or deduct stock.

## Notes
- Code is hosted on GitHub for version control, but must run inside Apps Script.
- The actual Sheet is chosen at deployment through `CRM_SPREADSHEET_ID`, not hardcoded to a Sheet in another account.
- If the Gmail account type/deployment settings do not expose `Session.getActiveUser().getEmail()`, access fails closed. A domain or authentication architecture change may be needed.
- A branded `crm.anaturalsintl.com` deployment needs a separate authenticated hosting/proxy design; Apps Script itself runs on its own Google web-app URL.


## New: client-friendly Stock dashboard
- All stock changes are handled in the **Stock** page inside the authenticated Apps Script dashboard, not the storefront.
- **Add product** saves SKU, product name, price, and starting physical quantity; initially marks availability unverified.
- **Manage stock** offers three actions: Add received stock, Remove stock, or Correct physical stock count.
- Shows physical stock, reserved quantity, and remaining available units.
- Rejects negative counts or reducing stock below reservations.
- Creates a private **Stock History** tab on first stock operation, recording the actor, reason, old and new stock values.
- Manual order status changes do **not** automatically reserve or deduct inventory.
- No change is made to the public website's inventory or Cloudflare Worker. Website and Google Sheets stock can differ until an explicit integration is designed.

### Upgrade existing Apps Script deployment
1. Copy the updated `Code.gs` and `Index.html` from this repository into your Google Apps Script dashboard project. Ensure HTML file is named **Index** with capital I, resulting in `Index.html`.
2. Save both.
3. Deploy > Manage deployments > Edit > **New version** > Deploy.
4. Log in with the allowlisted account, open **Stock**, test adding a product and receiving an inventory delivery. Check the `Inventory` and `Stock History` tabs in your actual spreadsheet.
5. Use only test product/stock values until the client confirms real inventory.
