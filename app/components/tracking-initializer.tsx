"use client";

import { useEffect } from "react";
import { initializePageTracking, trackPageLeave, sendVisitorEvent, clearQueuedTracking, flushQueuedTracking, updateSessionVisibility } from "../../src/lib/visitorTracking";
import { hasAnalyticsConsent } from "../../src/lib/cookies";

/**
 * TrackingInitializer: Initializes campaign and engagement tracking.
 * Must be used in a client component and placed early in the app (e.g., in layout or page).
 *
 * Optional visitor activity is recorded only after analytics consent.
 *
 * This component does not render anything; it only sets up event listeners and storage.
 */
export function TrackingInitializer() {
  useEffect(() => {
    let lastScrollEventAt = 0;
    const sentScrollDepths = new Set<number>();
    if (hasAnalyticsConsent()) {
      initializePageTracking();
      flushQueuedTracking();
    }

    const handlePageHide = () => trackPageLeave();
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted && hasAnalyticsConsent()) initializePageTracking();
    };
    const handleClick = (event: MouseEvent) => {
      if (!hasAnalyticsConsent()) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const control = target.closest<HTMLElement>("a, button");
      if (!control || control.closest("[aria-hidden='true']")) return;
      const href = control instanceof HTMLAnchorElement ? control.getAttribute("href") ?? "" : "";
      const label = (control.getAttribute("aria-label") || control.innerText || control.getAttribute("title") || "").trim().slice(0, 120);
      const semantic = control.dataset.analyticsName || control.getAttribute("aria-label") || control.getAttribute("title") || "";
      const safeHref = href.startsWith("/") && !href.startsWith("//") ? href.split(/[?#]/, 1)[0] : "";
      const clickedElement = [control.tagName.toLowerCase(), semantic.slice(0, 80), safeHref].filter(Boolean).join(":").slice(0, 160);
      const sendClick = (eventName: string, ctaName: string) => void sendVisitorEvent({ eventName, ctaName, clickedElement });
      if (/^tel:/i.test(href)) sendClick("phone_click", label || "phone-link");
      else if (/wa\.me|whatsapp/i.test(href) || control.hasAttribute("data-whatsapp")) sendClick("whatsapp_click", label || "whatsapp-link");
      else if (control.closest(".project-card")) sendClick("project_interaction", label || "project");
      else if (control.closest(".service-card")) sendClick("service_interaction", label || "service");
      else if (control.matches(".estimator-calculate")) sendClick("estimator_complete", label || "calculate-estimate");
      else if (control.closest(".estimator")) sendClick("estimator_interaction", label || control.getAttribute("type") || "estimator-control");
      else if (href === "#estimator") sendClick("estimator_open", label || "estimator-link");
      else if (control.matches(".btn, .button, [data-track-cta]")) sendClick("cta_click", label || "cta");
      else if (href.startsWith("#") && href.length > 1) sendClick("navigation", href.slice(1));
      else if (safeHref) sendClick("navigation", label || safeHref);
      else if (/^https?:/i.test(href)) {
        try {
          const destination = new URL(href);
          if (destination.origin === window.location.origin) sendClick("navigation", label || destination.pathname);
        } catch { /* Ignore malformed destinations. */ }
      }
    };
    const handleScroll = () => {
      if (!hasAnalyticsConsent()) return;
      const now = Date.now();
      if (now - lastScrollEventAt < 500) return;
      lastScrollEventAt = now;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const depth = height > 0 ? Math.min(100, Math.floor((window.scrollY / height) * 100)) : 100;
      for (const milestone of [25, 50, 75, 100]) {
        if (depth >= milestone && !sentScrollDepths.has(milestone)) {
          sentScrollDepths.add(milestone);
          void sendVisitorEvent({ eventName: "scroll_depth", scrollDepth: milestone, clickedElement: "document:scroll" });
        }
      }
    };
    const handleVisibility = () => updateSessionVisibility();
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("click", handleClick, true);
    document.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);

    // Listen for consent changes and initialize tracking if user grants consent
    const handleConsentChanged = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.analytics === true) {
        sentScrollDepths.clear();
        updateSessionVisibility();
        initializePageTracking();
        flushQueuedTracking();
      } else if (customEvent.detail?.analytics === false) {
        sentScrollDepths.clear();
        clearQueuedTracking();
      }
    };
    window.addEventListener("consent-changed", handleConsentChanged);
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "leor-cookie-preferences") return;
      if (hasAnalyticsConsent()) {
        initializePageTracking();
        flushQueuedTracking();
      } else clearQueuedTracking();
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("consent-changed", handleConsentChanged);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return null;
}
