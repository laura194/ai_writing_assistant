import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "../../../../test/renderWithProviders";

vi.mock("framer-motion", async () => {
  const ReactPkg = await import("react");
  const passthrough = (tag: any) => (props: any) =>
    ReactPkg.createElement(tag, props, props?.children);
  return { motion: { div: passthrough("div") } };
});

// Virtual import fix for styles, hoc, motion
vi.mock("../../constants/styles/LandingPageStyles", () => ({
  LandingPageStyles: { sectionSubText: "", sectionHeadText: "" },
}));
vi.mock("../../hoc", () => ({
  __esModule: true,
  SectionWrapper: (C: any) => C,
}));
vi.mock("../../utils/motion", () => ({
  fadeIn: () => ({}),
  textVariant: () => ({}),
}));

import LandingTeam from "./LandingTeam";
import { team } from "../../../constants/LandingPageText";

describe("LandingTeam", () => {
  it("renders section headers and team card", () => {
    render(<LandingTeam />);

    expect(screen.getByText(/Who We Are/i)).toBeInTheDocument();
    expect(screen.getByText(/The Team\./i)).toBeInTheDocument();

    // Team content
    expect(
      screen.getByText((_, el) => el?.textContent === team[0].name)
    ).toBeInTheDocument();
    expect(screen.getByAltText(/Team Image/i)).toBeInTheDocument();

    // Quotation marks included (allow multiple matches, assert at least one)
    const quoteMatches = screen.getAllByText(
      (_, el) => el?.textContent?.includes(team[0].teamQuote) ?? false
    );
    expect(quoteMatches.length).toBeGreaterThan(0);
  });
});
