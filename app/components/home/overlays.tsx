"use client";

import { useEffect, useRef, useState } from "react";
import { PremiumImage } from "../../../components/ui/premium-image";
import { useScrollLock } from "../../../components/smooth-scroll";
import { buildWhatsAppLink, phoneHref, site } from "../../../src/config/site";
import { photos } from "../../../src/config/images";
import { hasBannerBeenDismissed } from "../../../src/lib/cookies";
import { RegisterForm, WhatsAppMark } from "./forms";

const SEEN_KEY = "leor-offer-seen";

export function OfferPopup() {
  const [open, setOpen] = useState(false);
  const shown = useRef(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useScrollLock(open);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) return;

    let timer: number | undefined;
    let activated = false;
    const show = () => {
      if (shown.current) return;
      shown.current = true;
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        // Storage can be blocked; the in-memory flag still limits the popup to one showing.
      }
      setOpen(true);
    };
    const onScroll = () => {
      const hero = document.getElementById("top");
      if (hero && window.scrollY > hero.offsetHeight) show();
    };
    const activateOffer = () => {
      if (activated || shown.current) return;
      activated = true;
      timer = window.setTimeout(show, 15000);
      window.addEventListener("scroll", onScroll, { passive: true });
    };
    const waitForConsent = () => {
      if (!hasBannerBeenDismissed()) return;
      window.removeEventListener("consent-changed", waitForConsent);
      window.removeEventListener("storage", waitForConsent);
      activateOffer();
    };

    if (hasBannerBeenDismissed()) activateOffer();
    else {
      window.addEventListener("consent-changed", waitForConsent);
      window.addEventListener("storage", waitForConsent);
    }
    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("consent-changed", waitForConsent);
      window.removeEventListener("storage", waitForConsent);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const firstInput = dialogRef.current?.querySelector<HTMLInputElement>("input");
    if (window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0) closeRef.current?.focus({ preventScroll: true });
    else firstInput?.focus({ preventScroll: true });

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const items = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex='-1'])"),
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus?.({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="offer-layer" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className="offer-modal" role="dialog" aria-modal="true" aria-labelledby="offer-title" ref={dialogRef}>
        <button ref={closeRef} type="button" className="offer-close" aria-label="Close offer" onClick={() => setOpen(false)}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <div className="offer-art">
          <PremiumImage className="offer-art-image" src={photos.livingNeutral.src} alt="" sizes="(max-width: 768px) 100vw, 420px" ratio="4 / 5" overlay />
          <div className="offer-art-copy">
            <p className="offer-brand">Leor Design · Hebbal, Bengaluru</p>
            <p className="offer-big" aria-hidden="true"><span>10</span><sup>%</sup><em>OFF</em></p>
            <p className="offer-ribbon"><span>Flat 10% off on your interiors</span></p>
          </div>
        </div>
        <div className="offer-panel" data-lenis-prevent>
          <h2 id="offer-title">Begin your interior journey</h2>
          <p className="offer-lead">Share your details and we will talk you through the offer, with no obligation.</p>
          <RegisterForm compact buttonLabel="Claim My 10% Discount" />
          <p className="offer-terms">
            Online registration is not connected yet: no code is issued or stored here, and you will finish on WhatsApp. <a href="/privacy#terms" onClick={() => setOpen(false)}>Offer terms</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export function FloatingActions() {
  return (
    <>
      <a
        className="float-wa"
        href={buildWhatsAppLink(site.whatsappMessage)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Leor Design on WhatsApp"
      >
        <WhatsAppMark />
        <span>Chat</span>
      </a>
      <div className="mobile-bar">
        <a className="mobile-call" href={phoneHref}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
          </svg>
          <span>Call Leor</span>
        </a>
        <a className="mobile-wa" href={buildWhatsAppLink(site.whatsappMessage)} target="_blank" rel="noopener noreferrer">
          <WhatsAppMark /> <span>WhatsApp</span>
        </a>
      </div>
    </>
  );
}
