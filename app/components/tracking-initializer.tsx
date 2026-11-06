"use client";

import { useEffect, useRef } from "react";
import { captureUtmParameters, initializeWhatsAppClickTracking } from "../../src/lib/tracking";
import { initializePageTracking, trackPageLeave } from "../../src/lib/visitorTracking";

/**
 * TrackingInitializer: Initializes campaign and engagement tracking.
 * Must be used in a client component and placed early in the app (e.g., in layout or page).
 *
 * - Captures UTM parameters from the landing page URL on first load
 * - Sets up click tracking for WhatsApp links across the entire page
 * - Initializes visitor tracking with page views and device detection
 *
 * This component does not render anything; it only sets up event listeners and storage.
 */
export function TrackingInitializer() {
  const initializeRef = useRef(false);

  useEffect(() => {
    // Only initialize once per component mount
    if (initializeRef.current) return;
    initializeRef.current = true;

    // Capture UTM on page load (only if not already captured)
    captureUtmParameters();

    // Initialize WhatsApp click tracking
    const cleanup = initializeWhatsAppClickTracking();

    // Initialize visitor tracking
    initializePageTracking();

    // Track page leave when user navigates away
    const handleBeforeUnload = () => {
      trackPageLeave();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Log initialization for debugging
    if (typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
      const wasClicked = sessionStorage.getItem("leor_whatsapp_clicked") === "true";
      console.debug("[tracking-init]", {
        utm_source: sessionStorage.getItem("leor_utm_source"),
        utm_medium: sessionStorage.getItem("leor_utm_medium"),
        utm_campaign: sessionStorage.getItem("leor_utm_campaign"),
        whatsapp_previously_clicked: wasClicked,
      });
    }

    return () => {
      if (typeof cleanup === "function") {
        cleanup();
      }
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return null;
}
