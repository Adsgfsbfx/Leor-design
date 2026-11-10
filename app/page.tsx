import { Commitments, ConsultationSection, CostCards, CtaBand, DesignerCta, Footer, Gold, Heading, Highlights, ProjectsHeading, Services, Testimonials, WhyLeor } from "./components/home/sections";
import { Faq, Projects } from "./components/home/interactive";
import TrustStrip from "./components/home/trust-strip";
import Navbar from "./components/navbar";
import Hero from "./components/hero";
import { ConsultationForm } from "./components/home/forms";
import { FloatingActions, OfferPopup } from "./components/home/overlays";

export const instant = false;

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <Services />
        <Highlights />
        <section className="section" id="projects">
          <div className="wrap">
            <ProjectsHeading />
            <Projects />
            <CtaBand title="Get a free consultation" text="Like what you see? Tell us about your home." />
          </div>
        </section>
        <Testimonials />
        <WhyLeor />
        <Commitments />
        <DesignerCta />
        <CostCards />
        <section className="section faq-section" id="faq">
          <div className="wrap">
            <Heading eyebrow="FAQs" sub="Everything you need to know about working with Leor Design.">
              Frequently asked <Gold>questions</Gold>
            </Heading>
            <Faq />
          </div>
        </section>
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
