import { isRateLimited } from "../../../src/lib/rateLimit";
import { saveVisitorEventToAppsScript, type GoogleSheetsVisitorEvent } from "../../../src/lib/visitorSheets";
import { GoogleAppsScriptConfigurationError } from "../../../src/lib/googleSheets";
import { getCloudflareContext } from "@opennextjs/cloudflare";

type VisitorEventPayload = Record<string, unknown>;

const allowedEventNames = new Set([
  "page_view",
  "page_leave",
  "navigation",
  "project_interaction",
  "service_interaction",
  "whatsapp_click",
  "phone_click",
  "form_start",
  "form_submit",
  "estimator_open",
  "estimator_complete",
  "estimator_interaction",
  "form_error",
  "cta_click",
  "scroll_depth",
]);

const stringValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const numberValue = (value: unknown) =>
  typeof value === "number" && !isNaN(value) && isFinite(value) ? value : 0;

function validateVisitorEvent(payload: VisitorEventPayload) {
  const eventName = stringValue(payload.eventName);
  const visitorId = stringValue(payload.visitorId);
  const sessionId = stringValue(payload.sessionId);
  const eventId = stringValue(payload.eventId);
  const pageUrl = stringValue(payload.pageUrl);
  const pageTitle = stringValue(payload.pageTitle);
  const previousPage = stringValue(payload.previousPage);
  const referralSource = stringValue(payload.referralSource);
  const utmSource = stringValue(payload.utmSource);
  const utmMedium = stringValue(payload.utmMedium);
  const utmCampaign = stringValue(payload.utmCampaign);
  const deviceType = stringValue(payload.deviceType);
  const browser = stringValue(payload.browser);
  const operatingSystem = stringValue(payload.operatingSystem);
  const timeOnPage = numberValue(payload.timeOnPage);
  const ctaName = stringValue(payload.ctaName);
  const cookieConsent = stringValue(payload.cookieConsent);
  const leadId = stringValue(payload.leadId);
  const entryPage = stringValue(payload.entryPage);
  const exitPage = stringValue(payload.exitPage);
  const sessionDuration = numberValue(payload.sessionDuration);
  const pageCategory = stringValue(payload.pageCategory);
  const clickedElement = stringValue(payload.clickedElement);
  const scrollDepth = numberValue(payload.scrollDepth);
  const screenResolution = stringValue(payload.screenResolution);
  const language = stringValue(payload.language);

  const errors: string[] = [];

  if (!visitorId) errors.push("visitorId is required");
  if (visitorId && visitorId.length > 100) errors.push("visitorId is too long");
  if (!sessionId) errors.push("sessionId is required");
  if (sessionId && sessionId.length > 100) errors.push("sessionId is too long");
  if (!eventId) errors.push("eventId is required");
  if (eventId && eventId.length > 100) errors.push("eventId is too long");
  if (!eventName) errors.push("eventName is required");
  if (!allowedEventNames.has(eventName)) errors.push(`eventName "${eventName}" is not in allowed list`);
  if (!pageUrl) errors.push("pageUrl is required");
  if (pageUrl && pageUrl.length > 2_000) errors.push("pageUrl is too long");
  if (pageTitle && pageTitle.length > 500) errors.push("pageTitle is too long");
  if (previousPage && previousPage.length > 2_000) errors.push("previousPage is too long");
  if (referralSource && referralSource.length > 200) errors.push("referralSource is too long");
  if (utmSource && utmSource.length > 200) errors.push("utmSource is too long");
  if (utmMedium && utmMedium.length > 200) errors.push("utmMedium is too long");
  if (utmCampaign && utmCampaign.length > 200) errors.push("utmCampaign is too long");
  if (deviceType && deviceType.length > 50) errors.push("deviceType is too long");
  if (browser && browser.length > 100) errors.push("browser is too long");
  if (operatingSystem && operatingSystem.length > 100) errors.push("operatingSystem is too long");
  if (timeOnPage < 0) errors.push("timeOnPage cannot be negative");
  if (ctaName && ctaName.length > 200) errors.push("ctaName is too long");
  if (!cookieConsent) errors.push("cookieConsent is required");
  if (cookieConsent !== "accepted") {
    errors.push("Analytics consent is required to record visitor events");
  }
  if (leadId && leadId.length > 100) errors.push("leadId is too long");
  if (entryPage.length > 2_000 || exitPage.length > 2_000) errors.push("entryPage or exitPage is too long");
  if (sessionDuration < 0 || sessionDuration > 31_536_000) errors.push("sessionDuration is outside the allowed range");
  if (pageCategory.length > 80 || clickedElement.length > 160) errors.push("pageCategory or clickedElement is too long");
  if (payload.scrollDepth !== "" && payload.scrollDepth !== undefined && (scrollDepth < 0 || scrollDepth > 100)) errors.push("scrollDepth must be between 0 and 100");
  if (screenResolution.length > 32 || language.length > 80) errors.push("screenResolution or language is too long");

  return {
    isValid: errors.length === 0,
    errors,
    parsed: {
      eventName,
      visitorId,
      sessionId,
      eventId,
      pageUrl,
      pageTitle,
      previousPage,
      referralSource,
      utmSource,
      utmMedium,
      utmCampaign,
      deviceType,
      browser,
      operatingSystem,
      timeOnPage,
      ctaName,
      cookieConsent,
      leadId,
      entryPage,
      exitPage,
      sessionDuration,
      pageCategory,
      clickedElement,
      scrollDepth: payload.scrollDepth === "" || payload.scrollDepth === undefined ? "" as const : scrollDepth,
      screenResolution,
      language,
    },
  };
}

function invalid(message: string, status = 400) {
  return Response.json({ message }, { status });
}

export async function POST(request: Request) {
  if (isRateLimited(request, "visitor-event", 30, 60 * 1000)) {
    return invalid("Too many requests. Please wait a little and try again.", 429);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 8_192) {
    return invalid("Request payload is too large.", 413);
  }

  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return invalid("Invalid JSON payload.");
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return invalid("Invalid payload structure.");
  }

  const payload = data as VisitorEventPayload;

  const validation = validateVisitorEvent(payload);
  if (!validation.isValid) {
    console.error("[visitor-event-api] Validation failed:", validation.errors);
    return invalid("Visitor event validation failed.", 400);
  }

  const {
    parsed: {
      eventName,
      visitorId,
      sessionId,
      eventId,
      pageUrl,
      pageTitle,
      previousPage,
      referralSource,
      utmSource,
      utmMedium,
      utmCampaign,
      deviceType,
      browser,
      operatingSystem,
      timeOnPage,
      ctaName,
      cookieConsent,
      leadId,
      entryPage,
      exitPage,
      sessionDuration,
      pageCategory,
      clickedElement,
      scrollDepth,
      screenResolution,
      language,
    },
  } = validation;

  const visitorEvent: GoogleSheetsVisitorEvent = {
    event_id: eventId,
    visitor_id: visitorId,
    session_id: sessionId,
    event_name: eventName,
    page_url: pageUrl,
    page_title: pageTitle,
    previous_page: previousPage,
    referral_source: referralSource,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    device_type: deviceType,
    browser,
    operating_system: operatingSystem,
    time_on_page: timeOnPage,
    cta_name: ctaName,
    cookie_consent: cookieConsent,
    lead_id: leadId,
    entry_page: entryPage,
    exit_page: exitPage,
    session_duration_seconds: sessionDuration,
    visit_count: "", // Calculated durably by Apps Script from Session Registry.
    page_category: pageCategory,
    clicked_element: clickedElement,
    scroll_depth_percent: scrollDepth,
    screen_resolution: screenResolution,
    language,
    approximate_location: trustedApproximateLocation(),
  };

  try {
    const saved = await saveVisitorEventToAppsScript(visitorEvent);
    return Response.json(
      {
        message: saved ? "Visitor event recorded." : "Visitor event already recorded.",
        eventId,
        duplicate: !saved,
      },
      { status: saved ? 201 : 200 },
    );
  } catch (error) {
    if (error instanceof GoogleAppsScriptConfigurationError) {
      console.error("[visitor-event-api] configuration_error");
      return invalid("System configuration error.", 500);
    }
    console.error("[visitor-event-api] error:", error);
    return invalid("Failed to record visitor event.", 500);
  }
}

function trustedApproximateLocation() {
  // Country/region are coarse; raw IP and city are never collected.
  try {
    const { cf } = getCloudflareContext();
    const country = typeof cf?.country === "string" ? cf.country.trim().slice(0, 8) : "";
    const region = typeof cf?.regionCode === "string" ? cf.regionCode.trim().slice(0, 32) : "";
    if (!/^[A-Z]{2}$/i.test(country)) return "";
    return [country.toUpperCase(), region].filter(Boolean).join("-");
  } catch {
    // Local Node.js development has no Cloudflare request context.
    return "";
  }
}
