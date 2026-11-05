import "server-only";

export const leadHeaders = [
  "Timestamp (IST)",
  "Lead ID",
  "Source",
  "Name",
  "Mobile",
  "Email",
  "Property Type",
  "Locality",
  "Services Needed",
  "Requirements",
  "Estimator Selections",
  "Indicative Estimate",
  "Page URL",
  "UTM Source",
  "UTM Medium",
  "UTM Campaign",
  "Device Type",
  "WhatsApp Clicked",
  "Consent",
  "Status",
  "Follow-up Notes",
] as const;

export class GoogleAppsScriptConfigurationError extends Error {
  constructor() {
    super("Google Apps Script webhook credentials are not configured correctly.");
    this.name = "GoogleAppsScriptConfigurationError";
  }
}

export function getAppsScriptConfiguration() {
  const url = process.env.GOOGLE_APPS_SCRIPT_URL?.trim();
  const secret = process.env.LEOR_WEBHOOK_SECRET?.trim();

  if (!url || !secret) {
    throw new GoogleAppsScriptConfigurationError();
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new GoogleAppsScriptConfigurationError();
  }

  if (
    parsedUrl.protocol !== "https:" ||
    !["script.google.com", "script.googleusercontent.com"].includes(parsedUrl.hostname)
  ) {
    throw new GoogleAppsScriptConfigurationError();
  }

  return { url: parsedUrl, secret };
}

export function sanitizeSheetText(value: string, maxLength: number) {
  const trimmed = value.trim().slice(0, maxLength);
  return /^[=+\-@]/.test(trimmed) ? `'${trimmed}` : trimmed;
}

export function formatIstTimestamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")} ${part("hour")}:${part("minute")}:${part("second")} IST`;
}
