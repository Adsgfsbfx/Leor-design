import { interiorImages } from "../../../src/config/images";
import {
  packageRates,
  phoneDisplay,
  phoneHref,
  sampleTestimonialsPlaceholder,
  site,
} from "../../../src/config/site";
import {
  CostEstimator,
  EnquiryForm,
  FAQAccordion,
  FloatingWhatsAppButton,
  Header,
  HeroImage,
  MobileActionBar,
  ProjectGallery,
  SampleImage,
  WhatsAppButton,
} from "./interactive";

const packages = [
  {
    name: "Essential",
    note: "A thoughtful start",
    rate: packageRates.essential,
    description: "Good design foundations, with considered choices for the spaces you use every day.",
    features: ["Space planning", "Core finish selections", "Modular kitchen & storage", "Installation coordination"],
  },
  {
    name: "Signature",
    note: "Our considered edit",
    rate: packageRates.signature,
    description: "A more expressive, joined-up home with room for the details that make it yours.",
    features: ["Everything in Essential", "Personalised design direction", "Expanded material palette", "Custom detail options"],
    featured: true,
  },
  {
    name: "Bespoke",
    note: "Made around you",
    rate: packageRates.bespoke,
    description: "A deeply personal design journey shaped around your home, routines, and point of view.",
    features: ["Everything in Signature", "Bespoke design development", "Curated finish consultation", "Tailored scope & detailing"],
  },
];

const processSteps = [
  ["01", "Listen & understand", "We start with your home, your priorities, and the way you want it to feel."],
  ["02", "Shape the design", "Together, we develop a direction, layouts, material choices, and a clear scope."],
  ["03", "Plan the details", "Selections, drawings, and project expectations are aligned before work begins."],
  ["04", "Bring it to life", "We coordinate the agreed work through installation and a considered handover."],
];

const reasons = [
  ["Personal, not prescriptive", "A design conversation that begins with how you live—not a one-size-fits-all template."],
  ["Clear from the outset", "A written scope and transparent estimate before you commit to a direction."],
  ["Considered choices", "Materials and details chosen for the balance of beauty, everyday use, and budget."],
  ["One connected journey", "Design decisions and delivery planning shaped to work together from the beginning."],
];

const materials = [
  ["01", "Natural woods", "Warmth, grain, and a tactile sense of home."],
  ["02", "Stone & surfaces", "Quiet character for hardworking, well-used spaces."],
  ["03", "Textiles", "Softness, pattern, and an inviting finish."],
  ["04", "Metals & details", "Subtle accents that bring a room into focus."],
];

const serviceDetails = {
  "living-room": {
    description: "A welcoming balance of comfort, flow, light, and the pieces you love.",
    icon: "⌂",
    points: ["Space planning", "Lighting and finishes", "Furniture and storage"],
  },
  bedroom: {
    description: "Restful rooms with thoughtful storage and a softer end to the day.",
    icon: "☾",
    points: ["Bedroom layouts", "Wardrobe planning", "Comfort-led finishes"],
  },
  "modular-kitchen": {
    description: "Hard-working layouts, considered finishes, and room for everyday rituals.",
    icon: "✳",
    points: ["Kitchen planning", "Storage solutions", "Surface selections"],
  },
  wardrobe: {
    description: "Storage planned around your belongings, routines, and available space.",
    icon: "▤",
    points: ["Built-in storage", "Internal organisation", "Finish choices"],
  },
  "complete-home": {
    description: "A cohesive design language carried from the first room to the last detail.",
    icon: "⌂",
    points: ["Whole-home design", "Coordinated finishes", "Delivery coordination"],
  },
  "dining-area": {
    description: "A considered place to gather, share meals, and spend time together.",
    icon: "◌",
    points: ["Dining layouts", "Lighting and finishes", "Comfortable circulation"],
  },
  painting: {
    description: "Interior wall painting and finishing work, planned around your home.",
    icon: "✦",
    points: ["Interior wall painting", "Touch-ups and finishes", "Painting coordination"],
  },
  "electrical-work": {
    description: "Electrical finishing for lighting, switches, wiring, and fixtures.",
    icon: "✧",
    points: ["Lighting and switches", "Wiring and new points", "Fixture installation"],
  },
} as const;

const comparisonRows = [
  ["Space planning", true, true, true],
  ["Material & finish guidance", "Core", "Expanded", "Curated"],
  ["Modular kitchen & storage", true, true, true],
  ["Personalised design direction", false, true, true],
  ["Custom detailing", "Selected", "Expanded", "Bespoke"],
  ["Project scope", "Defined essentials", "Whole-home edit", "Tailored together"],
];

function IndianRupees({ amount }: { amount: number }) {
  return <>₹{amount.toLocaleString("en-IN")}<span className="rate-unit"> / sq.ft.</span></>;
}

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <section className="hero-section" id="home">
          <div className="hero-copy">
            <p className="eyebrow"><span /> Interiors, thoughtfully made in Bengaluru</p>
            <h1>A home that feels<br />a little more <em>you.</em></h1>
            <p className="hero-description">
              Thoughtful design. A clear process. A home shaped around the way you really live.
            </p>
            <div className="hero-links">
              <a className="button button-dark" href="#contact"><span className="desktop-cta">Let’s talk about your home</span><span className="mobile-cta">Get Free Quote</span><span aria-hidden="true">↗</span></a>
              <a className="button button-outline hero-secondary" href="#portfolio"><span className="desktop-cta">Explore the spaces</span><span className="mobile-cta">See our work</span><span aria-hidden="true">↓</span></a>
              <WhatsAppButton
                className="button button-whatsapp hero-whatsapp"
                source="hero"
                message="Hi Leor Design, I'd like a free quote for my home interiors."
              >
                WhatsApp
              </WhatsAppButton>
            </div>
            <div className="hero-service-chips" aria-label="Interior design and finishing services">
              <span>Interior design</span><span>Painting</span><span>Electrical work</span>
            </div>
            <div className="hero-footnote">
              <span className="mini-mark">L</span>
              <span>{site.companyName}<small>Based in {site.address} · {site.serviceArea}</small></span>
            </div>
          </div>
          <div className="hero-visual">
            <HeroImage />
            <div className="hero-form-card">
              <div className="form-card-heading">
                <div>
                  <p className="eyebrow">A good place to begin</p>
                  <h2>Tell us about home.</h2>
                </div>
                <span className="form-card-arrow" aria-hidden="true">↘</span>
              </div>
              <EnquiryForm compact />
            </div>
          </div>
          <a className="scroll-cue" href="#promise"><span /> Scroll to explore</a>
        </section>

        <section aria-label="How we work" className="promise-strip" id="promise">
          <div className="promise-item"><span className="promise-icon">01</span><span>Designed around<small>your everyday</small></span></div>
          <div className="promise-item"><span className="promise-icon">02</span><span>Thoughtful material<small>& finish guidance</small></span></div>
          <div className="promise-item"><span className="promise-icon">03</span><span>Clear scope<small>before we begin</small></span></div>
          <div className="promise-item"><span className="promise-icon">04</span><span>Snag & finishing<small>painting and electrical</small></span></div>
        </section>

        <section className="section packages-section" id="packages">
          <div className="section-heading">
            <div>
              <p className="eyebrow">A starting point, not a rulebook</p>
              <h2>Good design,<br /><em>your kind of considered.</em></h2>
            </div>
            <p className="section-intro">
              A few ways to begin thinking about your home. Every project is scoped around your space and priorities.
            </p>
          </div>
          <div className="package-grid">
            {packages.map((item, index) => (
              <article className={`package-card${item.featured ? " package-featured" : ""}`} key={item.name}>
                <div className="package-topline"><span>0{index + 1} / {item.name}</span>{item.featured && <span className="package-tag">A considered balance</span>}</div>
                <h3>{item.name}</h3>
                <p className="package-note">{item.note}</p>
                <p className="package-rate"><IndianRupees amount={item.rate} /></p>
                <p className="package-description">{item.description}</p>
                <ul>{item.features.map((feature) => <li key={feature}><span aria-hidden="true">＋</span>{feature}</li>)}</ul>
                <a className="text-link" href="#contact">Explore this direction <span aria-hidden="true">↗</span></a>
              </article>
            ))}
          </div>
          <p className="estimate-disclaimer">Indicative, editable estimates only—not a quote. Final pricing depends on site measurements, scope, materials, and confirmed specifications.</p>
        </section>

        <section className="section estimator-section" id="estimator">
          <div className="estimator-intro">
            <p className="eyebrow">A little clarity, right at the start</p>
            <h2>Let’s find a<br /><em>comfortable range.</em></h2>
            <p>Adjust the home size and finish direction to get a rough planning figure. No pressure, just a place to start.</p>
            <span className="estimate-label">Planning tool · estimates are illustrative</span>
          </div>
          <CostEstimator />
        </section>

        <section className="section portfolio-section" id="portfolio">
          <div className="section-heading">
            <div><p className="eyebrow">Rooms, moods & possibilities</p><h2>Space to imagine<br /><em>what’s possible.</em></h2></div>
            <p className="section-intro">A visual starting point for the conversations we’ll have about your home, your materials, and the details that matter to you.</p>
          </div>
          <ProjectGallery />
        </section>

        <section className="section services-section" id="spaces">
          <div className="section-heading">
            <div><p className="eyebrow">Room by room, or all at once</p><h2>Made for the way<br /><em>you move through home.</em></h2></div>
            <p className="section-intro">From one room that needs a rethink to a whole home with a story to tell, let’s make the plan feel like yours.</p>
          </div>
          <div className="services-grid">
            {interiorImages.map((service, index) => {
              const details = serviceDetails[service.id];
              return (
                <article className="service-card" key={service.id}>
                  <div className="service-image sample-image-frame">
                    <SampleImage
                      alt={service.alt}
                      isSample={service.isSample}
                      label={service.label}
                      sizes="(max-width: 767px) 50vw, (max-width: 1050px) 50vw, 33vw"
                      src={service.src}
                    />
                    <span className="service-number">0{index + 1}</span>
                  </div>
                  <span aria-hidden="true" className="service-icon">{details.icon}</span>
                  <h3>{service.label}</h3>
                  <p>{details.description}</p>
                  <ul className="service-points">{details.points.map((point) => <li key={point}>{point}</li>)}</ul>
                  <WhatsAppButton
                    className="service-whatsapp"
                    source="service card"
                    message={`Hi Leor Design, I'm interested in ${service.label}.`}
                  >
                    Ask about {service.label} <span aria-hidden="true">↗</span>
                  </WhatsAppButton>
                </article>
              );
            })}
          </div>
          <p className="image-disclaimer">Sample images shown. Leor&apos;s completed projects will replace these.</p>
        </section>

        <section className="section process-section" id="process">
          <div className="process-side">
            <p className="eyebrow">Clear steps, considered decisions</p>
            <h2>Good things<br />take <em>good listening.</em></h2>
            <p>There’s no need to have it all figured out. We’ll work through the important decisions with you, one thoughtful step at a time.</p>
            <a className="button button-outline" href="#contact">Start with a conversation <span aria-hidden="true">↗</span></a>
          </div>
          <div className="process-steps">
            {processSteps.map(([number, title, copy]) => (
              <article className="process-step" key={number}>
                <span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div><span className="step-cross" aria-hidden="true">↗</span>
              </article>
            ))}
          </div>
        </section>

        <section className="section why-section" id="why-leor">
          <div className="why-image">
            <SampleImage
              alt={interiorImages[0].alt}
              isSample={interiorImages[0].isSample}
              label={interiorImages[0].label}
              sizes="(max-width: 760px) 100vw, 40vw"
              src={interiorImages[0].src}
            />
            <span>Designing for the everyday, beautifully.</span>
          </div>
          <div className="why-copy">
            <p className="eyebrow">A studio that starts with you</p>
            <h2>Care in the details.<br /><em>Clarity in the process.</em></h2>
            <p className="why-lead">A home is more than the sum of its finishes. We bring care, curiosity, and a clear point of view to the decisions that make it yours.</p>
            <div className="reason-list">{reasons.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div>
          </div>
        </section>

        <section className="section materials-section" id="materials">
          <div className="materials-heading">
            <div><p className="eyebrow">A palette with purpose</p><h2>Feel the difference<br /><em>in the details.</em></h2></div>
            <p>Beautiful choices should feel good to live with, too. We’ll help you compare the look, care, and everyday practicality of the finishes available for your project.</p>
          </div>
          <div className="material-swatches">
            {materials.map(([number, title, description], index) => (
              <article className="material-card" key={title}>
                <div className={`material-swatch swatch-${index + 1}`}><span>{number}</span></div>
                <h3>{title}</h3><p>{description}</p>
              </article>
            ))}
          </div>
          <p className="estimate-disclaimer">Illustrative material categories only. Exact products, brands, and availability are confirmed during project planning.</p>
        </section>

        <section className="section comparison-section" id="compare">
          <div className="section-heading">
            <div><p className="eyebrow">The details, side by side</p><h2>Find the right<br /><em>place to begin.</em></h2></div>
            <p className="section-intro">A transparent conversation about what’s in scope, what matters most, and where your investment can go.</p>
          </div>
          <div className="comparison-wrap">
            <table className="comparison-table">
              <thead><tr><th scope="col">What’s included</th>{packages.map((item) => <th scope="col" key={item.name}>{item.name}<small>From ₹{item.rate.toLocaleString("en-IN")} / sq.ft.</small></th>)}</tr></thead>
              <tbody>{comparisonRows.map(([label, ...values]) => <tr key={String(label)}><th scope="row">{label}</th>{values.map((value, index) => <td key={`${label}-${index}`}>{typeof value === "boolean" ? (value ? <span aria-label="Included" className="check-mark">✓</span> : <span aria-label="Not included" className="not-included">—</span>) : value}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <p className="estimate-disclaimer">Illustrative comparison only. Package rates are editable estimates, not a confirmed price list. Every final proposal is tailored to the agreed brief.</p>
        </section>

        <section className="section stories-section" id="stories">
          <div className="stories-heading"><p className="eyebrow">A space saved for your story</p><h2>Good homes are personal.<br /><em>So are the stories.</em></h2></div>
          <div className="sample-notice">SAMPLE PLACEHOLDERS · These are not genuine customer reviews. Replace with approved client feedback before publishing.</div>
          <div className="story-grid">
            {[1, 2, 3].map((item) => <article className="story-card" key={item}><span className="story-quote" aria-hidden="true">“</span><p>{sampleTestimonialsPlaceholder}</p><div className="story-byline"><span className="story-avatar">L</span><span>Client name to be added<small>Project details to be confirmed</small></span></div><span className="story-placeholder-label">Sample content placeholder</span></article>)}
          </div>
        </section>

        <section className="section faq-section" id="faqs">
          <div className="faq-heading"><p className="eyebrow">A few useful first answers</p><h2>Questions,<br /><em>before the first hello.</em></h2><p>Still wondering about something specific? Tell us about your home and we’ll take it from there.</p><a className="text-link" href="#contact">Ask us directly <span aria-hidden="true">↗</span></a></div>
          <FAQAccordion />
        </section>

        <section className="contact-section" id="contact">
          <div className="contact-heading">
            <p className="eyebrow">The first step is a conversation</p>
            <h2>Let’s make room<br />for <em>what matters.</em></h2>
            <p>Tell us a little about your home. We’ll get back to you to understand the brief and see if we’re the right fit.</p>
            <div className="contact-note"><span className="contact-dot" />{site.address}<small>{site.serviceArea}</small></div>
            <WhatsAppButton
              className="whatsapp-link"
              source="enquiry form"
              message="Hi Leor Design, I'd like a free quote for my home interiors."
            >
              Chat on WhatsApp
            </WhatsAppButton>
            <a className="phone-link" href={phoneHref}>{phoneDisplay} <span>Call Leor Design</span></a>
          </div>
          <div className="contact-form-card">
            <p className="eyebrow">A few details to get us started</p>
            <EnquiryForm />
          </div>
        </section>

        <section className="closing-cta">
          <div className="closing-mark">L.</div>
          <p className="eyebrow">Your home, your next chapter</p>
          <h2>Let’s begin with<br /><em>a good conversation.</em></h2>
          <a className="button button-light" href="#contact">Tell us what you’re imagining <span aria-hidden="true">↗</span></a>
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <a aria-label="Leor Design home" className="wordmark footer-wordmark" href="#home">leor<span>®</span><small>DESIGN STUDIO · BANGALORE</small></a>
            <p>Thoughtful interiors, shaped around the way you live.</p>
            <span className="footer-location">{site.address}<br />{site.serviceArea}</span>
          </div>
          <div className="footer-column"><h2>Our services</h2><a href="#spaces">Living rooms & bedrooms</a><a href="#spaces">Kitchens & wardrobes</a><a href="#spaces">Complete homes</a><a href="#spaces">Painting & electrical</a><a href="#portfolio">Visual inspiration</a></div>
          <div className="footer-column"><h2>Good to know</h2><a href="#materials">Materials & finishes</a><a href="#compare">Package comparison</a><a href="#faqs">Frequently asked</a><a href="#contact">Consultation</a></div>
          <div className="footer-column footer-contact"><h2>Say hello</h2><a href="#contact">Send an enquiry <span aria-hidden="true">↗</span></a><WhatsAppButton className="footer-whatsapp" source="footer">WhatsApp us <span aria-hidden="true">↗</span></WhatsAppButton><a href={phoneHref}>{phoneDisplay} <span aria-hidden="true">↗</span></a><small>Email placeholder: {site.businessEmailPlaceholder}</small></div>
        </div>
        <div className="footer-bottom"><span>© {site.companyName}. All rights reserved.</span><span>Thoughtful interiors in Bangalore</span><a href="/privacy">Privacy</a><a href="#home">Back to top ↑</a></div>
      </footer>
      <MobileActionBar />
      <FloatingWhatsAppButton />
    </>
  );
}
