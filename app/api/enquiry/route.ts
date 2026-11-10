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

function validateEnquiry(payload: EnquiryPayload) {
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

  const errors: string[] = [];

  if (!name) errors.push("name is empty");
  if (name && name.length > 120) errors.push("name is too long");
  if (!/^[6-9]\d{9}$/.test(mobile)) errors.push(`mobile is invalid: "${mobile}" does not match pattern`);
  if (email !== "" && !isEmail(email)) errors.push("email format is invalid");
  if (email !== "" && email.length > 254) errors.push("email is too long");
  if (!allowedPropertyTypes.has(propertyType)) errors.push(`propertyType "${propertyType}" not in allowed list`);
  if (!locality) errors.push("locality is empty");
  if (locality && locality.length > 120) errors.push("locality is too long");
  if (!requirements) errors.push("requirements is empty");
  if (requirements && requirements.length > 2_000) errors.push("requirements is too long");
  if (servicesNeeded.length === 0) errors.push("servicesNeeded is empty");
  if (payload.consent !== true) errors.push("consent is not true");
  if (!source) errors.push(`source "${requestedSource}" not found in mapping`);
  if (!allowedDevices.has(deviceType)) errors.push(`deviceType "${deviceType}" not in allowed list`);
  if (typeof payload.whatsappClicked !== "boolean") {
    errors.push(`whatsappClicked is not a boolean, got: ${typeof payload.whatsappClicked} = ${JSON.stringify(payload.whatsappClicked)}`);
  }
  if (estimatorSelections && estimatorSelections.length > 500) errors.push("estimatorSelections is too long");
  if (indicativeEstimate && indicativeEstimate.length > 100) errors.push("indicativeEstimate is too long");
  if (whatsappClicked && (!whatsappMessage || whatsappMessage.length > 2_000)) {
    errors.push(`whatsappMessage is required when whatsappClicked=true, got length=${whatsappMessage.length}`);
  }

  const pageUrl = stringValue(payload.pageUrl);
  if (pageUrl && pageUrl.length > 2_000) errors.push("pageUrl is too long");

  const utmSource = stringValue(payload.utmSource);
  const utmMedium = stringValue(payload.utmMedium);
  const utmCampaign = stringValue(payload.utmCampaign);
  if (utmSource.length > 200) errors.push("utmSource is too long");
  if (utmMedium.length > 200) errors.push("utmMedium is too long");
  if (utmCampaign.length > 200) errors.push("utmCampaign is too long");

  return {
    isValid: errors.length === 0,
    errors,
    parsed: {
      name,
      mobile,
      email,
      propertyType,
      servicesNeeded,
      source,
      deviceType,
      locality,
      requirements,
      estimatorSelections,
      indicativeEstimate,
      whatsappClicked,
      whatsappMessage,
      pageUrl,
      utmSource,
      utmMedium,
      utmCampaign,
    },
  };
}

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

  const validation = validateEnquiry(payload);
  if (!validation.isValid) {
    console.error("[enquiry-api] Validation failed.");
    return invalid("Please check the required fields, consent, services, and Indian mobile number.");
  }

  const {
    parsed: {
      name,
      mobile,
      email,
      propertyType,
      servicesNeeded,
      source,
      deviceType,
      locality,
      requirements,
      estimatorSelections,
      indicativeEstimate,
      whatsappClicked,
      whatsappMessage,
      pageUrl,
      utmSource,
      utmMedium,
      utmCampaign,
    },
  } = validation;

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
      {
        message: saved ? "Enquiry saved." : "Enquiry already saved.",
        leadId,
        whatsapp_clicked: whatsappClicked,
      },
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
