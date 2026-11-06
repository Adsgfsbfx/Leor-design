"use client";

import { useEffect, useRef } from "react";
import { captureUtmParameters, initializeWhatsAppClickTracking } from "../../src/lib/tracking";
import { initializePageTracking, trackPageLeave } from "../../src/lib/visitorTracking";
import { hasAnalyticsConsent } from "../../src/lib/cookies";

/**
 * TrackingInitializer: Initializes campaign and engagement tracking.
 * Must be used in a client component and placed early in the app (e.g., in layout or page).
 *
 * - Captures UTM parameters from the landing page URL on first load (no consent needed)
 * - Sets up click tracking for WhatsApp links across the entire page (no consent needed)
 * - Initializes visitor tracking with page views and device detection (requires analytics consent)
 *
 * This component does not render anything; it only sets up event listeners and storage.
 */
export function TrackingInitializer() {
  const initializeRef = useRef(false);

  useEffect(() => {
    // Only initialize once per component mount
    if (initializeRef.current) return;
    initializeRef.current = true;

    // Capture UTM on page load (only if not already captured) - no consent needed
    captureUtmParameters();

    // Initialize WhatsApp click tracking - no consent needed
    const cleanup = initializeWhatsAppClickTracking();

    // Initialize visitor tracking only if analytics consent is granted
    if (hasAnalyticsConsent()) {
      initializePageTracking();
    }

    // Track page leave when user navigates away
    const handleBeforeUnload = () => {
      if (hasAnalyticsConsent()) {
        trackPageLeave();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Listen for consent changes and initialize tracking if user grants consent
    const handleConsentChanged = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.analytics === true) {
        initializePageTracking();
      }
    };
    window.addEventListener("consent-changed", handleConsentChanged);

    // Log initialization for debugging
    if (typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
      const wasClicked = sessionStorage.getItem("leor_whatsapp_clicked") === "true";
      console.debug("[tracking-init]", {
        utm_source: sessionStorage.getItem("leor_utm_source"),
        utm_medium: sessionStorage.getItem("leor_utm_medium"),
        utm_campaign: sessionStorage.getItem("leor_utm_campaign"),
        whatsapp_previously_clicked: wasClicked,
        analytics_consent: hasAnalyticsConsent(),
      });
    }

    return () => {
      if (typeof cleanup === "function") {
        cleanup();
      }
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("consent-changed", handleConsentChanged);
    };
  }, []);

  return null;
}
