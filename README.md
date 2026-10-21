# Leor Design

A responsive Bengaluru interiors website built with Next.js App Router, TypeScript, and Tailwind CSS. Enquiries and WhatsApp click-to-chat intents are written to a private Google Sheet by server-side route handlers.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Connect the Google Sheets lead database

1. Create a Google Sheet and copy its spreadsheet ID from the URL. It is the value between `/d/` and `/edit`.
2. In Google Cloud Console, create or select a project and enable the **Google Sheets API**.
3. Create a service account, create a JSON key for it, and copy `client_email` and `private_key` from the downloaded JSON.
4. Share the Google Sheet with the service account email as an **Editor**. The application creates the `Leads` tab and its column header row on first use.
5. Set these variables in a root `.env.local` file for local development and in the hosting dashboard (for example, Vercel → Project Settings → Environment Variables):
   - `GOOGLE_SHEETS_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`

   Paste the private key as supplied, including its `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines. It may be entered as a multiline value or with literal `\n` sequences; the server converts escaped newlines. Keep these values private, do not commit `.env.local`, and never prefix them with `NEXT_PUBLIC_`.

The `Leads` tab has these columns in order: Timestamp (IST), Lead ID, Source, Name, Mobile, Email, Property Type, Locality, Services Needed, Requirements, Estimator Selections, Indicative Estimate, Page URL, UTM Source, UTM Medium, UTM Campaign, Device Type, WhatsApp Clicked, Consent, Status, Follow-up Notes. New enquiries have status `New`; click-only rows have status `WhatsApp click (no details)`. The Follow-up Notes cell is left empty for the team.

The enquiry form requires name, Indian mobile number, property type, locality, requirements, one or more services, and consent. Email is optional. A successful response is returned only after Google Sheets confirms the write. Without working Google credentials, the form shows an error rather than a false success.

Basic rate limits and idempotency tracking are in memory, so they are best-effort protections and reset when a server process restarts. The app also checks the sheet for an existing deterministic Lead ID before appending a retried submission. For high-volume use or strict cross-instance atomic idempotency, use a durable database/queue alongside Sheets.

## Optional Phase 2: WhatsApp Business webhook

The `app/api/whatsapp/webhook` route is disabled unless Google Sheets credentials and all four `WHATSAPP_*` variables are configured. For setup, create a Meta app and configure a WhatsApp Business Platform webhook subscribed to incoming messages, then set:

- `WHATSAPP_VERIFY_TOKEN` — a secret value you choose and enter in Meta's webhook configuration.
- `WHATSAPP_APP_SECRET` — the Meta app secret used to verify `X-Hub-Signature-256`.
- `WHATSAPP_ACCESS_TOKEN` — the WhatsApp Business Platform access token.
- `WHATSAPP_PHONE_NUMBER_ID` — the Meta phone number ID.

Incoming text messages are written to a separate `WhatsApp Messages` sheet tab. This requires Leor to register a WhatsApp Business Platform number with Meta. A number registered for the WhatsApp Business Platform cannot be used in the normal WhatsApp app at the same time. Click-to-chat links on the website do not require this webhook.

## Privacy and launch details

The `/privacy` page is a general template, not legal advice, and must be reviewed by Leor before publication. Replace the placeholder contact address in `src/config/site.ts` with a monitored email. Review all sample images and other launch placeholders before publishing.

## Checks

```bash
npm run lint
npm run build
```
