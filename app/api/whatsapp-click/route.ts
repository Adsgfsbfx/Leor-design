import { randomUUID } from "node:crypto";
import { appendWhatsAppClick, formatIstTimestamp, sanitizeSheetText } from "../../../src/lib/googleSheets";
import { isRateLimited } from "../../../src/lib/rateLimit";

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
const text = (value: unknown, max: number) =>
  typeof value === "string" ? sanitizeSheetText(value, max) : "";

export async function POST(request: Request) {
  if (isRateLimited(request, "whatsapp-click", 40, 10 * 60 * 1000)) {
    return Response.json({ message: "Please wait before trying again." }, { status: 429 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 8_192) {
    return Response.json({ message: "Invalid request." }, { status: 413 });
  }

  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return Response.json({ message: "Invalid request." }, { status: 400 });
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return Response.json({ message: "Invalid request." }, { status: 400 });
  }
  const payload = data as Record<string, unknown>;
  const source = text(payload.source, 50);
  const deviceType = text(payload.deviceType, 20);
  const message = text(payload.message, 2_000);
  if (
    !allowedSources.has(source) ||
    !allowedDevices.has(deviceType) ||
    !message
  ) {
    return Response.json({ message: "Invalid request." }, { status: 400 });
  }

  const row = [
    formatIstTimestamp(),
    randomUUID(),
    source,
    "",
    "",
    "",
    "",
    "",
    "",
    message,
    text(payload.estimatorSelections, 500),
    text(payload.indicativeEstimate, 100),
    text(payload.pageUrl, 2_000),
    text(payload.utmSource, 200),
    text(payload.utmMedium, 200),
    text(payload.utmCampaign, 200),
    deviceType,
    "Yes",
    "",
    "WhatsApp click (no details)",
    "",
  ];

  try {
    await appendWhatsAppClick(row);
    return Response.json({ message: "Click logged." }, { status: 201 });
  } catch (error) {
    console.error("Google Sheets WhatsApp click append failed.", error);
    return Response.json(
      { message: "Click logging is temporarily unavailable." },
      { status: 503 },
    );
  }
}
