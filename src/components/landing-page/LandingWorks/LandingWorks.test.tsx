import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../../../../test/renderWithProviders";

vi.mock("framer-motion", async () => {
  const ReactPkg = await import("react");
  const passthrough = (tag: any) => (props: any) =>
    ReactPkg.createElement(tag, props, props?.children);
  return { motion: { div: passthrough("div"), p: passthrough("p") } };
});

vi.mock("react-parallax-tilt", () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="tilt">{children}</div>,
}));

// Virtual import fix for styles, hoc, utils and assets path used inside component
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
vi.mock("../../assets/images/landing-page", () => ({ github: "github.png" }));
vi.mock(
  "../../constants/LandingPageText",
  async () => await import("../../../constants/LandingPageText")
);

import Works from "./LandingWorks";
import { projects } from "../../../constants/LandingPageText";

const openSpy = vi.fn();
Object.defineProperty(window, "open", { value: openSpy, writable: true });

describe("LandingWorks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders section headings and project cards", () => {
    render(<Works />);

    expect(screen.getByText(/The Projects/i)).toBeInTheDocument();
    expect(screen.getByText(/Our Journey\./i)).toBeInTheDocument();

    for (const p of projects) {
      expect(screen.getByRole("heading", { name: p.name })).toBeInTheDocument();
      expect(screen.getByText(p.description)).toBeInTheDocument();
      for (const tag of p.tags) {
        expect(screen.getByText(`#${tag.name}`)).toBeInTheDocument();
      }
    }
  });

  it("clicking github overlay opens source_code_link in new tab", async () => {
    render(<Works />);

    // There should be one overlay button per project
    const overlays = screen.getAllByRole("img", { name: /source code/i });
    expect(overlays.length).toBeGreaterThanOrEqual(projects.length);

    // Click first overlay's parent button area
    await userEvent.click(overlays[0].closest("div")!);
    expect(openSpy).toHaveBeenCalledWith(
      projects[0].source_code_link,
      "_blank"
    );
  });
});
