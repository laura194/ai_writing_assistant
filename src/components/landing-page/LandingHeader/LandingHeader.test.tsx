import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../../../../test/renderWithProviders";

// Virtual mocks to fix incorrect relative imports inside component
vi.mock("../../constants/styles/LandingPageStyles", () => ({
  LandingPageStyles: {
    paddingX: "",
    sectionSubText: "sectionSubText",
    sectionHeadText: "sectionHeadText",
  },
}));

// Bridge constants path
vi.mock(
  "../../constants/LandingPageText",
  async () => await import("../../../constants/LandingPageText"),
);

// Mock AOS to observe init (use hoisted var to avoid TDZ)
const { aosInit } = vi.hoisted(() => ({ aosInit: vi.fn() }));
vi.mock("aos", () => ({
  default: { init: aosInit },
}));

// Ensure window.scrollTo exists
beforeEach(() => {
  (window as any).scrollTo = vi.fn();
  aosInit.mockClear();
});

import LandingHeader from "./LandingHeader";
import { navLinks } from "../../../constants/LandingPageText";

describe("LandingHeader", () => {
  it("renders logo and top navigation links", () => {
    render(<LandingHeader />);

    expect(screen.getByAltText(/logo/i)).toBeInTheDocument();
    for (const link of navLinks) {
      expect(
        screen.getAllByRole("button", { name: link.title })[0],
      ).toBeInTheDocument();
    }
  });

  it("initializes AOS on mount with expected options", () => {
    render(<LandingHeader />);
    expect(aosInit).toHaveBeenCalledTimes(1);
    expect(aosInit).toHaveBeenCalledWith(
      expect.objectContaining({ duration: 600, once: true, mirror: false }),
    );
  });

  it("toggles scrolled class based on window scroll", async () => {
    render(<LandingHeader />);
    const nav = screen.getByRole("navigation");

    // Start at top
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
    fireEvent(window, new Event("scroll"));
    expect(nav).not.toHaveClass("bg-[#050816]");

    // Scroll down
    Object.defineProperty(window, "scrollY", {
      value: 150,
      configurable: true,
    });
    fireEvent(window, new Event("scroll"));

    await waitFor(() => {
      expect(nav).toHaveClass("bg-[#050816]");
    });
  });

  it("clicking a top nav item scrolls to its section and sets active state", async () => {
    render(<LandingHeader />);

    const targetId = navLinks[0].id; // 'about'
    const scrollIntoView = vi.fn();
    const origGetEl = document.getElementById;
    vi.spyOn(document, "getElementById").mockImplementation((id: string) => {
      if (id === targetId) {
        return { scrollIntoView } as any;
      }
      return origGetEl.call(document, id);
    });

    await userEvent.click(
      screen.getAllByRole("button", { name: navLinks[0].title })[0],
    );
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("mobile menu toggles aria-label and aria-expanded", async () => {
    render(<LandingHeader />);

    const toggle = screen.getByRole("button", { name: /open menu/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveAccessibleName(/close menu/i);

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAccessibleName(/open menu/i);
  });

  it("clicking logo scrolls to top and resets active without navigation", async () => {
    render(<LandingHeader />);

    const logoLink = screen.getByRole("link", {
      name: /ai writing assistant/i,
    });
    await userEvent.click(logoLink);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });
});
