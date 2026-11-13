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
        introduction="Leor Design plans residential interiors in Bangalore, serving homeowners across the city from Hebbal. Bring the rooms, routines and priorities you have in mind; the conversation can start with the whole home or the spaces that need attention first."
        relatedPath="/services/modular-kitchens"
        relatedLabel="Explore modular kitchens"
      >
        <section className={styles.section}>
          <h2>A considered plan for every room</h2>
          <p>Full home interiors bring the main spaces of an apartment or house into one connected plan. Rather than making decisions room by room in isolation, it helps to begin with how you use the home, what needs to be stored, and which details should feel consistent across spaces.</p>
          <p>Leor’s residential interiors include living areas, bedrooms, kitchens, wardrobes, TV units and ceilings. The right scope depends on the home and the work you want to take up.</p>
        </section>

      <section className={styles.section}>
        <h2>Planning for a 2BHK or 3BHK home</h2>
        <p>When comparing home interior designers in Bangalore for a 2BHK or 3BHK, make a room list and note the decisions that matter most to your household. That gives a useful starting point for discussing layout, storage and finishes without assuming every home needs the same specification.</p>
        <h3>Start with the way you live</h3>
        <ul>
          <li>List each room and the main activities it needs to support.</li>
          <li>Note existing furniture, appliances and storage that should be considered.</li>
          <li>Identify connected decisions, such as kitchen storage and dining or bedroom wardrobes and circulation.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>From first conversation to a clear scope</h2>
        <p>A useful first discussion covers the home, the spaces involved and your priorities. Site conditions and selections shape the final scope, so details can be worked through against the actual home rather than assumed in advance.</p>
        <p>For an early planning reference, visit the <Link href="/#estimator">home interior cost estimator</Link>. It is a starting point for discussion; the project scope depends on the home and selected work.</p>
        <aside className={styles.related}>
          <p>Considering one focused space first? See <Link href="/services/modular-kitchens">modular kitchen planning in Bangalore</Link>, or return to the <Link href="/">Leor Design homepage</Link>.</p>
        </aside>
      </section>
      </ServicePageShell>
    </>
  );
}
