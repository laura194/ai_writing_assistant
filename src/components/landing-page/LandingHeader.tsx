import "boxicons/css/boxicons.min.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LandingPageStyles } from "../../constants/styles/LandingPageStyles";
import { navLinks } from "../../constants/LandingPageText";
import AOS from "aos";
import "aos/dist/aos.css";

const LandingHeader = () => {
  const logo = "/logo.svg";

  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [toggle, setToggle] = useState(false);

  // Handle scroll event to change header style
  useEffect(() => {
    AOS.init({ duration: 600, once: true, mirror: false });
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      if (scrollTop > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`${
        LandingPageStyles.paddingX
      } w-full flex items-center py-5 fixed top-0 z-20 transition-colors duration-750 ease-in-out ${
        scrolled ? "bg-[#050816]" : "bg-transparent"
      }`}
    >
      <div className="w-full flex justify-between items-center max-w-5xl 2xl:max-w-7xl mx-auto">
        <Link
          to="/"
          data-aos="fade-down"
          data-aos-easing="linear"
          data-aos-duration="1500"
          data-aos-delay="1500"
          className="flex items-center gap-4 transform transition-transform duration-200 hover:translate-y-[-2px]"
          onClick={(e) => {
            e.preventDefault();
            setActive("");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <img src={logo} alt="logo" className="w-9 h-9 object-contain" />
          <p className="text-white text-[20px] font-bold cursor-pointer flex">
            AI WRITING ASSISTANT &nbsp;
          </p>
        </Link>

        <ul className="list-none hidden sm:flex flex-row gap-10">
          {navLinks.map((nav, idx) => (
            <li
              key={nav.id}
              data-aos="fade-down"
              data-aos-easing="linear"
              data-aos-delay={`${(idx + 26) * 100}`}
              data-aos-duration="600"
              className="text-[#aaa6c3] hover:text-white text-[18px] font-medium"
              onClick={() => setActive(nav.title)}
            >
              <button
                className="cursor-pointer transform transition-transform duration-300 hover:scale-108"
                onClick={() => {
                  setActive(nav.title);
                  setToggle(false);
                  const section = document.getElementById(nav.id);
                  if (section) {
                    section.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
              >
                {nav.title}
              </button>
            </li>
          ))}
        </ul>

        <div className="sm:hidden flex flex-1 justify-end items-center">
          <button
            onClick={() => setToggle((t) => !t)}
            className="p-2 z-50"
            aria-label={toggle ? "Close menu" : "Open menu"}
            aria-expanded={toggle}
          >
            <i
              className={`bx ${toggle ? "bx-x" : "bx-menu"} text-white text-3xl`}
            />
          </button>

          <div
            className={`${
              !toggle ? "hidden" : "flex"
            } p-6 black-gradient absolute top-20 right-0 mx-4 my-2 min-w-[140px] z-10 rounded-xl`}
          >
            <ul className="list-none flex justify-end items-start flex-1 flex-col gap-4">
              {navLinks.map((nav, idx) => (
                <li
                  key={nav.id}
                  data-aos="fade-down"
                  data-aos-easing="linear"
                  data-aos-delay={`${idx * 100}`}
                  data-aos-duration="600"
                  className={`font-medium text-[16px]`}
                >
                  <button
                    className={`cursor-pointer w-full text-left ${
                      active === nav.title ? "text-white" : "text-[#aaa6c3]"
                    }`}
                    onClick={() => {
                      setActive(nav.title);
                      setToggle(false);
                      const section = document.getElementById(nav.id);
                      if (section) {
                        section.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }}
                  >
                    {nav.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <Link
        to="/signIn"
        data-aos="fade-down"
        data-aos-easing="linear"
        data-aos-delay="3000"
        data-aos-duration="600"
        className="
            hidden md:block
            group relative overflow-hidden
            py-2.5 px-6 rounded-full font-semibold text-sm sm:text-base tracking-wider
            text-black bg-white border border-[#2d2d4e] backdrop-blur-md
            shadow-[0_0_10px_rgba(5,8,22,0.3)]
            transform hover:scale-105 hover:shadow-[0_0_20px_rgba(5,8,22,0.5)]
            transition-all duration-500 ease-in-out
            z-50 cursor-pointer
          "
      >
        {/* Hover-Overlay als animierbarer Gradient */}
        <span
          className="
              absolute inset-0
              bg-gradient-to-r from-[#8675da] to-[#221755]
              opacity-0 group-hover:opacity-100
              transition-opacity duration-300
              z-0
            "
        />

        {/* Text mit Gradient im Normalzustand, weiß beim Hover */}
        <span
          className="
              relative z-10
              transition-colors duration-300
              bg-clip-text text-transparent
              bg-gradient-to-r from-[#2f2467] to-[#6653c3]
              group-hover:bg-none group-hover:text-white
            "
        >
          SIGN IN
        </span>
      </Link>
    </nav>
  );
};

export default LandingHeader;
