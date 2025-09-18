import { useEffect } from "react";
import LandingHeader from "../../components/landing-page/LandingHeader/LandingHeader";
import LandingHero from "../../components/landing-page/LandingHero/LandingHero";
import LandingAbout from "../../components/landing-page/LandingAbout/LandingAbout";
import heroBg from "../../assets/images/landing-page/herobg.png";
import AOS from "aos";
import "aos/dist/aos.css";
import LandingTech from "../../components/landing-page/LandingTech/LandingTech";
import LandingWorks from "../../components/landing-page/LandingWorks/LandingWorks";
import LandingTeam from "../../components/landing-page/LandingTeam/LandingTeam";
import LandingContact from "../../components/landing-page/LandingContact/LandingContact";
import LandingStarsCanvas from "../../components/landing-page/canvas/StarsCanvas/StarsCanvas";

export default function LandingPage() {
  useEffect(() => {
    AOS.init({ duration: 1500, once: true, delay: 1200 });
  }, []);

  return (
    <main
      className="relative overflow-hidden scroll-smooth bg-[#050816]"
      style={{ fontFamily: "Roboto, sans-serif" }}
    >
      <section className="relative min-h-screen flex flex-col">
        <div
          className="bg-hero-pattern bg-cover bg-no-repeat bg-center absolute inset-0 z-0 bg-[#050816]"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <LandingHeader />
        <LandingHero />
      </section>

      <section id="about">
        <LandingAbout />
      </section>
      <section id="tech">
        <LandingTech />
      </section>
      <section id="work">
        <LandingWorks />
      </section>
      <section id="team">
        <LandingTeam />
      </section>
      <section id="contact" className="relative z-15">
        <LandingContact />
        <LandingStarsCanvas />
      </section>
    </main>
  );
}
