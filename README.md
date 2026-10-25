# Leor Design

A responsive Bengaluru interiors website built with Next.js App Router, TypeScript, and Tailwind CSS. The homepage enquiry and discount forms are front-end demonstrations and do not send or save submissions. The repository also contains server/API integrations documented below; they are not called by the current homepage and should be reviewed before any future connection.

## Run locally

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com). Choose the Mumbai region, or Singapore if Mumbai is unavailable, for lower latency in India.
2. Open **SQL Editor** in the Supabase dashboard and run [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql).
3. Open **Project Settings > API** and copy the **Project URL** and the **service_role (secret)** key.
4. Add these values to `.env.local` at the project root and to the hosting dashboard (for example, Vercel → Project Settings → Environment Variables):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Restart the local development server after editing `.env.local`. Never prefix these variables with `NEXT_PUBLIC_`.

**Keep the service role key secret.** It bypasses Row Level Security (RLS). It must only be used by server code and must never be committed or sent to the browser. RLS is enabled on every application table and there are no public/anon access policies.

### View and export leads

In Supabase, open **Table Editor > leads** to view enquiries and WhatsApp click leads. Filter by `created_at`, `mobile`, `source`, or `status`; click **Download** / **Export CSV** in the table toolbar to export the filtered rows. WhatsApp click details are available in **Table Editor > whatsapp_clicks**. Incoming WhatsApp Business messages (when Phase 2 is configured) are in **whatsapp_messages**.

All `timestamptz` values are stored in UTC. Convert/display timestamps in `Asia/Kolkata` (IST) for exports and team workflows.

### Customer data requests

After verifying a deletion request, run the appropriate statement in the Supabase SQL Editor. Deleting by mobile removes matching enquiry rows; use the lead UUID when deleting one specific enquiry:

```sql
delete from public.leads where mobile = '9876543210';
```

```sql
delete from public.leads where id = '00000000-0000-0000-0000-000000000000';
```

If the customer also requests deletion of click or received-message history, find matching rows in `whatsapp_clicks` by page/context and in `whatsapp_messages` by `from_phone`, verify them, then delete those rows as well. Update any optional Sheets mirror separately.

## Optional Google Sheets mirror

Supabase remains the source of truth. To enable a best-effort, non-blocking mirror of lead rows, configure:

- `GOOGLE_SHEETS_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`

Create a Google Sheet, enable the Google Sheets API in a Google Cloud project, create a service account and JSON key, then share the Sheet with the service account email as an Editor. Put the spreadsheet ID and the JSON key's `client_email` and `private_key` values in `.env.local` and the hosting dashboard. The private key accepts real line breaks or escaped `\n` sequences. These credentials are server-only; do not use `NEXT_PUBLIC_` names.

The application creates a `Leads` tab and header row on first mirror write. It marks `leads.sheets_synced = true` only after the append succeeds. Find records needing a mirror retry with:

```sql
select id, created_at, source, mobile, status
from public.leads
where sheets_synced = false
order by created_at asc;
```

This query identifies rows for manual retry/reconciliation; Supabase retains all records if Sheets is unavailable.

## WhatsApp Business webhook (Phase 2)

The `app/api/whatsapp/webhook` route stays disabled unless Supabase and all four variables below are configured:

- `WHATSAPP_VERIFY_TOKEN` — a private verification string configured in Meta.
- `WHATSAPP_APP_SECRET` — used to verify `X-Hub-Signature-256`.
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`

Register and configure a WhatsApp Business Platform number with Meta to receive actual customer chat messages. Reading messages only works after this registration and webhook configuration; website click-to-chat intents do not expose the WhatsApp conversation. A number registered with the WhatsApp Business Platform cannot be used in the normal WhatsApp app at the same time. Incoming message IDs are deduplicated in `whatsapp_messages`.

## Privacy and launch details

The `/privacy` page is a general template, not legal advice, and must be reviewed by Leor before publication. Deletion and privacy requests can be made by phone or WhatsApp using the confirmed business number in `src/config/site.ts`. Review all launch placeholders before publishing.

## Checks

```bash
npm run lint
npm run build
```
