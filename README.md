# Leor Design

A responsive Bengaluru interiors landing page built with the existing Next.js App Router, TypeScript, and Tailwind CSS setup.

The home page waits for an incoming request before rendering, so it is rendered dynamically on the server instead of being fully prerendered at build time.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Launch details to replace

- Confirmed business details, the business-email placeholder, editable indicative pricing, sample image URLs, service estimates, and the testimonial placeholder are centralized in `src/config/site.ts`.
- Replace the clearly marked sample project imagery and testimonial placeholders with approved Leor material before publishing.
- Enquiry forms validate in the browser and on the server. To deliver enquiries, set `LEOR_ENQUIRY_WEBHOOK_URL` in the server environment to an HTTPS endpoint that accepts the enquiry JSON and returns a successful HTTP status after saving it. Optionally set `LEOR_ENQUIRY_WEBHOOK_TOKEN`; it is sent as a server-side bearer token. See `.env.example`. Until a destination is configured, the form reports that delivery is unavailable and does not display a false success message.

The webhook receives `name`, `mobile`, `email`, `propertyType`, `locality`, `requirements`, and `servicesNeeded`. Keep any webhook credentials on the server; do not expose them in `NEXT_PUBLIC_*` variables.

## Checks

```bash
npm run lint
npm run build
```
