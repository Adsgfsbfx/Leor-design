/**
 * Cookie choice persistence for the first-party privacy prompt.
 */

export interface ConsentPreferences {
  essential: boolean;
  timestamp: number;
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
    if (typeof parsed.essential !== "boolean") return null;
    return {
      essential: parsed.essential,
      timestamp: typeof parsed.timestamp === "number" ? parsed.timestamp : 0,
    };
  } catch {
    return null;
  }
}

/**
 * Get the current consent preferences.
 * Returns the default choice when no preference has been saved.
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

  return { essential: false, timestamp: 0 };
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
