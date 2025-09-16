import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "./Header";
import { vi } from "vitest";

vi.mock("/logo.svg", () => ({ default: "logo-path" }));

vi.mock("@clerk/clerk-react", () => ({
  useUser: vi.fn(),
  UserButton: () => <div data-testid="user-button" />,
}));

vi.mock("../RecentProjectsDropdown/RecentProjectsDropdown", () => ({
  RecentProjectsDropdown: () => <div data-testid="recent-dropdown">Recent</div>,
}));

vi.mock("../ThemeToggleButton/ThemeToggleButton", () => ({
  __esModule: true,
  default: () => <button data-testid="theme-toggle">T</button>,
}));

import { useUser } from "@clerk/clerk-react";

const renderWithRouter = (ui: React.ReactElement) => {
  const result = render(<MemoryRouter>{ui}</MemoryRouter>);
  const rerenderWithRouter = (newUi: React.ReactElement) =>
    result.rerender(<MemoryRouter>{newUi}</MemoryRouter>);

  return { ...result, rerender: rerenderWithRouter };
};

describe("Header component (unit tests)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("renders logo, title, nav links, theme toggle and UserButton (no user)", () => {
    (useUser as any).mockReturnValue({ user: undefined });

    renderWithRouter(<Header />);

    const logo = screen.getByAltText("Logo") as HTMLImageElement;
    expect(logo).toBeInTheDocument();
    expect(logo.src).toContain("logo-path");

    const title = screen.getByText(/AI Writing Assistant/i);
    expect(title).toBeInTheDocument();

    expect(screen.getByText(/Create Project/i).closest("a")).toHaveAttribute(
      "href",
      "/structureSelection"
    );
    expect(screen.getByText(/Open Project/i).closest("a")).toHaveAttribute(
      "href",
      "/myProjects"
    );

    expect(screen.getByTestId("recent-dropdown")).toBeInTheDocument();
    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
    expect(screen.getByTestId("user-button")).toBeInTheDocument();
    expect(screen.queryByText(/^Hi,/i)).not.toBeInTheDocument();
  });

  test("shows greeting with firstName when available", () => {
    (useUser as any).mockReturnValue({
      user: { firstName: "Gerald", username: "geros" },
    });

    renderWithRouter(<Header />);

    const greeting = screen.getByText((content) =>
      /Hi,\s*Gerald/i.test(content)
    );
    expect(greeting).toBeInTheDocument();
  });

  test("shows greeting with username when firstName missing", () => {
    (useUser as any).mockReturnValue({
      user: { username: "geros" },
    });

    renderWithRouter(<Header />);

    const greeting = screen.getByText((content) =>
      /Hi,\s*geros/i.test(content)
    );
    expect(greeting).toBeInTheDocument();
  });

  test("renders empty greeting when user exists but no firstName and no username", () => {
    (useUser as any).mockReturnValue({
      user: {},
    });

    renderWithRouter(<Header />);

    const el = screen.getByText((content) => content.trim() === "Hi,");
    expect(el).toBeInTheDocument();
  });

  test("links to home wraps logo and title (link to /home)", () => {
    (useUser as any).mockReturnValue({ user: undefined });

    renderWithRouter(<Header />);

    const homeLink = screen.getByAltText("Logo").closest("a");
    expect(homeLink).toHaveAttribute("href", "/home");
  });
});

describe("Header component (mutation-focused tests)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("header root and nav structure contain expected classes and links", () => {
    (useUser as any).mockReturnValue({ user: undefined });

    const { container } = renderWithRouter(<Header />);

    const headerEl = container.querySelector("header");
    expect(headerEl).toBeInTheDocument();
    expect(headerEl).toHaveClass("fixed top-0 left-0 w-full h-14");

    const nav = container.querySelector("nav");
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveClass("hidden md:flex");

    const logo = screen.getByAltText("Logo") as HTMLImageElement;
    expect(logo).toBeInTheDocument();
    expect(logo.src).toContain("logo-path");
    expect(logo).toHaveClass("h-8 w-8");

    const createLink = screen.getByText("Create Project").closest("a");
    const openLink = screen.getByText("Open Project").closest("a");
    expect(createLink).toHaveAttribute("href", "/structureSelection");
    expect(openLink).toHaveAttribute("href", "/myProjects");

    expect(createLink?.className).toEqual(expect.stringContaining("relative"));
  });

  test("greeting branch coverage via rerender: firstName -> username -> empty -> none", () => {
    (useUser as any).mockReturnValue({ user: undefined });
    const { rerender } = renderWithRouter(<Header />);
    expect(screen.queryByText(/^Hi,/i)).not.toBeInTheDocument();

    (useUser as any).mockReturnValue({
      user: { firstName: "Gerald", username: "geros" },
    });
    rerender(<Header />);
    expect(
      screen.getByText((t) => /Hi,\s*Gerald/i.test(t))
    ).toBeInTheDocument();

    (useUser as any).mockReturnValue({ user: { username: "geros" } });
    rerender(<Header />);
    expect(screen.getByText((t) => /Hi,\s*geros/i.test(t))).toBeInTheDocument();

    (useUser as any).mockReturnValue({ user: {} });
    rerender(<Header />);
    expect(screen.getByText((t) => t.trim() === "Hi,")).toBeInTheDocument();

    (useUser as any).mockReturnValue({ user: undefined });
    rerender(<Header />);
    expect(screen.queryByText(/^Hi,/i)).not.toBeInTheDocument();
  });

  test("RecentProjectsDropdown and ThemeToggleButton are rendered exactly once (mock stability)", () => {
    (useUser as any).mockReturnValue({ user: undefined });
    renderWithRouter(<Header />);

    const recent = screen.getAllByTestId("recent-dropdown");
    expect(recent).toHaveLength(1);

    const toggle = screen.getAllByTestId("theme-toggle");
    expect(toggle).toHaveLength(1);
  });

  test("header link to /home wraps both logo and title (structure/assert order)", () => {
    (useUser as any).mockReturnValue({ user: undefined });
    renderWithRouter(<Header />);

    const homeLink = screen.getByAltText("Logo").closest("a");
    expect(homeLink).toHaveAttribute("href", "/home");

    const title = screen.getByText("AI Writing Assistant");
    expect(homeLink).toContainElement(title);
    expect(homeLink).toContainElement(screen.getByAltText("Logo"));
  });
});
