// All photographs are from Unsplash (free commercial licence) and are illustrative, not Leor projects.
// Source photo IDs are listed in ASSETS.md.
export type Photo = { src: string; alt: string };

const photo = (file: string, alt: string): Photo => ({ src: `/images/${file}`, alt });

export const photos = {
  hero: photo("hero-living-room-marble-wall.jpg", "Contemporary Indian living room with a marble feature wall and a mandir niche"),
  livingBright: photo("living-room-bright-leather-sofa.jpg", "Bright living room with a leather sofa and large windows"),
  livingNeutral: photo("living-room-neutral-chandelier.jpg", "Neutral-toned living room with a chandelier"),
  villaStaircase: photo("villa-living-staircase.jpg", "Villa living area with a sculpted staircase"),
  villaArched: photo("villa-living-arched-curtains.jpg", "Villa living room with arched openings and full-height curtains"),
  kitchenOak: photo("kitchen-white-oak-island.jpg", "Modular kitchen with white oak cabinets and an island"),
  kitchenGrey: photo("kitchen-modular-grey-island.jpg", "Modular grey kitchen with a breakfast island"),
  kitchenTimber: photo("kitchen-timber-cabinets.jpg", "Kitchen with timber cabinetry"),
  bedroomTimber: photo("bedroom-timber-wardrobe.jpg", "Bedroom with timber wardrobe and bed"),
  bedroomArched: photo("bedroom-arched-headboard.jpg", "Bedroom with an arched headboard wall"),
  bedroomFeature: photo("bedroom-feature-wall.jpg", "Bedroom with a feature wall"),
  wardrobeDressing: photo("wardrobe-dressing-unit.jpg", "Dressing unit with fitted wardrobe storage"),
  wardrobeWalkIn: photo("wardrobe-walk-in-timber.jpg", "Walk-in timber wardrobe"),
  oak: photo("finish-oak-grain.jpg", "Close-up of light oak wood grain"),
  walnut: photo("finish-walnut-grain.jpg", "Close-up of dark walnut wood grain"),
  fluted: photo("finish-fluted-panel.jpg", "Vertical fluted wood panel behind a bedside lamp"),
} as const;

export type ProjectCategory = "Living rooms" | "Kitchens" | "Bedrooms";
export const projectCategories: ProjectCategory[] = ["Living rooms", "Kitchens", "Bedrooms"];

export const concepts: { id: string; title: string; room: string; category: ProjectCategory; photo: Photo }[] = [
  { id: "c1", title: "Marble-wall living room", room: "Living room concept", category: "Living rooms", photo: photos.hero },
  { id: "c2", title: "White oak kitchen", room: "Modular kitchen concept", category: "Kitchens", photo: photos.kitchenOak },
  { id: "c3", title: "Timber bedroom suite", room: "Bedroom and wardrobe concept", category: "Bedrooms", photo: photos.bedroomTimber },
  { id: "c4", title: "Villa living and stair", room: "Villa concept", category: "Living rooms", photo: photos.villaStaircase },
  { id: "c5", title: "Grey island kitchen", room: "Modular kitchen concept", category: "Kitchens", photo: photos.kitchenGrey },
  { id: "c6", title: "Arched headboard bedroom", room: "Bedroom concept", category: "Bedrooms", photo: photos.bedroomArched },
  { id: "c7", title: "Neutral lounge", room: "Living room concept", category: "Living rooms", photo: photos.livingNeutral },
  { id: "c8", title: "Timber-fronted kitchen", room: "Modular kitchen concept", category: "Kitchens", photo: photos.kitchenTimber },
];
