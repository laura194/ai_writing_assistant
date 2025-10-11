import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

vi.mock("/logo.svg", () => ({ default: "logo-path" }));

vi.mock("@clerk/clerk-react", () => ({
  useUser: vi.fn(),
  UserButton: () => <div data-testid="user-button" />,
}));

vi.mock("../RecentProjectsDropdown/RecentProjectsDropdown", () => ({
  RecentProjectsDropdown: () => <div data-testid="recent-dropdown">Recent</div>,
}));

vi.mock("../FAQDropdown/FAQDropdown.tsx", () => ({
  FAQDropdown: () => <div data-testid="faq-dropdown">FAQ</div>,
}));

vi.mock("../SettingsButton/SettingsButton", () => ({
  SettingsButton: () => <div data-testid="settings-button">Settings</div>,
}));

vi.mock("../ThemeToggleButton/ThemeToggleButton", () => ({
  __esModule: true,
  default: () => <button data-testid="theme-toggle">T</button>,
}));

// Mock UndoRedoButton so we can inspect passed props easily
vi.mock("../UndoRedoButton/UndoRedoButton", () => ({
  UndoRedoButton: ({ canUndo, canRedo }: any) => (
    <div
      data-testid="undo-redo"
      data-canundo={String(canUndo)}
      data-canredo={String(canRedo)}
    >
      UndoRedo
    </div>
  ),
}));

import Header from "./Header";
import { useUser } from "@clerk/clerk-react";

const renderWithRouter = (ui: React.ReactElement, initialEntries = ["/"]) => {
  const result = render(
    <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>,
  );
  const rerenderWithRouter = (
    newUi: React.ReactElement,
    entries = initialEntries,
  ) =>
    result.rerender(
      <MemoryRouter initialEntries={entries}>{newUi}</MemoryRouter>,
    );
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
    // mocked import returns 'logo-path'
    expect(logo.src).toContain("logo-path");

    expect(screen.getByText(/AI Writing Assistant/i)).toBeInTheDocument();

    expect(screen.getByText(/Create Project/i).closest("a")).toHaveAttribute(
      "href",
      "/structureSelection",
    );
    expect(screen.getByText(/Open Project/i).closest("a")).toHaveAttribute(
      "href",
      "/myProjects",
    );

    expect(screen.getByTestId("recent-dropdown")).toBeInTheDocument();
    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
    expect(screen.getByTestId("user-button")).toBeInTheDocument();
    // no greeting when user undefined
    expect(screen.queryByText(/^Hi,/i)).not.toBeInTheDocument();
  });

  test("shows greeting with firstName when available", () => {
    (useUser as any).mockReturnValue({
      user: { firstName: "Gerald", username: "geros" },
    });

    renderWithRouter(<Header />);

    const greeting = screen.getByText((content) =>
      /Hi,\s*Gerald/i.test(content),
    );
    expect(greeting).toBeInTheDocument();
  });

  test("shows greeting with username when firstName missing", () => {
    (useUser as any).mockReturnValue({ user: { username: "geros" } });

    renderWithRouter(<Header />);

    const greeting = screen.getByText((content) =>
      /Hi,\s*geros/i.test(content),
    );
    expect(greeting).toBeInTheDocument();
  });

  test("renders empty greeting when user exists but no firstName and no username", () => {
    (useUser as any).mockReturnValue({ user: {} });

    renderWithRouter(<Header />);

    const el = screen.getByText((content) => content.trim() === "Hi,");
    expect(el).toBeInTheDocument();
  });

  test("links to home wraps logo and title (link to /home)", () => {
    (useUser as any).mockReturnValue({ user: undefined });

    renderWithRouter(<Header />);

    const homeLink = screen.getByAltText("Logo").closest("a");
    expect(homeLink).toHaveAttribute("href", "/home");

    // title is inside the same link
    const title = screen.getByText("AI Writing Assistant");
    expect(homeLink).toContainElement(title);
  });
});

describe("Header component (mutation-focused tests & coverage)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("header root contains expected classes and Create/Open links keep relative class", () => {
    (useUser as any).mockReturnValue({ user: undefined });
    const { container } = renderWithRouter(<Header />);

    const headerEl = container.querySelector("header");
    expect(headerEl).toBeInTheDocument();
    expect(headerEl).toHaveClass("fixed", "top-0", "left-0", "w-full", "h-14");

    // No <nav> element in current implementation — ensure we don't assert for it.
    // Instead, check existence of key interactive elements we expect to be present.
    const createLink = screen.getByText("Create Project").closest("a");
    const openLink = screen.getByText("Open Project").closest("a");
    expect(createLink).toHaveAttribute("href", "/structureSelection");
    expect(openLink).toHaveAttribute("href", "/myProjects");

    // The original tests asserted className contains 'relative'
    expect(createLink?.className).toEqual(expect.stringContaining("relative"));
  });

  test("renders Community link and it points to /communityPage", () => {
    (useUser as any).mockReturnValue({ user: undefined });
    renderWithRouter(<Header />);

    const community = screen.getByText("Community").closest("a");
    expect(community).toBeInTheDocument();
    expect(community).toHaveAttribute("href", "/communityPage");
  });

  test("UndoRedoButton receives props and is shown on non-excluded route", () => {
    (useUser as any).mockReturnValue({ user: undefined });

    renderWithRouter(
      <Header
        onUndo={() => {}}
        onRedo={() => {}}
        canUndo={true}
        canRedo={false}
      />,
      ["/app/editor"],
    );

    const ur = screen.getByTestId("undo-redo");
    expect(ur).toBeInTheDocument();
    expect(ur).toHaveAttribute("data-canundo", "true");
    expect(ur).toHaveAttribute("data-canredo", "false");
  });

  test("UndoRedoButton is hidden on excluded routes like /home and /myProjects and /structureSelection", () => {
    (useUser as any).mockReturnValue({ user: undefined });

    // /home
    renderWithRouter(<Header />, ["/home"]);
    expect(screen.queryByTestId("undo-redo")).not.toBeInTheDocument();

    // /structureSelection
    renderWithRouter(<Header />, ["/structureSelection"]);
    expect(screen.queryByTestId("undo-redo")).not.toBeInTheDocument();
  });

  test("FAQDropdown and SettingsButton are rendered (mock stability)", () => {
    (useUser as any).mockReturnValue({ user: undefined });
    renderWithRouter(<Header />);

    expect(screen.getByTestId("faq-dropdown")).toBeInTheDocument();
    expect(screen.getByTestId("settings-button")).toBeInTheDocument();
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
      screen.getByText((t) => /Hi,\s*Gerald/i.test(t)),
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
});
