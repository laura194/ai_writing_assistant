import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../../../../test/renderWithProviders";

vi.mock("@splinetool/react-spline", () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="spline" {...props} />,
}));
vi.mock("framer-motion", async () => {
  const ReactPkg = await import("react");
  const passthrough = (tag: any) => (props: any) =>
    ReactPkg.createElement(tag, props, props?.children);
  return { motion: { div: passthrough("div") } };
});

import LandingHero from "./LandingHero";

describe("LandingHero", () => {
  it("renders hero texts, spline, and CTA buttons", () => {
    render(<LandingHero />);

    expect(screen.getByText(/WELCOME/i)).toBeInTheDocument();
    expect(screen.getByText(/YOUR INTELLIGENT/i)).toBeInTheDocument();
    expect(screen.getByText(/WRITING ASSISTANT/i)).toBeInTheDocument();
    expect(screen.getByTestId("spline")).toBeInTheDocument();

    // Documentation external link
    const docs = screen.getByRole("link", { name: /Documentation/i });
    expect(docs).toHaveAttribute("href", expect.stringContaining("github.com"));
    expect(docs).toHaveAttribute("target", "_blank");
    expect(docs).toHaveAttribute("rel", expect.stringContaining("noopener"));

    // GetStarted link to /signUp
    const start = screen.getByRole("link", { name: /GetStarted/i });
    expect(start).toHaveAttribute("href", "/signUp");
  });

  it("scroll button scrolls to #about section", async () => {
    render(<LandingHero />);

    const scrollIntoView = vi.fn();
    const origGetEl = document.getElementById;
    vi.spyOn(document, "getElementById").mockImplementation((id: string) => {
      if (id === "about") return { scrollIntoView } as any;
      return origGetEl.call(document, id);
    });

    await userEvent.click(
      screen.getByRole("button", { name: /Scroll to About section/i })
    );
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });
});
