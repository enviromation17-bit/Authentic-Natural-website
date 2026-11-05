# Authentic Naturals — HostBreak storefront and private CRM deployment

The public GitHub Pages site runs static HTML/JS and **cannot execute the PHP backend**. The real lead dashboard becomes functional only when the HostBreak PHP/MySQL database and private hosting configuration are set up.

## Deployment package
The manual GitHub workflow `.github/workflows/deploy-hostbreak.yml` now includes:
- Storefront pages, images, styles and scripts (including `lead-capture.js`).
- `/api/leads.php` — consent-based secure lead intake.
- `/admin/index.php` — password-protected private staff dashboard.
- `/_private/bootstrap.php` and a private directory deny-access rule.

It excludes the old public CRM demo and does **not** deploy passwords or `hostbreak/private-config.example.php`.

## Before triggering
1. Set up HostBreak PHP 8.1+, MySQL database and an HTTPS-enabled website.
2. Import `hostbreak/schema.sql`.
3. Create `authentic-naturals-config.php` **outside the web root**, based on `hostbreak/private-config.example.php`. See `hostbreak/README.md` for exact fields.
4. In GitHub Actions secrets set `HB_FTP_HOST`, `HB_FTP_USER`, `HB_FTP_PASSWORD`, `HB_FTP_PATH`. Use the actual cPanel FTP values; never send or commit passwords to the repository.
5. Ensure `HB_FTP_PATH` is the correct `public_html` for the intended domain and back up any existing site.

## Publish
- GitHub repository → Actions → **Deploy Authentic Naturals storefront to HostBreak** → Run workflow.
- Verify that `https://YOURDOMAIN/api/leads.php` rejects GET (HTTP 405), that `/_private/bootstrap.php` is blocked (HTTP 403), and that `/admin/` requires a staff password.
- Submit a consented test enquiry from the actual HostBreak storefront and confirm its record appears in the private dashboard.
- Test checkout, WhatsApp handoff, responsive layout, rate limiting, SSL, admin search and CSV export.

## Current status
Source code and deploy workflow are committed, **not deployed to HostBreak**. No hosting credentials or DNS changes have been performed. The existing GitHub Pages storefront still opens WhatsApp, but its lead capture cannot persist to MySQL there.

Additional security before storing real customers: review the privacy policy, login attempt throttling, database backups, retention/deletion process, monitoring and least-privilege permissions.
