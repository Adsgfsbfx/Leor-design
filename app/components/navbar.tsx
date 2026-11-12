"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type MouseEvent } from "react";
import { Magnetic } from "../../components/ui/motion";
import { useScrollLock } from "../../components/smooth-scroll";
import { buildWhatsAppLink, phoneHref, site } from "../../src/config/site";

const items = [
  ["Services", "#services"], ["About", "#highlights"], ["Estimate", "#estimator"],
  ["FAQs", "#faq"], ["Contact", "#contact"],
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const reduce = useReducedMotion();
  useScrollLock(open);

  const navigateToSection = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const href = event.currentTarget.getAttribute("href");
    if (!href?.startsWith("#")) return;
    const id = href.slice(1);
    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();
    if (window.location.hash !== href) window.history.pushState(null, "", href);
    setOpen(false);

    // Wait for the mobile menu's scroll lock to release before scrolling.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - 80);
        window.scrollTo({ top, left: 0, behavior: "auto" });
      });
    });
  };

  useEffect(() => {
    let previousY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 48);
      setHidden(!open && currentY > 150 && currentY > previousY + 3);
      if (currentY < 90 || currentY < previousY - 2) setHidden(false);
      previousY = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const targets = items.map(([, href]) => document.querySelector(href)).filter(Boolean) as Element[];
    const observer = new IntersectionObserver((entries) => {
      const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (current) setActive(`#${current.target.id}`);
    }, { rootMargin: "-25% 0px -62% 0px", threshold: [0, .2, .5] });
    targets.forEach((target) => observer.observe(target));
    return () => { window.removeEventListener("scroll", onScroll); observer.disconnect(); };
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return <motion.header inert={hidden && !open} className={`cinematic-nav${scrolled ? " is-scrolled" : ""}${hidden ? " is-hidden" : ""}`} initial={false} animate={{ opacity: 1, y: hidden ? -110 : 0 }} transition={{ opacity: { duration: reduce ? 0 : .2 }, y: { duration: reduce ? 0 : .42, ease: [.22, 1, .36, 1] } }}>
    <div className="cinematic-nav-inner">
      <a href="#top" className="cinematic-brand" aria-label="Leor Design home"><span>LEOR</span><span>Design</span></a>
      <nav className="cinematic-nav-links" aria-label="Primary navigation">{items.map(([label, href]) => <a href={href} onClick={navigateToSection} key={href} className={active === href ? "is-active" : ""} aria-current={active === href ? "location" : undefined}>{label}<i /></a>)}</nav>
      <Magnetic className="cinematic-nav-cta-wrap"><a className="cinematic-nav-cta" href="#enquire">Book a consultation <span aria-hidden="true">↗</span></a></Magnetic>
      <button className={`cinematic-menu-button${open ? " is-open" : ""}`} type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="cinematic-mobile-menu" onClick={() => setOpen((value) => !value)}><span /><span /></button>
    </div>
    <AnimatePresence>
      {open && <motion.div id="cinematic-mobile-menu" className="cinematic-mobile-menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : .28 }}>
        <nav aria-label="Mobile navigation">{items.map(([label, href], index) => <motion.a key={href} href={href} onClick={navigateToSection} initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: reduce ? 0 : .52, delay: reduce ? 0 : .12 + index * .09, ease: [.22, 1, .36, 1] }}>{label}<span aria-hidden="true">↗</span></motion.a>)}</nav>
        <div className="cinematic-mobile-footer"><a href={phoneHref}>{site.phoneNumber.replace("+91 ", "")}</a><a href={buildWhatsAppLink(site.whatsappMessage)} target="_blank" rel="noopener noreferrer">WhatsApp <span aria-hidden="true">↗</span></a></div>
      </motion.div>}
    </AnimatePresence>
  </motion.header>;
}
