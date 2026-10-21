"use client";

import { useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import {
  enquiryServiceOptions,
  faqs,
  images,
  packageRates,
  projects,
  serviceAddOnEstimates,
  site,
} from "../../../src/config/site";

const navLinks = [
  ["Our approach", "#process"],
  ["Spaces", "#spaces"],
  ["Portfolio", "#portfolio"],
  ["Packages", "#packages"],
  ["FAQs", "#faqs"],
] as const;

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <a
          aria-label="Leor Design home"
          className="wordmark"
          href="#home"
          onClick={() => setMenuOpen(false)}
        >
          leor<span>®</span>
          <small>DESIGN STUDIO · BANGALORE</small>
        </a>
        <div className="header-meta">
          <a className="header-address" href="#contact">{site.address}<small>{site.serviceArea}</small></a>
          <a className="header-phone" href={`tel:${site.phoneNumber}`}>
            <span className="phone-icon" aria-hidden="true">☎</span>
            <span>{site.phoneDisplay}<small>Call Leor Design</small></span>
          </a>
        </div>
        <div className="header-mobile-actions">
          <a className="header-phone-icon" href={`tel:${site.phoneNumber}`} aria-label={`Call Leor Design at ${site.phoneDisplay}`}>
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.32.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.26.2 2.46.57 3.58a1 1 0 0 1-.24 1.02l-2.23 2.2Z" /></svg>
          </a>
          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            className={`menu-toggle${menuOpen ? " is-open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            type="button"
          >
            <span />
            <span />
          </button>
        </div>
        <nav aria-label="Main navigation" className={menuOpen ? "main-nav is-open" : "main-nav"}>
          {navLinks.map(([label, href]) => (
            <a href={href} key={href} onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
          <a className="button button-dark nav-cta" href="#contact" onClick={() => setMenuOpen(false)}>
            Book a consultation <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </div>
    </header>
  );
}

type FormStatus =
  | { kind: "idle"; message: "" }
  | { kind: "loading"; message: "Sending your enquiry…" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

function normalizeIndianMobile(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
}

export function EnquiryForm({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<FormStatus>({ kind: "idle", message: "" });
  const [servicesError, setServicesError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const servicesErrorId = compact ? "services-needed-error-compact" : "services-needed-error";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const enteredMobile = String(formData.get("mobile") ?? "").trim();
    const mobile = normalizeIndianMobile(enteredMobile);
    const servicesNeeded = formData.getAll("servicesNeeded").map(String);
    setServicesError("");
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setStatus({ kind: "error", message: "Enter a valid Indian mobile number, with or without +91." });
      form.querySelector<HTMLInputElement>('[name="mobile"]')?.focus();
      return;
    }
    if (servicesNeeded.length === 0) {
      setServicesError("Choose at least one service.");
      setStatus({ kind: "error", message: "Choose at least one service to continue." });
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setStatus({ kind: "loading", message: "Sending your enquiry…" });
    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          mobile,
          email: formData.get("email"),
          propertyType: formData.get("propertyType"),
          locality: formData.get("locality"),
          requirements: formData.get("requirements"),
          servicesNeeded,
        }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(result.message || "We couldn't send your enquiry. Please try again.");
      }
      setStatus({
        kind: "success",
        message: "Your enquiry is with us. We’ll be in touch soon.",
      });
      form.reset();
    } catch (error) {
      setStatus({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "We couldn't send your enquiry. Please try again.",
      });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <form
      className={`enquiry-form${compact ? " enquiry-form-compact" : ""}`}
      onSubmit={handleSubmit}
      aria-busy={status.kind === "loading"}
    >
      <div className="form-grid">
        <label>
          Your name
          <input autoComplete="name" name="name" placeholder="e.g. Aditi Rao" required />
        </label>
        <label>
          Mobile number
          <input
            autoComplete="tel-national"
            inputMode="tel"
            maxLength={14}
            name="mobile"
            pattern="(\+91 ?)?[6-9][0-9]{9}"
            placeholder="8050414570 or +91 8050414570"
            required
            title="Enter a valid 10-digit Indian mobile number, optionally prefixed by +91."
            type="tel"
          />
        </label>
        <label>
          Email address
          <input autoComplete="email" name="email" placeholder="you@example.com" required type="email" />
        </label>
        <label>
          Home type
          <select defaultValue="" name="propertyType" required>
            <option disabled value="">Choose one</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa / independent home</option>
            <option value="Renovation">Renovation</option>
            <option value="Other">Something else</option>
          </select>
        </label>
        <label>
          Your locality
          <input autoComplete="address-level2" name="locality" placeholder="e.g. Hebbal" required />
        </label>
        <label className="form-requirements">
          What are you looking for?
          <textarea
            name="requirements"
            placeholder="A little about your home, rooms, or ideas…"
            required
            rows={2}
          />
        </label>
        <fieldset aria-describedby={servicesError ? servicesErrorId : undefined} className="services-needed">
          <legend>Services needed <span>(choose all that apply)</span></legend>
          <div className="service-checkbox-grid">
            {enquiryServiceOptions.map((service) => (
              <label key={service}>
                <input name="servicesNeeded" type="checkbox" value={service} onChange={() => {
                  if (servicesError) {
                    setServicesError("");
                    setStatus({ kind: "idle", message: "" });
                  }
                }} />
                <span>{service}</span>
              </label>
            ))}
          </div>
          {servicesError && <span className="services-error" id={servicesErrorId}>{servicesError}</span>}
        </fieldset>
      </div>
      <div className="form-submit-row">
        <button className="button button-dark form-submit" disabled={submitting} type="submit">
          {submitting ? "Sending…" : "Request a conversation"}
          {!submitting && <span aria-hidden="true">↗</span>}
        </button>
        <span className="form-privacy">Your details stay between us.</span>
      </div>
      <p aria-live="polite" className={`form-status status-${status.kind}`} role={status.kind === "error" ? "alert" : "status"}>
        {status.message}
      </p>
      <div className="enquiry-contact-details">
        <a href={`tel:${site.phoneNumber}`}>{site.phoneDisplay}</a>
        <span>{site.address}</span>
      </div>
    </form>
  );
}

const estimatePackages = [
  { id: "essential", label: "Essential", rate: packageRates.essential },
  { id: "signature", label: "Signature", rate: packageRates.signature },
  { id: "bespoke", label: "Bespoke", rate: packageRates.bespoke },
] as const;

export function CostEstimator() {
  const [area, setArea] = useState(1200);
  const [packageId, setPackageId] = useState<(typeof estimatePackages)[number]["id"]>("signature");
  const [painting, setPainting] = useState(false);
  const [electrical, setElectrical] = useState(false);
  const selected = estimatePackages.find((item) => item.id === packageId) ?? estimatePackages[1];
  const addOnEstimate =
    (painting ? area * serviceAddOnEstimates.paintingPerSqFt : 0) +
    (electrical ? serviceAddOnEstimates.electricalAllowance : 0);
  const lower = Math.round((area * selected.rate * 0.88 + addOnEstimate * 0.88) / 10000) * 10000;
  const upper = Math.round((area * selected.rate * 1.12 + addOnEstimate * 1.12) / 10000) * 10000;
  const formatted = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="estimator-card">
      <div className="estimator-controls">
        <fieldset className="estimator-choice">
          <legend>Choose a finish direction</legend>
          {estimatePackages.map((item) => (
            <label className={packageId === item.id ? "estimate-option is-selected" : "estimate-option"} key={item.id}>
              <input
                checked={packageId === item.id}
                name="estimate-package"
                onChange={() => setPackageId(item.id)}
                type="radio"
                value={item.id}
              />
              <span>{item.label}</span>
              <small>₹{item.rate.toLocaleString("en-IN")} / sq.ft.</small>
            </label>
          ))}
        </fieldset>
        <label className="area-control" htmlFor="home-area">
          <span>Approximate home size</span>
          <strong>{area.toLocaleString("en-IN")} <small>sq.ft.</small></strong>
          <input
            id="home-area"
            max="3000"
            min="500"
            onChange={(event) => setArea(Number(event.target.value))}
            step="100"
            type="range"
            value={area}
          />
          <span className="range-labels"><span>500 sq.ft.</span><span>3,000 sq.ft.</span></span>
        </label>
        <fieldset className="estimate-addons">
          <legend>Optional finishing works <span>(indicative estimates)</span></legend>
          <label><input checked={painting} onChange={(event) => setPainting(event.target.checked)} type="checkbox" /> Painting</label>
          <label><input checked={electrical} onChange={(event) => setElectrical(event.target.checked)} type="checkbox" /> Electrical work</label>
        </fieldset>
      </div>
      <div aria-live="polite" className="estimate-result">
        <span className="eyebrow">A first-look budget range</span>
        <strong>{formatted(lower)} <span>—</span> {formatted(upper)}</strong>
        <p>Illustrative only. Final pricing depends on your home, scope, site, and chosen materials.</p>
        <a className="text-link" href="#contact">Talk through your estimate <span aria-hidden="true">↗</span></a>
      </div>
    </div>
  );
}

const filters = ["All spaces", "Living", "Bedroom", "Kitchen", "Dining", "Wardrobe"];

export function ProjectGallery() {
  const [filter, setFilter] = useState("All spaces");
  const filteredProjects =
    filter === "All spaces" ? projects : projects.filter((project) => project.category === filter);

  return (
    <>
      <div aria-label="Filter portfolio by space" className="gallery-filters" role="group">
        {filters.map((item) => (
          <button
            aria-pressed={filter === item}
            className={filter === item ? "filter-chip is-active" : "filter-chip"}
            key={item}
            onClick={() => setFilter(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>
      <div aria-live="polite" className="project-grid">
        {filteredProjects.map((project, index) => (
          <article className={`project-card${index === 0 ? " project-card-featured" : ""}`} key={project.title}>
            <div className="project-image">
              <Image alt={project.alt} fill sizes="(max-width: 760px) 50vw, 33vw" src={project.image} />
              <span className="project-category">{project.category}</span>
            </div>
            <div className="project-caption">
              <h3>{project.title}</h3>
              <p>{project.location}</p>
            </div>
          </article>
        ))}
      </div>
      <p className="image-disclaimer">
        Image references are illustrative inspiration, not completed Leor projects.
      </p>
    </>
  );
}

export function FAQAccordion() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(0);
  return (
    <div className="faq-list">
      {faqs.map((item, index) => {
        const isOpen = openQuestion === index;
        const answerId = `faq-answer-${index}`;
        return (
          <article className={`faq-item${isOpen ? " is-open" : ""}`} key={item.question}>
            <h3>
              <button
                aria-controls={answerId}
                aria-expanded={isOpen}
                onClick={() => setOpenQuestion(isOpen ? null : index)}
                type="button"
              >
                {item.question}<span aria-hidden="true">{isOpen ? "−" : "+"}</span>
              </button>
            </h3>
            <p hidden={!isOpen} id={answerId}>{item.answer}</p>
          </article>
        );
      })}
    </div>
  );
}

export function WhatsAppLink({ className = "" }: { className?: string }) {
  const href = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(
    site.whatsappMessage,
  )}`;
  return (
    <a
      className={className}
      href={href}
      rel="noreferrer"
      target="_blank"
      aria-label="Start a WhatsApp conversation with Leor Design"
    >
      WhatsApp us <span aria-hidden="true">↗</span>
    </a>
  );
}

export function MobileActionBar() {
  return (
    <nav aria-label="Quick contact" className="mobile-action-bar">
      <a className="mobile-action-call" href={`tel:${site.phoneNumber}`}>Call now</a>
      <a className="mobile-action-whatsapp" href={`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(site.whatsappMessage)}`} rel="noreferrer" target="_blank">WhatsApp</a>
    </nav>
  );
}

export function HeroImage() {
  return (
    <div className="hero-photo">
      <Image
        alt="Warm, light-filled living space with sculptural furniture and natural materials"
        fill
        preload
        sizes="(max-width: 760px) 100vw, 58vw"
        src={images.hero}
      />
      <div className="photo-note">
        <span className="note-mark">L.</span>
        <span>Considered in every detail<small>Visual inspiration · not a Leor project</small></span>
      </div>
    </div>
  );
}
