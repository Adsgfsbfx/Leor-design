# Leor Design

A responsive Bengaluru interiors website built with Next.js App Router, TypeScript, and Tailwind CSS. Consultation enquiries are sent server-side to the configured Google Apps Script web app, which stores them in Google Sheets. WhatsApp buttons open click-to-chat conversations directly.

## Run locally

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Apps Script enquiry webhook

Set these server-only variables in `.env.local` and your hosting environment:

- `GOOGLE_APPS_SCRIPT_URL` — the deployed Apps Script web app URL ending in `/exec`.
- `LEOR_WEBHOOK_SECRET` — the same secret configured in Apps Script.

The server posts the validated lead, its ordered Sheet row, and an idempotency key to Apps Script. The webhook secret and URL are never sent to browser code. Apps Script must use the idempotency key (also sent as the lead `id`) to avoid appending a duplicate row if a retry reaches a different server instance. The API requires a JSON response with `success: true`; otherwise the form reports a save failure and can be retried.

The discount form remains a front-end interaction and does not submit a lead.

## Privacy and launch details

The `/privacy` page is a general template, not legal advice, and must be reviewed by Leor before publication. Deletion and privacy requests can be made by phone or WhatsApp using the confirmed business number in `src/config/site.ts`. Review all launch placeholders before publishing.

## Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```
