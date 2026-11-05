# Authentic Naturals — Lead Studio (Prototype)

Open: `/crm/` on GitHub Pages. This is an **interactive design and workflow prototype**, not a production customer-data system.

## What works
- Right-side full-height icon navigation with the active item expanding to show its name.
- Dynamic page title for Overview, Leads, Customers, Follow-ups, Insights, and Data & settings.
- New lead / Edit lead form, sample statuses and sources, search, status filter, follow-up dates, overview KPIs and source charts.
- Import/export CSV compatible with manual use in Google Sheets.
- Mobile responsive layout, reduced-motion support, keyboard-accessible buttons and dialog.
- No external JavaScript frameworks, server calls, API keys, or credentials.

## Important privacy and operational boundaries
- Demo records are fictitious and labelled.
- Editing/importing only changes **in-memory tab state**; it does not save records after reload.
- Do not enter or import real private customer data in the public demonstration.
- The storefront WhatsApp enquiry form prepares a WhatsApp message; it does **not** submit records to this dashboard.
- Google Sheets is **not automatically connected**.
- There is no authentication, access controls, persistence, server-side validation, or message automation. Never use public GitHub Pages as a private CRM backend.

## Suggested production implementation (requires setup)
Use an authenticated backend (for example Cloudflare Workers + D1, or an authenticated n8n server) between storefront forms, staff users and persistent leads:
1. Provide a secure intake endpoint with spam/rate limits, server-side validation and a privacy notice/consent.
2. Store only necessary lead fields, restrict access by authenticated staff and give each client a scoped permission boundary.
3. Implement lead lifecycle updates, audit log, backups, deletion/retention and CSV export.
4. Optionally append lead records to a **private Google Sheet** using server-held credentials, never keys in frontend JavaScript. Reconcile edits to avoid duplicate/conflicting states.
5. Send WhatsApp messages only with appropriate consent and approved provider integrations; the existing `wa.me` handoff requires the visitor to press Send.

Google Sheets headers for manual import:
`id,name,phone,source,status,product,followup,notes,created`

## Before production
- Deploy the dashboard behind authentication, not at a public GitHub Pages URL.
- Perform real-device UI testing and accessibility review.
- Check privacy/retention policies, opt-in and staff permissions.
- Test intake, logging, failure retries, duplicate records, exports and secure backups.

This document describes implemented scope accurately; it does not claim that a real leads database or Google Sheets synchronization is running.
