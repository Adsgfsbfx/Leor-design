import { createHmac, timingSafeEqual } from "node:crypto";
import {
  appendWhatsAppMessages,
  formatIstTimestamp,
  isGoogleSheetsConfigured,
  sanitizeSheetText,
} from "../../../../src/lib/googleSheets";

function webhookConfigured() {
  return Boolean(
    process.env.WHATSAPP_VERIFY_TOKEN &&
      process.env.WHATSAPP_APP_SECRET &&
      process.env.WHATSAPP_ACCESS_TOKEN &&
      process.env.WHATSAPP_PHONE_NUMBER_ID &&
      isGoogleSheetsConfigured(),
  );
}

export async function GET(request: Request) {
  if (!webhookConfigured()) {
    return new Response("WhatsApp webhook is not configured.", { status: 503 });
  }

  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expectedToken = Buffer.from(process.env.WHATSAPP_VERIFY_TOKEN ?? "");
  const receivedToken = Buffer.from(token ?? "");
  if (
    mode !== "subscribe" ||
    !token ||
    expectedToken.length !== receivedToken.length ||
    !timingSafeEqual(expectedToken, receivedToken) ||
    !challenge
  ) {
    return new Response("Webhook verification failed.", { status: 403 });
  }
  return new Response(challenge, { status: 200 });
}

type IncomingMessage = {
  from?: unknown;
  timestamp?: unknown;
  text?: { body?: unknown };
};

type IncomingContact = {
  wa_id?: unknown;
  profile?: { name?: unknown };
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function toTimestamp(value: unknown) {
  if (typeof value !== "string" || !/^\d{1,12}$/.test(value)) {
    return formatIstTimestamp();
  }
  const date = new Date(Number(value) * 1_000);
  return Number.isNaN(date.getTime()) ? formatIstTimestamp() : formatIstTimestamp(date);
}

export async function POST(request: Request) {
  if (!webhookConfigured()) {
    return Response.json({ message: "WhatsApp webhook is not configured." }, { status: 503 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 1_000_000) {
    return Response.json({ message: "Payload too large." }, { status: 413 });
  }

  const rawBody = Buffer.from(await request.arrayBuffer());
  if (rawBody.byteLength > 1_000_000) {
    return Response.json({ message: "Payload too large." }, { status: 413 });
  }
  const signature = request.headers.get("x-hub-signature-256") ?? "";
  const match = /^sha256=([a-f0-9]{64})$/i.exec(signature);
  if (!match || !process.env.WHATSAPP_APP_SECRET) {
    return Response.json({ message: "Invalid webhook signature." }, { status: 401 });
  }
  const expected = createHmac("sha256", process.env.WHATSAPP_APP_SECRET)
    .update(rawBody)
    .digest();
  const provided = Buffer.from(match[1], "hex");
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return Response.json({ message: "Invalid webhook signature." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return Response.json({ message: "Invalid webhook payload." }, { status: 400 });
  }

  const root = asRecord(payload);
  const entries = Array.isArray(root?.entry) ? root.entry : [];
  const rows: string[][] = [];
  for (const entry of entries) {
    const entryRecord = asRecord(entry);
    const changes = Array.isArray(entryRecord?.changes) ? entryRecord.changes : [];
    for (const change of changes) {
      const value = asRecord(asRecord(change)?.value);
      const messages = Array.isArray(value?.messages) ? value.messages as IncomingMessage[] : [];
      const contacts = Array.isArray(value?.contacts) ? value.contacts as IncomingContact[] : [];
      for (const message of messages) {
        const body = message.text?.body;
        if (typeof body !== "string" || typeof message.from !== "string") continue;
        const contact = contacts.find((item) => item.wa_id === message.from);
        rows.push([
          toTimestamp(message.timestamp),
          sanitizeSheetText(message.from, 40),
          sanitizeSheetText(typeof contact?.profile?.name === "string" ? contact.profile.name : "", 120),
          sanitizeSheetText(body, 4_000),
        ]);
      }
    }
  }

  try {
    await appendWhatsAppMessages(rows);
    return Response.json({ received: rows.length }, { status: 200 });
  } catch (error) {
    console.error(
      "Google Sheets WhatsApp webhook append failed.",
      error instanceof Error ? { name: error.name, message: error.message } : error,
    );
    return Response.json({ message: "Webhook storage is temporarily unavailable." }, { status: 503 });
  }
}
