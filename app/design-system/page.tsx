import Link from "next/link";
import { Button, ButtonLink } from "../../components/ui/button";
import { Container } from "../../components/ui/container";
import { FadeUp, ImageReveal, Magnetic, Parallax, Reveal } from "../../components/ui/motion";
import { SectionLabel } from "../../components/ui/section-label";

const colors = [
  { name: "Redwood", value: "#6A4912", className: "bg-redwood", note: "Primary" },
  { name: "Tenne", value: "#B76308", className: "bg-tenne", note: "Warm accent" },
  { name: "Golden Bear", value: "#DEB228", className: "bg-golden-bear", note: "Highlight" },
  { name: "Aztec Gold", value: "#9F0C1F", className: "bg-aztec-gold", note: "Accent" },
  { name: "Sand Dollar", value: "#C29F8D", className: "bg-sand-dollar", note: "Material neutral" },
];

export const metadata = {
  title: "Design system | Leor Design",
  description: "Leor Design visual and motion system reference.",
};

export default function DesignSystemPage() {
  return <main className="ds-page">
    <header className="ds-header"><Container className="ds-header-inner"><Link href="/" className="ds-wordmark" aria-label="Leor Design home">Leor<span> / Design system</span></Link><span className="ds-header-note">Hebbal · Bangalore <i /></span></Container></header>
    <section className="ds-intro"><Container>
      <SectionLabel>Leor Design / Foundations</SectionLabel>
      <h1><Reveal>Quiet confidence.</Reveal><Reveal delay={.12}><em>Considered by design.</em></Reveal></h1>
      <FadeUp className="ds-intro-bottom"><p>A living reference for the visual language, type, color and motion behind Leor Design.</p><span>Version 01 <b>·</b> 2026</span></FadeUp>
    </Container></section>

    <section className="ds-section" id="palette"><Container>
      <div className="ds-section-head"><SectionLabel>01 / Palette</SectionLabel><h2>Grounded in warmth.</h2><p>Redwood and Sand Dollar build the foundation, with Tenne, Golden Bear and Aztec Gold adding warmth and contrast.</p></div>
      <div className="ds-swatches">{colors.map((color, index) => <FadeUp key={color.name} delay={index * .05} className="ds-swatch"><div className={`ds-swatch-color ${color.className}`} /><div className="ds-swatch-meta"><div><h3>{color.name}</h3><span>{color.note}</span></div><code>{color.value}</code></div></FadeUp>)}</div>
    </Container></section>

    <section className="ds-section ds-type-section" id="type"><Container>
      <div className="ds-section-head"><SectionLabel>02 / Typography</SectionLabel><h2>Editorial in voice.</h2><p>Cormorant Garamond gives the work its measured character. Inter keeps every detail clear.</p></div>
      <div className="ds-type-specimen"><div className="ds-type-display"><span>Display / Cormorant Garamond</span><p>Rooms with <em>room to breathe.</em></p><small>Light · expressive · architectural</small></div><div className="ds-type-body"><span>Body / Inter</span><p>Thoughtful spaces take shape around daily rituals, honest materials and the natural qualities of light.</p><small>Regular 16 / 28 · Medium 12 / 16</small></div></div>
      <div className="ds-scale"><div><span>Display 01</span><strong>Clarity in every detail.</strong><code>clamp(64px, 8vw, 120px) / 0.9</code></div><div><span>Display 02</span><strong>Made to live in.</strong><code>clamp(48px, 6vw, 88px) / 0.95</code></div><div><span>Heading 03</span><strong>Considered materials</strong><code>clamp(32px, 4vw, 56px) / 1.05</code></div><div><span>Eyebrow</span><strong className="ds-eyebrow-sample">A quieter kind of luxury</strong><code>10px / 0.2em tracking</code></div></div>
    </Container></section>

    <section className="ds-section"><Container>
      <div className="ds-section-head"><SectionLabel>03 / Actions</SectionLabel><h2>Quietly assured.</h2><p>Clear choices, a little movement, and no unnecessary decoration.</p></div>
      <div className="ds-buttons"><div><span>Primary</span><ButtonLink href="#motion">Explore the system</ButtonLink></div><div><span>Outline</span><ButtonLink href="#type" variant="outline">View our approach</ButtonLink></div><div><span>Text link</span><ButtonLink href="#palette" variant="link">Discover the details</ButtonLink></div><div><span>Magnetic</span><Magnetic><Button>Feel the response</Button></Magnetic></div></div>
    </Container></section>

    <section className="ds-motion-section" id="motion"><Container>
      <div className="ds-section-head"><SectionLabel>04 / Motion</SectionLabel><h2>Movement with intention.</h2><p>Unhurried transitions reveal structure and depth. Motion is removed when a visitor prefers reduced movement.</p></div>
      <div className="ds-motion-grid"><div className="ds-motion-copy"><span>01 / Masked text reveal</span><h3><Reveal>Light enters.</Reveal><Reveal delay={.15}><em>Space follows.</em></Reveal></h3><p>Reveal · 1.0s · cubic-bezier(0.22, 1, 0.36, 1)</p></div><div className="ds-motion-art"><Parallax distance={28} className="ds-parallax-card"><ImageReveal><div className="ds-arch"><div /><span>Image reveal / Parallax</span></div></ImageReveal></Parallax></div></div>
      <div className="ds-motion-note"><FadeUp><span>FadeUp</span><p>Soft entrance with restrained vertical travel.</p></FadeUp><FadeUp delay={.14}><span>ImageReveal</span><p>A calm clip-path reveal for interior photography.</p></FadeUp><FadeUp delay={.28}><span>Magnetic</span><p>Subtle pointer response on capable devices.</p></FadeUp><FadeUp delay={.42}><span>Parallax</span><p>Low amplitude depth that respects motion preferences.</p></FadeUp></div>
    </Container></section>

    <footer className="ds-footer"><Container><SectionLabel>Enduring by design</SectionLabel><p>Leor <em>Design</em></p><span>Redwood · Golden Bear · Sand Dollar</span></Container></footer>
  </main>;
}
