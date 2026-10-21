import { createHmac, timingSafeEqual } from "node:crypto";
import { getSupabaseAdmin, isSupabaseConfigured } from "../../../../src/lib/supabaseAdmin";

function webhookConfigured() {
  return Boolean(
    process.env.WHATSAPP_VERIFY_TOKEN?.trim() &&
      process.env.WHATSAPP_APP_SECRET?.trim() &&
      process.env.WHATSAPP_ACCESS_TOKEN?.trim() &&
      process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() &&
      isSupabaseConfigured(),
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
  id?: unknown;
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

function messageTimestamp(value: unknown) {
  if (typeof value !== "string" || !/^\d{1,12}$/.test(value)) {
    return new Date().toISOString();
  }
  const date = new Date(Number(value) * 1_000);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
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
  const messagesToInsert: {
    wa_message_id: string;
    created_at: string;
    from_phone: string;
    profile_name: string;
    message_text: string;
    direction: "inbound";
  }[] = [];
  for (const entry of entries) {
    const entryRecord = asRecord(entry);
    const changes = Array.isArray(entryRecord?.changes) ? entryRecord.changes : [];
    for (const change of changes) {
      const value = asRecord(asRecord(change)?.value);
      const messages = Array.isArray(value?.messages)
        ? value.messages as IncomingMessage[]
        : [];
      const contacts = Array.isArray(value?.contacts)
        ? value.contacts as IncomingContact[]
        : [];
      for (const message of messages) {
        const body = message.text?.body;
        if (
          typeof message.id !== "string" ||
          message.id.length > 200 ||
          typeof message.from !== "string" ||
          message.from.length > 40 ||
          typeof body !== "string"
        ) {
          continue;
        }
        const contact = contacts.find((item) => item.wa_id === message.from);
        const profileName =
          typeof contact?.profile?.name === "string"
            ? contact.profile.name.slice(0, 120)
            : "";
        messagesToInsert.push({
          wa_message_id: message.id,
          created_at: messageTimestamp(message.timestamp),
          from_phone: message.from,
          profile_name: profileName,
          message_text: body.slice(0, 4_000),
          direction: "inbound",
        });
      }
    }
  }

  try {
    if (messagesToInsert.length > 0) {
      const { error } = await getSupabaseAdmin()
        .from("whatsapp_messages")
        .upsert(messagesToInsert, {
          onConflict: "wa_message_id",
          ignoreDuplicates: true,
        });
      if (error) throw error;
    }
    return Response.json({ received: messagesToInsert.length }, { status: 200 });
  } catch (error) {
    console.error("Supabase WhatsApp webhook insert failed.", {
      message: error instanceof Error ? error.message : String(error),
    });
    return Response.json({ message: "Webhook storage is temporarily unavailable." }, { status: 503 });
  }
}
