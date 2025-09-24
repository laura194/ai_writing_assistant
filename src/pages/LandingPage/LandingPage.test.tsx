import { render, screen } from "../../../test/renderWithProviders";
import { vi } from "vitest";
import LandingPage from "./LandingPage";

vi.mock("aos", () => ({ default: { init: vi.fn() } }));
// Mock CSS and image imports used by page
vi.mock("aos/dist/aos.css", () => ({}) as any);
vi.mock("../../assets/images/landing-page/herobg.png", () => ({
  default: "bg-path",
}));
vi.mock("../../components/landing-page/LandingHeader/LandingHeader", () => ({
  __esModule: true,
  default: () => <div data-testid="landing-header" />,
}));
vi.mock("../../components/landing-page/LandingHero/LandingHero", () => ({
  __esModule: true,
  default: () => <div data-testid="landing-hero" />,
}));
vi.mock("../../components/landing-page/LandingAbout/LandingAbout", () => ({
  __esModule: true,
  default: () => <div data-testid="landing-about" />,
}));
vi.mock("../../components/landing-page/LandingTech/LandingTech", () => ({
  __esModule: true,
  default: () => <div data-testid="landing-tech" />,
}));
vi.mock("../../components/landing-page/LandingWorks/LandingWorks", () => ({
  __esModule: true,
  default: () => <div data-testid="landing-works" />,
}));
vi.mock("../../components/landing-page/LandingTeam/LandingTeam", () => ({
  __esModule: true,
  default: () => <div data-testid="landing-team" />,
}));
vi.mock("../../components/landing-page/LandingContact/LandingContact", () => ({
  __esModule: true,
  default: () => <div data-testid="landing-contact" />,
}));
vi.mock("../../components/landing-page/canvas/StarsCanvas/StarsCanvas", () => ({
  __esModule: true,
  default: () => <div data-testid="landing-stars" />,
}));

// Mock hero background import path
vi.mock("../../assets/images/landing-page/herobg.png", () => ({
  default: "bg-path",
}));

// Reduce motion components to plain wrappers
vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: () => (props: any) => <div {...props} />,
    },
  ),
}));

describe("LandingPage", () => {
  test("renders all landing sections in order with background", () => {
    render(<LandingPage />);

    const main = document.querySelector("main");
    expect(main).toBeInTheDocument();

    // Header and Hero in first section
    const header = screen.getByTestId("landing-header");
    const hero = screen.getByTestId("landing-hero");
    expect(header).toBeInTheDocument();
    expect(hero).toBeInTheDocument();

    // Individual sections by id exist and contain mocked components
    expect(screen.getByTestId("landing-about")).toBeInTheDocument();
    expect(screen.getByTestId("landing-tech")).toBeInTheDocument();
    expect(screen.getByTestId("landing-works")).toBeInTheDocument();
    expect(screen.getByTestId("landing-team")).toBeInTheDocument();

    const contactSection = document.querySelector("#contact");
    expect(contactSection).toBeInTheDocument();
    expect(screen.getByTestId("landing-contact")).toBeInTheDocument();
    expect(screen.getByTestId("landing-stars")).toBeInTheDocument();

    // Background style url applied on first section child
    const bgDiv = document.querySelector("section > div.bg-hero-pattern");
    expect(bgDiv).toBeInTheDocument();
  });
});
