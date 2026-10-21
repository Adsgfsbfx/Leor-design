import { appendLead, formatIstTimestamp, GoogleSheetsConfigurationError, sanitizeSheetText } from "../../../src/lib/googleSheets";
import { isRateLimited } from "../../../src/lib/rateLimit";
import { enquiryServiceOptions } from "../../../src/config/site";

type EnquiryPayload = Record<string, unknown>;
type DeviceType = "mobile" | "tablet" | "desktop";

const allowedPropertyTypes = new Set(["Apartment", "Villa", "Renovation", "Other"]);
const allowedSources = new Set(["hero form", "enquiry form", "estimator", "service card"]);
const allowedDevices = new Set<DeviceType>(["mobile", "tablet", "desktop"]);
const stringValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const safe = (value: string, maxLength: number) => sanitizeSheetText(value, maxLength);

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
  const source = stringValue(payload.source);
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
    !allowedSources.has(source) ||
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

  try {
    await appendLead(idempotencyKey, (leadId) => [
      formatIstTimestamp(),
      leadId,
      safe(source, 50),
      safe(name, 120),
      safe(mobile, 10),
      safe(email, 254),
      safe(propertyType, 60),
      safe(locality, 120),
      safe(servicesNeeded.join(", "), 500),
      safe(
        whatsappClicked
          ? `${requirements}\n\nWhatsApp message: ${whatsappMessage}`
          : requirements,
        2_000,
      ),
      safe(estimatorSelections, 500),
      safe(indicativeEstimate, 100),
      safe(pageUrl, 2_000),
      safe(stringValue(payload.utmSource), 200),
      safe(stringValue(payload.utmMedium), 200),
      safe(stringValue(payload.utmCampaign), 200),
      deviceType,
      whatsappClicked ? "Yes" : "No",
      `Yes — ${formatIstTimestamp()}`,
      "New",
      "",
    ]);
    return Response.json({ message: "Enquiry saved." }, { status: 201 });
  } catch (error) {
    if (error instanceof GoogleSheetsConfigurationError) {
      console.error("Google Sheets enquiry append is not configured.", error.message);
      return invalid(
        "Our enquiry form is temporarily unavailable. Please call or WhatsApp us instead.",
        503,
      );
    }

    console.error(
      "Google Sheets enquiry append failed.",
      error instanceof Error ? { name: error.name, message: error.message } : error,
    );
    return invalid(
      "We couldn't save your enquiry right now. Please try again shortly or contact us by phone.",
      502,
    );
  }
}
