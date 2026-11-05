import { saveLeadToAppsScript, type GoogleSheetsLeadRecord } from "../../../src/lib/leadSheets";
import { isRateLimited } from "../../../src/lib/rateLimit";
import { enquiryServiceOptions } from "../../../src/config/site";
import { GoogleAppsScriptConfigurationError } from "../../../src/lib/googleSheets";

type EnquiryPayload = Record<string, unknown>;
type DeviceType = "mobile" | "tablet" | "desktop";
type EnquirySource = "hero_form" | "enquiry_form" | "estimator" | "service_card";

const allowedPropertyTypes = new Set(["Apartment", "Villa", "Renovation", "Other"]);
const sourceMapping: Record<string, EnquirySource> = {
  "enquiry form": "enquiry_form",
  estimator: "estimator",
  "service card": "service_card",
};
const allowedDevices = new Set<DeviceType>(["mobile", "tablet", "desktop"]);
const stringValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

function invalid(message: string, status = 400) {
  return Response.json({ message }, { status });
}

export async function POST(request: Request) {
  if (isRateLimited(request, "enquiry", 8, 15 * 60 * 1000)) {
    return invalid("Too many requests. Please wait a little and try again.", 429);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 16_384) {
    return invalid("Your enquiry is too large. Please shorten the details and try again.", 413);
  }

  const idempotencyKey = request.headers.get("idempotency-key")?.trim() ?? "";
  if (!/^[\w-]{16,200}$/.test(idempotencyKey)) {
    return invalid("Please refresh the page and try sending your enquiry again.");
  }

  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return invalid("Please check the enquiry details and try again.");
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return invalid("Please check the enquiry details and try again.");
  }

  const payload = data as EnquiryPayload;
  if (stringValue(payload.website)) {
    return invalid("Please check the enquiry details and try again.");
  }

  const enteredMobile = stringValue(payload.mobile);
  const normalizedMobile = enteredMobile.replace(/[\s-]/g, "");
  const mobile = normalizedMobile.startsWith("+91")
    ? normalizedMobile.slice(3)
    : normalizedMobile;
  const email = stringValue(payload.email);
  const propertyType = stringValue(payload.propertyType);
  const servicesNeeded = Array.isArray(payload.servicesNeeded)
    ? [...new Set(
        payload.servicesNeeded.filter(
          (service): service is (typeof enquiryServiceOptions)[number] =>
            typeof service === "string" &&
            enquiryServiceOptions.some((option) => option === service),
        ),
      )]
    : [];
  const requestedSource = stringValue(payload.source);
  const source = sourceMapping[requestedSource];
  const deviceType = stringValue(payload.deviceType) as DeviceType;
  const name = stringValue(payload.name);
  const locality = stringValue(payload.locality);
  const requirements = stringValue(payload.requirements);
  const estimatorSelections = stringValue(payload.estimatorSelections);
  const indicativeEstimate = stringValue(payload.indicativeEstimate);
  const whatsappClicked = payload.whatsappClicked === true;
  const whatsappMessage = stringValue(payload.whatsappMessage);

  if (
    !name ||
    name.length > 120 ||
    !/^[6-9]\d{9}$/.test(mobile) ||
    (email !== "" && (!isEmail(email) || email.length > 254)) ||
    !allowedPropertyTypes.has(propertyType) ||
    !locality ||
    locality.length > 120 ||
    !requirements ||
    requirements.length > 2_000 ||
    servicesNeeded.length === 0 ||
    payload.consent !== true ||
    !source ||
    !allowedDevices.has(deviceType) ||
    typeof payload.whatsappClicked !== "boolean" ||
    estimatorSelections.length > 500 ||
    indicativeEstimate.length > 100 ||
    (whatsappClicked && (!whatsappMessage || whatsappMessage.length > 2_000))
  ) {
    return invalid("Please check the required fields, consent, services, and Indian mobile number.");
  }

  const pageUrl = stringValue(payload.pageUrl);
  if (pageUrl.length > 2_000) {
    return invalid("Please check the enquiry details and try again.");
  }

  const utmSource = stringValue(payload.utmSource);
  const utmMedium = stringValue(payload.utmMedium);
  const utmCampaign = stringValue(payload.utmCampaign);
  if (utmSource.length > 200 || utmMedium.length > 200 || utmCampaign.length > 200) {
    return invalid("Please check the enquiry details and try again.");
  }

  const estimatorData = estimatorSelections
    ? { selections: estimatorSelections }
    : null;
  const leadId = idempotencyKey;
  const leadInput: GoogleSheetsLeadRecord = {
    id: leadId,
    created_at: new Date().toISOString(),
    source,
    name,
    mobile,
    email: email || null,
    property_type: propertyType,
    locality,
    services_needed: servicesNeeded,
    requirements: whatsappClicked
      ? `${requirements}\n\nWhatsApp message: ${whatsappMessage}`.slice(0, 2_000)
      : requirements,
    estimator_selections: estimatorData,
    indicative_estimate: indicativeEstimate || null,
    page_url: pageUrl || null,
    utm_source: utmSource || null,
    utm_medium: utmMedium || null,
    utm_campaign: utmCampaign || null,
    device_type: deviceType,
    whatsapp_clicked: whatsappClicked,
    consent: true,
    consent_at: new Date().toISOString(),
    status: "New",
  };

  try {
    const saved = await saveLeadToAppsScript(leadInput);
    return Response.json(
      { message: saved ? "Enquiry saved." : "Enquiry already saved." },
      { status: saved ? 201 : 200 },
    );
  } catch (error) {
    if (error instanceof GoogleAppsScriptConfigurationError) {
      console.error("[enquiry-api] configuration_error");
      return invalid(
        "Our enquiry form is not connected yet. Please try again later or contact us by phone.",
        503,
      );
    }

    console.error(`[enquiry-api] submission_failed ${JSON.stringify({
      errorType: error instanceof Error ? error.name : typeof error,
      reason: error instanceof Error ? error.message : "unknown_error",
    })}`);
    return invalid(
      "We couldn't save your enquiry right now. Please try again shortly or contact us by phone.",
      503,
    );
  }
}
