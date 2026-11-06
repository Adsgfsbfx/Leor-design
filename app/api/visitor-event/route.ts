import { isRateLimited } from "../../../src/lib/rateLimit";
import { saveVisitorEventToAppsScript, type GoogleSheetsVisitorEvent } from "../../../src/lib/visitorSheets";
import { GoogleAppsScriptConfigurationError } from "../../../src/lib/googleSheets";

type VisitorEventPayload = Record<string, unknown>;

const allowedEventNames = new Set([
  "page_view",
  "page_leave",
  "whatsapp_click",
  "phone_click",
  "form_start",
  "form_submit",
  "estimator_open",
  "estimator_complete",
  "cta_click",
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
  if (cookieConsent && !["accepted", "rejected", "unknown"].includes(cookieConsent)) {
    errors.push("cookieConsent must be 'accepted', 'rejected', or 'unknown'");
  }
  if (leadId && leadId.length > 100) errors.push("leadId is too long");

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
  };

  try {
    await saveVisitorEventToAppsScript(visitorEvent);
    return Response.json(
      {
        message: "Visitor event recorded.",
        eventId,
      },
      { status: 201 },
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
