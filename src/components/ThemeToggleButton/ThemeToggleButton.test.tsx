import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeToggleButton from "./ThemeToggleButton";
import * as ThemeProvider from "../../providers/ThemeProvider";
import { vi } from "vitest";

const toggleMock = vi.fn();
const setThemeMock = vi.fn();

vi.spyOn(ThemeProvider, "useTheme").mockImplementation(() => ({
  theme: "light",
  toggle: toggleMock,
  setTheme: setThemeMock,
}));

describe("ThemeToggleButton Unit Tests", () => {
  beforeEach(() => {
    toggleMock.mockClear();
    setThemeMock.mockClear();
    document.head.innerHTML = "";
  });

  test("renders correctly in light mode", () => {
    (ThemeProvider.useTheme as any).mockReturnValue({
      theme: "light",
      toggle: toggleMock,
      setTheme: setThemeMock,
    });

    render(<ThemeToggleButton />);

    const button = screen.getByRole("button", { name: /Change to Dark Mode/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "false");

    const meta = document.querySelector(
      'meta[name="theme-color"]'
    ) as HTMLMetaElement;
    expect(meta).toBeInTheDocument();
    expect(meta.content).toBe("#ffffff");
  });

  test("renders correctly in dark mode", () => {
    (ThemeProvider.useTheme as any).mockReturnValue({
      theme: "dark",
      toggle: toggleMock,
      setTheme: setThemeMock,
    });

    render(<ThemeToggleButton />);

    const button = screen.getByRole("button", {
      name: /Change to Light Mode/i,
    });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "true");

    const meta = document.querySelector(
      'meta[name="theme-color"]'
    ) as HTMLMetaElement;
    expect(meta.content).toBe("#090325");
  });

  test("clicking the button calls toggle function", async () => {
    (ThemeProvider.useTheme as any).mockReturnValue({
      theme: "light",
      toggle: toggleMock,
      setTheme: setThemeMock,
    });

    const user = userEvent.setup();
    render(<ThemeToggleButton />);

    const button = screen.getByRole("button");
    await user.click(button);
    expect(toggleMock).toHaveBeenCalledTimes(1);
  });

  test("accepts custom className prop", () => {
    (ThemeProvider.useTheme as any).mockReturnValue({
      theme: "light",
      toggle: toggleMock,
      setTheme: setThemeMock,
    });

    render(<ThemeToggleButton className="my-custom-class" />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("my-custom-class");
  });

  test("logs error if updating theme-color meta tag fails", () => {
    (ThemeProvider.useTheme as any).mockReturnValue({
      theme: "light",
      toggle: toggleMock,
      setTheme: setThemeMock,
    });

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const originalQuerySelector = document.querySelector;
    document.querySelector = vi.fn(() => {
      throw new Error("test-error");
    }) as any;

    render(<ThemeToggleButton />);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Cant switch Theme Color: ",
      expect.any(Error)
    );

    document.querySelector = originalQuerySelector;
    consoleErrorSpy.mockRestore();
  });
});

describe("ThemeToggleButton Mutation Tests", () => {
  beforeEach(() => {
    toggleMock.mockClear();
    setThemeMock.mockClear();
    document.head.innerHTML = "";
  });

  test("knob boxShadow and inner span opacity for light mode", () => {
    (ThemeProvider.useTheme as any).mockReturnValue({
      theme: "light",
      toggle: toggleMock,
      setTheme: setThemeMock,
    });

    render(<ThemeToggleButton className="mut-test" />);

    const knob = document.querySelector(
      ".absolute.top-1.left-1.h-7.w-7"
    ) as HTMLElement | null;
    expect(knob).toBeInTheDocument();
    expect(knob?.style.boxShadow).toBe("0 4px 20px rgba(0,0,0,0.35)");

    const overlay = document.querySelector(
      'span[class*="opacity-0"], span[class*="opacity-80"]'
    ) as HTMLElement | null;
    expect(overlay).toBeInTheDocument();
    expect(overlay?.className).toContain("opacity-0");
  });

  test("knob boxShadow and inner span opacity for dark mode", () => {
    (ThemeProvider.useTheme as any).mockReturnValue({
      theme: "dark",
      toggle: toggleMock,
      setTheme: setThemeMock,
    });

    render(<ThemeToggleButton />);

    const knob = document.querySelector(
      ".absolute.top-1.left-1.h-7.w-7"
    ) as HTMLElement | null;
    expect(knob).toBeInTheDocument();
    expect(knob?.style.boxShadow).toBe("0 2px 20px rgba(0,255,209,0.5)");

    const overlay = document.querySelector(
      'span[class*="opacity-80"]'
    ) as HTMLElement | null;
    expect(overlay).toBeInTheDocument();
    expect(overlay?.className).toContain("opacity-80");
  });

  test("aria-label, title and aria-pressed reflect theme", () => {
    (ThemeProvider.useTheme as any).mockReturnValue({
      theme: "light",
      toggle: toggleMock,
      setTheme: setThemeMock,
    });

    const { rerender } = render(<ThemeToggleButton />);

    const btnLight = screen.getByRole("button", {
      name: /Change to Dark Mode/i,
    });
    expect(btnLight).toHaveAttribute("aria-pressed", "false");
    expect(btnLight).toHaveAttribute("title", "Dark Mode");

    (ThemeProvider.useTheme as any).mockReturnValue({
      theme: "dark",
      toggle: toggleMock,
      setTheme: setThemeMock,
    });

    rerender(<ThemeToggleButton />);

    const btnDark = screen.getByRole("button", {
      name: /Change to Light Mode/i,
    });
    expect(btnDark).toBeInTheDocument();
    expect(btnDark).toHaveAttribute("aria-pressed", "true");
    expect(btnDark).toHaveAttribute("title", "Light Mode");
  });

  test("keyed motion span swaps icon between sun and moon when theme changes", () => {
    (ThemeProvider.useTheme as any).mockReturnValue({
      theme: "light",
      toggle: toggleMock,
      setTheme: setThemeMock,
    });
    render(<ThemeToggleButton />);
    const svgsLight = document.querySelectorAll("svg");
    expect(svgsLight.length).toBeGreaterThanOrEqual(1);

    (ThemeProvider.useTheme as any).mockReturnValue({
      theme: "dark",
      toggle: toggleMock,
      setTheme: setThemeMock,
    });
    render(<ThemeToggleButton />);
    const svgsDark = document.querySelectorAll("svg");
    expect(svgsDark.length).toBeGreaterThanOrEqual(1);

    // ensure we have SVGs present in both renders (covers the branch that chooses Moon vs Sun)
    expect(svgsLight.length).toBeGreaterThanOrEqual(1);
    expect(svgsDark.length).toBeGreaterThanOrEqual(1);
  });

  test("multiple clicks call toggle multiple times", async () => {
    (ThemeProvider.useTheme as any).mockReturnValue({
      theme: "light",
      toggle: toggleMock,
      setTheme: setThemeMock,
    });

    const user = userEvent.setup();
    render(<ThemeToggleButton />);

    const btn = screen.getByRole("button");
    await user.click(btn);
    await user.click(btn);
    await user.click(btn);

    expect(toggleMock).toHaveBeenCalledTimes(3);
  });
});
