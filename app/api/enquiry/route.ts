import { enquiryServiceOptions } from "../../../src/config/site";

type Enquiry = {
  name: string;
  mobile: string;
  email: string;
  propertyType: string;
  locality: string;
  requirements: string;
  servicesNeeded: string[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const stringValue = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 16_384) {
    return Response.json(
      { message: "Your enquiry is too large. Please shorten the details and try again." },
      { status: 413 },
    );
  }

  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return Response.json({ message: "Please check the enquiry details and try again." }, { status: 400 });
  }

  if (!isRecord(data)) {
    return Response.json({ message: "Please check the enquiry details and try again." }, { status: 400 });
  }

  const enteredMobile = stringValue(data.mobile);
  const digits = enteredMobile.replace(/\D/g, "");
  const mobile = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  const servicesNeeded = Array.isArray(data.servicesNeeded)
    ? data.servicesNeeded.filter(
        (service): service is string =>
          typeof service === "string" &&
          enquiryServiceOptions.some((option) => option === service),
      )
    : [];
  const enquiry: Enquiry = {
    name: stringValue(data.name),
    mobile,
    email: stringValue(data.email),
    propertyType: stringValue(data.propertyType),
    locality: stringValue(data.locality),
    requirements: stringValue(data.requirements),
    servicesNeeded,
  };

  if (
    !enquiry.name ||
    !/^[6-9]\d{9}$/.test(enquiry.mobile) ||
    !isEmail(enquiry.email) ||
    !["Apartment", "Villa", "Renovation", "Other"].includes(enquiry.propertyType) ||
    !enquiry.locality ||
    !enquiry.requirements ||
    enquiry.servicesNeeded.length === 0
  ) {
    return Response.json(
      { message: "Please check all fields, choose a service, and enter a valid Indian mobile number." },
      { status: 400 },
    );
  }

  const webhookUrl = process.env.LEOR_ENQUIRY_WEBHOOK_URL;
  if (!webhookUrl) {
    return Response.json(
      { message: "Enquiry delivery is not connected yet. Please call or WhatsApp us instead." },
      { status: 503 },
    );
  }

  let endpoint: URL;
  try {
    endpoint = new URL(webhookUrl);
  } catch {
    return Response.json(
      { message: "Enquiry delivery is misconfigured. Please call or WhatsApp us instead." },
      { status: 503 },
    );
  }
  if (endpoint.protocol !== "https:" && endpoint.protocol !== "http:") {
    return Response.json(
      { message: "Enquiry delivery is misconfigured. Please call or WhatsApp us instead." },
      { status: 503 },
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.LEOR_ENQUIRY_WEBHOOK_TOKEN
          ? { Authorization: `Bearer ${process.env.LEOR_ENQUIRY_WEBHOOK_TOKEN}` }
          : {}),
      },
      body: JSON.stringify(enquiry),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch {
    return Response.json(
      { message: "We couldn't reach the enquiry inbox. Please try again shortly." },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    return Response.json(
      { message: "We couldn't deliver your enquiry. Please try again shortly." },
      { status: 502 },
    );
  }

  return Response.json({ message: "Enquiry saved." }, { status: 201 });
}
