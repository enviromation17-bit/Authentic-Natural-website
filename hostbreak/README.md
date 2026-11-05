# Authentic Naturals — Production lead dashboard on HostBreak

This is a **real PHP/MySQL implementation**, not the old browser-only CRM demo.

## Files and routes
- Storefront: `/` (unchanged static HTML/CSS/JS).
- Lead intake API: `/api/leads.php` (accepts same-origin HTTPS POST with consent).
- Protected staff dashboard: `/admin/` (password login, lead list, search, stage updates, CSV export).
- Private shared bootstrap: `/_private/bootstrap.php`, protected by .htaccess.
- SQL schema: `hostbreak/schema.sql`.
- Example secret configuration: `hostbreak/private-config.example.php`. **Do not deploy a populated version to a public folder.**

## HostBreak setup (required before the connection works)
1. Confirm the HostBreak cPanel account supports **PHP 8.1+**, MySQL/MariaDB, PDO MySQL, mbstring, HTTPS, and FTPS. Set your site to HTTPS.
2. In cPanel, create a new MySQL database, dedicated database user, and grant that user access. Import `hostbreak/schema.sql` using phpMyAdmin.
3. Using cPanel File Manager, create `authentic-naturals-config.php` **one directory above** the site's `public_html`. Copy `hostbreak/private-config.example.php` and replace placeholders:
   - DSN: `mysql:host=localhost;dbname=ACTUAL_DB;charset=utf8mb4`
   - Dedicated database username and password.
   - Strong staff password hash generated with PHP's `password_hash(..., PASSWORD_DEFAULT)`.
   - Random 32-byte rate-limit secret in hex, generated with `bin2hex(random_bytes(32))`.
4. Keep the private config out of Git and outside public_html. Restrict its filesystem permissions appropriately.
5. In GitHub repository Actions secrets, configure `HB_FTP_HOST`, `HB_FTP_USER`, `HB_FTP_PASSWORD`, `HB_FTP_PATH` according to the actual HostBreak activation email and correct document root.
6. Run GitHub Actions → **Deploy Authentic Naturals storefront to HostBreak** manually; this uploads storefront and `hostbreak` PHP runtime but excludes private config, SQL setup file, and obsolete CRM prototype.
7. Confirm `https://YOURDOMAIN/admin/` opens a password-protected login, and sign in using the configured staff password. Never use the example placeholders.
8. Make a consented test enquiry from `https://YOURDOMAIN/`, then confirm it appears in `/admin/`. Test an order, the dashboard statuses, search, CSV, and WhatsApp handoff.
9. Verify `/_private/bootstrap.php` is inaccessible via HTTP (403). Check HTTPS SSL, response headers, backups, database retention, and domain configuration.

**Do not** test real customer information on GitHub Pages or before HTTPS and a privacy policy are configured.

## Data flow
Website enquiry/order → explicit consent → same-origin `POST /api/leads.php` → validated/rate-limited insertion into private MySQL → staff sees record in password-protected `/admin/`.

WhatsApp is separate: a prefilled message opens after the save attempt; the visitor must still press Send in WhatsApp. If the server is unavailable, WhatsApp can still open, and the website reports that the CRM did **not** save the enquiry.

On GitHub Pages, `lead-capture.js` intentionally bypasses the PHP API and returns not-configured; a GitHub Pages URL does not execute PHP.

## Security boundaries
- The database username/password and admin password hash are only in the outside-public-root private PHP configuration.
- Same-origin JSON intake, explicit consent, honeypot, field limits, a per-IP-hash hourly limit, and SQL prepared statements protect basic intake.
- Admin authentication uses PHP sessions and `password_verify`. POST updates require CSRF tokens, and CSV fields are escaped against spreadsheet formula injection.
- This is a **single-owner starter backend**, not a complete enterprise CRM. Add stronger brute-force login controls, backups, retention/deletion processes, privacy policy, monitoring, and potentially staff roles before scaling.

## Important deployment status
GitHub commits alone do **not** activate this backend. It becomes operational only after the real HostBreak database and outside-web-root secret configuration exist, deployment succeeds, and the domain points to that hosting account.

For actual HostBreak deployment, see `HOSTBREAK_DEPLOYMENT.md`.
