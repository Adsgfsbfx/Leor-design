export const site = {
  companyName: "Leor Design",
  address: "Hebbal, Bangalore, Karnataka",
  serviceArea: "Serving all of Bangalore",
  phoneDisplay: "8050414570",
  phoneNumber: "+918050414570",
  whatsappNumber: "918050414570",
  whatsappMessage: "Hi Leor Design, I'd like to discuss my home interiors.",
  businessEmailPlaceholder: "Add confirmed business email before launch",
} as const;

export const images = {
  hero: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=88",
  living:
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85",
  bedroom:
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85",
  kitchen:
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=85",
  dining:
    "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&w=1000&q=85",
  wardrobe:
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=85",
  detail:
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85",
} as const;

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
  "Living rooms",
  "Bedrooms",
  "Kitchens",
  "Wardrobes",
  "Complete homes",
  "Painting",
  "Electrical work",
  "Other",
] as const;

export const services = [
  {
    title: "Living rooms",
    description: "A welcoming balance of comfort, flow, light, and the pieces you love.",
    image: images.living,
    alt: "Warm living room inspiration with natural light",
    icon: "⌂",
    points: ["Space planning", "Lighting and finishes", "Furniture and storage"],
  },
  {
    title: "Bedrooms",
    description: "Restful rooms with thoughtful storage and a softer end to the day.",
    image: images.bedroom,
    alt: "Relaxed bedroom interior inspiration",
    icon: "☾",
    points: ["Bedroom layouts", "Wardrobe planning", "Comfort-led finishes"],
  },
  {
    title: "Kitchens",
    description: "Hard-working layouts, considered finishes, and room for everyday rituals.",
    image: images.kitchen,
    alt: "Contemporary kitchen interior inspiration",
    icon: "✳",
    points: ["Kitchen planning", "Storage solutions", "Surface selections"],
  },
  {
    title: "Wardrobes",
    description: "Storage planned around your belongings, routines, and available space.",
    image: images.wardrobe,
    alt: "Calm wardrobe and built-in storage inspiration",
    icon: "▤",
    points: ["Built-in storage", "Internal organisation", "Finish choices"],
  },
  {
    title: "Complete homes",
    description: "A cohesive design language carried from the first room to the last detail.",
    image: images.dining,
    alt: "Cohesive dining interior inspiration",
    icon: "⌂",
    points: ["Whole-home design", "Coordinated finishes", "Delivery coordination"],
  },
  {
    title: "Snag & Finishing Works",
    description: "Practical finishing support to help bring your home together.",
    image: images.detail,
    alt: "Carefully finished interior detail used as a sample visual",
    icon: "✦",
    points: [
      "Painting: interior walls, touch-ups, putty & polish, ceiling and woodwork finishes, post-handover snag fixes",
      "Electrical: new points & wiring, switches & fixtures, lighting installation, fan & appliance fittings, safety checks and snag fixes",
    ],
  },
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

export const projects = [
  {
    title: "Quietly layered living",
    category: "Living",
    location: "Sample visual · Bangalore",
    image: images.living,
    alt: "Neutral-toned living room with an inviting, layered seating arrangement",
  },
  {
    title: "A softer start to the day",
    category: "Bedroom",
    location: "Sample visual · Bangalore",
    image: images.bedroom,
    alt: "Calm bedroom concept with warm natural textures",
  },
  {
    title: "Made for everyday rituals",
    category: "Kitchen",
    location: "Sample visual · Bangalore",
    image: images.kitchen,
    alt: "Contemporary kitchen interior with warm neutral finishes",
  },
  {
    title: "Room to gather",
    category: "Dining",
    location: "Sample visual · Bangalore",
    image: images.dining,
    alt: "Elegant dining area with a considered natural palette",
  },
  {
    title: "Storage, thoughtfully considered",
    category: "Wardrobe",
    location: "Sample visual · Bangalore",
    image: images.wardrobe,
    alt: "Built-in wardrobe and storage inspiration in a serene interior",
  },
  {
    title: "The beauty is in the details",
    category: "Living",
    location: "Sample visual · Bangalore",
    image: images.detail,
    alt: "Close view of a refined interior detail and natural materials",
  },
] as const;

export const sampleTestimonialsPlaceholder =
  "Add genuine, permission-approved Leor client testimonials here before publishing.";
