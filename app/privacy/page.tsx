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
      <Link className="privacy-back-link" href="/">← Back to Leor Design</Link>
      <p className="eyebrow">Privacy information</p>
      <h1>Your information, handled with care.</h1>
      <p className="privacy-review-note">
        This is a general privacy template, not legal advice. Leor Design should review and update it
        before publication.
      </p>
      <section>
        <h2>Website forms</h2>
        <p>
          The enquiry and discount forms on this website are front-end demonstrations. Details
          entered into them are not sent to Leor Design or saved by the website. The website only
          remembers, in the current browser tab, that the offer popup has been shown so it does not
          repeat; this is cleared when the tab session ends.
        </p>
      </section>
      <section>
        <h2>Call and WhatsApp</h2>
        <p>
          If you choose to call or open WhatsApp, your communication is handled by your phone
          provider or WhatsApp. The website does not receive the WhatsApp conversation through a
          click-to-chat link.
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
    </main>
  );
}
