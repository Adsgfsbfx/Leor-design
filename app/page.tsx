import { connection } from "next/server";
import { Comparison, Commitments, DesignApproach, ConsultationSection, CostCards, CtaBand, DesignerCta, FinalCta, Footer, Gold, Heading, Highlights, Packages, ProjectsHeading, WhyLeor } from "./components/home/sections";
import { Estimator, Faq, Finishes, Projects } from "./components/home/interactive";
import TrustStrip from "./components/home/trust-strip";
import Navbar from "./components/navbar";
import Hero from "./components/hero";
import { ConsultationForm } from "./components/home/forms";
import { FloatingActions, OfferPopup } from "./components/home/overlays";

export const instant = false;

export default async function Home() {
  await connection();
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <CostCards />
        <section className="section" id="projects">
          <div className="wrap">
            <ProjectsHeading />
            <Projects />
            <CtaBand title="Get a free consultation" text="Like what you see? Tell us about your home." />
          </div>
        </section>
        <Highlights />
        <section className="section tint" id="estimator">
          <div className="wrap">
            <Heading eyebrow="Budget estimator" sub="Select your home size, finish level and add-ons to see a provisional range instantly.">
              Get your <Gold>instant estimate</Gold>
            </Heading>
            <Estimator />
          </div>
        </section>
        <Packages />
        <WhyLeor />
        <DesignApproach />
        <DesignerCta />
        <section className="section tint" id="finishes">
          <div className="wrap">
            <Heading eyebrow="Materials and finishes" sub="Tap a finish to preview it. Oak, walnut and fluted oak show real material photography; the three painted finishes are colour previews.">
              Finishes you can <Gold>see and feel</Gold>
            </Heading>
            <Finishes />
          </div>
        </section>
        <Comparison />
        <FinalCta />
        <section className="section" id="faq">
          <div className="wrap">
            <Heading align="left" eyebrow="FAQs" sub="Everything you need to know about working with Leor Design.">
              Frequently asked <Gold>questions</Gold>
            </Heading>
            <Faq />
          </div>
        </section>
        <Commitments />
        <ConsultationSection>
          <ConsultationForm />
        </ConsultationSection>
      </main>
      <Footer />
      <FloatingActions />
      <OfferPopup />
    </>
  );
}
