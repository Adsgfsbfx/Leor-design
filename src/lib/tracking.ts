"use client";

/**
 * Tracking utilities for UTM parameters and WhatsApp clicks.
 * Uses sessionStorage to persist campaign data across page navigation.
 */

const UTM_SOURCE_KEY = "leor_utm_source";
const UTM_MEDIUM_KEY = "leor_utm_medium";
const UTM_CAMPAIGN_KEY = "leor_utm_campaign";
const WHATSAPP_CLICKED_KEY = "leor_whatsapp_clicked";

/**
 * Extract and persist UTM parameters from the current URL to sessionStorage.
 * Only overwrites stored values if parameters are present in the URL.
 * Call this once on page load to capture landing page UTM values.
 */
export function captureUtmParameters(): void {
  if (typeof window === "undefined" || typeof sessionStorage === "undefined") {
    return;
  }

  const search = new URLSearchParams(window.location.search);
  const utmSource = search.get("utm_source");
  const utmMedium = search.get("utm_medium");
  const utmCampaign = search.get("utm_campaign");

  if (utmSource) sessionStorage.setItem(UTM_SOURCE_KEY, utmSource);
  if (utmMedium) sessionStorage.setItem(UTM_MEDIUM_KEY, utmMedium);
  if (utmCampaign) sessionStorage.setItem(UTM_CAMPAIGN_KEY, utmCampaign);
}

/**
 * Retrieve persisted UTM parameters from sessionStorage.
 * Returns object with utm_source, utm_medium, utm_campaign (empty string if not set).
 */
export function getPersistedUtmParameters(): {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
} {
  if (typeof sessionStorage === "undefined") {
    return { utm_source: "", utm_medium: "", utm_campaign: "" };
  }

  return {
    utm_source: sessionStorage.getItem(UTM_SOURCE_KEY) ?? "",
    utm_medium: sessionStorage.getItem(UTM_MEDIUM_KEY) ?? "",
    utm_campaign: sessionStorage.getItem(UTM_CAMPAIGN_KEY) ?? "",
  };
}

/**
 * Record that a WhatsApp link was clicked.
 * Sets a flag in sessionStorage to indicate engagement.
 */
export function recordWhatsAppClick(): void {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(WHATSAPP_CLICKED_KEY, "true");
  }
}

/**
 * Check if a WhatsApp link was clicked during this session.
 * Returns true if any WhatsApp click has been recorded.
 */
export function wasWhatsAppClicked(): boolean {
  if (typeof sessionStorage === "undefined") {
    return false;
  }

  return sessionStorage.getItem(WHATSAPP_CLICKED_KEY) === "true";
}

/**
 * Initialize click tracking for all WhatsApp links.
 * Adds a click listener to document that records clicks on WhatsApp buttons/links.
 * Call this once after the DOM is ready (e.g., in a useEffect with empty dependency array).
 */
export function initializeWhatsAppClickTracking(): (() => void) | void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  function handleClick(event: Event) {
    const target = event.target as HTMLElement;
    // Check for clicks on:
    // 1. Anchor tags with wa.me href
    // 2. Any element with onclick containing wa.me or whatsapp
    // 3. Buttons or elements inside a WhatsApp link
    const link = target.closest<HTMLElement>("a[href*='wa.me']");
    const button = target.closest<HTMLElement>("[onclick*='wa.me'], [onclick*='whatsapp']");
    const dataAttr = target.closest<HTMLElement>("[data-whatsapp]");
    
    if (link || button || dataAttr) {
      recordWhatsAppClick();
    }
  }

  // Use capture phase to catch clicks early
  document.addEventListener("click", handleClick, true);

  // Log that tracking was initialized
  if (typeof console !== "undefined") {
    console.debug("[tracking] WhatsApp click tracking initialized");
  }

  return () => {
    document.removeEventListener("click", handleClick, true);
  };
}
