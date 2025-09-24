import { motion } from "framer-motion";
import { LandingPageStyles } from "../../constants/styles/LandingPageStyles";
import { SectionWrapper } from "../../hoc";
import { fadeIn, textVariant } from "../../utils/motion";
import { team } from "../../constants/LandingPageText";

const TeamCard: React.FC<{
  quote: string;
  names: string;
  image: string;
}> = ({ quote, names, image }) => (
  <motion.div
    variants={fadeIn("", "spring", 0.3, 0.75)}
    className="bg-[#090325] p-12 rounded-3xl w-full max-w-4xl flex flex-col items-center text-center shadow-2xl"
  >
    <img
      src={image}
      alt="Team Image"
      className="w-[300px] h-[300px] object-cover object-top mb-8 rounded-[3rem] border-4 border-[#151030] shadow-xl"
    />

    <p className="text-gradient bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent text-[24px] font-medium leading-relaxed max-w-3xl">
      “{quote}”
    </p>

    <p className="text-[#c9c3ec] font-semibold text-[20px] mt-8 tracking-wide">
      {names}
    </p>
  </motion.div>
);

const LandingTeam = () => (
  <div className="mt-12 bg-[#100d25] rounded-[20px] overflow-hidden">
    <div
      className={`bg-[#151030] rounded-2xl ${LandingPageStyles.padding} min-h-[400px]`}
    >
      <motion.div variants={textVariant()}>
        <p className={LandingPageStyles.sectionSubText}>Who We Are</p>
        <h2 className={LandingPageStyles.sectionHeadText}>The Team.</h2>
      </motion.div>
    </div>

    <div className={`-mt-50 pb-14 px-6 flex justify-center`}>
      <TeamCard
        quote={team[0].teamQuote}
        names={team[0].name}
        image={team[0].image}
      />
    </div>
  </div>
);

export default SectionWrapper(LandingTeam, "");
