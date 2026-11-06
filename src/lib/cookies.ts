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

/**
 * Get the current consent preferences.
 * Returns default (analytics: false) if not set.
 */
export function getConsentPreferences(): ConsentPreferences {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return { analytics: false, essential: false, timestamp: 0 };
  }

  try {
    const stored = localStorage.getItem(CONSENT_PREFERENCES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ConsentPreferences;
      if (parsed && typeof parsed.analytics === "boolean") {
        return parsed;
      }
    }
  } catch {
    // localStorage may not be available or JSON parse failed
  }

  return { analytics: false, essential: false, timestamp: 0 };
}

/**
 * Set consent preferences.
 * Called when user makes a choice in the consent banner.
 */
export function setConsentPreferences(preferences: ConsentPreferences) {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return;
  }

  try {
    const toStore: ConsentPreferences = {
      ...preferences,
      timestamp: Date.now(),
    };
    localStorage.setItem(CONSENT_PREFERENCES_KEY, JSON.stringify(toStore));
    // Dismiss banner after setting preferences
    localStorage.setItem(CONSENT_BANNER_DISMISSED_KEY, "true");
  } catch {
    // localStorage may not be available
  }
}

/**
 * Check if the banner has been dismissed (user made a choice).
 */
export function hasBannerBeenDismissed(): boolean {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return false;
  }

  try {
    return localStorage.getItem(CONSENT_BANNER_DISMISSED_KEY) === "true";
  } catch {
    return false;
  }
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
  } else if (prefs.analytics === false && prefs.essential === true) {
    return "customized";
  } else {
    return "rejected";
  }
}

/**
 * Legacy function for backward compatibility.
 * Returns "accepted" | "rejected" | "unknown"
 */
export function getCookieConsent(): "accepted" | "rejected" | "unknown" {
  const status = getCookieConsentStatus();
  if (status === "customized") return "accepted"; // Treat customized as accepted (user gave some consent)
  return status;
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
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(CONSENT_PREFERENCES_KEY);
    localStorage.removeItem(CONSENT_BANNER_DISMISSED_KEY);
  } catch {
    // localStorage may not be available
  }
}
