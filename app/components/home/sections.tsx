import Image from "next/image";
import { photos } from "../../../src/config/images";
import {
  alternatePhoneDisplay,
  alternatePhoneHref,
  buildWhatsAppLink,
  phoneDisplay,
  phoneHref,
  site,
} from "../../../src/config/site";
import { calculateEstimate, formatRange } from "../../../src/lib/pricing";
import { WhatsAppMark, LeadForm } from "./forms";

const iconPaths: Record<string, string> = {
  check: "M5 12.5l4.5 4.5L19 7.5",
  home: "M4 11l8-7 8 7v9H4zM10 20v-6h4v6",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  tag: "M3 12V4h8l10 10-8 8zM7.5 7.5h.01",
  layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5",
  clock: "M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 2",
  doc: "M7 3h8l4 4v14H7zM15 3v4h4M10 12h6M10 16h6",
  pin: "M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11zM12 7.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM8.5 12l2.5 2.5 4.5-5",
  calc: "M6 3h12v18H6zM9 7h6M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01",
};

function Icon({ name }: { name: keyof typeof iconPaths | string }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={iconPaths[name]} />
    </svg>
  );
}

function Heading({
  eyebrow,
  children,
  sub,
  align = "center",
}: {
  eyebrow?: string;
  children: React.ReactNode;
  sub?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={`heading h-${align}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2>{children}</h2>
      {sub ? <p className="sub">{sub}</p> : null}
    </div>
  );
}

const Gold = ({ children }: { children: React.ReactNode }) => <em className="gold">{children}</em>;

export function Hero() {
  return (
    <section className="hero" id="top-hero">
      <Image src={photos.hero.src} alt={photos.hero.alt} fill priority sizes="100vw" className="hero-img" />
      <div className="hero-shade" />
      <div className="wrap hero-grid" id="top">
        <div className="hero-copy">
          <p className="eyebrow light">Hebbal, Bangalore</p>
          <h1>
            Thoughtful home interiors in <Gold>Bangalore</Gold>
          </h1>
          <p className="hero-sub">
            Space planning, modular kitchens, wardrobes and finishes, shaped around the way you live. Start with a free conversation.
          </p>
        </div>
        <div className="hero-form-card" id="enquire">
          <LeadForm />
        </div>
      </div>
      <p className="hero-credit">Illustrative stock photograph, not a Leor project.</p>
    </section>
  );
}

const trust = [
  ["phone", "Free", "first consultation"],
  ["tag", "Transparent", "budget ranges"],
  ["layers", "Finishes", "you can compare"],
  ["doc", "Written", "proposal to review"],
  ["pin", "Hebbal", "studio, Bangalore"],
  ["clock", "Clear", "project timelines"],
] as const;

export function TrustStrip() {
  return (
    <section className="trust-strip" aria-label="What to expect">
      <ul className="wrap">
        {trust.map(([icon, a, b]) => (
          <li key={a}>
            <Icon name={icon} />
            <span>{a}<br />{b}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CostCards() {
  const two = calculateEstimate("2 BHK", "essential", []);
  const three = calculateEstimate("3 BHK", "essential", []);
  return (
    <section className="section tint" id="cost">
      <div className="wrap">
        <Heading eyebrow="Plan with confidence" sub="Indicative planning ranges for different home sizes. Final pricing follows a site visit and written proposal.">
          Home interior cost in <Gold>Bangalore</Gold>
        </Heading>
        <div className="cost-grid">
          <article className="cost-card">
            <div className="cost-img"><Image src={photos.livingBright.src} alt={photos.livingBright.alt} fill sizes="(max-width: 800px) 100vw, 33vw" /></div>
            <div className="cost-body">
              <span className="icon-tile"><Icon name="grid" /></span>
              <div>
                <h3>2 BHK interiors</h3>
                <p>Essential finish from {formatRange(two.low, two.high)}</p>
              </div>
              <a className="arrow-btn" href="#estimator" data-home="2 BHK" aria-label="Estimate a 2 BHK home">→</a>
            </div>
            <p className="cost-foot">Indicative · pending approval</p>
          </article>
          <article className="cost-card featured">
            <div className="cost-img"><Image src={photos.livingNeutral.src} alt={photos.livingNeutral.alt} fill sizes="(max-width: 800px) 100vw, 33vw" /></div>
            <div className="cost-body">
              <span className="icon-tile"><Icon name="home" /></span>
              <div>
                <h3>3 BHK interiors</h3>
                <p>Essential finish from {formatRange(three.low, three.high)}</p>
              </div>
              <a className="arrow-btn" href="#estimator" data-home="3 BHK" aria-label="Estimate a 3 BHK home">→</a>
            </div>
            <p className="cost-foot">Indicative · pending approval</p>
          </article>
          <article className="cost-card calc">
            <div className="cost-img"><Image src={photos.kitchenOak.src} alt={photos.kitchenOak.alt} fill sizes="(max-width: 800px) 100vw, 33vw" /></div>
            <div className="cost-body">
              <span className="icon-tile"><Icon name="calc" /></span>
              <div>
                <h3>Cost calculator</h3>
                <p>Pick a home size, finish level and add-ons for your own range.</p>
              </div>
              <a className="arrow-btn" href="#estimator" aria-label="Open the cost calculator">→</a>
            </div>
            <p className="cost-foot">Instant · no sign-up</p>
          </article>
        </div>
      </div>
    </section>
  );
}

export function ProjectsHeading() {
  return (
    <div className="projects-head">
      <Heading align="left" eyebrow="Concept spaces" sub="Illustrative interiors that show the direction we can design towards. Real Leor project photography will replace these as it is approved.">
        Spaces to <Gold>inspire</Gold> your home
      </Heading>
    </div>
  );
}

export function CtaBand({ title, text, cta = "Get a free consultation", href = "#enquire" }: { title: string; text?: string; cta?: string; href?: string }) {
  return (
    <div className="cta-inline">
      {text ? <p>{text}</p> : null}
      <a className="btn btn-gold" href={href} aria-label={title}>
        {cta} <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}

const highlights = [
  ["pin", "Hebbal", "Studio base in Bangalore", "Serving homeowners across the city."],
  ["home", "5", "Home sizes planned for", "1 BHK, 2 BHK, 3 BHK, 4 BHK and villas."],
  ["layers", "6", "Finishes to compare", "Oak, walnut, sage, midnight, ivory and fluted oak."],
  ["user", "3", "Finish levels", "Essential, Premium and Luxe budgets."],
] as const;

export function Highlights() {
  return (
    <section className="section" id="highlights">
      <div className="wrap split">
        <div>
          <Heading align="left" eyebrow="About Leor" sub="Straight facts about how we work. Project counts and client numbers will be added here once Leor confirms them.">
            What you can <Gold>count</Gold> on
          </Heading>
          <a className="btn btn-gold" href="#enquire">Talk to a designer <span aria-hidden="true">→</span></a>
        </div>
        <ul className="stat-grid">
          {highlights.map(([icon, big, label, note]) => (
            <li key={label}>
              <Icon name={icon} />
              <strong>{big}</strong>
              <span>{label}</span>
              <small>{note}</small>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const tiers = [
  { tag: "Practical", name: "Essential", photo: photos.wardrobeDressing, text: "Laminate-led finishes and smart storage for homes that need to work hard every day.", meta: "Multiplier ×1.0" },
  { tag: "Mid-range", name: "Premium", photo: photos.bedroomFeature, text: "Richer veneers, matte and PU finishes, and feature walls that give rooms a signature look.", meta: "Multiplier ×1.5" },
  { tag: "Bespoke", name: "Luxe", photo: photos.villaArched, text: "Premium veneers and detailed fluting for homes where every surface is considered.", meta: "Multiplier ×2.2" },
];

export function Packages() {
  return (
    <section className="section tint" id="packages">
      <div className="wrap">
        <Heading eyebrow="Design options" sub="Three finish levels that drive the calculator above. Inclusions will be confirmed in your written proposal.">
          Choose your <Gold>level of finish</Gold>
        </Heading>
        <div className="tier-grid">
          {tiers.map((tier) => (
            <article key={tier.name} className="tier-card">
              <span className="tier-tag">{tier.tag}</span>
              <div className="tier-img"><Image src={tier.photo.src} alt={tier.photo.alt} fill sizes="(max-width: 800px) 100vw, 33vw" /></div>
              <div className="tier-body">
                <h3>{tier.name} interiors</h3>
                <p>{tier.text}</p>
                <a className="arrow-btn" href="#estimator" aria-label={`Estimate with ${tier.name} finish`}>→</a>
              </div>
              <p className="tier-foot">{tier.meta}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const whys = [
  ["layers", "Material clarity", "Know what goes into each finish before you decide."],
  ["tag", "Clear budgets", "See a range early, with a breakdown you can follow."],
  ["grid", "Fitted to your home", "Storage and layouts planned around your actual rooms."],
  ["check", "Choice of finishes", "Compare oak, walnut, fluted and painted finishes."],
  ["doc", "Written proposal", "Scope and inclusions set out before you commit."],
  ["user", "One point of contact", "A single team to speak to from first call onwards."],
  ["pin", "Local to Bangalore", "A Hebbal studio that serves the city."],
  ["shield", "Honest process", "We tell you what is confirmed and what is still an estimate."],
] as const;

export function WhyLeor() {
  return (
    <section className="section" id="why">
      <div className="wrap why-grid">
        <div>
          <Heading align="left" eyebrow="The Leor approach" sub="Thoughtful design, a transparent process and a home you will enjoy living in.">
            More than interiors. <Gold>A better way to home.</Gold>
          </Heading>
          <ul className="why-list">
            {whys.map(([icon, title, text]) => (
              <li key={title}>
                <span className="ring"><Icon name={icon} /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
          <a className="btn btn-gold" href="#enquire">Start your interior journey <span aria-hidden="true">→</span></a>
        </div>
        <div className="why-photo">
          <Image src={photos.villaStaircase.src} alt={photos.villaStaircase.alt} fill sizes="(max-width: 900px) 100vw, 40vw" />
          <p>Spaces that feel like you</p>
        </div>
      </div>
    </section>
  );
}

const approach = [
  { step: "01", title: "Start with how you live", text: "We begin with your routines, your family and your budget, then plan layouts and storage around them before choosing a single finish.", photo: photos.livingBright },
  { step: "02", title: "Choose materials together", text: "Compare named finishes and levels side by side, and ask which brand and grade is used before you decide.", photo: photos.kitchenTimber },
  { step: "03", title: "Agree it in writing", text: "A written proposal sets out inclusions, exclusions and any changes, so you know what to expect before work begins.", photo: photos.bedroomFeature },
];

export function DesignApproach() {
  return (
    <section className="section tint" id="approach">
      <div className="wrap">
        <Heading eyebrow="Our design approach" sub="How we work with every home, from the first conversation to the written proposal. Client stories will be added once clients have agreed to share them.">
          Designed around <Gold>how you live</Gold>
        </Heading>
        <div className="approach-grid">
          {approach.map((item) => (
            <article key={item.step} className="approach-card">
              <div className="approach-photo">
                <Image src={item.photo.src} alt={item.photo.alt} fill sizes="(max-width: 860px) 100vw, 380px" />
                <span className="approach-step">{item.step}</span>
              </div>
              <div className="approach-body">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="approach-note">Photographs are illustrative stock images, not Leor projects.</p>
        <div className="center"><a className="btn btn-gold" href="#contact">Book a studio visit <span aria-hidden="true">→</span></a></div>
      </div>
    </section>
  );
}
export function DesignerCta() {
  return (
    <section className="section" id="designer">
      <div className="wrap designer">
        <div className="designer-photo"><Image src={photos.wardrobeWalkIn.src} alt={photos.wardrobeWalkIn.alt} fill sizes="(max-width: 900px) 100vw, 45vw" /></div>
        <div className="designer-copy">
          <p className="eyebrow">Talk to a designer</p>
          <h2>Unsure where to <Gold>begin?</Gold></h2>
          <p>Tell us about your home and budget. We will help you decide what to do first and what can wait.</p>
          <div className="btn-row">
            <a className="btn btn-gold" href={phoneHref}>Call {phoneDisplay}</a>
            <a className="btn btn-outline" href={buildWhatsAppLink(site.whatsappMessage)} target="_blank" rel="noopener noreferrer"><WhatsAppMark /> WhatsApp</a>
          </div>
        </div>
      </div>
    </section>
  );
}

const compareRows = [
  ["Budget", "A range you can adjust in the calculator", "Ask for a line-by-line breakdown"],
  ["Materials", "Named finishes and levels you can compare", "Ask which brand and grade is used"],
  ["Scope", "Inclusions and exclusions in a written proposal", "Ask what is not included"],
  ["Timeline", "Confirmed in the proposal for your home", "Ask for a dated schedule"],
  ["Changes", "Discussed and priced before work begins", "Ask how variations are charged"],
] as const;

export function Comparison() {
  return (
    <section className="section tint" id="compare">
      <div className="wrap narrow-lg">
        <Heading eyebrow="Choose with confidence" sub="Questions worth asking any interior designer, and how Leor answers them.">
          What makes us <Gold>different?</Gold>
        </Heading>
        <div className="compare" role="table" aria-label="How Leor compares with questions to ask any designer">
          <div className="compare-row head" role="row">
            <span role="columnheader">What you care about</span>
            <span role="columnheader" className="us">Leor Design</span>
            <span role="columnheader">Ask any designer</span>
          </div>
          {compareRows.map(([topic, us, ask]) => (
            <div key={topic} className="compare-row" role="row">
              <strong role="cell">{topic}</strong>
              <span role="cell" className="us"><i aria-hidden="true">✓</i>{us}</span>
              <span role="cell">{ask}</span>
            </div>
          ))}
        </div>
        <div className="center"><a className="btn btn-gold" href="#enquire">Get your free consultation <span aria-hidden="true">→</span></a></div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="final-cta">
      <div className="wrap">
        <h2>Ready to plan your <Gold>dream home?</Gold></h2>
        <p>Speak to Leor Design in Hebbal. Call, message us on WhatsApp, or book a consultation.</p>
        <div className="btn-row mid">
          <a className="btn btn-gold" href="#contact">Book a consultation <span aria-hidden="true">→</span></a>
          <a className="btn btn-outline light" href={phoneHref}>Call {phoneDisplay}</a>
        </div>
      </div>
    </section>
  );
}

const commitments = [
  ["doc", "Clear written scope", "We aim to set out what is and is not included before you commit."],
  ["tag", "Honest pricing", "Estimates are labelled as estimates until a proposal is agreed."],
  ["user", "Direct communication", "You will always have a named contact at the studio."],
  ["shield", "Your data, handled carefully", "We only use your details to respond to your enquiry."],
] as const;

export function Commitments() {
  return (
    <section className="section" id="commitments">
      <div className="wrap">
        <Heading eyebrow="Our commitments" sub="Draft wording pending Leor's final approval. Warranty and delivery terms will be added once confirmed.">
          Promises that build <Gold>better homes</Gold>
        </Heading>
        <ul className="commit-grid">
          {commitments.map(([icon, title, text]) => (
            <li key={title}>
              <span className="ring"><Icon name={icon} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ConsultationSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="section tint" id="contact">
      <div className="wrap contact-grid">
        <div>
          <Heading align="left" eyebrow="Book a consultation" sub="Share a few details and we will help you plan the next step.">
            Let&apos;s design your <Gold>home</Gold>
          </Heading>
          <ul className="contact-list">
            <li><Icon name="phone" /><a href={phoneHref}>{phoneDisplay}</a></li>
            <li><Icon name="phone" /><a href={alternatePhoneHref}>{alternatePhoneDisplay}</a></li>
            <li><Icon name="pin" /><span>{site.address}</span></li>
          </ul>
        </div>
        <div className="form-card">{children}</div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <p className="footer-brand">Leor <small>Design</small></p>
          <p>Home interiors in Bangalore.</p>
        </div>
        <div>
          <h3>Contact</h3>
          <p><a href={phoneHref}>{phoneDisplay}</a> · <a href={alternatePhoneHref}>{alternatePhoneDisplay}</a></p>
          <p><a href={buildWhatsAppLink(site.whatsappMessage)} target="_blank" rel="noopener noreferrer">WhatsApp {phoneDisplay}</a></p>
          <p>{site.address}</p>
        </div>
        <div>
          <h3>Explore</h3>
          <p><a href="#projects">Projects</a></p>
          <p><a href="#estimator">Cost estimator</a></p>
          <p><a href="#faq">FAQs</a></p>
          <p><a href="/privacy">Privacy</a></p>
        </div>
      </div>
      <div className="wrap footer-legal" id="offer-terms">
        <p>
          Offer terms: the 10% offer is a front-end preview. Eligibility, validity and the discount scope are pending confirmation by Leor Design, and no codes are issued online.
        </p>
        <p>Images are illustrative Unsplash stock photographs. Prices are placeholders pending approval. © {site.companyName}.</p>
      </div>
    </footer>
  );
}

export { Heading, Gold };

