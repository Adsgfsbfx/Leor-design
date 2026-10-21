import "server-only";

import { google } from "googleapis";

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

const sheetScopes = ["https://www.googleapis.com/auth/spreadsheets"];
const pendingLeadAppends = new Map<string, Promise<void>>();

type GoogleSheetsEnvironment = {
  spreadsheetId: string;
  serviceAccountEmail: string;
  privateKey: string;
};

export class GoogleSheetsConfigurationError extends Error {
  constructor() {
    super("Google Sheets credentials are not configured.");
    this.name = "GoogleSheetsConfigurationError";
  }
}

export function isGoogleSheetsConfigured() {
  return Boolean(
    process.env.GOOGLE_SHEETS_ID?.trim() &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() &&
      process.env.GOOGLE_PRIVATE_KEY?.trim(),
  );
}

function getEnvironment(): GoogleSheetsEnvironment {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID?.trim();
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();

  if (!spreadsheetId || !serviceAccountEmail || !privateKey) {
    throw new GoogleSheetsConfigurationError();
  }

  return { spreadsheetId, serviceAccountEmail, privateKey };
}

function getSheetsClient(environment: GoogleSheetsEnvironment) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: environment.serviceAccountEmail,
      private_key: environment.privateKey,
    },
    scopes: sheetScopes,
  });

  return google.sheets({ version: "v4", auth });
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

async function ensureSheetTab(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  title: string,
  headers: readonly string[],
) {
  let spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.sheetId,sheets.properties.title",
  });
  const sheet = spreadsheet.data.sheets?.find((item) => item.properties?.title === title);

  if (!sheet) {
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: [{ addSheet: { properties: { title } } }] },
      });
    } catch (error) {
      spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: "sheets.properties.sheetId,sheets.properties.title",
      });
      if (!spreadsheet.data.sheets?.some((item) => item.properties?.title === title)) {
        throw error;
      }
    }
  }

  const headerRange = `'${title.replace(/'/g, "''")}'!A1:${String.fromCharCode(64 + headers.length)}1`;
  const header = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: headerRange,
  });

  if (!header.data.values?.[0]?.[0]) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: headerRange,
      valueInputOption: "RAW",
      requestBody: { values: [[...headers]] },
    });
  }
}

async function appendRows(
  title: string,
  headers: readonly string[],
  rows: string[][],
) {
  const environment = getEnvironment();
  const sheets = getSheetsClient(environment);
  await ensureSheetTab(sheets, environment.spreadsheetId, title, headers);
  const lastColumn = String.fromCharCode(64 + headers.length);

  await sheets.spreadsheets.values.append({
    spreadsheetId: environment.spreadsheetId,
    range: `'${title.replace(/'/g, "''")}'!A:${lastColumn}`,
    insertDataOption: "INSERT_ROWS",
    valueInputOption: "RAW",
    requestBody: { values: rows },
  });
}

async function hasLeadId(leadId: string) {
  const environment = getEnvironment();
  const sheets = getSheetsClient(environment);
  await ensureSheetTab(sheets, environment.spreadsheetId, "Leads", leadHeaders);
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: environment.spreadsheetId,
    range: "'Leads'!B2:B",
  });
  return result.data.values?.some(([existingId]) => existingId === leadId) ?? false;
}

export async function appendLeadRow(leadId: string, row: string[]) {
  if (row.length !== leadHeaders.length) {
    throw new Error("Lead row does not match the configured Google Sheets columns.");
  }
  const pending = pendingLeadAppends.get(leadId);
  if (pending) return pending;

  const append = (async () => {
    if (await hasLeadId(leadId)) return;
    await appendRows("Leads", leadHeaders, [row]);
  })();
  pendingLeadAppends.set(leadId, append);
  try {
    await append;
  } finally {
    pendingLeadAppends.delete(leadId);
  }
}
