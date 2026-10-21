import type { Metadata } from "next";
import Link from "next/link";
import { site } from "../../src/config/site";

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
          click-to-chat link.
        </p>
      </section>
      <section>
        <h2>Why we store it</h2>
        <p>
          We use this information to understand your project, respond to your enquiry, arrange
          follow-up, and keep an internal record of enquiries. Enquiry records are stored in a
          Google Sheet accessible to the Leor Design team.
        </p>
      </section>
      <section>
        <h2>Your choices and deletion requests</h2>
        <p>
          To ask a question about your information or request deletion, contact Leor Design at{" "}
          <a href={`mailto:${site.privacyContactEmail}`}>{site.privacyContactEmail}</a>. This is a
          placeholder address and must be replaced with a monitored Leor Design email before launch.
        </p>
      </section>
    </main>
  );
}
