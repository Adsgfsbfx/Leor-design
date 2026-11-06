import { getCookieConsent, hasAnalyticsConsent } from "./cookies";

export interface VisitorTrackingPayload {
  eventName: string;
  visitorId: string;
  sessionId: string;
  eventId: string;
  pageUrl: string;
  pageTitle: string;
  previousPage: string;
  referralSource: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  deviceType: string;
  browser: string;
  operatingSystem: string;
  timeOnPage: number;
  ctaName: string;
  cookieConsent: "accepted" | "rejected" | "unknown";
  leadId: string;
}

const VISITOR_ID_KEY = "leor-visitor-id";
const SESSION_ID_KEY = "leor-session-id";
const PREVIOUS_PAGE_KEY = "leor-previous-page";
const PAGE_START_TIME_KEY = "leor-page-start-time";

function generateRandomId(length = 16) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  const stored = sessionStorage.getItem(VISITOR_ID_KEY);
  if (stored) return stored;
  const newId = generateRandomId(16);
  try {
    sessionStorage.setItem(VISITOR_ID_KEY, newId);
  } catch {
    // sessionStorage may not be available
  }
  return newId;
}

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  const stored = sessionStorage.getItem(SESSION_ID_KEY);
  if (stored) return stored;
  const newId = generateRandomId(16);
  try {
    sessionStorage.setItem(SESSION_ID_KEY, newId);
  } catch {
    // sessionStorage may not be available
  }
  return newId;
}

function generateEventId(): string {
  return `${Date.now()}-${generateRandomId(8)}`;
}

function getPreviousPage(): string {
  if (typeof window === "undefined") return "";
  const stored = sessionStorage.getItem(PREVIOUS_PAGE_KEY);
  return stored || "";
}

function updatePreviousPage(currentUrl: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PREVIOUS_PAGE_KEY, currentUrl);
  } catch {
    // sessionStorage may not be available
  }
}

function getTimeOnPage(): number {
  if (typeof window === "undefined") return 0;
  const stored = sessionStorage.getItem(PAGE_START_TIME_KEY);
  if (!stored) return 0;
  const startTime = parseInt(stored, 10);
  if (isNaN(startTime)) return 0;
  return Math.round((Date.now() - startTime) / 1000);
}

function resetPageStartTime() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PAGE_START_TIME_KEY, String(Date.now()));
  } catch {
    // sessionStorage may not be available
  }
}

function detectDeviceType(): string {
  if (typeof window === "undefined") return "unknown";
  const userAgent = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) return "tablet";
  if (/mobile|android|iphone|ipod|windows phone|blackberry/i.test(userAgent)) return "mobile";
  return "desktop";
}

function detectBrowser(): string {
  if (typeof window === "undefined") return "unknown";
  const userAgent = navigator.userAgent;
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Chrome")) {
    if (userAgent.includes("Edge")) return "Edge";
    if (userAgent.includes("Chromium")) return "Chromium";
    return "Chrome";
  }
  if (userAgent.includes("Safari")) return "Safari";
  if (userAgent.includes("Opera") || userAgent.includes("OPR")) return "Opera";
  return "unknown";
}

function detectOperatingSystem(): string {
  if (typeof window === "undefined") return "unknown";
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes("win")) return "Windows";
  if (userAgent.includes("mac")) return "macOS";
  if (userAgent.includes("linux")) return "Linux";
  if (userAgent.includes("android")) return "Android";
  if (userAgent.includes("iphone") || userAgent.includes("ipad")) return "iOS";
  return "unknown";
}

function getUtmTracking(): { source: string; medium: string; campaign: string } {
  if (typeof window === "undefined") return { source: "", medium: "", campaign: "" };
  try {
    const stored = sessionStorage.getItem("leor-utm-source");
    return {
      source: stored ? JSON.parse(stored).source || "" : "",
      medium: stored ? JSON.parse(stored).medium || "" : "",
      campaign: stored ? JSON.parse(stored).campaign || "" : "",
    };
  } catch {
    return { source: "", medium: "", campaign: "" };
  }
}

function getReferralSource(): string {
  if (typeof window === "undefined") return "";
  if (typeof document === "undefined") return "";
  const referrer = document.referrer;
  if (!referrer) return "";
  try {
    const referrerUrl = new URL(referrer);
    if (referrerUrl.hostname === window.location.hostname) return "";
    return referrerUrl.hostname || referrer;
  } catch {
    return referrer;
  }
}

export async function sendVisitorEvent(payload: Partial<VisitorTrackingPayload>) {
  // Only send visitor events if analytics consent is granted
  if (!hasAnalyticsConsent()) {
    console.debug("[visitor-tracking] Skipping event - analytics consent not granted");
    return;
  }

  const visitorId = getOrCreateVisitorId();
  const sessionId = getOrCreateSessionId();
  const eventId = generateEventId();
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const pageTitle = typeof document !== "undefined" ? document.title : "";
  const previousPage = getPreviousPage();
  const timeOnPage = getTimeOnPage();
  const utm = getUtmTracking();
  const referralSource = getReferralSource();
  const cookieConsent = getCookieConsent();

  const event: VisitorTrackingPayload = {
    eventName: payload.eventName || "page_view",
    visitorId,
    sessionId,
    eventId,
    pageUrl,
    pageTitle,
    previousPage,
    referralSource,
    utmSource: payload.utmSource || utm.source,
    utmMedium: payload.utmMedium || utm.medium,
    utmCampaign: payload.utmCampaign || utm.campaign,
    deviceType: payload.deviceType || detectDeviceType(),
    browser: payload.browser || detectBrowser(),
    operatingSystem: payload.operatingSystem || detectOperatingSystem(),
    timeOnPage: payload.timeOnPage ?? timeOnPage,
    ctaName: payload.ctaName || "",
    cookieConsent,
    leadId: payload.leadId || "",
  };

  try {
    const response = await fetch("/api/visitor-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      console.warn(`[visitor-tracking] API returned ${response.status}`);
    }
  } catch (error) {
    console.warn("[visitor-tracking] Failed to send event:", error instanceof Error ? error.message : error);
  }
}

export function initializePageTracking() {
  if (typeof window === "undefined") return;
  const currentUrl = window.location.href;
  updatePreviousPage(currentUrl);
  resetPageStartTime();
  sendVisitorEvent({ eventName: "page_view" });
}

export function trackPageLeave() {
  if (typeof window === "undefined") return;
  const timeOnPage = getTimeOnPage();
  sendVisitorEvent({ eventName: "page_leave", timeOnPage });
}
