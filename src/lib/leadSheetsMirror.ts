import "server-only";

import {
  appendLeadRow,
  formatIstTimestamp,
  isGoogleSheetsConfigured,
  sanitizeSheetText,
} from "./googleSheets";

export type LeadSheetsMirrorRecord = {
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

export async function mirrorLeadToGoogleSheets(lead: LeadSheetsMirrorRecord) {
  if (!isGoogleSheetsConfigured()) return false;

  const text = (value: string | null | undefined, maxLength: number) =>
    sanitizeSheetText(value ?? "", maxLength);
  const selections = lead.estimator_selections
    ? JSON.stringify(lead.estimator_selections)
    : "";

  await appendLeadRow(lead.id, [
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
  ]);

  return true;
}
