import { useEffect } from "react";
import LandingHeader from "../components/landing-page/LandingHeader";
import LandingHero from "../components/landing-page/LandingHero";
import LandingAbout from "../components/landing-page/LandingAbout";
import heroBg from "../assets/images/landing-page/herobg.png";
import AOS from "aos";
import "aos/dist/aos.css";
import LandingTech from "../components/landing-page/LandingTech";
import LandingWorks from "../components/landing-page/LandingWorks";
import LandingTeam from "../components/landing-page/LandingTeam";
import LandingContact from "../components/landing-page/LandingContact";
import LandingStarsCanvas from "../components/landing-page/canvas/StarsCanvas";

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
          className="bg-hero-pattern bg-cover bg-no-repeat bg-cente absolute inset-0 z-0 bg-[#050816]"
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
