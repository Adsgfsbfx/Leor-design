import type { Metadata } from "next";
import Link from "next/link";
import { buildWhatsAppLink, phoneDisplay, phoneHref, site } from "../../src/config/site";

const privacyMessage =
  "Hi Leor Design, I have a question about privacy and my personal information.";

export const metadata: Metadata = {
  title: `Privacy | ${site.companyName}`,
  description: `Privacy information for the ${site.companyName} website.`,
};

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <Link className="privacy-back-link" href="/">â† Back to Leor Design</Link>
      <p className="eyebrow">Privacy information</p>
      <h1>Your information, handled with care.</h1>
      <p className="privacy-review-note">
        This is a general privacy template, not legal advice. Leor Design should review and update it
        before publication.
      </p>
      <section>
        <h2>Enquiries and estimator submissions</h2>
        <p>
          When you submit an enquiry, the website processes the name, mobile number, optional email,
          property type, locality, services selected, requirements, estimator selections and estimate,
          page URL, campaign details when present, device category and whether WhatsApp was selected.
          Enquiry submission requires your consent. The website sends these details through its
          enquiry endpoint to the existing Google Apps Script integration, which writes them to the
          Google Sheets Leads sheet. The website&apos;s current mapping has 21 columns, including a Lead
          ID, timestamp, consent and status. No retention or deletion period is specified in the
          website implementation.
        </p>
        <p>
          If you select the WhatsApp enquiry option, the message prepared for WhatsApp is included in
          the submitted requirements field. A click-to-chat link by itself does not send the
          conversation to this website; WhatsApp handles any conversation you continue there.
        </p>
      </section>
      <section id="cookies">
        <h2>Cookie and analytics information</h2>
        <p>
          Optional visitor analytics run only after analytics consent is accepted. The website may
          send random visitor, session and event IDs; page and page-category details; referral and
          campaign values; browser, operating system and device category; interaction type and
          clicked-element label; scroll depth; page and session duration; screen resolution and
          browser language. Approximate country or region is included only when supplied in trusted
          platform headers. Raw IP addresses, passwords, payment information and sensitive form
          contents are not included in visitor event payloads.
        </p>
        <p>
          Analytics events are sent through the website&apos;s visitor-event endpoint to the existing
          Apps Script integration for the Visitor Footprints sheet. The current Apps Script mapping
          writes the original 19 columns. Its field names for page duration and consent do not match
          the names currently sent by the website, so those two values may not be recorded; the
          additional proposed columns and Session Registry are not confirmed as active. A Lead ID
          can be attached to later visitor events after an enquiry is submitted.
        </p>
        <p>
          The browser stores your consent choice in an essential cookie for up to 180 days, with
          local storage as a compatibility fallback. After analytics consent, anonymous visitor and
          session identifiers, attribution values and queued events are stored in local or session
          storage. Withdrawing analytics consent stops optional tracking and clears locally queued
          events and identifiers. Withdrawal does not delete events already sent to Google Sheets.
        </p>
      </section>
      <section>
        <h2>Service operation</h2>
        <p>
          The enquiry endpoint uses a forwarded network address as a temporary in-memory rate-limit
          key to limit repeated requests. That key is not included in the Leads or Visitor Footprints
          rows. The website does not state a retention period for the Google Sheets records.
        </p>
      </section>
      <section>
        <h2>Call and WhatsApp</h2>
        <p>
          If you choose to call, your call is handled by your phone provider. If you open WhatsApp,
          WhatsApp handles messages sent there. The website may record the click as an optional
          analytics event only when analytics consent has been accepted.
        </p>
      </section>
      <section>
        <h2>Privacy questions</h2>
        <p>
          For questions about contacting Leor Design directly, call{" "}
          <a href={phoneHref}>{phoneDisplay}</a> or{" "}
          <a
            href={buildWhatsAppLink(privacyMessage)}
            rel="noopener noreferrer"
            target="_blank"
          >
            message us on WhatsApp
          </a>
          . Please do not include sensitive personal information in a first message.
        </p>
      </section>
      <section id="terms">
        <h2>Terms and conditions</h2>
        <p>
          Prices and budget ranges shown on this website are indicative planning estimates. Final
          scope and pricing are confirmed after a site visit and set out in a proposal. The 10% offer
          shown online is a front-end preview; eligibility, validity and discount scope are pending
          confirmation by Leor Design, and no discount codes are issued online.
        </p>
      </section>
      <section id="disclaimer">
        <h2>Disclaimer</h2>
        <p>
          Website photographs are illustrative Unsplash stock images and are not represented as
          completed Leor Design projects. Budgets are indicative and may change after a site visit,
          measurement, material selection and confirmation of the project scope.
        </p>
      </section>
    </main>
  );
}
