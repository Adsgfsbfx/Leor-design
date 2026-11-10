import { getCookieConsent, hasAnalyticsConsent } from "./cookies";
import { getPersistedUtmParameters } from "./tracking";

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
  entryPage: string;
  exitPage: string;
  sessionDuration: number;
  visitCount: number | "";
  pageCategory: string;
  clickedElement: string;
  scrollDepth: number | "";
  screenResolution: string;
  language: string;
  approximateLocation: string;
}

type EventInput = Partial<VisitorTrackingPayload> & { eventName: string };
const VISITOR_ID_KEY = "leor-visitor-id";
const SESSION_ID_KEY = "leor-session-id";
const PREVIOUS_PAGE_KEY = "leor-previous-page";
const ATTRIBUTION_KEY = "leor-attribution";
const PENDING_KEY = "leor-pending-visitor-events";
const PAGE_STARTED_AT_KEY = "leor-page-started-at";
const SESSION_STARTED_AT_KEY = "leor-session-started-at";
const SESSION_ENTRY_PAGE_KEY = "leor-session-entry-page";
const SESSION_ACTIVE_SECONDS_KEY = "leor-session-active-seconds";
const SESSION_LAST_ACTIVITY_KEY = "leor-session-last-activity";
const SESSION_VISIBLE_AT_KEY = "leor-session-visible-at";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
let currentPageStartedAt = 0;
let pageExitSent = false;
let lastPageViewUrl = "";
let lastPageViewAt = 0;
const sentEventIds = new Set<string>();
const inFlight = new Set<AbortController>();

function safeGet(kind: "local" | "session", key: string) {
  try { return (kind === "local" ? localStorage : sessionStorage).getItem(key); } catch { return null; }
}
function safeSet(kind: "local" | "session", key: string, value: string) {
  try { (kind === "local" ? localStorage : sessionStorage).setItem(key, value); } catch { /* Storage may be blocked. */ }
}
function id() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}
function visitorId() {
  if (typeof window === "undefined") return "";
  const saved = safeGet("local", VISITOR_ID_KEY);
  if (saved) return saved;
  const created = id();
  safeSet("local", VISITOR_ID_KEY, created);
  return created;
}
function sessionId() {
  if (typeof window === "undefined") return "";
  const now = Date.now();
  const lastActivity = Number(safeGet("session", SESSION_LAST_ACTIVITY_KEY) ?? 0);
  if (!safeGet("session", SESSION_ID_KEY) || (lastActivity > 0 && now - lastActivity > SESSION_TIMEOUT_MS)) {
    const created = id();
    safeSet("session", SESSION_ID_KEY, created);
    safeSet("session", SESSION_STARTED_AT_KEY, String(now));
    safeSet("session", SESSION_ACTIVE_SECONDS_KEY, "0");
    safeSet("session", SESSION_ENTRY_PAGE_KEY, safePageUrl(window.location.href));
    safeSet("session", SESSION_LAST_ACTIVITY_KEY, String(now));
    safeSet("session", SESSION_VISIBLE_AT_KEY, document.visibilityState === "visible" ? String(now) : "0");
  }
  return safeGet("session", SESSION_ID_KEY) ?? "";
}
function sessionDurationSeconds() {
  const accumulated = Number(safeGet("session", SESSION_ACTIVE_SECONDS_KEY) ?? 0);
  const visibleSince = Number(safeGet("session", SESSION_VISIBLE_AT_KEY) ?? 0);
  return Math.max(0, Math.floor(accumulated + (visibleSince > 0 && document.visibilityState === "visible" ? (Date.now() - visibleSince) / 1000 : 0)));
}
export function updateSessionVisibility() {
  if (!hasAnalyticsConsent() || typeof document === "undefined") return;
  const visibleSince = Number(safeGet("session", SESSION_VISIBLE_AT_KEY) ?? 0);
  if (document.visibilityState === "hidden") {
    if (visibleSince > 0) {
      const accumulated = Number(safeGet("session", SESSION_ACTIVE_SECONDS_KEY) ?? 0);
      safeSet("session", SESSION_ACTIVE_SECONDS_KEY, String(accumulated + Math.max(0, (Date.now() - visibleSince) / 1000)));
    }
    safeSet("session", SESSION_VISIBLE_AT_KEY, "0");
  } else {
    safeSet("session", SESSION_VISIBLE_AT_KEY, String(Date.now()));
    safeSet("session", SESSION_LAST_ACTIVITY_KEY, String(Date.now()));
  }
}
function pageCategory(path: string) {
  const normalized = path.toLowerCase();
  if (/project|portfolio/.test(normalized)) return "project";
  if (/service/.test(normalized)) return "service";
  if (/gallery/.test(normalized)) return "gallery";
  if (/estimate|budget/.test(normalized)) return "estimator";
  if (/contact|enquir/.test(normalized)) return "enquiry";
  if (normalized === "/" || normalized === "") return "home";
  return "page";
}
function attribution() {
  if (typeof window === "undefined") return { source: "", medium: "", campaign: "", referral: "" };
  try {
    const saved = JSON.parse(safeGet("local", ATTRIBUTION_KEY) ?? "{}") as Record<string, string>;
    return { source: saved.source ?? "", medium: saved.medium ?? "", campaign: saved.campaign ?? "", referral: saved.referral ?? "" };
  } catch {
    return { source: "", medium: "", campaign: "", referral: "" };
  }
}
function detectDevice() {
  const ua = navigator.userAgent;
  const mobileHint = (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData?.mobile;
  if (mobileHint === true) return "mobile";
  if (/iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua))) return "tablet";
  if (/Mobi|iPhone|iPod|Android/i.test(ua)) return "mobile";
  return "desktop";
}
function detectBrowser() {
  const ua = navigator.userAgent;
  const brands = (navigator as Navigator & { userAgentData?: { brands?: { brand: string }[] } }).userAgentData?.brands;
  const hint = brands?.find(({ brand }) => /Microsoft Edge|Google Chrome|Opera/i.test(brand))?.brand;
  if (hint) return hint;
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\//.test(ua)) return "Opera";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/CriOS\//.test(ua)) return "Chrome iOS";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/FxiOS\//.test(ua)) return "Firefox iOS";
  if (/Safari\//.test(ua)) return "Safari";
  return "";
}
function detectOs() {
  const ua = navigator.userAgent;
  const platform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ?? "";
  if (/iPad|iPhone|iPod/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua))) return "iOS";
  if (/Windows/i.test(platform)) return "Windows";
  if (/Android/i.test(platform)) return "Android";
  if (/macOS/i.test(platform)) return "macOS";
  if (/Linux/i.test(platform)) return "Linux";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Android/i.test(ua)) return "Android";
  if (/Mac OS X|Macintosh/i.test(ua)) return "macOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "";
}
function secondsOnPage() {
  const started = currentPageStartedAt || Number(safeGet("session", PAGE_STARTED_AT_KEY) ?? 0);
  return started > 0 ? Math.max(0, Math.round((Date.now() - started) / 1000)) : 0;
}
function safePageUrl(value: string) {
  try {
    const url = new URL(value, window.location.origin);
    for (const key of [...url.searchParams.keys()]) {
      if (!/^utm_(source|medium|campaign)$/i.test(key)) url.searchParams.delete(key);
    }
    url.hash = "";
    return url.toString();
  } catch {
    return window.location.origin + window.location.pathname;
  }
}
function buildEvent(input: EventInput): VisitorTrackingPayload | null {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return null;
  const attr = attribution();
  const referrer = document.referrer ? (() => { try { const host = new URL(document.referrer).hostname; return host === location.hostname ? "" : host; } catch { return ""; } })() : "";
  const previous = safeGet("session", PREVIOUS_PAGE_KEY) ?? "";
  const pageUrl = safePageUrl(input.pageUrl ?? window.location.href);
  safeSet("session", SESSION_LAST_ACTIVITY_KEY, String(Date.now()));
  if (!safeGet("session", SESSION_ENTRY_PAGE_KEY)) safeSet("session", SESSION_ENTRY_PAGE_KEY, pageUrl);
  return {
    eventName: input.eventName,
    visitorId: visitorId(),
    sessionId: sessionId(),
    eventId: input.eventId ?? id(),
    pageUrl,
    pageTitle: input.pageTitle ?? document.title,
    previousPage: input.previousPage ?? previous,
    referralSource: input.referralSource ?? attr.referral ?? referrer,
    utmSource: input.utmSource ?? attr.source,
    utmMedium: input.utmMedium ?? attr.medium,
    utmCampaign: input.utmCampaign ?? attr.campaign,
    deviceType: input.deviceType ?? detectDevice(),
    browser: input.browser ?? detectBrowser(),
    operatingSystem: input.operatingSystem ?? detectOs(),
    timeOnPage: input.timeOnPage ?? secondsOnPage(),
    ctaName: input.ctaName ?? "",
    cookieConsent: getCookieConsent(),
    leadId: input.leadId ?? "",
    entryPage: safeGet("session", SESSION_ENTRY_PAGE_KEY) ?? pageUrl,
    exitPage: input.eventName === "page_leave" ? pageUrl : "",
    sessionDuration: sessionDurationSeconds(),
    visitCount: "",
    pageCategory: pageCategory(new URL(pageUrl).pathname),
    clickedElement: input.clickedElement ?? "",
    scrollDepth: input.scrollDepth ?? "",
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language ?? "",
    approximateLocation: "",
  };
}
function savePending(event: VisitorTrackingPayload) {
  try {
    const pending = JSON.parse(localStorage.getItem(PENDING_KEY) ?? "[]") as VisitorTrackingPayload[];
    if (!pending.some((item) => item.eventId === event.eventId)) {
      localStorage.setItem(PENDING_KEY, JSON.stringify([...pending.slice(-49), event]));
    }
  } catch { /* Best-effort queue only; never block the page. */ }
}
async function deliver(event: VisitorTrackingPayload, useBeacon = false) {
  if (!hasAnalyticsConsent() || sentEventIds.has(event.eventId)) return;
  sentEventIds.add(event.eventId);
  if (useBeacon && navigator.sendBeacon) {
    // Keep a retry copy until a later fetch receives an Apps Script acknowledgement.
    savePending(event);
    const accepted = navigator.sendBeacon("/api/visitor-event", new Blob([JSON.stringify(event)], { type: "application/json" }));
    if (accepted) return;
  }
  const controller = new AbortController();
  inFlight.add(controller);
  try {
    const response = await fetch("/api/visitor-event", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event), keepalive: useBeacon,
      signal: controller.signal,
    });
    inFlight.delete(controller);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (event.eventName === "page_view") safeSet("session", PREVIOUS_PAGE_KEY, event.pageUrl);
    try {
      const queued = JSON.parse(localStorage.getItem(PENDING_KEY) ?? "[]") as VisitorTrackingPayload[];
      localStorage.setItem(PENDING_KEY, JSON.stringify(queued.filter((item) => item.eventId !== event.eventId)));
    } catch { /* Ignore blocked storage. */ }
  } catch {
    inFlight.delete(controller);
    sentEventIds.delete(event.eventId);
    if (hasAnalyticsConsent()) savePending(event);
  }
}
export async function sendVisitorEvent(input: EventInput) {
  const event = buildEvent(input);
  if (event) await deliver(event);
}
export function captureAttribution() {
  if (!hasAnalyticsConsent()) return;
  const params = new URLSearchParams(window.location.search);
  const existing = attribution();
  const sessionUtm = getPersistedUtmParameters();
  const hasCampaign = ["utm_source", "utm_medium", "utm_campaign"].some((key) => params.has(key));
  let referral = existing.referral;
  if (!existing.source && !existing.medium && !existing.campaign && document.referrer) {
    try { const host = new URL(document.referrer).hostname; referral = host === location.hostname ? "" : host; } catch { /* Keep blank for invalid referrers. */ }
  }
  const next = hasCampaign ? {
    source: params.get("utm_source") ?? "", medium: params.get("utm_medium") ?? "", campaign: params.get("utm_campaign") ?? "", referral,
  } : {
    source: existing.source || sessionUtm.utm_source,
    medium: existing.medium || sessionUtm.utm_medium,
    campaign: existing.campaign || sessionUtm.utm_campaign,
    referral: existing.referral || referral,
  };
  safeSet("local", ATTRIBUTION_KEY, JSON.stringify(next));
  safeSet("session", "leor_utm_source", next.source);
  safeSet("session", "leor_utm_medium", next.medium);
  safeSet("session", "leor_utm_campaign", next.campaign);
}
export function initializePageTracking() {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return;
  const url = safePageUrl(window.location.href);
  if (url === lastPageViewUrl && Date.now() - lastPageViewAt < 1_000) return;
  lastPageViewUrl = url;
  lastPageViewAt = Date.now();
  captureAttribution();
  sessionId();
  if (document.visibilityState === "visible" && !Number(safeGet("session", SESSION_VISIBLE_AT_KEY) ?? 0)) {
    safeSet("session", SESSION_VISIBLE_AT_KEY, String(Date.now()));
  }
  currentPageStartedAt = Date.now();
  safeSet("session", PAGE_STARTED_AT_KEY, String(currentPageStartedAt));
  pageExitSent = false;
  const previousPage = safeGet("session", PREVIOUS_PAGE_KEY) ?? "";
  const event = buildEvent({ eventName: "page_view", previousPage, timeOnPage: 0 });
  if (event) {
    safeSet("session", PREVIOUS_PAGE_KEY, event.pageUrl);
    void deliver(event);
  }
}
export function trackPageLeave() {
  if (typeof window === "undefined" || pageExitSent || !hasAnalyticsConsent()) return;
  pageExitSent = true;
  updateSessionVisibility();
  const event = buildEvent({ eventName: "page_leave", timeOnPage: secondsOnPage() });
  if (event) void deliver(event, true);
}
export function clearQueuedTracking() {
  try { localStorage.removeItem(PENDING_KEY); } catch { /* Ignore blocked storage. */ }
  for (const controller of inFlight) controller.abort();
  inFlight.clear();
  sentEventIds.clear();
  for (const key of [VISITOR_ID_KEY, SESSION_ID_KEY, PREVIOUS_PAGE_KEY, ATTRIBUTION_KEY, SESSION_STARTED_AT_KEY, SESSION_ENTRY_PAGE_KEY, SESSION_ACTIVE_SECONDS_KEY, SESSION_LAST_ACTIVITY_KEY, SESSION_VISIBLE_AT_KEY, PAGE_STARTED_AT_KEY]) {
    try { localStorage.removeItem(key); sessionStorage.removeItem(key); } catch { /* Consent withdrawal still aborts pending delivery. */ }
  }
}
export function flushQueuedTracking() {
  if (!hasAnalyticsConsent()) return;
  try {
    const pending = JSON.parse(localStorage.getItem(PENDING_KEY) ?? "[]") as VisitorTrackingPayload[];
    for (const event of pending) void deliver(event);
  } catch { /* Ignore invalid or unavailable storage. */ }
}
