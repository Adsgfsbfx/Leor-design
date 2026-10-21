"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import { imageCategories, interiorImages } from "../../../src/config/images";
import {
  buildWhatsAppLink,
  enquiryServiceOptions,
  faqs,
  packageRates,
  phoneDisplay,
  phoneHref,
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
          <div className="header-desktop-contact">
            <span className="header-phone">
              <span className="phone-icon" aria-hidden="true">☎</span>
              <span>{site.phoneNumber}<small>Call Leor Design</small></span>
            </span>
            <WhatsAppButton className="button button-dark header-whatsapp" source="header" message="Hi Leor Design, I'd like a free quote for my home interiors.">
              Chat on WhatsApp
            </WhatsAppButton>
          </div>
        </div>
        <div className="header-mobile-actions">
          <WhatsAppButton className="button button-dark header-tablet-whatsapp" source="header" message="Hi Leor Design, I'd like a free quote for my home interiors.">
            WhatsApp
          </WhatsAppButton>
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
  | { kind: "loading"; message: string }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

function normalizeIndianMobile(value: string) {
  const normalized = value.replace(/[\s-]/g, "");
  return normalized.startsWith("+91") ? normalized.slice(3) : normalized;
}

type WhatsAppSource =
  | "header"
  | "hero"
  | "service card"
  | "estimator"
  | "bottom action bar"
  | "floating button"
  | "footer"
  | "enquiry form";

function getClientContext(source: string) {
  const query = new URLSearchParams(window.location.search);
  const width = window.innerWidth;
  return {
    source,
    pageUrl: window.location.href,
    utmSource: query.get("utm_source") ?? "",
    utmMedium: query.get("utm_medium") ?? "",
    utmCampaign: query.get("utm_campaign") ?? "",
    deviceType: width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop",
  };
}

function logWhatsAppIntent(
  source: WhatsAppSource,
  message: string,
  estimatorSelections?: string,
  indicativeEstimate?: string,
) {
  const body = JSON.stringify({
    ...getClientContext(source),
    message,
    estimatorSelections,
    indicativeEstimate,
  });
  const blob = new Blob([body], { type: "application/json" });
  try {
    if (navigator.sendBeacon?.("/api/whatsapp-click", blob)) return;
  } catch {
    // Fall through to keepalive fetch; click logging must not stop navigation.
  }

  void fetch("/api/whatsapp-click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

export function EnquiryForm() {
  const [status, setStatus] = useState<FormStatus>({ kind: "idle", message: "" });
  const [servicesError, setServicesError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [whatsAppMessage, setWhatsAppMessage] = useState("");
  const submittingRef = useRef(false);
  const idempotencyKeyRef = useRef("");
  const formRef = useRef<HTMLFormElement>(null);
  const servicesErrorId = "services-needed-error";
  const source = "enquiry form";

  function getIdempotencyKey() {
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = crypto.randomUUID();
    }
    return idempotencyKeyRef.current;
  }

  function getFormPayload(form: HTMLFormElement, whatsappClicked: boolean) {
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const requirements = String(formData.get("requirements") ?? "").trim();
    const message = `Hi Leor Design, I'm ${name}. My requirements: ${requirements}`;
    return {
      name,
      mobile: normalizeIndianMobile(String(formData.get("mobile") ?? "")),
      email: String(formData.get("email") ?? ""),
      propertyType: String(formData.get("propertyType") ?? ""),
      locality: String(formData.get("locality") ?? ""),
      requirements,
      servicesNeeded: formData.getAll("servicesNeeded").map(String),
      consent: formData.get("consent") === "on",
      website: String(formData.get("website") ?? ""),
      whatsappClicked,
      whatsappMessage: whatsappClicked ? message : "",
      ...getClientContext(source),
    };
  }

  function updateWhatsAppMessage(form: HTMLFormElement) {
    if (!form.checkValidity()) {
      setWhatsAppMessage("");
      return;
    }

    const formData = new FormData(form);
    const mobile = normalizeIndianMobile(String(formData.get("mobile") ?? ""));
    const servicesNeeded = formData.getAll("servicesNeeded");
    if (!/^[6-9]\d{9}$/.test(mobile) || servicesNeeded.length === 0) {
      setWhatsAppMessage("");
      return;
    }

    setWhatsAppMessage(getFormPayload(form, true).whatsappMessage);
  }

  async function saveLeadBeforeWhatsApp() {
    const form = formRef.current;
    if (!form || submittingRef.current) return;

    submittingRef.current = true;
    setSubmitting(true);
    const payload = getFormPayload(form, true);
    setStatus({ kind: "loading", message: "Saving your details before opening WhatsApp…" });
    logWhatsAppIntent(source, payload.whatsappMessage);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8_000);
    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": getIdempotencyKey(),
        },
        body: JSON.stringify(payload),
        keepalive: true,
        signal: controller.signal,
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(result.message || "We couldn't save your enquiry.");
      }
      setStatus({ kind: "success", message: "Your details were saved. WhatsApp is opening." });
      idempotencyKeyRef.current = "";
    } catch (error) {
      setStatus({
        kind: "error",
        message: `WhatsApp is opening, but your details were not saved. ${
          error instanceof Error ? error.message : "Please contact us directly."
        }`,
      });
    } finally {
      window.clearTimeout(timeout);
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

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
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": getIdempotencyKey(),
        },
        body: JSON.stringify(getFormPayload(form, false)),
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
      setWhatsAppMessage("");
      idempotencyKeyRef.current = "";
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
      className="enquiry-form"
      onSubmit={handleSubmit}
      onChange={(event) => updateWhatsAppMessage(event.currentTarget)}
      onInput={(event) => updateWhatsAppMessage(event.currentTarget)}
      aria-busy={status.kind === "loading"}
      ref={formRef}
    >
      <div aria-hidden="true" className="form-honeypot">
        <label>
          Leave this field empty
          <input autoComplete="off" name="website" tabIndex={-1} />
        </label>
      </div>
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
            placeholder="8792385751 or +91 8792385751"
            required
            title="Enter a valid 10-digit Indian mobile number, optionally prefixed by +91."
            type="tel"
          />
        </label>
        <label>
          Email address <span>(optional)</span>
          <input autoComplete="email" name="email" placeholder="you@example.com" type="email" />
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
      <label className="consent-checkbox">
        <input name="consent" required type="checkbox" />
        <span>I agree to Leor Design contacting me about my enquiry by call, WhatsApp or email.</span>
      </label>
      <div className="form-submit-row">
        <button className="button button-dark form-submit" disabled={submitting} type="submit">
          {submitting ? "Sending…" : "Request a conversation"}
          {!submitting && <span aria-hidden="true">↗</span>}
        </button>
        {whatsAppMessage && !submitting && (
          <WhatsAppButton
            className="button button-outline form-whatsapp"
            message={whatsAppMessage}
            onSaveLead={saveLeadBeforeWhatsApp}
          >
            Send on WhatsApp instead
          </WhatsAppButton>
        )}
        <span className="form-privacy">Your details are used to respond to your enquiry. See our <a href="/privacy">privacy note</a>.</span>
      </div>
      <p aria-live="polite" className={`form-status status-${status.kind}`} role={status.kind === "error" ? "alert" : "status"}>
        {status.message}
      </p>
      <div className="enquiry-contact-details">
        <a href={phoneHref}>{phoneDisplay}</a>
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
  const options = [
    `${selected.label} package`,
    `${area.toLocaleString("en-IN")} sq.ft.`,
    ...(painting ? ["Painting"] : []),
    ...(electrical ? ["Electrical work"] : []),
  ];
  const estimatorMessage =
    `Hi Leor Design, I'd like to discuss an estimate for ${options.join(", ")}. ` +
    `The indicative estimate is ${formatted(lower)}–${formatted(upper)}.`;
  const estimatorSelections = options.join(", ");
  const indicativeEstimate = `${formatted(lower)}–${formatted(upper)}`;

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
        <WhatsAppButton
          className="text-link estimator-whatsapp"
          message={estimatorMessage}
          source="estimator"
          estimatorSelections={estimatorSelections}
          indicativeEstimate={indicativeEstimate}
        >
          Get this estimate on WhatsApp
        </WhatsAppButton>
      </div>
    </div>
  );
}

export function ProjectGallery() {
  const [filter, setFilter] = useState<(typeof imageCategories)[number]>("All");
  const filteredProjects =
    filter === "All"
      ? interiorImages
      : interiorImages.filter((project) => project.category === filter);

  return (
    <>
      <div aria-label="Filter portfolio by space" className="gallery-filters" role="group">
        {imageCategories.map((item) => (
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
        {filteredProjects.map((project) => (
          <article className="project-card" key={project.id}>
            <div className="project-image sample-image-frame">
              <SampleImage
                alt={project.alt}
                label={project.label}
                sizes="(max-width: 767px) 100vw, (max-width: 1050px) 50vw, (max-width: 1279px) 33vw, 25vw"
                src={project.src}
              />
            </div>
            <div className="project-caption">
              <h3>{project.label}</h3>
            </div>
          </article>
        ))}
      </div>
      <p className="image-disclaimer">
        Illustrative images shown. Leor&apos;s completed projects will replace these.
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

export function WhatsAppButton({
  children = "WhatsApp",
  className = "",
  message = site.whatsappMessage,
  source = "header",
  estimatorSelections,
  indicativeEstimate,
  onSaveLead,
}: {
  children?: ReactNode;
  className?: string;
  message?: string;
  source?: WhatsAppSource;
  estimatorSelections?: string;
  indicativeEstimate?: string;
  onSaveLead?: () => Promise<void>;
}) {
  const href = buildWhatsAppLink(message);

  return (
    <a
      className={className}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      aria-label="Start a WhatsApp conversation with Leor Design"
      onClick={(event) => {
        if (!onSaveLead) {
          logWhatsAppIntent(source, message, estimatorSelections, indicativeEstimate);
          return;
        }

        event.preventDefault();
        const popup = window.open("about:blank", "_blank");
        if (popup) {
          popup.opener = null;
          void onSaveLead().catch(() => undefined).finally(() => {
            popup.location.replace(href);
          });
        } else {
          void onSaveLead().catch(() => undefined).finally(() => {
            window.setTimeout(() => window.location.assign(href), 1_200);
          });
        }
      }}
    >
      {children}
    </a>
  );
}

export function MobileActionBar() {
  return (
    <nav aria-label="Quick contact" className="mobile-action-bar">
      <a aria-label={`Call Leor Design at ${site.phoneNumber}`} className="mobile-action-call" href={phoneHref}>Call now</a>
      <WhatsAppButton className="mobile-action-whatsapp" source="bottom action bar">WhatsApp</WhatsAppButton>
    </nav>
  );
}

export function FloatingWhatsAppButton() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const protectedAreas = [
      ...document.querySelectorAll(".enquiry-form"),
      ...document.querySelectorAll(".hero-cta-card"),
      ...document.querySelectorAll(".site-footer"),
    ];
    if (protectedAreas.length === 0 || !("IntersectionObserver" in window)) return;

    const visibleAreas = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visibleAreas.add(entry.target);
          else visibleAreas.delete(entry.target);
        }
        setHidden(visibleAreas.size > 0);
      },
      { threshold: 0 },
    );

    protectedAreas.forEach((area) => observer.observe(area));
    return () => observer.disconnect();
  }, []);

  if (hidden) return null;

  return (
    <WhatsAppButton
      className="floating-whatsapp"
      source="floating button"
      message="Hi Leor Design, I'd like a free quote for my home interiors."
    >
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M20.52 3.48A11.83 11.83 0 0 0 12.1 0C5.53 0 .18 5.35.18 11.92c0 2.1.55 4.16 1.6 5.97L.08 24l6.26-1.64a11.9 11.9 0 0 0 5.75 1.47h.01c6.57 0 11.92-5.35 11.92-11.92 0-3.18-1.24-6.17-3.5-8.43ZM12.1 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.72.98.99-3.63-.23-.37a9.87 9.87 0 0 1-1.51-5.27C2.22 6.45 6.63 2.04 12.1 2.04a9.82 9.82 0 0 1 7 2.9 9.82 9.82 0 0 1 2.9 7c0 5.47-4.43 9.86-9.9 9.86Zm5.43-7.39c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.95 1.17-.18.2-.35.22-.65.08-.3-.15-1.26-.47-2.4-1.48-.89-.8-1.49-1.77-1.67-2.07-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.68-1.63-.93-2.23-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.53.08-.8.38-.28.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.13 3.26 5.16 4.57.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.13-.28-.2-.58-.35Z" />
      </svg>
      <span className="floating-whatsapp-label">Chat on WhatsApp</span>
    </WhatsAppButton>
  );
}

export function SampleImage({
  alt,
  label,
  priority = false,
  sizes,
  src,
}: {
  alt: string;
  label: string;
  priority?: boolean;
  sizes: string;
  src: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`sample-picture${failed ? " is-fallback" : ""}`}>
      {!failed && (
        <Image
          alt={alt}
          fill
          loading={priority ? "eager" : "lazy"}
          onError={() => setFailed(true)}
          preload={priority}
          sizes={sizes}
          src={src}
        />
      )}
      {failed && (
        <span aria-label={alt} className="sample-picture-fallback" role="img">
          <span className="sample-fallback-mark">L.</span>
          <strong>{label}</strong>
          <small>Leor Design · Visual reference</small>
        </span>
      )}
      <span className="image-name-badge">{label}</span>
    </div>
  );
}

export function HeroImage() {
  const heroImage = interiorImages[0];
  return (
    <div className="hero-photo">
      <SampleImage
        alt={heroImage.alt}
        label={heroImage.label}
        priority
        sizes="(max-width: 760px) 100vw, 58vw"
        src={heroImage.src}
      />
      <div className="photo-note">
        <span>Considered in every detail<small>Living Room inspiration · not a Leor project</small></span>
      </div>
    </div>
  );
}
