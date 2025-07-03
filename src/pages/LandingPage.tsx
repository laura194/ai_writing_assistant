import { useEffect } from "react";
import LandingHeader from "../components/landing-page/LandingHeader";
import LandingHero from "../components/landing-page/LandingHero";
import AOS from "aos";
import "aos/dist/aos.css";

export default function LandingPage() {
  useEffect(() => {
    AOS.init({ duration: 1500, once: true });
  }, []);

  return (
    <main
      className="relative h-screen overflow-hidden scroll-smooth bg-primary"
      style={{ fontFamily: "Roboto, sans-serif" }}
    >
      {/* Hintergrund-Gradient */}
      <div className="bg-hero-pattern bg-cover bg-no-repeat bg-cente absolute inset-0 -z-20">
        <LandingHeader />
        <LandingHero />
      </div>
    </main>
  );
}
