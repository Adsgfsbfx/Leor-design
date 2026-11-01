import { PremiumImage } from "../../../components/ui/premium-image";
import { photos } from "../../../src/config/images";
import { materialBrands, projectTerms } from "../../../src/config/budget-details";
import {
  alternatePhoneDisplay,
  alternatePhoneHref,
  buildWhatsAppLink,
  phoneDisplay,
  phoneHref,
  site,
} from "../../../src/config/site";
import { WhatsAppMark, LeadForm } from "./forms";
import HeroVideo from "./hero-video";
import { Estimator } from "./interactive";

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
      <HeroVideo />
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
    </section>
  );
}

const services = [
  { icon: "home", title: "Full home interiors", description: "Complete interiors for every room, including kitchens, wardrobes, TV units, bedrooms and ceilings.", note: `Typical timeline: ${projectTerms[0].value}; ${projectTerms[0].note.toLowerCase()}.` },
  { icon: "grid", title: "Commercial interiors", description: "Functional interiors for small offices, clinics, studios and shops.", note: "" },
  { icon: "layers", title: "Civil works", description: "Breaking walls, new bathrooms, flooring and tiling.", note: "" },
  { icon: "check", title: "Lived-in home renovation", description: "Refresh and improve your home while working around the way you live.", note: "" },
  { icon: "home", title: "Modular kitchens and wardrobes", description: "Standalone modular kitchen and wardrobe projects, planned for your space.", note: `Warranty: ${projectTerms[1].value} on modular work and ${projectTerms[2].value} on hardware.` },
  { icon: "calc", title: "Other home works", description: "False ceilings, painting, wallpaper, electrical and plumbing works.", note: "" },
] as const;

export function Services() {
  return (
    <section className="section services-section" id="services">
      <div className="wrap">
        <Heading eyebrow="Our services" sub="From complete interiors to focused upgrades, get the work your space needs from one team.">
          Thoughtful work for <Gold>every space</Gold>
        </Heading>
        <ul className="services-grid">
          {services.map((service) => (
            <li className="service-card" key={service.title}>
              <span className="service-icon"><Icon name={service.icon} /></span>
              <div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                {service.note ? <p className="service-note">{service.note}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function CostCards() {
  return (
    <section className="section tint" id="cost">
      <div className="wrap">
        <Heading eyebrow="Plan with confidence" sub="Indicative planning budgets for different home sizes. Final pricing follows a site visit and written proposal.">
          Home interior cost in <Gold>Bangalore</Gold>
        </Heading>
        <div className="budget-overview">
          <div className="budget-brands">
            <h3>Brands used</h3>
            <dl>
              {materialBrands.map((item) => (
                <div key={item.category}><dt>{item.category}</dt><dd>{item.brands}</dd></div>
              ))}
            </dl>
          </div>
        </div>
        <div className="cost-grid compact-budget-grid">
          <article className="cost-card compact-budget-card">
            <PremiumImage className="cost-img compact-budget-image" src={photos.livingBright.src} alt={photos.livingBright.alt} sizes="140px" ratio="1 / 1" />
            <div className="cost-body compact-budget-body">
              <span className="icon-tile"><Icon name="grid" /></span>
              <div>
                <h3>1 BHK interiors</h3>
                <p className="compact-budget-caption">Interior planning budget</p>
                <p className="compact-budget-price compact-budget-price-single"><span>1 BHK</span><strong>₹2L</strong></p>
              </div>
            </div>
            <a className="compact-budget-cta compact-budget-foot" href="#estimator" data-home="1 BHK" aria-label="Estimate a 1 BHK home">Estimate 1 BHK <span aria-hidden="true">→</span></a>
          </article>
          <article className="cost-card compact-budget-card combined featured">
            <PremiumImage className="cost-img compact-budget-image" src={photos.kitchenOak.src} alt={photos.kitchenOak.alt} sizes="140px" ratio="1 / 1" />
            <div className="cost-body compact-budget-body">
              <span className="icon-tile"><Icon name="home" /></span>
              <div>
                <h3>2 &amp; 3 BHK interiors</h3>
                <p className="compact-budget-caption">Interior planning budgets</p>
                <p className="compact-budget-price compact-budget-price-row"><span>2 BHK</span><strong>₹3L</strong></p>
                <p className="compact-budget-price compact-budget-price-row"><span>3 BHK</span><strong>₹4–6L</strong></p>
              </div>
            </div>
            <a className="compact-budget-cta compact-budget-foot" href="#estimator" data-home="2 BHK" aria-label="Estimate a 2 or 3 BHK home">Estimate 2 / 3 BHK <span aria-hidden="true">→</span></a>
          </article>
          <article className="cost-card compact-budget-card calculator-option">
            <PremiumImage className="cost-img compact-budget-image" src={photos.livingNeutral.src} alt={photos.livingNeutral.alt} sizes="140px" ratio="1 / 1" />
            <div className="cost-body compact-budget-body">
              <span className="icon-tile"><Icon name="calc" /></span>
              <div>
                <h3>Calculate your budget</h3>
                <p className="compact-budget-caption">Get an estimate for your home.</p>
                <p className="compact-budget-detail">Select your BHK, finish and add-ons.</p>
              </div>
            </div>
            <a className="compact-budget-cta compact-budget-foot" href="#estimator">Open cost calculator <span aria-hidden="true">→</span></a>
          </article>
        </div>
        <div className="compact-budget-calculator" id="estimator">
          <div className="compact-budget-calculator-heading">
            <span className="eyebrow">Budget estimator</span>
            <p>Choose your home size, finish and add-ons to see an instant estimate.</p>
          </div>
          <Estimator />
        </div>
      </div>
    </section>
  );
}

export function ProjectsHeading() {
  return (
    <div className="projects-head">
      <Heading align="left" eyebrow="Concept spaces" sub="Explore considered spaces shaped around your home, lifestyle and everyday rituals.">
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
  ["home", "80+", "Homes completed", "Interiors planned and delivered by Leor."],
  ["user", "6+", "Years of experience", "Experience across interior design and renovation."],
  ["clock", "24 hrs", "Open every day", "Available for enquiries and project support."],
] as const;

export function Highlights() {
  return (
    <section className="section" id="highlights">
      <div className="wrap split">
        <div>
          <Heading align="left" eyebrow="About Leor" sub="A little about our experience, availability and design studio in Hebbal.">
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
        <PremiumImage className="why-photo" variant="arch" src={photos.villaStaircase.src} alt={photos.villaStaircase.alt} sizes="(max-width: 960px) 100vw, (max-width: 1280px) 50vw, 40vw" ratio="16 / 9" overlay>
          <p>Spaces that feel like you</p>
        </PremiumImage>
      </div>
    </section>
  );
}

export function DesignerCta() {
  return (
    <section className="section" id="designer">
      <div className="wrap designer">
        <PremiumImage className="designer-photo" src={photos.wardrobeWalkIn.src} alt={photos.wardrobeWalkIn.alt} sizes="(max-width: 960px) 100vw, (max-width: 1280px) 50vw, 45vw" ratio="16 / 9" />
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
        <div className="form-card" id="enquire">{children}</div>
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
        <p>Images are illustrative Unsplash stock photographs. Budgets are indicative and confirmed after a site visit. © {site.companyName}.</p>
      </div>
    </footer>
  );
}

export { Heading, Gold };

