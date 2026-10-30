"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { PremiumImage } from "../../../components/ui/premium-image";
import { useScrollLock } from "../../../components/smooth-scroll";
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
  useScrollLock(open);
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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [projectCursor, setProjectCursor] = useState({ x: 0, y: 0, visible: false });
  const projectCursorRef = useRef(projectCursor);
  const reduce = useReducedMotion();
  const updateProjectCursor = (cursor: typeof projectCursor) => {
    projectCursorRef.current = cursor;
    setProjectCursor(cursor);
  };
  const shown = filter === "All" ? concepts.slice(0, 6) : concepts.filter((c) => c.category === filter);
  useEffect(() => {
    const hideCursorIfImageMovedAway = () => {
      const cursor = projectCursorRef.current;
      if (!cursor.visible) return;
      const underPointer = document.elementFromPoint(cursor.x, cursor.y);
      if (!underPointer?.closest(".project-card-media")) {
        const hiddenCursor = { ...cursor, visible: false };
        projectCursorRef.current = hiddenCursor;
        setProjectCursor(hiddenCursor);
      }
    };
    window.addEventListener("scroll", hideCursorIfImageMovedAway, true);
    return () => window.removeEventListener("scroll", hideCursorIfImageMovedAway, true);
  }, []);

  const moveProjectCursor = (event: React.PointerEvent<HTMLLIElement>) => {
    if (event.pointerType !== "mouse" || navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches) {
      updateProjectCursor({ ...projectCursorRef.current, visible: false });
      return;
    }
    const hoveringImage = (event.target as HTMLElement).closest(".project-card-media");
    updateProjectCursor({ x: event.clientX, y: event.clientY, visible: Boolean(hoveringImage) });
  };

  return (
    <>
      <div className="filters" role="group" aria-label="Filter projects">
        {(["All", ...projectCategories] as const).map((c) => (
          <button key={c} type="button" className="chip" aria-pressed={filter === c} onClick={() => setFilter(c)}>
            {c}
          </button>
        ))}
      </div>
      <motion.ul className="project-grid" layout={!reduce}>
        <AnimatePresence mode="popLayout">
          {shown.map((c, index) => (
            <motion.li key={c.id} className="project-card" layout={!reduce} initial={reduce ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} viewport={{ once: true, amount: .15 }} transition={{ duration: reduce ? 0 : .55, delay: reduce ? 0 : index * .07, ease: [.22, 1, .36, 1] }} onPointerMove={moveProjectCursor} onPointerLeave={() => updateProjectCursor({ ...projectCursorRef.current, visible: false })}>
              <button type="button" className="project-card-media" aria-label={`View ${c.title}`} onClick={() => { setSelectedIndex(index); updateProjectCursor({ ...projectCursorRef.current, visible: false }); }}>
                <PremiumImage src={c.photo.src} alt={c.photo.alt} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" ratio={index % 3 === 0 ? "4 / 5" : index % 3 === 1 ? "1 / 1" : "4 / 3"} overlay>
                  <span className="project-top"><strong>{c.title}</strong><small>Illustrative concept</small></span>
                  <span className="project-bottom">{c.room}</span>
                  <span className="project-view">View <i aria-hidden="true">↗</i></span>
                </PremiumImage>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
      <div className={`project-cursor${projectCursor.visible ? " is-visible" : ""}`} style={{ transform: `translate3d(${projectCursor.x}px, ${projectCursor.y}px, 0)` }} aria-hidden="true"><span>View</span></div>
      <AnimatePresence>
        {selectedIndex !== null && shown[selectedIndex] && <GalleryLightbox items={shown} index={selectedIndex} onIndexChange={setSelectedIndex} onClose={() => setSelectedIndex(null)} />}
      </AnimatePresence>
    </>
  );
}

function GalleryLightbox({ items, index, onIndexChange, onClose }: { items: typeof concepts; index: number; onIndexChange: (index: number) => void; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const callbacks = useRef({ onIndexChange, onClose });
  const indexRef = useRef(index);
  const lengthRef = useRef(items.length);
  const image = items[index];
  useScrollLock(true);

  useEffect(() => {
    callbacks.current = { onIndexChange, onClose };
    indexRef.current = index;
    lengthRef.current = items.length;
  }, [onIndexChange, onClose, index, items.length]);

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") callbacks.current.onClose();
      if (event.key === "ArrowRight") callbacks.current.onIndexChange((indexRef.current + 1) % lengthRef.current);
      if (event.key === "ArrowLeft") callbacks.current.onIndexChange((indexRef.current - 1 + lengthRef.current) % lengthRef.current);
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocus.current?.focus?.({ preventScroll: true });
    };
  }, []);

  return (
    <motion.div className="gallery-lightbox" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }} onTouchEnd={(event) => {
      const start = touchStartX.current;
      const end = event.changedTouches[0]?.clientX;
      if (start !== null && end !== undefined && Math.abs(end - start) > 50) onIndexChange((index + (end < start ? 1 : -1) + items.length) % items.length);
      touchStartX.current = null;
    }}>
      <motion.div className="gallery-lightbox-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-label={`${image.title} image viewer`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: .35 }}>
        <button ref={closeRef} type="button" className="lightbox-close" aria-label="Close image viewer" onClick={onClose}>×</button>
        <button type="button" className="lightbox-arrow lightbox-prev" aria-label="Previous image" onClick={() => onIndexChange((index - 1 + items.length) % items.length)}>‹</button>
        <div className="lightbox-image"><PremiumImage src={image.photo.src} alt={image.photo.alt} sizes="90vw" ratio="16 / 10" fit="contain" unconstrained /></div>
        <button type="button" className="lightbox-arrow lightbox-next" aria-label="Next image" onClick={() => onIndexChange((index + 1) % items.length)}>›</button>
        <div className="lightbox-caption"><h2>{image.title}</h2><p>{image.room}</p></div>
      </motion.div>
    </motion.div>
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
          <PremiumImage key={current.id} src={current.photo.src} alt={current.photo.alt} sizes="(max-width: 1100px) 100vw, 520px" ratio="4 / 3" overlay />
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
        <ul className="finish-list" aria-label="Choose a finish" data-lenis-prevent>
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
