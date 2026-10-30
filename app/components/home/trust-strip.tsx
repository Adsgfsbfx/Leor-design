"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Container } from "../../../components/ui/container";

const commitments = [
  { title: "Free consultation", subtitle: "First meeting at no cost", icon: "conversation" },
  { title: "Transparent budgets", subtitle: "Clear ranges upfront", icon: "budget" },
  { title: "Compare finishes", subtitle: "See and feel materials", icon: "finishes" },
  { title: "Written proposal", subtitle: "Scope agreed in writing", icon: "proposal" },
  { title: "Hebbal studio", subtitle: "Serving all Bangalore", icon: "location" },
  { title: "Clear timelines", subtitle: "Dated schedule you can track", icon: "timeline" },
] as const;

function CommitmentIcon({ name }: { name: (typeof commitments)[number]["icon"] }) {
  const shared = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths = {
    conversation: <><path d="M8 19 4 21v-5a8 8 0 1 1 4 3Z"/><path d="M8 10h8M8 14h5"/></>,
    budget: <><path d="M7 3h8l4 4v14H5V3z"/><path d="M15 3v5h4M8 12h8M8 16h4"/></>,
    finishes: <><path d="M4 5h7v7H4zM13 5h7v7h-7zM4 14h7v6H4zM13 14h7v6h-7z"/></>,
    proposal: <><path d="M7 3h8l4 4v14H5V3z"/><path d="M15 3v5h4M8 12h8M8 16h8"/></>,
    location: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    timeline: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></>,
  };
  return <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" {...shared}>{paths[name]}</svg>;
}

export default function TrustStrip() {
  const reduce = useReducedMotion();
  const [hasEntered, setHasEntered] = useState(false);
  const listVariants = { hidden: {}, visible: { transition: { staggerChildren: reduce ? 0 : .07 } } };
  const itemVariants = { hidden: { opacity: 0, y: reduce ? 0 : 12 }, visible: { opacity: 1, y: 0 } };

  return <section className={`leor-trust-strip${hasEntered ? " is-visible" : ""}`} aria-label="Leor Design commitments">
    <Container>
      <motion.ul className="leor-trust-grid" aria-label="Studio commitments" tabIndex={0} data-lenis-prevent variants={listVariants} initial={reduce ? false : "hidden"} whileInView="visible" onViewportEnter={() => setHasEntered(true)} viewport={{ once: true, amount: .2 }}>
        {commitments.map((item) => <motion.li className="leor-trust-item" key={item.title} variants={itemVariants} transition={{ duration: reduce ? 0 : .6, ease: [.22, 1, .36, 1] }}>
          <span className="leor-trust-icon"><CommitmentIcon name={item.icon}/></span>
          <div className="leor-trust-copy">
            <h2 className="leor-trust-title">{item.title}</h2>
            <p className="leor-trust-subtitle">{item.subtitle}</p>
          </div>
        </motion.li>)}
      </motion.ul>
    </Container>
  </section>;
}
