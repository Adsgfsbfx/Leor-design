import { PremiumImage } from "../../../components/ui/premium-image";
import Image from "next/image";
import { photos } from "../../../src/config/images";
import { projectTerms } from "../../../src/config/budget-details";
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
import { FadeUpListItem } from "../../../components/ui/motion";
import { CookiePreferencesLink } from "../cookie-preferences-link";
import { ConsultationLink } from "./consultation-link";
import { EstimatorLink } from "./estimator-link";
import TestimonialsCarousel from "./testimonials-carousel";

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
            Interior Designers in <Gold>Bangalore</Gold>
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
        <p className="services-mobile-heading" aria-hidden="true">Featured Services</p>
        <Heading eyebrow="Our services" sub="For homeowners comparing home interior designers in Bangalore, we plan complete interiors and focused upgrades around the way you live.">
          Thoughtful work for <Gold>every space</Gold>
        </Heading>
        <ul className="services-grid">
          {services.map((service) => (
            <li key={service.title}>
              <ConsultationLink className="service-card" href="#enquire" label={`Get a free consultation about ${service.title}`}>
                <span className="service-icon"><Icon name={service.icon} /></span>
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  {service.note ? <p className="service-note">{service.note}</p> : null}
                </div>
              </ConsultationLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const brandVisuals = [
  { brand: "Century", material: "Plywood", logo: "https://www.centuryply.com/uploads/logo_6f13da0c06.png" },
  { brand: "Greenply", material: "Plywood", logo: "https://www.greenply.com/assets/images/logo.svg" },
  { brand: "Country", material: "Plywood", logo: null },
  { brand: "Ebco", material: "Hardware", logo: "https://toolswarehouse.in/cdn/shop/collections/ebco_logo.png?crop=center&height=1200&v=1767943599&width=1200" },
  { brand: "Häfele", material: "Hardware", logo: "https://home.hafeleindia.com/cdn/shop/files/Logo6.png?width=240" },
  { brand: "Hettich", material: "Hardware", logo: "https://upload.wikimedia.org/wikipedia/commons/1/15/Logo_of_Hettich_%28company%29.svg" },
  { brand: "Merino", material: "Laminates", logo: "https://3adeal.com/images/thumbnails/904/500/detailed/5/merino_logo.png?t=1736319929" },
  { brand: "Greenlam", material: "Laminates", logo: "https://images.assettype.com/fortune-india/import/company/logos/Greenlam%20Industries%20Ltd.png" },
  { brand: "Virgo", material: "Laminates", logo: "https://online.fliphtml5.com/ajyyd/accountlogo.jpg" },
] as const;

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
            <ul className="brand-image-list">
              {brandVisuals.map((item) => (
                <li key={`${item.brand}-${item.material}`}>
                  <span className="brand-image-circle">
                    {item.logo ? <Image src={item.logo} alt="" width={68} height={68} unoptimized /> : <span className="brand-text-mark">Country</span>}
                  </span>
                  <strong>{item.brand}</strong>
                  <span>{item.material}</span>
                </li>
              ))}
            </ul>
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
            <EstimatorLink home="1 BHK" label="Estimate a 1 BHK home">Estimate 1 BHK <span aria-hidden="true">→</span></EstimatorLink>
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
            <EstimatorLink home="2 BHK" label="Estimate a 2 or 3 BHK home">Estimate 2 / 3 BHK <span aria-hidden="true">→</span></EstimatorLink>
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
            <EstimatorLink label="Open cost calculator">Open cost calculator <span aria-hidden="true">→</span></EstimatorLink>
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
      <Heading align="left" eyebrow="Interior inspiration">
        Spaces to <Gold>inspire</Gold> your home
      </Heading>
    </div>
  );
}

export function CtaBand({ title, text, cta = "Get a free consultation", href = "#enquire" }: { title: string; text?: string; cta?: string; href?: string }) {
  return (
    <div className="cta-inline">
      {text ? <p>{text}</p> : null}
      <ConsultationLink className="btn btn-gold" href={href} label={title}>
        {cta} <span aria-hidden="true">→</span>
      </ConsultationLink>
    </div>
  );
}

const highlights = [
  ["user", "6+", "Years of experience"],
  ["home", "80+", "Homes completed"],
  ["clock", "24 hrs", "Open every day"],
  ["pin", "Hebbal", "Our Bengaluru studio"],
] as const;

export function Highlights() {
  return (
    <section className="section about-metrics" id="highlights" aria-labelledby="about-metrics-title">
      <div className="wrap about-metrics-layout">
        <div className="about-metrics-intro">
          <p className="eyebrow">About us</p>
          <h2 id="about-metrics-title">We’re more than an interior design studio.</h2>
          <p>We shape thoughtful homes around the way you live, with clear choices and carefully considered details from our Hebbal studio.</p>
          <a
            className="btn btn-gold"
            href={buildWhatsAppLink("Hello Leor Design, I would like to discuss my home interior project.")}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Talk to a designer on WhatsApp"
          >
            <strong>Talk to Designer</strong><span aria-hidden="true">↗</span>
          </a>
        </div>
        <ul className="about-metrics-grid">
          {highlights.map(([icon, big, label], index) => (
            <FadeUpListItem key={label} className="about-metric" delay={index * 0.1}>
              <span className="about-metric-icon"><Icon name={icon} /></span>
              <span className="about-metric-copy">
                <strong>{big}</strong>
                <span>{label}</span>
              </span>
            </FadeUpListItem>
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
          <Heading align="left" eyebrow="The Leor approach" sub="For homeowners seeking luxury interior designers in Bangalore, a considered process starts with clear choices and a home you will enjoy living in.">
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
          <ConsultationLink className="btn btn-gold" href="#enquire" label="Start your interior journey">Start your interior journey <span aria-hidden="true">→</span></ConsultationLink>
        </div>
        <PremiumImage className="why-photo" variant="arch" src={photos.villaStaircase.src} alt={photos.villaStaircase.alt} sizes="(max-width: 960px) 100vw, (max-width: 1280px) 50vw, 40vw" ratio="16 / 9" overlay>
          <p>Spaces that feel like you</p>
        </PremiumImage>
      </div>
    </section>
  );
}

export function Testimonials() {
  const examples = [
    { name: "Ananya Mehta", initials: "AM", role: "Kitchen renovation", quote: "I used to clear the counter before I could even start cooking. Now there’s a spot for everything, and weeknight dinners feel a lot less chaotic." },
    { name: "Rohan Iyer", initials: "RI", role: "Full home interiors", quote: "We came in with a folder full of ideas and no real plan. They helped us pull it together and still made the place feel like our home." },
    { name: "Priya Sharma", initials: "PS", role: "Living room design", quote: "We barely used the living room before. Now my parents settle in there after lunch and somehow nobody wants to leave." },
    { name: "Arjun Nair", initials: "AN", role: "Wardrobe and storage", quote: "The new wardrobe fits the room properly, and we can finally find things in the morning. That alone has made me very happy." },
    { name: "Kavya Reddy", initials: "KR", role: "Bedroom interiors", quote: "I asked for a calm room that didn’t feel too serious. The colours and soft lighting are just right, especially at the end of a long day." },
    { name: "Vikram Patel", initials: "VP", role: "New home interiors", quote: "We were worried the budget would keep creeping up. They talked us through the options early, so there were no nasty surprises." },
    { name: "Meera Kulkarni", initials: "MK", role: "Dining area redesign", quote: "We kept changing our minds about the dining area. The new layout gives us room to have everyone over without blocking the way to the balcony." },
    { name: "Nikhil Bose", initials: "NB", role: "Home office", quote: "I work from home most days, so I wanted a proper desk setup that didn’t take over the spare room. It feels much easier to switch off at the end of the day now." },
    { name: "Sneha Menon", initials: "SM", role: "Kids’ bedroom", quote: "Our daughter has already claimed every shelf for her books and little projects. It’s lovely seeing her enjoy a room that was planned around her." },
    { name: "Aditya Rao", initials: "AR", role: "Apartment interiors", quote: "The apartment is not huge, so we wanted the storage to feel built in rather than bulky. The finished rooms feel open, and we have space for all the everyday things." },
    { name: "Ishita Das", initials: "ID", role: "Living and dining", quote: "We hosted our first family dinner last weekend. Everyone fit comfortably, and my mum immediately asked where we got the dining lights." },
    { name: "Sameer Khan", initials: "SK", role: "Renovation and finishes", quote: "I appreciated being shown the finish samples in our own space. It made the choices much easier than trying to picture everything from a catalogue." },
  ];

  return (
    <section className="section testimonials-section" id="testimonials">
      <div className="wrap">
        <Heading align="left" eyebrow="Made for your life, loved every day">
          Kind Words from the Homes We’ve Shaped
        </Heading>
        <TestimonialsCarousel reviews={examples} />
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
    <section className="section commitments-section" id="commitments">
      <div className="wrap">
        <Heading eyebrow="Our commitments" sub="Clear scope, honest estimates and thoughtful support at every step.">
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

export function Footer({ homeLinks = false }: { homeLinks?: boolean }) {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div className="footer-brand-column">
          <p className="footer-brand">Leor <small>Design</small></p>
          <p>Thoughtful residential and commercial interiors, planned around the way you live and work.</p>
          <p className="footer-area-note">Based in Hebbal, serving homes across Bangalore.</p>
        </div>
        <nav aria-label="Footer quick links">
          <h3>Explore</h3>
          <ul className="footer-link-list">
            <li><a href={homeLinks ? "/#top" : "#top"}>Home</a></li>
            <li><a href={homeLinks ? "/#highlights" : "#highlights"}>About</a></li>
            <li><a href={homeLinks ? "/#services" : "#services"}>Services</a></li>
            <li><a href={homeLinks ? "/#projects" : "#projects"}>Projects</a></li>
            <li><a href={homeLinks ? "/#why" : "#why"}>Design Process</a></li>
            <li><a href={homeLinks ? "/#estimator" : "#estimator"}>Cost Estimator</a></li>
            <li><a href={homeLinks ? "/#contact" : "#contact"}>Contact</a></li>
            <li><a href={homeLinks ? "/#faq" : "#faq"}>FAQs</a></li>
          </ul>
        </nav>
        <div>
          <h3>Our services</h3>
          <ul className="footer-link-list footer-service-list">
            <li>Residential and apartment interiors</li>
            <li>Villa interiors</li>
            <li>Kitchen, bedroom and living room interiors</li>
            <li>Commercial interiors</li>
            <li>Renovation and civil works</li>
            <li>Modular kitchens and wardrobes</li>
            <li>Painting, electrical and plumbing work</li>
          </ul>
        </div>
        <div>
          <h3>Contact</h3>
          <ul className="footer-link-list footer-contact-list">
            <li><a href={phoneHref}>Call: +91 {phoneDisplay}</a></li>
            <li><a href={alternatePhoneHref}>Alternate phone: +91 {alternatePhoneDisplay}</a></li>
            <li><a href={buildWhatsAppLink(site.whatsappMessage)} target="_blank" rel="noopener noreferrer">WhatsApp: +91 {phoneDisplay}</a></li>
            <li><span>Studio area: {site.address}</span></li>
            <li><span>Service area: {site.serviceArea}</span></li>
          </ul>
        </div>
      </div>
      <div className="wrap footer-legal">
        <div className="footer-legal-bottom">
          <p>© 2026 Leor Design. All rights reserved.</p>
          <nav className="footer-legal-links" aria-label="Legal information">
            <a href="/privacy">Privacy Policy</a>
            <a href="/privacy#terms">Terms and Conditions</a>
            <a href="/privacy#cookies">Cookie Policy</a>
            <CookiePreferencesLink />
            <a href="/privacy#disclaimer">Disclaimer</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
export { Heading, Gold };

