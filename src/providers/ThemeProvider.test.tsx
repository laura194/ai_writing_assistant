import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { render } from "../../test/renderWithProviders";
import { ThemeProvider, useTheme } from "./ThemeProvider";

const TestProbe: React.FC = () => {
  const { theme, setTheme, toggle } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={() => setTheme("dark")} data-testid="set-dark" />
      <button onClick={() => setTheme("light")} data-testid="set-light" />
      <button onClick={toggle} data-testid="toggle" />
    </div>
  );
};

describe("providers/ThemeProvider", () => {
  const getStored = (k: string) => window.localStorage.getItem(k);

  beforeEach(() => {
    // Reset DOM and storage per test
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("dark");
    localStorage.clear();
  });

  it("defaults to light when no storage and no matchMedia", () => {
    // @ts-expect-error override
    window.matchMedia = undefined;

    render(
      <ThemeProvider>
        <TestProbe />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme").textContent).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(getStored("theme")).toBe("light");
  });

  it("initializes from localStorage if present and valid", () => {
    localStorage.setItem("theme", "dark");

    render(
      <ThemeProvider>
        <TestProbe />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(getStored("theme")).toBe("dark");
  });

  it("respects prefers-color-scheme when not in storage", () => {
    // Mock matchMedia dark = true
    window.matchMedia = ((_q: string) => ({ matches: true })) as any;

    render(
      <ThemeProvider>
        <TestProbe />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("toggle switches theme and updates DOM and storage", async () => {
    // Start light
    // @ts-expect-error override
    window.matchMedia = undefined;

    render(
      <ThemeProvider>
        <TestProbe />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme").textContent).toBe("light");

    await screen.getByTestId("toggle").click();

    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(getStored("theme")).toBe("dark");
  });

  it("useTheme throws outside provider", () => {
    const ErrProbe: React.FC = () => {
      expect(() => useTheme()).toThrow(/must be used inside ThemeProvider/i);
      return null;
    };
    render(<ErrProbe />);
  });
});

describe("ThemeProvider - extended coverage", () => {
  const getStored = (k: string) => window.localStorage.getItem(k);

  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("dark");
    localStorage.clear();
  });

  it("setTheme to same value does not break", async () => {
    render(
      <ThemeProvider>
        <TestProbe />
      </ThemeProvider>
    );

    const span = screen.getByTestId("theme");
    expect(span.textContent).toBe("light");

    await screen.getByTestId("set-light").click();
    expect(span.textContent).toBe("light");
    expect(getStored("theme")).toBe("light");

    await screen.getByTestId("set-dark").click();
    expect(span.textContent).toBe("dark");
    expect(getStored("theme")).toBe("dark");
  });

  it("toggle multiple times cycles theme correctly", async () => {
    render(
      <ThemeProvider>
        <TestProbe />
      </ThemeProvider>
    );

    const span = screen.getByTestId("theme");

    await screen.getByTestId("toggle").click(); // light → dark
    expect(span.textContent).toBe("dark");

    await screen.getByTestId("toggle").click(); // dark → light
    expect(span.textContent).toBe("light");

    await screen.getByTestId("toggle").click(); // light → dark
    expect(span.textContent).toBe("dark");
  });

  it("handles localStorage setItem error gracefully", async () => {
    const spy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("Storage error");
      });

    render(
      <ThemeProvider>
        <TestProbe />
      </ThemeProvider>
    );

    const span = screen.getByTestId("theme");
    expect(span.textContent).toBe("light");

    // Klick ausführen
    fireEvent.click(screen.getByTestId("toggle"));

    // waitFor auf die Aktualisierung des Themes
    await waitFor(() => {
      // Theme sollte trotzdem wechseln, auch wenn setItem fehlschlägt
      expect(span.textContent).toBe("dark");
    });

    spy.mockRestore();
  });

  it("does not break if matchMedia undefined after mount", () => {
    // @ts-expect-error override
    window.matchMedia = undefined;

    render(
      <ThemeProvider>
        <TestProbe />
      </ThemeProvider>
    );

    const span = screen.getByTestId("theme");
    expect(span.textContent).toBe("light");
  });

  it("handles useEffect errors in try/catch blocks", () => {
    const spySetAttribute = vi
      .spyOn(document.documentElement, "setAttribute")
      .mockImplementation(() => {
        throw new Error("DOM error");
      });

    render(
      <ThemeProvider>
        <TestProbe />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme").textContent).toBe("light");
    spySetAttribute.mockRestore();
  });
});
