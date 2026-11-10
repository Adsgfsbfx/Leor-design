"use client";

/**
 * Tracking utilities for UTM parameters and WhatsApp clicks.
 * Uses sessionStorage to persist campaign data across page navigation.
 */

const UTM_SOURCE_KEY = "leor_utm_source";
const UTM_MEDIUM_KEY = "leor_utm_medium";
const UTM_CAMPAIGN_KEY = "leor_utm_campaign";
const WHATSAPP_CLICKED_KEY = "leor_whatsapp_clicked";
const WHATSAPP_LEAD_ID_KEY = "leor_whatsapp_lead_id";

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
 * Captures a complete campaign tuple when any UTM parameter is present, clearing
 * omitted values so a previous campaign is not mixed into a new attribution.
 * Call this once on page load to capture landing-page UTM values for a form submit.
 */
export function captureUtmParameters(): void {
  const storage = getSessionStorage();
  if (!storage) return;

  const search = new URLSearchParams(window.location.search);
  const keys = ["utm_source", "utm_medium", "utm_campaign"] as const;
  if (!keys.some((key) => search.has(key))) return;

  try {
    const storageKeys = [UTM_SOURCE_KEY, UTM_MEDIUM_KEY, UTM_CAMPAIGN_KEY] as const;
    keys.forEach((key, index) => {
      const value = search.get(key)?.trim().slice(0, 200) ?? "";
      if (value) storage.setItem(storageKeys[index], value);
      else storage.removeItem(storageKeys[index]);
    });
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

/** Remember the most recent saved lead so a later WhatsApp click can be linked
 * to that lead in visitor analytics (when the visitor has opted into analytics).
 */
export function rememberWhatsAppLead(leadId: string): void {
  if (!leadId) return;
  try {
    getSessionStorage()?.setItem(WHATSAPP_LEAD_ID_KEY, leadId.slice(0, 100));
  } catch {
    // Linkage is optional; it must not block confirmation or WhatsApp navigation.
  }
}

export function getWhatsAppLeadId(): string {
  try {
    return getSessionStorage()?.getItem(WHATSAPP_LEAD_ID_KEY) ?? "";
  } catch {
    return "";
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
    const rawTarget = event.target;
    const target = rawTarget instanceof Element
      ? rawTarget
      : rawTarget instanceof Node
        ? rawTarget.parentElement
        : null;
    if (!target) return;

    const link = target.closest<HTMLAnchorElement>("a[href]");
    const href = link?.getAttribute("href") ?? "";
    if (/wa\.me|whatsapp/i.test(href) || target.closest("[data-whatsapp]")) recordWhatsAppClick();
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
