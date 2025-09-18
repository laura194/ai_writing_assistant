import { motion } from "framer-motion";
import { FC } from "react";

import { LandingPageStyles } from "../constants/styles/LandingPageStyles";
import { staggerContainer } from "../utils/motion";

const StarWrapper = (Component: FC, idName: string) =>
  function HOC() {
    return (
      <motion.section
        variants={staggerContainer(0.25, 0)}
        initial="hidden"
        whileInView="show"
        aria-label={idName}
        viewport={{ once: true, amount: 0.25 }}
        className={`${LandingPageStyles.padding} max-w-7xl mx-auto relative z-0`}
      >
        <span className="hash-span" id={idName}>
          &nbsp;
        </span>

        <Component />
      </motion.section>
    );
  };

export default StarWrapper;
