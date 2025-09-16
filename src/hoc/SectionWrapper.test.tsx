import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import React from "react";
import { render } from "../../test/renderWithProviders";

vi.mock("framer-motion", async () => {
  const ReactPkg = await import("react");
  const section = (props: any) => ReactPkg.createElement("section", props, props?.children);
  return { motion: { section } };
});

vi.mock("../utils/motion", () => ({
  staggerContainer: (stagger: number, delay: number) => ({ _type: "stagger", stagger, delay }),
}));

vi.mock("../constants/styles/LandingPageStyles", () => ({
  LandingPageStyles: { padding: "pad" },
}));

import SectionWrapper from "./SectionWrapper";

describe("hoc/SectionWrapper", () => {
  it("wraps component with a motion.section and injects id span and classes", () => {
    const Inner: React.FC = () => <div data-testid="inner">X</div>;
    const Wrapped = SectionWrapper(Inner, "about");

    render(<Wrapped />);

    const section = screen.getByRole("region", { hidden: true }) || document.querySelector("section");
    expect(section).toBeInTheDocument();

    // Check className includes padding and static classes
    expect(section).toHaveAttribute("class", expect.stringContaining("pad"));
    expect(section).toHaveAttribute("class", expect.stringContaining("max-w-7xl"));

    // Span with id
    const span = document.querySelector("span.hash-span#about");
    expect(span).toBeInTheDocument();

    // Inner rendered
    expect(screen.getByTestId("inner")).toBeInTheDocument();

    // Variants passed (mocked value)
    // since variants is an object prop, verify it exists on the DOM node props via toString check is not possible
    // but we can rely on our mocked staggerContainer being called by verifying the expected attribute set on the element isn't possible in DOM.
    // This test ensures wrapper wiring; mutation testing ensures call is needed.
  });
});
