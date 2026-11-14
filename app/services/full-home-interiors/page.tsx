import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "../../components/seo/json-ld";
import { ServicePageShell } from "../service-page-shell";
import styles from "../service-page.module.css";

const canonical = "https://leordesign.com/services/full-home-interiors";
const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${canonical}#service`,
  name: "Full home interior design",
  serviceType: "Residential interior design",
  description:
    "Leor Design plans residential interiors in Bangalore, from a whole home to the spaces that need attention first. Its residential interiors include living areas, bedrooms, kitchens, wardrobes, TV units and ceilings.",
  url: canonical,
  provider: { "@id": "https://leordesign.com/#organization" },
  areaServed: { "@type": "City", name: "Bangalore" },
};

export const metadata: Metadata = {
  title: "Full Home Interiors in Bangalore | Leor Design",
  description: "Plan full home interiors in Bangalore with Leor Design, based in Hebbal. Explore room-by-room planning for apartments, kitchens, bedrooms and storage.",
  alternates: { canonical },
  openGraph: {
    type: "website",
    url: canonical,
    title: "Full Home Interiors in Bangalore | Leor Design",
    description: "Plan full home interiors in Bangalore with Leor Design, based in Hebbal. Explore room-by-room planning for apartments, kitchens, bedrooms and storage.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Full Home Interiors in Bangalore | Leor Design",
    description: "Plan full home interiors in Bangalore with Leor Design, based in Hebbal. Explore room-by-room planning for apartments, kitchens, bedrooms and storage.",
  },
};

export default function FullHomeInteriorsPage() {
  return (
    <>
      <JsonLd data={serviceJsonLd} />
      <ServicePageShell
        eyebrow="Residential interiors · Hebbal, Bangalore"
        title="Full-home interiors, planned around your home"
        introduction="For homeowners looking for full home interior designers in Bangalore, Leor Design plans residential interiors from Hebbal for homes across the city. Full home interior design in Bangalore starts with your rooms, routines and priorities, whether you are planning the whole home or beginning with the spaces that need attention first."
        relatedPath="/services/modular-kitchens"
        relatedLabel="Explore modular kitchens"
      >
        <section className={styles.section}>
          <h2>A considered plan for every room</h2>
          <p>Full-home planning connects the rooms you use every day, so furniture, storage and finishes can be considered together. Start with how people move through the home, what each room needs to do and which pieces of furniture or appliances are staying. This gives the plan a practical basis before room-by-room choices are made.</p>
          <p>Leor Design is based in Hebbal and serves homes across Bangalore. Its residential interior scope includes living areas, bedrooms, kitchens, wardrobes, TV units and ceilings. You can discuss a complete home or the rooms you want to address first; the final scope depends on the home and selected work.</p>
          <h3>Living room planning</h3>
          <p>Begin with the furniture you use or plan to keep, then consider clear routes between the entrance, seating and other parts of the room. A TV unit can be planned with the screen, storage and nearby furniture in mind. Room dimensions, doors and windows help show where furniture and storage can fit without making movement awkward.</p>
          <h3>Bedrooms and usable storage</h3>
          <p>Bedroom planning balances bed placement, wardrobe access and the space needed to move around comfortably. List what each wardrobe needs to hold and note existing furniture, doors and windows. This helps keep storage useful while making the most of the available floor area.</p>
          <h3>Kitchens, ceilings and lighting</h3>
          <p>Kitchen planning should account for cooking routines, storage priorities and appliance dimensions. Coordinate the kitchen decisions with the rest of the home, or explore Leor’s <Link href="/services/modular-kitchens">modular kitchen service</Link> for a focused kitchen project. Ceiling and lighting choices can be discussed in relation to natural light, room use, furniture and the overall feel you want; the appropriate details depend on the actual space.</p>
          <h3>Coordinating materials and finishes</h3>
          <p>Choose finishes with the connected rooms in view. Comparing samples together can help you consider colour, sheen and texture across cabinetry, walls and other visible surfaces. A consistent palette does not require every room to match; relate the choices so the home feels considered as you move between spaces.</p>
        </section>

      <section className={styles.section}>
        <h2>Planning for a 2BHK or 3BHK home</h2>
        <p>For 2BHK interior planning, list the purpose of each room, the furniture that needs to fit and the storage gaps you want to solve. When comparing 2BHK interior designers in Bangalore, ask how those everyday needs will inform the room plan. For a 3BHK, note how each room will be used and whether its needs differ from the others; this gives 3BHK interior designers in Bangalore a clearer basis for discussing layout and storage.</p>
        <h3>Start with the way you live</h3>
        <ul>
          <li>List each room, who uses it and the activities it needs to support.</li>
          <li>Bring a floor plan or available measurements, plus photos that show fixed features and current conditions.</li>
          <li>Note furniture, appliances and storage you plan to keep, including dimensions when available.</li>
          <li>Write down priorities, style preferences, storage challenges and any practical constraints you already know about.</li>
        </ul>
        <p>Apartment interior design in Bangalore often starts with the unit’s own plan and fixed service points. For a villa, bring the floor plans for each level if available; when speaking with villa interior designers in Bangalore, clarify which areas are part of the project and how rooms connect across floors.</p>
      </section>

      <section className={styles.section}>
        <h2>From first conversation to a clear scope</h2>
        <p>A useful first discussion covers the home, the rooms you want help with, your priorities and the information you have prepared. Home interior designers in Bangalore should be able to discuss how the site, selected rooms and connected decisions shape the work. Leor’s scope is considered against the home and the work you want to take up, then clarified around the selected spaces and choices. When comparing residential interior designers in Bangalore, make sure you understand which rooms and types of work are included before moving ahead.</p>
        <p>For an early planning reference, visit the <Link href="/#estimator">home interior cost estimator</Link>. It is a starting point for discussion; the project scope depends on the home and selected work.</p>
        <aside className={styles.related}>
          <p>Considering one focused space first? See <Link href="/services/modular-kitchens">modular kitchen planning in Bangalore</Link>, or return to the <Link href="/">Leor Design homepage</Link>.</p>
        </aside>
      </section>
      </ServicePageShell>
    </>
  );
}
