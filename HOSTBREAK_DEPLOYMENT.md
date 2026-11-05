# HostBreak deployment — Authentic Naturals storefront

The site is still hosted on GitHub Pages until this workflow is configured and run. A GitHub commit **does not** deploy to HostBreak by itself.

## What is prepared
- GitHub Actions workflow: `.github/workflows/deploy-hostbreak.yml`
- Manual trigger only (`workflow_dispatch`).
- Uploads public storefront HTML, CSS, JS and `public/` assets.
- Uses encrypted FTP over TLS (FTPS), certificate verification, and GitHub Actions secrets.
- Does not delete pre-existing HostBreak files.
- Excludes the unauthenticated `crm/` prototype from production uploads.

## Setup required in GitHub
Go to repository **Settings → Secrets and variables → Actions → New repository secret** and enter:

- `HB_FTP_HOST`: server hostname from your HostBreak activation email.
- `HB_FTP_USER`: your hosting FTP username.
- `HB_FTP_PASSWORD`: your FTP password (secret, never commit it).
- `HB_FTP_PATH`: your remote hosting document directory, normally `public_html` or `/public_html`. The workflow requires the path to end in `public_html` as a safety check.

A HostBreak account whose FTP login is already rooted *inside* `public_html` may require a different remote path. Review and adjust the safety check with your actual hosting configuration before running; never guess a directory.

## Deployment
1. Confirm the target HostBreak directory is the one for the intended domain. Back up any existing site.
2. Repository → **Actions → Deploy Authentic Naturals storefront to HostBreak → Run workflow**.
3. Confirm the workflow upload completes. Check actual published HTML and asset responses in a browser.
4. Configure the domain at its registrar using the actual HostBreak nameservers or server IP supplied in your activation email.
5. Enable HTTPS/SSL on the hosting account, test both apex and www variants as applicable.
6. Recheck cart, WhatsApp enquiry, mobile menu, 10 hero frames and footer on the custom domain.

## Known limitations / safety notes
- HostBreak is **not connected** to this chat; this workflow has not been executed or verified.
- FTPS must be enabled and trusted by your HostBreak server; if it is unavailable, use HostBreak cPanel File Manager or a supported SFTP setup instead of weakening TLS.
- GitHub-hosted storefront does not automatically sync leads to the CRM or Google Sheets.
- The HTML contains `noindex,nofollow`; remove intentionally only when public indexing is desired and privacy/legal pages are ready.
- Do not upload `crm/` to a public storefront; production CRM requires authentication and secure data storage.
- Run Lighthouse and check real-device responsive layout before final public launch.
