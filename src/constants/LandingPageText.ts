import {
  mobile,
  backend,
  creator,
  web,
  typescript,
  reactjs,
  tailwind,
  nodejs,
  mongodb,
  docker,
  threejs,
  nextjs,
  gemini,
  clerk,
  github,
  teamImg,
  studiproject,
  studiproject2,
} from "../assets/images/landing-page";

export const navLinks = [
  {
    id: "about",
    title: "Overview",
  },
  {
    id: "work",
    title: "Our Journey",
  },
  {
    id: "team",
    title: "The Team",
  },
  {
    id: "contact",
    title: "Contact Us",
  },
];

const services = [
  {
    title: "Smarter Writing",
    icon: web,
  },
  {
    title: "AI Transparency",
    icon: mobile,
  },
  {
    title: "Full Control",
    icon: backend,
  },
  {
    title: "Work Efficiently",
    icon: creator,
  },
];

const technologies = [
  {
    name: "React JS",
    icon: reactjs,
  },
  {
    name: "Next JS",
    icon: nextjs,
  },
  {
    name: "Node JS",
    icon: nodejs,
  },
  {
    name: "MongoDB",
    icon: mongodb,
  },
  {
    name: "TypeScript",
    icon: typescript,
  },
  {
    name: "Tailwind CSS",
    icon: tailwind,
  },
  {
    name: "Three JS",
    icon: threejs,
  },
  {
    name: "Github",
    icon: github,
  },
  {
    name: "docker",
    icon: docker,
  },
  {
    name: "Clerk",
    icon: clerk,
  },
  {
    name: "Gemini",
    icon: gemini,
  },
];

const team = [
  {
    teamQuote:
      "We didn't just want to build another AI tool—we wanted to build one that respects the writing process and makes every AI step transparent.",
    name: "Gero S.\u00A0\u00A0\u00A0|\u00A0\u00A0\u00A0Lisa K.\u00A0\u00A0\u00A0|\u00A0\u00A0\u00A0Laura V.\u00A0\u00A0\u00A0|\u00A0\u00A0\u00A0Aylin O.",
    image: teamImg,
  },
];

const projects = [
  {
    name: "Student Project I",
    description:
      "In this project, we integrated Gemini to enable AI-powered editing and rewriting of academic texts—either as a whole or at selected sections. All AI-generated content is automatically tracked and documented through a custom-built protocol, ensuring full transparency. Users can also structure their work using common academic formats like IMRaD or create custom templates to fit their individual research needs.",
    tags: [
      {
        name: "writing-assistant",
        color: "blue-text-gradient",
      },
      {
        name: "ai-doc-protocol",
        color: "green-text-gradient",
      },
      {
        name: "flexible-structure",
        color: "pink-text-gradient",
      },
    ],
    image: studiproject,
    source_code_link: "https://github.com/laura194/ai_writing_assistant/",
  },
  {
    name: "Student Project II",
    description:
      "The second project focuses on collaboration. Users can create, share, and reuse writing structures and work together on academic texts in a transparent, AI-supported environment. In addition, we introduced several smaller improvements to ensure consistent behavior, prevent regressions, and maintain the system's long-term stability.",
    tags: [
      {
        name: "community-driven",
        color: "blue-text-gradient",
      },
      {
        name: "share-structure",
        color: "green-text-gradient",
      },
      {
        name: "write-together",
        color: "pink-text-gradient",
      },
    ],
    image: studiproject2,
    source_code_link: "https://github.com/laura194/ai_writing_assistant/",
  },
];

export { services, technologies, team, projects };
