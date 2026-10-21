export const imageCategories = [
  "All",
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Wardrobe",
  "Complete Home",
  "Dining",
  "Painting",
  "Electrical",
] as const;

export type ImageCategory = (typeof imageCategories)[number];

export const interiorImages = [
  {
    id: "living-room",
    label: "Living Room",
    category: "Living Room",
    src: "/images/living-room.jpg",
    alt: "Living Room",
    isSample: true,
  },
  {
    id: "bedroom",
    label: "Bedroom",
    category: "Bedroom",
    src: "/images/bedroom.jpg",
    alt: "Bedroom",
    isSample: true,
  },
  {
    id: "modular-kitchen",
    label: "Modular Kitchen",
    category: "Kitchen",
    src: "/images/modular-kitchen.jpg",
    alt: "Modular Kitchen",
    isSample: true,
  },
  {
    id: "wardrobe",
    label: "Wardrobe",
    category: "Wardrobe",
    src: "/images/wardrobe.jpg",
    alt: "Wardrobe",
    isSample: true,
  },
  {
    id: "complete-home",
    label: "Complete Home",
    category: "Complete Home",
    src: "/images/complete-home.jpg",
    alt: "Complete Home",
    isSample: true,
  },
  {
    id: "dining-area",
    label: "Dining Area",
    category: "Dining",
    src: "/images/dining-area.jpg",
    alt: "Dining Area",
    isSample: true,
  },
  {
    id: "painting",
    label: "Painting",
    category: "Painting",
    src: "/images/painting.jpg",
    alt: "Painting",
    isSample: true,
  },
  {
    id: "electrical-work",
    label: "Electrical Work",
    category: "Electrical",
    src: "/images/electrical-work.jpg",
    alt: "Electrical Work",
    isSample: true,
  },
] as const satisfies readonly {
  id: string;
  label: string;
  category: Exclude<ImageCategory, "All">;
  src: string;
  alt: string;
  isSample: true;
}[];
