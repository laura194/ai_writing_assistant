import { describe, it, expect, vi } from "vitest";

// Mock the images barrel used by LandingPageText to avoid loading actual assets
vi.mock("../assets/images/landing-page", () => ({
  mobile: "mobile.png",
  backend: "backend.png",
  creator: "creator.png",
  web: "web.png",
  typescript: "ts.png",
  reactjs: "react.png",
  tailwind: "tailwind.png",
  nodejs: "node.png",
  mongodb: "mongo.png",
  docker: "docker.png",
  threejs: "three.png",
  nextjs: "next.png",
  gemini: "gemini.png",
  clerk: "clerk.png",
  github: "github.png",
  teamImg: "team.png",
  questionmark: "question.png",
  studiproject: "studiproject.png",
}));

// Import after mock
import {
  navLinks,
  services,
  technologies,
  team,
  projects,
} from "./LandingPageText";
import { LandingPageStyles } from "./styles/LandingPageStyles";

describe("constants/LandingPageText", () => {
  it("navLinks contain the expected ids and titles in order", () => {
    expect(navLinks).toHaveLength(4);
    expect(navLinks.map((l) => l.id)).toEqual([
      "about",
      "work",
      "team",
      "contact",
    ]);
    expect(navLinks.map((l) => l.title)).toEqual([
      "Overview",
      "Our Journey",
      "The Team",
      "Contact Us",
    ]);
  });

  it("services have titles and mocked icon references", () => {
    const expected = [
      { title: "Smarter Writing", icon: "web.png" },
      { title: "AI Transparency", icon: "mobile.png" },
      { title: "Full Control", icon: "backend.png" },
      { title: "Work Efficiently", icon: "creator.png" },
    ];
    expect(services).toHaveLength(expected.length);
    expect(services).toEqual(expected);
  });

  it("technologies list includes all expected names and icons", () => {
    const names = technologies.map((t) => t.name);
    const icons = technologies.map((t) => t.icon);

    expect(names).toEqual([
      "React JS",
      "Next JS",
      "Node JS",
      "MongoDB",
      "TypeScript",
      "Tailwind CSS",
      "Three JS",
      "Github",
      "docker",
      "Clerk",
      "Gemini",
    ]);

    expect(icons).toEqual([
      "react.png",
      "next.png",
      "node.png",
      "mongo.png",
      "ts.png",
      "tailwind.png",
      "three.png",
      "github.png",
      "docker.png",
      "clerk.png",
      "gemini.png",
    ]);
  });

  it("team contains one entry with quote, name and image", () => {
    expect(team).toHaveLength(1);
    const t = team[0];
    expect(typeof t.teamQuote).toBe("string");
    expect(t.teamQuote.toLowerCase()).toContain("writing process");
    expect(t.name).toContain("Gero");
    expect(t.image).toBe("team.png");
  });

  it("projects contain expected structure, tags and links", () => {
    expect(projects).toHaveLength(2);

    for (const p of projects) {
      expect(typeof p.name).toBe("string");
      expect(typeof p.description).toBe("string");
      expect(Array.isArray(p.tags)).toBe(true);
      expect(p.tags).toHaveLength(3);
      expect(typeof p.image).toBe("string");
      expect(p.source_code_link).toContain("http");
    }

    // First project specifics
    expect(projects[0].image).toBe("studiproject.png");
    expect(projects[0].source_code_link).toContain("github.com");

    // Second project image
    expect(projects[1].image).toBe("question.png");
  });
});

describe("constants/styles/LandingPageStyles", () => {
  it("exports a style object with required keys and non-empty class strings", () => {
    const keys = [
      "paddingX",
      "paddingY",
      "padding",
      "heroHeadText",
      "heroSubText",
      "sectionHeadText",
      "sectionSubText",
    ];

    for (const k of keys) {
      expect(Object.prototype.hasOwnProperty.call(LandingPageStyles, k)).toBe(
        true,
      );
      const val = (LandingPageStyles as any)[k];
      expect(typeof val).toBe("string");
      expect(val.length).toBeGreaterThan(0);
    }

    // Spot-check a couple of expected class tokens to harden mutation tests
    expect(LandingPageStyles.sectionSubText).toContain("uppercase");
    expect(LandingPageStyles.sectionHeadText).toContain("font-black");
  });
});
