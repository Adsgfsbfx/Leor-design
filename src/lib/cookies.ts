/**
 * Cookie consent management.
 * Handles tracking of user's consent status for analytics and tracking.
 */

type CookieConsentStatus = "accepted" | "rejected" | "unknown";

const CONSENT_STATUS_KEY = "leor-cookie-consent-status";

/**
 * Get the current cookie consent status.
 * Returns "accepted", "rejected", or "unknown" if consent has not been explicitly set.
 */
export function getCookieConsent(): CookieConsentStatus {
  if (typeof window === "undefined" || typeof sessionStorage === "undefined") {
    return "unknown";
  }

  try {
    const stored = sessionStorage.getItem(CONSENT_STATUS_KEY) as CookieConsentStatus | null;
    if (stored === "accepted" || stored === "rejected") {
      return stored;
    }
  } catch {
    // sessionStorage may not be available
  }

  return "unknown";
}

/**
 * Set the cookie consent status.
 * Should be called when the user makes a consent decision.
 */
export function setCookieConsent(status: CookieConsentStatus) {
  if (typeof window === "undefined" || typeof sessionStorage === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(CONSENT_STATUS_KEY, status);
  } catch {
    // sessionStorage may not be available
  }
}

/**
 * Check if visitor has accepted analytics tracking.
 * Returns true if consent is explicitly "accepted", false otherwise.
 */
export function hasAnalyticsConsent(): boolean {
  return getCookieConsent() === "accepted";
}

/**
 * Check if visitor can be tracked (has accepted or status is unknown).
 * In "unknown" state, optional tracking proceeds (assume consent until told otherwise).
 */
export function canTrack(): boolean {
  const consent = getCookieConsent();
  return consent === "accepted" || consent === "unknown";
}
