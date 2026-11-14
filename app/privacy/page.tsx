import type { Metadata } from "next";
import Link from "next/link";
import { buildWhatsAppLink, phoneDisplay, phoneHref, site } from "../../src/config/site";

const privacyMessage =
  "Hi Leor Design, I have a question about privacy and my personal information.";
const privacyTitle = `Privacy | ${site.companyName}`;
const privacyDescription = `Privacy information for the ${site.companyName} website.`;

export const metadata: Metadata = {
  title: privacyTitle,
  description: privacyDescription,
  alternates: {
    canonical: "https://leordesign.com/privacy",
  },
  openGraph: {
    type: "website",
    url: "https://leordesign.com/privacy",
    siteName: site.companyName,
    title: privacyTitle,
    description: privacyDescription,
  },
  twitter: {
    card: "summary",
    title: privacyTitle,
    description: privacyDescription,
  },
};

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <Link className="privacy-back-link" href="/">â† Back to Leor Design</Link>
      <p className="eyebrow">Privacy information</p>
      <h1>Your information, handled with care.</h1>
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
        <h2>Cookies and browser storage</h2>
        <p>
          The website does not collect visit or interaction analytics. It stores your privacy choice
          in a first-party cookie for up to 180 days, with local storage as a fallback. UTM campaign
          values and a WhatsApp-click marker may be kept in session storage so they can be included
          if you submit a customer enquiry; they are not sent as separate activity events.
        </p>
      </section>
      <section>
        <h2>Service operation</h2>
        <p>
          The enquiry endpoint uses a forwarded network address as a temporary in-memory rate-limit
          key to limit repeated requests. That key is not included in the Leads rows. The website
          does not state a retention period for the Google Sheets records.
        </p>
      </section>
      <section>
        <h2>Call and WhatsApp</h2>
        <p>
          If you choose to call, your call is handled by your phone provider. If you open WhatsApp,
          WhatsApp handles messages sent there. The website keeps a session-only marker of WhatsApp
          clicks so it can include that choice if you later submit an enquiry. The click is not sent
          to the website as a separate event.
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
          Website photographs are Unsplash images for visual reference and are not completed Leor
          Design projects. Budgets are indicative and may change after a site visit,
          measurement, material selection and confirmation of the project scope.
        </p>
      </section>
    </main>
  );
}
