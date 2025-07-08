import { motion } from "framer-motion";
import { LandingPageStyles } from "../../constants/styles/LandingPageStyles";
import { services } from "../../constants/LandingPageText";
import { SectionWrapper } from "../../hoc";
import { fadeIn, textVariant } from "../../utils/motion";
import Tilt from "react-parallax-tilt";

type ServiceCardProps = {
  index: number;
  title: string;
  icon: string;
};

const ServiceCard = ({ index, title, icon }: ServiceCardProps) => (
  <Tilt
    tiltMaxAngleX={45}
    tiltMaxAngleY={45}
    scale={1}
    transitionSpeed={450}
    className="w-full sm:w-[250px]"
  >
    <motion.div
      variants={fadeIn("right", "spring", index * 0.5, 0.75)}
      className="w-full green-pink-gradient p-[1px] rounded-[20px] shadow-[0px_35px_120px_-15px_rgba(33,30,53,1)]"
    >
      <div className="bg-[#151030] rounded-[20px] py-5 px-12 min-h-[280px] flex justify-evenly items-center flex-col">
        <img
          src={icon}
          alt="web-development"
          className="w-16 h-16 object-contain"
        />

        <h3 className="text-white text-[20px] font-bold text-center">
          {title}
        </h3>
      </div>
    </motion.div>
  </Tilt>
);

const About = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={LandingPageStyles.sectionSubText}>Introduction</p>
        <h2 className={LandingPageStyles.sectionHeadText}>Overview.</h2>
      </motion.div>

      <motion.p
        variants={fadeIn("", "", 0.1, 1)}
        className="mt-4 text-[#aaa6c3] text-[17px] max-w-3xl leading-[30px]"
      >
        Our AI-powered tool supports academic writing from start to finish. It
        helps improve clarity, structure complex ideas, and transparently
        document all AI-generated content. Designed for students and researchers
        alike, it streamlines your writing process without compromising
        authorship. Whether refining a sentence or organizing an entire paper,
        our assistant empowers you to write faster, smarter, and with full
        transparency.
      </motion.p>

      <div className="mt-20 flex flex-wrap gap-10">
        {services.map((service, index) => (
          <ServiceCard key={service.title} index={index} {...service} />
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(About, "about");
