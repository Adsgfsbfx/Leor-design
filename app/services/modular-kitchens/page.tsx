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
        introduction="Leor Design plans modular kitchen interiors for homes across Bangalore from its Hebbal base. A considered modular kitchen design in Bangalore starts with your room, cooking routines and appliances, then brings layout, storage and finishes together."
        relatedPath="/services/full-home-interiors"
        relatedLabel="Explore full home interiors"
      >
      <section className={styles.section}>
        <h2>A kitchen plan begins with the space</h2>
        <p>A useful kitchen plan starts with the room you have and the way you use it. Note the location of doors, windows, plumbing and electrical points, and any fixed features that affect cabinet placement. These details help shape a plan around the actual space instead of a generic drawing.</p>
        <p>Leor Design is based in Hebbal and serves homes across Bangalore. You can discuss a standalone modular kitchen project or include the kitchen in a wider full-home interiors scope; the right scope depends on your home and the work you want to take up.</p>
      </section>

      <section className={styles.section}>
        <h2>Decisions to consider for a modular kitchen</h2>
        <h3>Layout and movement</h3>
        <p>Common layouts include a single run along one wall, parallel counters, and L- or U-shaped arrangements. Each creates a different route between preparation, cooking and cleaning areas. Think about where groceries are unpacked, where food is prepared and how people pass through the room. An island or breakfast counter only makes sense when the room allows comfortable movement around it.</p>
        <h3>Storage, appliances and finishes</h3>
        <p>Good modular kitchen storage solutions begin with what you actually keep: everyday crockery, cookware, pantry items, small appliances and cleaning supplies. Decide which items should be easiest to reach, and consider drawer, shelf and tall-unit locations around those routines. Share appliance make and model or confirmed dimensions, including the space and clearances the manufacturer specifies, before cabinet sizes are finalised.</p>
        <p>For modular kitchen design for apartments, take accurate measurements and note door swings, windows, service points and any building constraints before planning storage. Where the kitchen opens into a living or dining area, compare finish samples with nearby flooring, cabinetry and wall colours. Modern modular kitchen designs can use different combinations of colour, sheen and grain; the most cohesive choice is one that suits the home as well as the kitchen.</p>
        <h3>Materials and finishes</h3>
        <p>Plywood, MDF and HDHMR are board options; laminate, acrylic, PU, membrane and veneer describe finish choices. They have different looks and characteristics, and their suitability depends on the cabinet part, location and intended use. Discuss the specific application with Leor and review samples before deciding.</p>
        <ul>
          <li><strong>Plywood:</strong> Made from bonded layers of wood, it has a layered construction. Ask which grade and application are proposed for each part of the kitchen.</li>
          <li><strong>MDF:</strong> An engineered board with a smooth, even face that can suit selected painted or surfaced designs. Confirm where it is appropriate for the planned cabinet and the kitchen environment.</li>
          <li><strong>HDHMR:</strong> A dense engineered board option with a smooth surface. Discuss its intended use and the specified product for the cabinet location.</li>
          <li><strong>Laminate:</strong> A surface finish available in a range of colours, patterns and textures. Compare actual samples and edge details with the rest of the room.</li>
          <li><strong>Acrylic:</strong> Often selected for a sleek, reflective appearance. Its sheen can make fingerprints and reflections more noticeable, so consider the look in your kitchen’s lighting.</li>
          <li><strong>PU finish:</strong> A painted finish that can be specified in different colours and levels of sheen. Review a sample and ask about care for the selected finish.</li>
          <li><strong>Membrane finish:</strong> A wrapped finish that can give cabinet fronts a continuous appearance, including on some shaped profiles. Check the sample and confirm suitability for the intended location.</li>
          <li><strong>Veneer:</strong> A real-wood surface with natural variation in grain and tone. Look at a representative sample and consider how its wood colour will sit alongside other finishes.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Choosing kitchen designers in Bangalore</h2>
        <p>When comparing modular kitchen designers in Bangalore, ask how the discussion will account for your room, cooking routines, appliance dimensions and storage priorities. Bring a plan or measurements if available, and clarify whether you are considering a standalone kitchen or a wider home project. This gives the conversation a useful starting point without assuming that one layout or material suits every home.</p>
        <p>For a broader view of connected rooms and storage, explore <Link href="/services/full-home-interiors">full home interiors in Bangalore</Link>. You can also use the <Link href="/#estimator">home interior cost estimator</Link> as an early planning reference.</p>
        <aside className={styles.related}>
          <p>Leor Design is based in Hebbal and serves homes across Bangalore. <Link href="/#enquire">Start a conversation about your kitchen</Link> or visit the <Link href="/">homepage</Link> to explore the wider service range.</p>
        </aside>
      </section>
      </ServicePageShell>
    </>
  );
}
