"use client";

/**
 * Tracking utilities for UTM parameters and WhatsApp clicks.
 * Uses sessionStorage to persist campaign data across page navigation.
 */

const UTM_SOURCE_KEY = "leor_utm_source";
const UTM_MEDIUM_KEY = "leor_utm_medium";
const UTM_CAMPAIGN_KEY = "leor_utm_campaign";
const WHATSAPP_CLICKED_KEY = "leor_whatsapp_clicked";

function getSessionStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/**
 * Extract and persist UTM parameters from the current URL to sessionStorage.
 * Only overwrites stored values if parameters are present in the URL.
 * Call this once on page load to capture landing page UTM values.
 */
export function captureUtmParameters(): void {
  const storage = getSessionStorage();
  if (!storage) return;

  const search = new URLSearchParams(window.location.search);
  const utmSource = search.get("utm_source");
  const utmMedium = search.get("utm_medium");
  const utmCampaign = search.get("utm_campaign");

  try {
    if (utmSource) storage.setItem(UTM_SOURCE_KEY, utmSource);
    if (utmMedium) storage.setItem(UTM_MEDIUM_KEY, utmMedium);
    if (utmCampaign) storage.setItem(UTM_CAMPAIGN_KEY, utmCampaign);
  } catch {
    // Campaign storage is optional; it must not block a form or navigation.
  }
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
  const empty = { utm_source: "", utm_medium: "", utm_campaign: "" };
  const storage = getSessionStorage();
  if (!storage) return empty;
  try {
    return {
      utm_source: storage.getItem(UTM_SOURCE_KEY) ?? "",
      utm_medium: storage.getItem(UTM_MEDIUM_KEY) ?? "",
      utm_campaign: storage.getItem(UTM_CAMPAIGN_KEY) ?? "",
    };
  } catch {
    return empty;
  }
}

/**
 * Record that a WhatsApp link was clicked.
 * Sets a flag in sessionStorage to indicate engagement.
 */
export function recordWhatsAppClick(): void {
  try {
    getSessionStorage()?.setItem(WHATSAPP_CLICKED_KEY, "true");
  } catch {
    // Click tracking is optional and must not block opening WhatsApp.
  }
}

/**
 * Check if a WhatsApp link was clicked during this session.
 * Returns true if any WhatsApp click has been recorded.
 */
export function wasWhatsAppClicked(): boolean {
  try {
    return getSessionStorage()?.getItem(WHATSAPP_CLICKED_KEY) === "true";
  } catch {
    return false;
  }
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
