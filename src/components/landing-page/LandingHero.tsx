import "boxicons/css/boxicons.min.css";
import Spline from "@splinetool/react-spline";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const LandingHero = () => {
  return (
    <main className="relative w-full h-screen flex lg:mt-20 flex-col lg:flex-row items-center justify-between">
      <div
        data-aos="fade-right"
        data-aos-offset="300"
        data-aos-easing="ease-in-sine"
        data-aos-delay="1000"
        data-aos-duration="1200"
        className="max-w-xl ml-[5%] z-10 mt-[90%] md:mt-[60%] lg:mt-0 mb-60"
      >
        <div className="flex flex-row items-start gap-6 mt-5">
          {/* Strich mit Kreis */}
          <div className="flex flex-col justify-center items-center">
            <div className="w-5 h-5 rounded-full bg-[#915EFF]" />
            <div className="w-1 sm:h-105 h-50 violet-gradient" />
          </div>

          {/* Tag box-with gradient border */}
          <div>
            <div className="relative w-[95%] sm:w-42 h-10 bg-gradient-to-r from-[#4d3384] to-[#a582f1] shadow-[0_0_15px_rgba(255, 255, 255, 0.4)] rounded-full">
              <div className="absolute inset-[3px] bg-black rounded-full flex items-center justify-center gap-1 text-white">
                <i className="bx bx-diamond"></i> WELCOME
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-semibold tracking-wider my-8 text-white">
              YOUR INTELLIGENT
              <br />
              WRITING ASSISTANT
            </h1>

            {/* Description */}
            <p className="text-gray-400 text-base sm:text-lg tracking-wider max-w-[25rem] lg:max-w-[35rem]">
              What if writing academic texts wasn't a struggle—but a smarter,
              guided process? Discover how AI can transform the way you write
              and structure, refine, and document your academic texts—with full
              transparency. Rethink how you write, before your next idea begins.
            </p>
            {/* Call To Action Buttons */}
            <div className="flex gap-4 mt-12">
              <a
                className="border border-[#44395c] py-2 sm:py-3 px-4 sm:px-5 rounded-full sm:text-lg text-sm font-semibold tracking-wider transition-all duration-300 hover:bg-[#272035] text-white"
                href="https://github.com/laura194/ai_writing_assistant"
                target="_blank"
                rel="noopener noreferrer"
              >
                Documentation <i className="bx bx-link-external"></i>
              </a>
              <Link
                to="/signUp"
                className="border border-[#2a2a2a] py-2 sm:py-3 px-8 sm:px-10 rounded-full sm:text-lg text-sm font-semibold tracking-wider transition-all duration-300 hover:bg-[#272035] bg-gray-300 text-black hover:text-white"
              >
                GetStarted <i className="bx bx-link-external"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Model Particle Brain */}
      <Spline
        data-aos="fade-zoom-in"
        data-aos-easing="ease-in-back"
        data-aos-delay="2250"
        data-aos-offset="0"
        data-aos-duration="3000"
        className="absolute top-[-20%] lg:top-[-5%] lg:left-[23%] sm:left-[-2%] h-[60%] w-[60%] z-0"
        scene="https://prod.spline.design/Rvf44gIm5dNRdckf/scene.splinecode"
      />

      <div className="absolute xs:bottom-10 bottom-32 w-full flex justify-center items-center z-50">
        <button
          data-aos="fade-zoom-in"
          data-aos-easing="ease-in-back"
          data-aos-delay="5000"
          data-aos-offset="0"
          data-aos-duration="2000"
          onClick={(e) => {
            e.preventDefault();
            const section = document.getElementById("about");
            if (section) {
              section.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }}
          className="w-[35px] h-[64px] rounded-3xl border-4 border-[#aaa6c3] flex justify-center items-start p-2 cursor-pointer"
          aria-label="Scroll to About section"
        >
          <motion.div
            animate={{ y: [0, 24, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
            className="w-3 h-3 rounded-full bg-[#aaa6c3] mb-1"
          />
        </button>
      </div>
    </main>
  );
};

export default LandingHero;
