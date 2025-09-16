import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "../../../../test/renderWithProviders";

vi.mock("framer-motion", async () => {
  const ReactPkg = await import("react");
  const passthrough = (tag: any) => (props: any) =>
    ReactPkg.createElement(tag, props, props?.children);
  return {
    motion: {
      div: passthrough("div"),
      p: passthrough("p"),
      h2: passthrough("h2"),
    },
  };
});

vi.mock("react-parallax-tilt", () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="tilt">{children}</div>,
}));

// Virtual import fix for styles and constants wrong path inside component
vi.mock("../../constants/styles/LandingPageStyles", () => ({
  LandingPageStyles: {
    sectionSubText: "sectionSubText",
    sectionHeadText: "sectionHeadText",
  },
}));
vi.mock("../../utils/motion", () => ({
  fadeIn: () => ({}),
  textVariant: () => ({}),
}));
vi.mock("../../hoc", () => ({
  __esModule: true,
  SectionWrapper: (C: any) => C,
}));
vi.mock(
  "../../constants/LandingPageText",
  async () => await import("../../../constants/LandingPageText")
);

import About from "./LandingAbout";
import { services } from "../../../constants/LandingPageText";

describe("LandingAbout", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders intro headings and services", () => {
    render(<About />);
    expect(screen.getByText(/Introduction/i)).toBeInTheDocument();
    expect(screen.getByText(/Overview\./i)).toBeInTheDocument();

    for (const s of services) {
      expect(
        screen.getByRole("heading", { name: s.title })
      ).toBeInTheDocument();
    }
  });

  it("renders a Tilt wrapper for each service", () => {
    render(<About />);
    const tilts = screen.getAllByTestId("tilt");
    expect(tilts).toHaveLength(services.length);
  });
});
