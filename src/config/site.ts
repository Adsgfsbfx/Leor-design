export const site = {
  companyName: "Leor Design",
  address: "Hebbal, Bangalore, Karnataka",
  serviceArea: "Serving all of Bangalore",
  phoneNumber: "+91 8792385751",
  whatsappMessage: "Hi Leor Design, I'd like to discuss my home interiors.",
} as const;

export const phoneDisplay = site.phoneNumber.replace("+91 ", "");
export const phoneHref = `tel:${site.phoneNumber.replace(/\s/g, "")}`;

export function buildWhatsAppLink(message: string) {
  const number = site.phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

// Editable, indicative sample estimates only; confirm rates before publishing.
export const packageRates = {
  essential: 1499,
  signature: 2199,
  bespoke: 3199,
} as const;

// Editable add-on planning estimates only; confirm costs before publishing.
export const serviceAddOnEstimates = {
  paintingPerSqFt: 65,
  electricalAllowance: 18000,
} as const;

export const enquiryServiceOptions = [
  "Living Room",
  "Bedroom",
  "Modular Kitchen",
  "Wardrobe",
  "Complete Home",
  "Dining Area",
  "Painting",
  "Electrical Work",
  "Other",
] as const;

export const faqs = [
  {
    question: "Which areas of Bangalore does Leor Design work in?",
    answer:
      "We are based in Hebbal and serve homeowners across Bangalore. Share your locality and project details with us and we’ll confirm availability for your area.",
  },
  {
    question: "Do you handle painting and electrical work?",
    answer:
      "Yes. We can discuss interior wall painting, touch-ups, putty and polish, ceiling and woodwork finishes, and post-handover snag fixes. Electrical work can include new points and wiring, switches and fixtures, lighting, fan and appliance fittings, safety checks, and snag fixes. The exact scope is confirmed in your written proposal.",
  },
  {
    question: "What is included in an interior design project?",
    answer:
      "The scope is shaped around your home and brief. It can include space planning, design concepts, material and finish selection, custom storage, coordination, and installation. Your written proposal will spell out inclusions and exclusions before you proceed.",
  },
  {
    question: "How much do home interiors cost?",
    answer:
      "Every home is different. The indicative prices and calculator on this page are editable planning estimates only; final pricing depends on site dimensions, selected materials, scope, and current project requirements.",
  },
  {
    question: "Can I choose the materials and finishes?",
    answer:
      "Yes. We’ll help you compare finish, durability, maintenance, and budget so that selections suit the way you live. The exact options available are confirmed in your project proposal.",
  },
  {
    question: "Do you take up one-room projects or renovations?",
    answer:
      "Tell us what you have in mind. We can discuss individual rooms, upgrades, and full-home projects, then confirm whether the brief fits our current scope and schedule.",
  },
  {
    question: "How do I get started?",
    answer:
      "Send us your contact details, locality, and a short note about your home. We’ll use them to arrange an initial conversation and understand what you’re looking for.",
  },
] as const;
