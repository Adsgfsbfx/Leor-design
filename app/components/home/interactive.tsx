"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { concepts, photos, projectCategories, type Photo, type ProjectCategory } from "../../../src/config/images";
import { alternatePhoneDisplay, buildWhatsAppLink, faqs, phoneDisplay, phoneHref, site } from "../../../src/config/site";
import {
  addOns,
  calculateEstimate,
  finishLevels,
  formatRange,
  formatRupees,
  homeTypes,
  type AddOnId,
  type FinishLevelId,
  type HomeType,
} from "../../../src/lib/pricing";
import { RegisterForm } from "./forms";

const navLinks = [
  ["Projects", "#projects"],
  ["Estimate", "#estimator"],
  ["Packages", "#packages"],
  ["Finishes", "#finishes"],
  ["FAQs", "#faq"],
  ["Contact", "#contact"],
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#top" aria-label={`${site.companyName} home`}>
          <span className="brand-mark" aria-hidden="true">L</span>
          <span className="brand-name">Leor <small>Design</small></span>
        </a>
        <nav id="primary-nav" className={`nav${open ? " open" : ""}`} aria-label="Primary">
          {navLinks.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
        </nav>
        <a className="btn btn-gold btn-sm header-call" href={phoneHref}>
          Call {phoneDisplay}
        </a>
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden="true">{open ? "✕" : "☰"}</span>
        </button>
      </div>
    </header>
  );
}

export function Projects() {
  const [filter, setFilter] = useState<"All" | ProjectCategory>("All");
  const shown = (filter === "All" ? concepts.slice(0, 6) : concepts.filter((c) => c.category === filter));
  return (
    <>
      <div className="filters" role="group" aria-label="Filter projects">
        {(["All", ...projectCategories] as const).map((c) => (
          <button key={c} type="button" className="chip" aria-pressed={filter === c} onClick={() => setFilter(c)}>
            {c}
          </button>
        ))}
      </div>
      <ul className="project-grid">
        {shown.map((c) => (
          <li key={c.id} className="project-card">
            <Image src={c.photo.src} alt={c.photo.alt} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" />
            <div className="project-top">
              <h3>{c.title}</h3>
              <span>Illustrative concept</span>
            </div>
            <p className="project-bottom">{c.room}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

function useAnimated(target: number) {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    const origin = from.current;
    const duration = reduce ? 0 : 350;
    let frame = 0;
    const tick = (now: number) => {
      const t = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      const current = origin + (target - origin) * t;
      from.current = current;
      setValue(current);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return value;
}

export function Estimator() {
  const [home, setHome] = useState<HomeType>("2 BHK");
  const [finish, setFinish] = useState<FinishLevelId>("premium");
  const [selected, setSelected] = useState<AddOnId[]>([]);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const estimate = calculateEstimate(home, finish, selected);
  const low = useAnimated(estimate.low);
  const high = useAnimated(estimate.high);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const trigger = (event.target as HTMLElement).closest<HTMLElement>("[data-home]");
      if (trigger) setHome(trigger.dataset.home as HomeType);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const rangeText = formatRange(low, high);
  const finalRange = formatRange(estimate.low, estimate.high);
  const estimateText = `My ${home} ${finish} estimate on the calculator was ${finalRange}.`;
  const toggle = (id: AddOnId) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="estimator">
      <div className="estimator-controls">
        <fieldset>
          <legend>1. Home size</legend>
          <div className="pill-row">
            {homeTypes.map((type) => (
              <button key={type} type="button" className="chip" aria-pressed={home === type} onClick={() => setHome(type)}>
                {type}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>2. Finish level</legend>
          <div className="level-row">
            {finishLevels.map((level) => (
              <label key={level.id} className={`level${finish === level.id ? " active" : ""}`}>
                <input type="radio" name="finish-level" checked={finish === level.id} onChange={() => setFinish(level.id)} />
                <strong>{level.label}</strong>
                <span>{level.note}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>3. Add-ons</legend>
          <div className="addon-list">
            {addOns.map((addOn) => (
              <label key={addOn.id} className="addon">
                <input type="checkbox" checked={selected.includes(addOn.id)} onChange={() => toggle(addOn.id)} />
                <span>{addOn.label}</span>
                <em>+ {formatRupees(addOn.price)}</em>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="estimator-result">
        <p className="eyebrow light">Provisional budget range</p>
        <p className="result-number" aria-live="polite" aria-atomic="true">
          <span className="sr-only">{finalRange}</span>
          <span aria-hidden="true">{rangeText}</span>
        </p>
        <p className="result-sub">
          for a {home} · {finishLevels.find((l) => l.id === finish)?.label} finish · about {formatRupees(estimate.emi)}/month
          EMI (12%, 36 months, illustrative)
        </p>
        <dl className="breakdown">
          <div><dt>{home} base price</dt><dd>{formatRupees(estimate.base)}</dd></div>
          <div><dt>Finish adjustment</dt><dd>{formatRupees(estimate.finishCost - estimate.base)}</dd></div>
          <div><dt>Add-ons</dt><dd>{formatRupees(estimate.addOnTotal)}</dd></div>
          <div className="total"><dt>Midpoint estimate</dt><dd>{formatRupees(estimate.mid)}</dd></div>
        </dl>
        <p className="fine">Range is the midpoint ±8%. Placeholder pricing pending Leor approval; not a quotation.</p>

        {registered ? (
          <p className="discount-result" role="status">
            With the 10% offer (if confirmed): {formatRange(estimate.discountLow, estimate.discountHigh)}
          </p>
        ) : null}
        {registering ? (
          <div className="inline-register">
            <RegisterForm compact estimateText={estimateText} onDone={() => setRegistered(true)} />
          </div>
        ) : (
          <button type="button" className="discount-banner" onClick={() => setRegistering(true)}>
            Register to unlock flat 10% off <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
    </div>
  );
}

type Finish = {
  id: string;
  name: string;
  material: string;
  level: string;
  photo?: Photo;
  color?: string;
  note: string;
};

const finishes: Finish[] = [
  { id: "oak", name: "Oak", material: "Laminate", level: "Essential", photo: photos.oak, note: "Light, warm grain that suits everyday family homes." },
  { id: "walnut", name: "Walnut", material: "Veneer", level: "Luxe", photo: photos.walnut, note: "Deep, rich tone for statement storage and panelling." },
  { id: "fluted", name: "Fluted oak", material: "Fluted panel", level: "Luxe", photo: photos.fluted, note: "Vertical grooves that add depth to feature walls and headboards." },
  { id: "sage", name: "Sage", material: "Matte", level: "Premium", color: "#8FA38F", note: "Soft green matte. Colour preview only." },
  { id: "midnight", name: "Midnight", material: "Acrylic", level: "Premium", color: "#16303A", note: "Deep teal-black gloss. Colour preview only." },
  { id: "ivory", name: "Ivory", material: "PU", level: "Premium", color: "#EDE6D6", note: "Warm off-white PU. Colour preview only." },
];

export function Finishes() {
  const [active, setActive] = useState(finishes[0].id);
  const current = finishes.find((f) => f.id === active) ?? finishes[0];
  return (
    <div className="finishes">
      <div className="finish-preview">
        {current.photo ? (
          <Image key={current.id} src={current.photo.src} alt={current.photo.alt} fill sizes="(max-width: 900px) 100vw, 55vw" />
        ) : (
          <div className="door-preview" style={{ background: current.color }} role="img" aria-label={`${current.name} wardrobe door colour preview`}>
            <span /><span />
          </div>
        )}
        <p className="finish-caption">
          <strong>{current.name}</strong> · {current.material} · {current.level}
        </p>
      </div>
      <div className="finish-side">
        <h3>{current.name}</h3>
        <p>{current.note}</p>
        <ul className="finish-list" aria-label="Choose a finish">
          {finishes.map((f) => (
            <li key={f.id}>
              <button type="button" aria-pressed={f.id === active} onClick={() => setActive(f.id)}>
                <span
                  className="swatch"
                  style={f.color ? { background: f.color } : { backgroundImage: `url(${f.photo?.src})` }}
                  aria-hidden="true"
                />
                <span>
                  <strong>{f.name}</strong>
                  <small>{f.material} · {f.level}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="fine">Photographs are illustrative stock images. Final colour and grain vary by supplier and lighting; Leor will confirm samples.</p>
      </div>
    </div>
  );
}

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="faq-grid">
      <ol className="faq-list">
        {faqs.map((item, index) => (
          <li key={item.question} className={open === index ? "open" : ""}>
            <h3>
              <button
                type="button"
                id={`faq-btn-${index}`}
                aria-expanded={open === index}
                aria-controls={`faq-panel-${index}`}
                onClick={() => setOpen(open === index ? -1 : index)}
              >
                <span className="faq-num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <span className="faq-q">{item.question}</span>
                <span className="faq-chevron" aria-hidden="true" />
              </button>
            </h3>
            <div id={`faq-panel-${index}`} role="region" aria-labelledby={`faq-btn-${index}`} hidden={open !== index}>
              <p>{item.answer}</p>
            </div>
          </li>
        ))}
      </ol>
      <aside className="faq-aside">
        <h3>Still have a question?</h3>
        <p>Call {phoneDisplay} or {alternatePhoneDisplay}, or message us on WhatsApp.</p>
        <a className="btn btn-gold" href={buildWhatsAppLink(site.whatsappMessage)} target="_blank" rel="noopener noreferrer">
          Talk to our team <span aria-hidden="true">→</span>
        </a>
      </aside>
    </div>
  );
}
