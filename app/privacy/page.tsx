import type { Metadata } from "next";
import Link from "next/link";
import { buildWhatsAppLink, phoneDisplay, phoneHref, site } from "../../src/config/site";

const privacyMessage =
  "Hi Leor Design, I'd like to ask about or request deletion of my personal information.";

export const metadata: Metadata = {
  title: `Privacy | ${site.companyName}`,
  description: `How ${site.companyName} handles enquiry and WhatsApp intent information.`,
};

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <Link className="privacy-back-link" href="/">← Back to Leor Design</Link>
      <p className="eyebrow">Privacy information</p>
      <h1>Your information, handled with care.</h1>
      <p className="privacy-review-note">
        This is a general privacy template, not legal advice. Leor Design should review and update it
        before publication.
      </p>
      <section>
        <h2>What we store</h2>
        <p>
          When you submit an enquiry, we store your name, phone number, optional email address,
          property type, locality, services requested, requirements, any estimator selections and
          indicative estimate, consent and its timestamp, and basic enquiry source and page
          information. If you use a WhatsApp link, we may store the prefilled message and basic click
          context. We do not receive or store the conversation you have inside WhatsApp through a
          click-to-chat link. Enquiry and click records are stored in Leor Design&apos;s Supabase
          database and may also be mirrored to a Google Sheet for team follow-up.
        </p>
      </section>
      <section>
        <h2>Why we store it</h2>
        <p>
          We use this information to understand your project, respond to your enquiry, arrange
          follow-up, and keep an internal record of enquiries. Supabase is the primary database;
          Google Sheets is an optional team-accessible mirror.
        </p>
      </section>
      <section>
        <h2>Your choices and deletion requests</h2>
        <p>
          To ask a question about your information or request deletion from the database and any
          optional mirror, call Leor Design at <a href={phoneHref}>{phoneDisplay}</a> or{" "}
          <a
            href={buildWhatsAppLink(privacyMessage)}
            rel="noopener noreferrer"
            target="_blank"
          >
            message us on WhatsApp
          </a>
          . Please include the phone number used for your enquiry so the team can locate the
          relevant records.
        </p>
      </section>
    </main>
  );
}
