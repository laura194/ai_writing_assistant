import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";
import { LandingPageStyles } from "../../constants/styles/LandingPageStyles";
import { github } from "../../assets/images/landing-page";
import { SectionWrapper } from "../../hoc";
import { projects } from "../../constants/LandingPageText";
import { fadeIn, textVariant } from "../../utils/motion";

interface Tag {
  name: string;
  color: string;
}

interface Project {
  name: string;
  description: string;
  tags: Tag[];
  image: string;
  source_code_link: string;
}

interface ProjectCardProps extends Project {
  index: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  index,
  name,
  description,
  tags,
  image,
  source_code_link,
}) => {
  return (
    <motion.div variants={fadeIn("up", "spring", index * 0.5, 0.75)}>
      <Tilt
        tiltMaxAngleX={45}
        tiltMaxAngleY={45}
        scale={1}
        transitionSpeed={450}
        className="bg-[#151030] p-5 rounded-2xl sm:w-[400px] w-full h-full flex flex-col"
      >
        <div className="relative w-full h-[230px]">
          <img
            src={image}
            alt="project_image"
            className="w-full h-full object-cover rounded-2xl"
          />

          <div className="absolute inset-0 flex justify-end m-3 card-img_hover">
            <div
              onClick={() => window.open(source_code_link, "_blank")}
              className="black-gradient w-10 h-10 rounded-full flex justify-center items-center cursor-pointer"
            >
              <img
                src={github}
                alt="source code"
                className="w-1/2 h-1/2 object-contain"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex-1">
          <h3 className="text-white font-bold text-[24px]">{name}</h3>
          <p className="mt-2 text-[#aaa6c3] text-[14px]">{description}</p>
        </div>

        <div className="mt-auto pt-4 flex flex-wrap gap-2">
          {tags.map((tag: Tag) => (
            <p
              key={`${name}-${tag.name}`}
              className={`text-[14px] ${tag.color}`}
            >
              #{tag.name}
            </p>
          ))}
        </div>
      </Tilt>
    </motion.div>
  );
};

const Works = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={`${LandingPageStyles.sectionSubText} `}>The Projects</p>
        <h2 className={`${LandingPageStyles.sectionHeadText}`}>Our Journey.</h2>
      </motion.div>

      <div className="w-full flex">
        <motion.p
          variants={fadeIn("", "", 0.1, 1)}
          className="mt-3 text-[#aaa6c3] text-[17px] max-w-3xl leading-[30px]"
        >
          Following projects showcase our two study projects for HWR Berlin.
          Each is briefly described with links to code repositories and
          documentation. They reflect our progress and how the application
          evolved between the first and second project.
        </motion.p>
      </div>

      <div className="mt-16 flex flex-wrap gap-24 items-stretch">
        {projects.map((project, index) => (
          <ProjectCard key={`project-${index}`} index={index} {...project} />
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(Works, "");
