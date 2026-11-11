/**
 * Cookie consent management.
 * Handles tracking of user's consent status for analytics and tracking.
 * Supports granular consent: Essential (always required) and Analytics (optional).
 */

export type ConsentChoice = "accepted" | "rejected" | "unknown" | "customized";

export interface ConsentPreferences {
  analytics: boolean;
  essential: boolean; // Always true when consent is given
  timestamp: number; // When preference was set
}

const CONSENT_PREFERENCES_KEY = "leor-cookie-preferences";
const CONSENT_BANNER_DISMISSED_KEY = "leor-consent-banner-dismissed";
const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 180;
let memoryPreferences: ConsentPreferences | null = null;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  try {
    const prefix = `${name}=`;
    const entry = document.cookie.split(";").map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith(prefix));
    return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
  } catch {
    return null;
  }
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;

  try {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${CONSENT_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
  } catch {
    // Cookies may be disabled by the browser; local storage remains a fallback.
  }
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;

  try {
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
  } catch {
    // Ignore unavailable cookie storage.
  }
}

function parsePreferences(value: string | null): ConsentPreferences | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<ConsentPreferences>;
    if (typeof parsed.analytics !== "boolean" || typeof parsed.essential !== "boolean") return null;
    return {
      analytics: parsed.analytics,
      essential: parsed.essential,
      timestamp: typeof parsed.timestamp === "number" ? parsed.timestamp : 0,
    };
  } catch {
    return null;
  }
}

/**
 * Get the current consent preferences.
 * Returns default (analytics: false) if not set.
 */
export function getConsentPreferences(): ConsentPreferences {
  const fromCookie = parsePreferences(readCookie(CONSENT_PREFERENCES_KEY));
  if (fromCookie) return fromCookie;

  if (typeof window !== "undefined") {
    try {
      const fromStorage = parsePreferences(window.localStorage.getItem(CONSENT_PREFERENCES_KEY));
      if (fromStorage) return fromStorage;
    } catch {
      // localStorage may be unavailable.
    }
  }

  if (memoryPreferences) return memoryPreferences;

  return { analytics: false, essential: false, timestamp: 0 };
}

/**
 * Set consent preferences.
 * Called when user makes a choice in the consent banner.
 */
export function setConsentPreferences(preferences: ConsentPreferences) {
  if (typeof window === "undefined") return;

  const toStore: ConsentPreferences = { ...preferences, timestamp: Date.now() };
  memoryPreferences = toStore;
  writeCookie(CONSENT_PREFERENCES_KEY, JSON.stringify(toStore));
  writeCookie(CONSENT_BANNER_DISMISSED_KEY, "true");

  try {
    window.localStorage.setItem(CONSENT_PREFERENCES_KEY, JSON.stringify(toStore));
    window.localStorage.setItem(CONSENT_BANNER_DISMISSED_KEY, "true");
  } catch {
    // The consent cookie remains the persistence fallback when localStorage is blocked.
  }
}

/**
 * Check if the banner has been dismissed (user made a choice).
 */
export function hasBannerBeenDismissed(): boolean {
  if (typeof window === "undefined") return false;
  if (readCookie(CONSENT_BANNER_DISMISSED_KEY) === "true") return true;
  if (parsePreferences(readCookie(CONSENT_PREFERENCES_KEY))?.essential) return true;

  try {
    if (window.localStorage.getItem(CONSENT_BANNER_DISMISSED_KEY) === "true") return true;
  } catch {
    // Keep the choice available in memory when browser storage is blocked.
  }
  return memoryPreferences?.essential === true;
}

/**
 * Check if analytics tracking is enabled.
 * Returns true only if explicitly opted in.
 */
export function hasAnalyticsConsent(): boolean {
  return getConsentPreferences().analytics === true;
}

/**
 * Check if essential functionality consent is given.
 * Returns true if user has made any consent choice.
 */
export function hasEssentialConsent(): boolean {
  return getConsentPreferences().essential === true;
}

/**
 * Get the consent status for Google Sheets (backward compatible).
 * Returns: "accepted" (all), "rejected" (all), "unknown" (not decided), or "customized" (selective)
 */
export function getCookieConsentStatus(): "accepted" | "rejected" | "unknown" | "customized" {
  if (!hasBannerBeenDismissed()) {
    return "unknown";
  }

  const prefs = getConsentPreferences();
  if (prefs.analytics === true) {
    return "accepted";
  }
  return prefs.essential ? "rejected" : "unknown";
}

/**
 * Legacy function for backward compatibility.
 * Returns "accepted" | "rejected" | "unknown"
 */
export function getCookieConsent(): "accepted" | "rejected" | "unknown" {
  const status = getCookieConsentStatus();
  return status === "customized" ? "rejected" : status;
}

/**
 * Check if visitor can be tracked (has accepted analytics).
 * Only returns true if user explicitly enabled analytics.
 */
export function canTrack(): boolean {
  return hasAnalyticsConsent();
}

/**
 * Reset all consent preferences (for testing).
 */
export function resetConsentPreferences() {
  memoryPreferences = null;
  deleteCookie(CONSENT_PREFERENCES_KEY);
  deleteCookie(CONSENT_BANNER_DISMISSED_KEY);
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(CONSENT_PREFERENCES_KEY);
    window.localStorage.removeItem(CONSENT_BANNER_DISMISSED_KEY);
  } catch {
    // localStorage may not be available
  }
}
