# Leor Design: Project Handover

Generated from the actual project files, `git` state, and commands run during this review. Anything not verified is marked **UNKNOWN**. No application code was changed to produce this report.

---

## 1. Project overview

| Item | Value (verified) |
|---|---|
| Business | Leor Design, interior design studio, Hebbal, Bangalore |
| Project folder | `C:\Users\gayat\leor-design` |
| Git remote | `https://github.com/Adsgfsbfx/Leor-design.git`, branch `main` |
| Latest commit | `49223fa` "Rebuild homepage in Truww-style layout with PRD estimator, new offer popup and illustrative imagery" (pushed; `main` is in sync with `origin/main`) |
| Production URL | `https://leor-design.vercel.app` (deployed with `npx vercel --prod`; returned HTTP 200 when probed with curl; not opened in a browser) |
| Framework | Next.js **16.4.2**, App Router, Turbopack, **Cache Components** enabled |
| Language | TypeScript 5, React 19.3.0 |
| Styling | Hand-written CSS in `app/globals.css` (~30 KB). Tailwind v4 is installed and loaded via `@import "tailwindcss"` and `@tailwindcss/turbopack`, but components use custom class names, not Tailwind utilities. |
| Fonts | `next/font/google`: Instrument Serif (`--font-instrument-serif`), Hanken Grotesk (`--font-hanken-grotesk`) |
| Dependencies | `next`, `react`, `react-dom`, `@supabase/supabase-js`, `googleapis`. Dev: `tailwindcss`, `@tailwindcss/turbopack`, `typescript`, `eslint`, `eslint-config-next`, `@types/*`. |
| Dependency changes this session | None. `package.json` was not edited. |

### Important Next.js note
`AGENTS.md` warns that this Next.js version has breaking changes. Read the relevant guide in `node_modules/next/dist/docs/` before changing framework-level code. `app/page.tsx` uses `await connection()` and `export const instant = false`; keep these unless you read the docs first.

### Structure
```
app/
  layout.tsx            fonts, metadata (title + description only)
  page.tsx              homepage composition
  globals.css           ALL styling
  privacy/page.tsx      privacy notice
  api/
    enquiry/route.ts            POST lead -> Supabase (+ optional Sheets mirror); NOT called by the UI
    whatsapp-click/route.ts     POST click log -> Supabase; NOT called by the UI
    whatsapp/webhook/route.ts   WhatsApp Cloud API webhook scaffold; disabled unless 4 env vars set
  components/home/
    sections.tsx        server components: Hero ... Footer
    interactive.tsx     client: Header, Projects, Estimator, Finishes, Faq
    forms.tsx           client: LeadForm, ConsultationForm, RegisterForm
    overlays.tsx        client: OfferPopup, FloatingActions
src/
  config/site.ts        business info, FAQs, WhatsApp link builder
  config/images.ts      photo registry + 8 concept projects
  lib/pricing.ts        PRD pricing, estimator maths, mobile validator
  lib/supabaseAdmin.ts, googleSheets.ts, leadSheetsMirror.ts, rateLimit.ts   (server-side, used only by /api)
supabase/migrations/0001_init.sql   tables: leads, whatsapp_clicks, whatsapp_messages (RLS enabled)
public/images/          16 Unsplash photos (see ASSETS.md)
ASSETS.md               Unsplash photo ID table and licence note
screenshots/            local test screenshots, 92 files, git-ignored (not in repo)
```

### Commands (Windows PowerShell)
```powershell
cd C:\Users\gayat\leor-design
npm ci            # only if node_modules is missing
npm run dev       # Next picks its own port, normally 3000; read "Local:" in the output
npx tsc --noEmit
npm run lint
npm run build
npx vercel --prod --yes     # deploy (CLI is already logged in on this machine)
```
Do not assume port 3000 or 3100. Use the URL that `next dev` prints.

---

## 2. Work completed

### Homepage sections, in render order (`app/page.tsx`)
`Header` > `Hero` (+ lead form, `#top-hero`, `#top`, `#enquire`) > `TrustStrip` > `CostCards` > Projects (`#projects`) > `CtaBand` > `Highlights` (`#highlights`) > Estimator (`#estimator`) > `Packages` (`#packages`) > `WhyLeor` (`#why`) > `DesignApproach` (`#approach`) > `DesignerCta` (`#designer`) > Finishes (`#finishes`) > `Comparison` > `FinalCta` > FAQ (`#faq`) > `Commitments` > `ConsultationSection` (`#contact`) > `Footer` (`#offer-terms` inside the footer) > `FloatingActions` > `OfferPopup`.

### Fully implemented (verified by code and/or browser test)
- **Responsive header** with anchors Projects, Estimate, Packages, Finishes, FAQs, Contact, plus a gold Call button. Mobile menu uses `aria-expanded`.
- **Anchors:** all in-page `href="#..."` targets used in the code resolve to an element ID (`#top`, `#enquire`, `#projects`, `#estimator`, `#packages`, `#finishes`, `#faq`, `#contact`, `#offer-terms`). The earlier `#estimato` error was a mistyped or truncated URL; the real ID is `estimator`.
- **Project gallery:** 8 illustrative concept projects, filter chips (All shows the first 6; Living rooms / Kitchens / Bedrooms). Photos are Unsplash stock, labelled "Illustrative concept". Tested: Kitchens gives 3 cards, All gives 6.
- **Cost estimator** (PRD rules, `src/lib/pricing.ts`): home type 1/2/3/4 BHK and Villa; finish Essential/Premium/Luxe; add-ons false ceiling, panelling, painting; animated range; breakdown; EMI (12%, 36 months); "register for 10% off" inline form with an indicative discounted range.
  - Base prices (Rs): 1 BHK 380,000; 2 BHK 620,000; 3 BHK 900,000; 4 BHK 1,250,000; Villa 2,000,000. Multipliers 1.0 / 1.5 / 2.2. Add-ons 120,000 / 90,000 / 60,000.
  - `mid = base × multiplier + add-ons`; range = mid × 0.92 to mid × 1.08, rounded to the nearest 10,000; discounted × 0.9.
  - Tested values: 2 BHK Premium Rs 8.6L–10.0L; Villa Luxe plus false ceiling Rs 41.6L–48.8L; 1 BHK Essential Rs 3.5L–4.1L.
  - The PRD itself says these prices are placeholders pending client approval.
- **Finish selector:** six finishes. Oak, walnut and fluted oak use real material photos; sage, midnight and ivory use CSS colour previews.
- **FAQ accordion** (`aria-expanded` / `aria-controls`), tested.
- **Forms** (`forms.tsx`): hero `LeadForm`, `ConsultationForm` (name, mobile, locality, home type, notes), `RegisterForm` (name, mobile, consent). Validation: name at least 2 characters, mobile `^[6-9][0-9]{9}$`, locality at least 2 characters. Mobile input strips non-digits, handles pasted `+91` / `91` / `0` prefixes, caps at 10 digits. Error states use `aria-invalid` and `role="alert"`. Success state says nothing was sent or stored and offers a WhatsApp hand-off link (`https://wa.me/918050414570?text=...`). Tested.
- **10% offer popup** (`overlays.tsx` + CSS): a modal dialog with a photo panel, "10 OFF" headline, gold ribbon "Flat 10% off on your interiors", ivory form panel, and a "Claim My 10% Discount" button (disabled until name, valid mobile and consent are all present). Opens after scrolling past `#top-hero` or after 15 s, whichever comes first; once per tab via `sessionStorage["leor-offer-seen"]`; closes with the ✕ button, Escape or a backdrop click; focus trap; body scroll lock; focus is restored on close. Desktop and tablet use a two-column modal, up to 640 px a bottom sheet, and landscape phones a full-height two-column layout. The popup says online registration is not connected and no code is issued.
- **Floating WhatsApp button** (desktop) and **mobile Call now / WhatsApp bar** (up to 860 px).
- **Phone / WhatsApp links:** `tel:+918050414570`, `tel:+919180414570`, `wa.me/918050414570`.
- **Design approach section** (replaced the client-review section). Three photo cards, no fake names, ratings or quotes.
- **Privacy page** (`/privacy`).

### Partially implemented or placeholder
- **Client reviews/stories:** none exist. The section is the "Design approach" content. No real testimonials are available.
- **Highlights / metrics:** only page facts (Hebbal, 5 home sizes, 6 finishes, 3 levels). No verified company statistics.
- **Packages, commitments, warranty and delivery wording:** draft text, labelled as pending approval.
- **Images:** all 16 are Unsplash stock, labelled illustrative. None are real Leor projects.
- **"Renovation and small offices" service:** no image, not shown as a card.
- **SEO:** only `title` and `description` in `layout.tsx`. There is no Open Graph, Twitter card, canonical URL, JSON-LD LocalBusiness schema, `sitemap.xml`, `robots.txt` or per-page metadata (none found in `app/`). The favicon is the default `app/favicon.ico`.
- **Dark mode:** a `prefers-color-scheme: dark` token override exists in CSS; the manual theme toggle was removed. Dark mode was not visually tested.

---

## 3. Files changed (this redesign, commit `49223fa` and earlier in the session)

| File | Change |
|---|---|
| `app/page.tsx` | Rewritten: composes the sections above. |
| `app/globals.css` | Replaced entirely with the new stylesheet (tokens, sections, breakpoints at 1100 / 960 / 860 / 640 / 340 px, popup layouts, reduced motion). |
| `app/layout.tsx` | Removed old CSS imports and the theme script; fonts and metadata remain. |
| `app/components/home/*.tsx` | New: all UI components (see structure). |
| `app/privacy/page.tsx` | Wording updated to say only an "offer popup shown" flag is kept per tab. |
| `src/lib/pricing.ts` | Rewritten with PRD pricing. |
| `src/config/images.ts` | New photo registry and 8 concept projects. |
| `src/config/site.ts` | Phone link is now `tel:+918050414570`; `packageRates` and `serviceAddOnEstimates` removed. `enquiryServiceOptions` and `faqs` kept. |
| `ASSETS.md` | New: Unsplash photo IDs. |
| `.gitignore` | Added `/screenshots/`. |
| `public/images/` | 8 old mismatched photos deleted; 16 new photos added. |
| Deleted | `app/components/landing/*`, `app/leor-homepage.css`, `app/leor-landing.css`. |

**Configuration:** `next.config.ts` has `experimental.agentFeedback`, `cacheComponents`, `partialPrefetching`, and a Turbopack CSS rule for `@tailwindcss/turbopack`. These were present before; this redesign did not change them. **New dependencies: none.**

`README.md` documents Supabase setup and says the homepage forms do not submit.

---

## 4. Current design and reference

- **Reference:** `https://interiors.truww.com/Lp/Bangalore/main?lp=v2`. It was inspected earlier through screenshots, section by section.
- **Match level (my judgement, not measured):** the section order and layout patterns follow the reference closely: hero with a lead form, trust strip, cost cards, project gallery, estimator, packages, why-us grid with an arched photo, comparison table, final CTA, FAQ, commitments, consultation form, footer. Copy, imagery and brand are original.
- **Remaining differences:**
  - The page is ~13,600 px tall on desktop versus ~11,000 px for the reference.
  - Imagery is stock rather than real project photography.
  - The reference has real reviews, video stories, partner or award strips and verified statistics, which Leor cannot show until real data exists.
  - No pixel-level side-by-side comparison against the reference was done.
  - No motion or scroll animations beyond simple transitions.
- **Brand:** deep teal `#16303A`, pale mist `#F2F5F3`, white `#FFFFFF`, warm gold `#C9922E`, moss green `#5E7A62`. Headings Instrument Serif; body Hanken Grotesk.
- **Business details (`src/config/site.ts`):** Leor Design; Hebbal, Bangalore, Karnataka; phone +91 8050414570; alternate +91 9180414570; WhatsApp 918050414570. Email: **UNKNOWN** (none seen in site config).
- **PRD:** the extracted text is in `C:\Users\gayat\.copilot\session-state\ccd2d17c-77c6-4e54-a196-075adfca3432\files\prd.txt` (outside the repo). The original PDF `leor-design-website-prd-final.pdf` is not in the repo; its location is **UNKNOWN**.

---

## 5. Current bugs and unfinished work

### Verified status (this review)
- `npx tsc --noEmit`: exit 0, no errors.
- `npm run lint`: exit 0, no errors.
- `npm run build`: passed when last run earlier in this session (after the popup changes). It was **not re-run in this review**.
- Dev server: **running on port 3000**, `http://localhost:3000/` returned HTTP 200 (PID 5968 at the time). Production URL returned 200.
- Runtime errors: no `pageerror` events in the Playwright tests at 14 viewports.

### Discount popup input issue
The Name and Mobile inputs were already controlled React inputs with independent state, so I could not reproduce a definite root cause from the screenshots (which I could not see). Changes made: the old 360 px non-modal card was replaced with a modal; a native `maxLength` that truncated pasted numbers was removed; paste normalisation was added. Typing, paste, backspace, consent and submit were verified in headless Edge at 14 sizes. **Not verified on a real phone or with a real on-screen keyboard.**

### Known issues
1. **Galaxy Fold width (280 px):** the automated check reported the popup's close button outside the viewport. After the CSS fix the screenshot looks mostly correct, but Edge emulation may be keeping the layout wider than 280 px. Treat it as unverified.
2. The **15-second popup timer** was never tested; only the scroll trigger was.
3. The Next dev "N" badge overlaps the mobile bar in dev screenshots (dev only).
4. Tested only in headless Microsoft Edge (Chromium). Safari, Firefox and real devices: **not tested**.
5. Production deployment has Vercel Deployment Protection (`vercel_authentication`) enabled, so public visitors may hit a Vercel login page. Check the Vercel project settings.
6. No custom 404 or error pages checked. **UNKNOWN.**
7. Accessibility was not audited with a tool; only manual attributes (ARIA, focus trap, labels) are in place.
8. `app/api/enquiry` and `app/api/whatsapp-click` still reference an older enquiry shape (`enquiryServiceOptions`); they were not retested against the new forms and are not called by them.

---

## 6. Backend and integrations

| Area | Status |
|---|---|
| Homepage forms (hero, consultation, popup, estimator register) | **Frontend only.** They validate and show a confirmation plus a WhatsApp hand-off link. Nothing is saved or sent (verified: no `fetch` or `/api/` call in `app/components`). |
| `POST /api/enquiry` | Code exists: writes to a Supabase `leads` table and optionally mirrors to Google Sheets, with rate limiting. **Not called by the UI. Not tested in this session.** |
| `POST /api/whatsapp-click` | Code exists (`whatsapp_clicks` or `leads`). Not called by the UI. Untested. |
| `/api/whatsapp/webhook` | Scaffold. Stays disabled unless `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` and the Supabase credentials are set. Untested. |
| Supabase schema | `supabase/migrations/0001_init.sql` defines `leads`, `whatsapp_clicks`, `whatsapp_messages` with RLS enabled. **Whether it has been run on a real Supabase project is UNKNOWN.** |
| Env vars | `.env.example` lists `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_SHEETS_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` and the four WhatsApp variables. Whether any are set locally or on Vercel is **UNKNOWN**. No `.env.local` was seen in the project root. |
| Discount registration / codes | **Not implemented.** No codes are generated. The UI says so. |
| Authentication, admin dashboard | **Not implemented.** No auth or admin route exists. |
| Analytics, email or SMS notifications | **Not implemented / UNKNOWN.** |

---

## 7. Testing

### Actually run
- `tsc`, `eslint`: pass (re-run in this review).
- `next build`: pass (earlier in the session, after the final popup edit; not re-run now).
- Playwright (`playwright-core` + headless Edge, temporary install, since removed), against `http://localhost:3000`:
  - Estimator values, project filter, finish selector, FAQ toggle, form validation errors and success state, and the WhatsApp link on the confirmation.
  - Popup: not shown at load; opens on scroll past the hero; typing; paste of `+91 98765 43210` gives `9876543210`; Backspace; letters stripped; button disabled until consent and valid input; submit gives the "nothing stored" message; close button; no reopen in the same tab.
  - Viewports with screenshots: 1440×900, 1366×768, 768×1024, 390×844, 320×700 (the first requested set), then 14 devices: iPhone SE 375, iPhone 14 390, Pro Max 430, Pixel 7 412, Galaxy Fold 280, phone landscape 844×390, iPad mini 768, iPad Air 820, iPad Pro 1024×1366, tablet landscape 1024×768, laptop 1280×720, 1366×768, 1920×1080, 2560×1080. Checks were no horizontal overflow, no broken images, no page errors.
- **Screenshots were actually captured.** They are in `screenshots/` (92 files, including `screenshots/devices/` with overview sheets). They are **git-ignored** (about 122 MB), so they exist only on this machine.

### Not tested
- 15-second popup timer; real phone keyboards and touch hardware; Safari / Firefox; screen readers; dark mode; Lighthouse or performance; `/api/*` routes; Supabase, Google Sheets and WhatsApp integrations; the production site in a browser (only a curl 200); a pixel-level side-by-side comparison with the reference.
- There is no automated test suite in the repo (no test script in `package.json`).

---

## 8. Next steps (prioritised)

**Most important immediate task:** decide the lead-capture approach, then connect the forms to a real, working submission, because right now no lead from the site is saved.

1. Confirm with the owner: use Supabase (already scaffolded) or another approach. No paid services without approval.
2. Create or confirm the Supabase project, run `supabase/migrations/0001_init.sql`, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` and in Vercel (Production). Never expose the service role key to the client.
3. Wire `LeadForm`, `ConsultationForm` and `RegisterForm` to `POST /api/enquiry` (check the request shape in `app/api/enquiry/route.ts` first). Show a success message **only** after a confirmed 2xx. Keep the honest failure and WhatsApp fallback.
4. Decide discount mechanics with the owner (code generation, validity, terms) before issuing any code. Replace the "not connected" wording only once it is true.
5. Replace stock images with real Leor project photos when supplied; update `src/config/images.ts` and `ASSETS.md`.
6. Add verified content: real reviews (with permission), metrics, warranty and delivery terms, approved pricing, offer terms, email address.
7. SEO: Open Graph and Twitter metadata, canonical URL, `LocalBusiness` JSON-LD, `sitemap.xml`, `robots.txt`, favicon and OG image, `metadataBase`.
8. Review Vercel Deployment Protection so the public can see the site.
9. Test the 15 s popup path, real-device keyboard behaviour, Safari and Firefox, and the 280 px width.
10. Optional: admin dashboard with authentication to view leads (needs the owner's approval; design before building).
11. Optional: reduce page length toward the reference; add an automated e2e test script.

### Exact PowerShell
```powershell
cd C:\Users\gayat\leor-design
npm run dev                  # note the "Local:" URL it prints
# in a second terminal:
cd C:\Users\gayat\leor-design
npx tsc --noEmit; npm run lint; npm run build
git status -sb
git add -A; git commit -m "your message"; git push origin main
npx vercel --prod --yes
```

---

## 9. Instructions for the next AI

- **Preserve** the existing project and everything that works: estimator maths, filters, finish selector, FAQ, validated forms, popup behaviour, anchors, floating and mobile contact controls, and the Leor palette and fonts. Do not replace the site with a static mock-up.
- **Inspect before editing.** Read `app/page.tsx`, the four files in `app/components/home/`, `src/lib/pricing.ts`, `src/config/*`, and `AGENTS.md`. Read the Next.js docs under `node_modules/next/dist/docs/` before touching framework-level behaviour; this is Next 16 with Cache Components.
- **Follow the PRD** (pricing, rules). Its extracted text is in the session folder path above; the original PDF location is UNKNOWN, so ask the owner if you need it.
- **No paid services** without the owner's explicit approval.
- **Never fabricate** customer names, reviews, ratings, review counts, project stats, awards, warranties, delivery promises, coupon codes, or test results. Keep stock photos labelled illustrative. Do not copy Truww's brand, text, reviews, stats or images.
- **Be honest about the backend.** The forms are not connected. Do not show "submitted" or "saved" until a real 2xx comes back from a working endpoint. Do not create fake coupon codes.
- **Fix directly in code and verify.** Run `npx tsc --noEmit`, `npm run lint` and `npm run build`, then check in a real browser at desktop, tablet and mobile widths. Report only tests you actually ran.
- **Secrets:** never commit `.env*` (already git-ignored) or put the Supabase service role key in client code.
- **Windows PowerShell:** no `&&` or `||`; use `;`. Write files with an editor tool or `[IO.File]::WriteAllText` with a UTF-8 no-BOM encoding (`Set-Content -Encoding UTF8` adds a BOM).
- `screenshots/` is git-ignored; do not commit it.
