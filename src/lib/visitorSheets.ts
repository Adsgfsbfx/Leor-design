import "server-only";

import {
  formatIstTimestamp,
  getAppsScriptConfiguration,
  sanitizeSheetText,
} from "./googleSheets";

export const visitorHeaders = [
  "Timestamp (IST)",
  "Anonymous Visitor ID",
  "Session ID",
  "Event ID",
  "Event Name",
  "Page URL",
  "Page Title",
  "Previous Page",
  "Referral Source",
  "UTM Source",
  "UTM Medium",
  "UTM Campaign",
  "Device Type",
  "Browser",
  "Operating System",
  "Time on Page (Seconds)",
  "CTA Name",
  "Cookie Consent Status",
  "Lead ID",
  "Entry Page",
  "Exit Page",
  "Session Duration (Seconds)",
  "Visit Count",
  "Page Category",
  "Clicked Element",
  "Scroll Depth (%)",
  "Screen Resolution",
  "Language",
  "Approximate Location",
] as const;

export type GoogleSheetsVisitorEvent = {
  event_id: string;
  visitor_id: string;
  session_id: string;
  event_name: string;
  page_url: string;
  page_title: string;
  previous_page: string;
  referral_source: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  device_type: string;
  browser: string;
  operating_system: string;
  time_on_page: number;
  cta_name: string;
  cookie_consent: string;
  lead_id: string;
  entry_page: string;
  exit_page: string;
  session_duration_seconds: number;
  visit_count: number | "";
  page_category: string;
  clicked_element: string;
  scroll_depth_percent: number | "";
  screen_resolution: string;
  language: string;
  approximate_location: string;
};

const completedSubmissions = new Set<string>();
const pendingSubmissions = new Map<string, Promise<boolean>>();

function logWebhookDiagnostic(event: string, details: Record<string, string | number | boolean>) {
  console.error(`[visitor-webhook] ${event} ${JSON.stringify(details)}`);
}

function classifyScriptError(error: unknown) {
  if (typeof error !== "string") return "missing_error_detail";
  if (error === "Unauthorized request") return "secret_rejected";
  if (error === "Visitor Footprints sheet tab not found.") return "visitor_tab_missing";
  if (/cannot read properties of null.*getSheetByName/i.test(error)) {
    return "active_spreadsheet_unavailable";
  }
  if (/LEOR_SPREADSHEET_ID is not configured/i.test(error)) {
    return "spreadsheet_id_not_configured";
  }
  return "apps_script_reported_failure";
}

function extractScriptError(result: Record<string, unknown>) {
  const error = result.error;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && !Array.isArray(error)) {
    const nestedMessage = (error as { message?: unknown }).message;
    if (typeof nestedMessage === "string") return nestedMessage;
  }
  return typeof result.message === "string" ? result.message : undefined;
}

function safeScriptErrorMessage(
  error: unknown,
  sensitiveValues: string[],
) {
  if (typeof error !== "string" || !error.trim()) {
    return "Apps Script returned no textual error message.";
  }

  let message = error.replace(/[\r\n\t]+/g, " ").trim();
  for (const value of sensitiveValues) {
    if (!value) continue;
    if (value.length < 4 && message.includes(value)) {
      return "Apps Script error message was redacted because it matched tracking data.";
    }
    message = message.split(value).join("[redacted]");
  }
  message = message
    .replace(/https?:\/\/\S+/gi, "[redacted-url]")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[redacted-email]")
    .replace(/\+?\d[\d ().-]{7,}\d/g, "[redacted-number]")
    .replace(/\b[A-Z0-9_-]{25,}\b/gi, "[redacted-id]");

  return message.slice(0, 240) || "Apps Script error message was redacted.";
}

export async function saveVisitorEventToAppsScript(event: GoogleSheetsVisitorEvent) {
  if (completedSubmissions.has(event.event_id)) return false;
  const pending = pendingSubmissions.get(event.event_id);
  if (pending) return pending;

  const text = (value: string, maxLength: number) =>
    sanitizeSheetText(value ?? "", maxLength);

  const row = [
    formatIstTimestamp(new Date()),
    text(event.visitor_id, 100),
    text(event.session_id, 100),
    text(event.event_id, 100),
    text(event.event_name, 50),
    text(event.page_url, 2_000),
    text(event.page_title, 500),
    text(event.previous_page, 2_000),
    text(event.referral_source, 200),
    text(event.utm_source, 200),
    text(event.utm_medium, 200),
    text(event.utm_campaign, 200),
    text(event.device_type, 50),
    text(event.browser, 100),
    text(event.operating_system, 100),
    String(Math.max(0, event.time_on_page)),
    text(event.cta_name, 200),
    text(event.cookie_consent, 20),
    text(event.lead_id, 100),
    text(event.entry_page, 2_000),
    text(event.exit_page, 2_000),
    String(Math.max(0, event.session_duration_seconds)),
    event.visit_count === "" ? "" : String(Math.max(1, event.visit_count)),
    text(event.page_category, 80),
    text(event.clicked_element, 160),
    event.scroll_depth_percent === "" ? "" : String(Math.min(100, Math.max(0, event.scroll_depth_percent))),
    text(event.screen_resolution, 32),
    text(event.language, 80),
    text(event.approximate_location, 80),
  ];

  if (row.length !== visitorHeaders.length) {
    throw new Error("Visitor event row does not match the configured Google Sheets columns.");
  }

  const submission = (async () => {
    const { url, secret } = getAppsScriptConfiguration();
    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret,
          record_type: "visitor_event",
          idempotencyKey: event.event_id,
          ...event,
          headers: [...visitorHeaders],
          row,
        }),
        signal: AbortSignal.timeout(15_000),
      });
    } catch (error) {
      logWebhookDiagnostic("network_error", {
        errorType: error instanceof Error ? error.name : typeof error,
      });
      throw new Error("Google Apps Script request could not be completed.");
    }

    if (!response.ok) {
      logWebhookDiagnostic("http_error", {
        status: response.status,
        responseHost: safeResponseHost(response.url),
      });
      throw new Error(`Google Apps Script returned HTTP ${response.status}.`);
    }

    const responseText = await response.text();
    let result: unknown;
    try {
      result = JSON.parse(responseText);
    } catch {
      logWebhookDiagnostic("invalid_json", {
        status: response.status,
        contentType: response.headers.get("content-type") ?? "unknown",
        responseHost: safeResponseHost(response.url),
      });
      throw new Error("Google Apps Script returned an invalid JSON response.");
    }

    if (!result || typeof result !== "object" || Array.isArray(result)) {
      throw new Error("Google Apps Script returned an invalid response.");
    }

    const scriptResult = result as {
      success?: unknown;
      duplicate?: unknown;
      errorCode?: unknown;
    };
    if (scriptResult.success !== true) {
      const scriptError = extractScriptError(result as Record<string, unknown>);
      const sensitiveValues = [
        secret,
        url.href,
        ...Object.values(event).filter((value): value is string => typeof value === "string"),
      ];
      logWebhookDiagnostic("script_failure", {
        status: response.status,
        errorCode: typeof scriptResult.errorCode === "string" && /^[a-z0-9_-]{1,60}$/i.test(scriptResult.errorCode)
          ? scriptResult.errorCode
          : classifyScriptError(scriptError),
        errorMessage: safeScriptErrorMessage(scriptError, sensitiveValues),
      });
      throw new Error("Google Apps Script reported that it could not save the visitor event.");
    }

    const saved = scriptResult.duplicate !== true;
    if (completedSubmissions.size >= 5_000) completedSubmissions.clear();
    completedSubmissions.add(event.event_id);
    return saved;
  })();

  pendingSubmissions.set(event.event_id, submission);
  try {
    return await submission;
  } finally {
    pendingSubmissions.delete(event.event_id);
  }
}

function safeResponseHost(responseUrl: string) {
  try {
    return new URL(responseUrl).hostname;
  } catch {
    return "unknown";
  }
}
