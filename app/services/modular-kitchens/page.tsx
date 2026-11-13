import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "../../components/seo/json-ld";
import { ServicePageShell } from "../service-page-shell";
import styles from "../service-page.module.css";

const canonical = "https://leordesign.com/services/modular-kitchens";
const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${canonical}#service`,
  name: "Modular kitchen design",
  serviceType: "Modular kitchen design",
  description:
    "Leor Design plans modular kitchens in Bangalore around the room, cooking routines and appliances, with attention to layout, storage and finishes.",
  url: canonical,
  provider: { "@id": "https://leordesign.com/#organization" },
  areaServed: { "@type": "City", name: "Bangalore" },
};

export const metadata: Metadata = {
  title: "Modular Kitchen Designers in Bangalore | Leor Design",
  description: "Explore modular kitchen design in Bangalore with Leor Design in Hebbal. Plan layout, storage, appliances and finishes around your home and routines.",
  alternates: { canonical },
  openGraph: {
    type: "website",
    url: canonical,
    title: "Modular Kitchen Designers in Bangalore | Leor Design",
    description: "Explore modular kitchen design in Bangalore with Leor Design in Hebbal. Plan layout, storage, appliances and finishes around your home and routines.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Modular Kitchen Designers in Bangalore | Leor Design",
    description: "Explore modular kitchen design in Bangalore with Leor Design in Hebbal. Plan layout, storage, appliances and finishes around your home and routines.",
  },
};

export default function ModularKitchensPage() {
  return (
    <>
      <JsonLd data={serviceJsonLd} />
      <ServicePageShell
        eyebrow="Kitchen interiors · Hebbal, Bangalore"
        title="Modular kitchens planned for Bangalore homes"
        introduction="Leor Design plans modular kitchens in Bangalore, serving homes across the city from Hebbal. Start with the room, the way you cook and the appliances you use, then consider how layout, storage and finishes can work together."
        relatedPath="/services/full-home-interiors"
        relatedLabel="Explore full home interiors"
      >
      <section className={styles.section}>
        <h2>A kitchen plan begins with the space</h2>
        <p>A useful kitchen plan responds to the available room and its everyday use. The position of doors, windows, services and appliances can all affect how the layout comes together, so these are good details to bring into an initial discussion.</p>
        <p>Leor’s existing home-interior scope includes modular kitchens and wardrobes, including standalone kitchen projects. The right scope depends on the home and the work you want to take up.</p>
      </section>

      <section className={styles.section}>
        <h2>Decisions to consider for a modular kitchen</h2>
        <h3>Layout and movement</h3>
        <p>Consider how you move between preparation, cooking and cleaning areas, and how many people typically use the kitchen at once. A plan should be discussed against the actual room rather than a generic layout.</p>
        <h3>Storage, appliances and finishes</h3>
        <p>Make a list of the cookware and everyday items you want close at hand, along with appliance dimensions where available. Finishes can then be considered in relation to the wider home and the way the kitchen is used.</p>
      </section>

      <section className={styles.section}>
        <h2>Choosing kitchen designers in Bangalore</h2>
        <p>When comparing modular kitchen designers in Bangalore, share the room dimensions or a plan if you have one, note the appliances to accommodate, and clarify whether you are planning a standalone kitchen or a wider home project. These details help make the discussion specific to your space.</p>
        <p>For a broader view of connected rooms and storage, explore <Link href="/services/full-home-interiors">full home interiors in Bangalore</Link>. You can also use the <Link href="/#estimator">home interior cost estimator</Link> as an early planning reference.</p>
        <aside className={styles.related}>
          <p>Leor Design is based in Hebbal and serves homes across Bangalore. <Link href="/#enquire">Start a conversation about your kitchen</Link> or visit the <Link href="/">homepage</Link> to explore the wider service range.</p>
        </aside>
      </section>
      </ServicePageShell>
    </>
  );
}
