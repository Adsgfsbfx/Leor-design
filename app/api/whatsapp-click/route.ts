import { after } from "next/server";
import {
  mirrorLeadToGoogleSheets,
  type LeadSheetsMirrorRecord,
} from "../../../src/lib/leadSheetsMirror";
import { isRateLimited } from "../../../src/lib/rateLimit";
import { getSupabaseAdmin, SupabaseConfigurationError } from "../../../src/lib/supabaseAdmin";

const allowedSources = new Set([
  "header",
  "hero",
  "service card",
  "estimator",
  "bottom action bar",
  "floating button",
  "footer",
  "enquiry form",
]);
const allowedDevices = new Set(["mobile", "tablet", "desktop"]);
const stringValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

function invalid(message: string, status = 400) {
  return Response.json({ message }, { status });
}

function scheduleSheetsMirror(leadId: string) {
  after(async () => {
    try {
      const supabase = getSupabaseAdmin();
      const { data: lead, error: lookupError } = await supabase
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .single();
      if (lookupError) throw lookupError;
      if (!(await mirrorLeadToGoogleSheets(lead as LeadSheetsMirrorRecord))) return;

      const { error: updateError } = await supabase
        .from("leads")
        .update({ sheets_synced: true })
        .eq("id", leadId);
      if (updateError) throw updateError;
    } catch (error) {
      console.error("Optional Google Sheets WhatsApp mirror failed.", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

export async function POST(request: Request) {
  if (isRateLimited(request, "whatsapp-click", 40, 10 * 60 * 1000)) {
    return invalid("Please wait before trying again.", 429);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 8_192) return invalid("Invalid request.", 413);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return invalid("Invalid request.");
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return invalid("Invalid request.");
  }

  const data = payload as Record<string, unknown>;
  const source = stringValue(data.source);
  const deviceType = stringValue(data.deviceType);
  const message = stringValue(data.message);
  const pageUrl = stringValue(data.pageUrl);
  const utmSource = stringValue(data.utmSource);
  const utmMedium = stringValue(data.utmMedium);
  const utmCampaign = stringValue(data.utmCampaign);
  const estimatorSelections = stringValue(data.estimatorSelections);
  const indicativeEstimate = stringValue(data.indicativeEstimate);

  if (
    !allowedSources.has(source) ||
    !allowedDevices.has(deviceType) ||
    !message ||
    message.length > 2_000 ||
    pageUrl.length > 2_000 ||
    utmSource.length > 200 ||
    utmMedium.length > 200 ||
    utmCampaign.length > 200 ||
    estimatorSelections.length > 500 ||
    indicativeEstimate.length > 100
  ) {
    return invalid("Invalid request.");
  }

  try {
    const { data: result, error } = await getSupabaseAdmin().rpc("log_whatsapp_click", {
      p_source: source,
      p_page_url: pageUrl || null,
      p_utm_source: utmSource || null,
      p_utm_medium: utmMedium || null,
      p_utm_campaign: utmCampaign || null,
      p_device_type: deviceType,
      p_message_text: message,
      p_estimator_selections: estimatorSelections
        ? { selections: estimatorSelections }
        : null,
      p_indicative_estimate: indicativeEstimate || null,
    });
    if (error) throw error;

    const inserted = Array.isArray(result) ? result[0] : result;
    if (!inserted || typeof inserted.lead_id !== "string") {
      throw new Error("Supabase returned no WhatsApp click lead.");
    }
    scheduleSheetsMirror(inserted.lead_id);
    return Response.json({ message: "Click logged." }, { status: 201 });
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      console.error("Supabase WhatsApp click insert is not configured.", error.message);
    } else {
      console.error("Supabase WhatsApp click insert failed.", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
    return invalid("WhatsApp click logging is temporarily unavailable.", 503);
  }
}
