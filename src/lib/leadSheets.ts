import "server-only";

import {
  formatIstTimestamp,
  getAppsScriptConfiguration,
  leadHeaders,
  sanitizeSheetText,
} from "./googleSheets";

export type GoogleSheetsLeadRecord = {
  id: string;
  created_at: string;
  source: string;
  name: string | null;
  mobile: string | null;
  email: string | null;
  property_type: string | null;
  locality: string | null;
  services_needed: string[] | null;
  requirements: string | null;
  estimator_selections: unknown;
  indicative_estimate: string | null;
  page_url: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  device_type: string | null;
  whatsapp_clicked: boolean;
  consent: boolean;
  consent_at: string | null;
  status: string;
};

const completedSubmissions = new Set<string>();
const pendingSubmissions = new Map<string, Promise<boolean>>();

function logWebhookDiagnostic(event: string, details: Record<string, string | number | boolean>) {
  console.error(`[enquiry-webhook] ${event} ${JSON.stringify(details)}`);
}

function classifyScriptError(error: unknown) {
  if (typeof error !== "string") return "missing_error_detail";
  if (error === "Unauthorized request") return "secret_rejected";
  if (error === "Leads sheet tab not found.") return "leads_tab_missing";
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
      return "Apps Script error message was redacted because it matched enquiry data.";
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

export async function saveLeadToAppsScript(lead: GoogleSheetsLeadRecord) {
  if (completedSubmissions.has(lead.id)) return false;
  const pending = pendingSubmissions.get(lead.id);
  if (pending) return pending;

  const text = (value: string | null | undefined, maxLength: number) =>
    sanitizeSheetText(value ?? "", maxLength);
  const selections = lead.estimator_selections
    ? JSON.stringify(lead.estimator_selections)
    : "";

  const row = [
    formatIstTimestamp(new Date(lead.created_at)),
    lead.id,
    text(lead.source, 50),
    text(lead.name, 120),
    text(lead.mobile, 10),
    text(lead.email, 254),
    text(lead.property_type, 60),
    text(lead.locality, 120),
    text(lead.services_needed?.join(", "), 500),
    text(lead.requirements, 2_000),
    text(selections, 500),
    text(lead.indicative_estimate, 100),
    text(lead.page_url, 2_000),
    text(lead.utm_source, 200),
    text(lead.utm_medium, 200),
    text(lead.utm_campaign, 200),
    text(lead.device_type, 20),
    lead.whatsapp_clicked ? "Yes" : "No",
    lead.consent_at ? `Yes — ${formatIstTimestamp(new Date(lead.consent_at))}` : "",
    text(lead.status, 100),
    "",
  ];
  if (row.length !== leadHeaders.length) {
    throw new Error("Lead row does not match the configured Google Sheets columns.");
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
          idempotencyKey: lead.id,
          ...lead,
          timestamp_ist: formatIstTimestamp(new Date(lead.created_at)),
          headers: [...leadHeaders],
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
        ...Object.values(lead).flatMap((value) => {
          if (typeof value === "string") return [value];
          if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
          if (value && typeof value === "object") return [JSON.stringify(value)];
          return [];
        }),
      ];
      logWebhookDiagnostic("script_failure", {
        status: response.status,
        errorCode: typeof scriptResult.errorCode === "string" && /^[a-z0-9_-]{1,60}$/i.test(scriptResult.errorCode)
          ? scriptResult.errorCode
          : classifyScriptError(scriptError),
        errorMessage: safeScriptErrorMessage(scriptError, sensitiveValues),
      });
      throw new Error("Google Apps Script reported that it could not save the enquiry.");
    }

    const saved = scriptResult.duplicate !== true;
    if (completedSubmissions.size >= 5_000) completedSubmissions.clear();
    completedSubmissions.add(lead.id);
    return saved;
  })();

  pendingSubmissions.set(lead.id, submission);
  try {
    return await submission;
  } finally {
    pendingSubmissions.delete(lead.id);
  }
}

function safeResponseHost(responseUrl: string) {
  try {
    return new URL(responseUrl).hostname;
  } catch {
    return "unknown";
  }
}
