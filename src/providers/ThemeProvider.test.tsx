import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { screen } from "@testing-library/react";
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
    // @ts-expect-error override
    window.matchMedia = ((q: string) => ({ matches: true })) as any;

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

  it("adds matchMedia listener only when supported and no saved theme", () => {
    // Simulate browser with event-based matchMedia API
    const listeners: Record<string, Function[]> = {};
    // @ts-expect-error override
    window.matchMedia = ((query: string) => ({
      matches: false,
      addEventListener: (name: string, cb: Function) => {
        listeners[name] = listeners[name] || [];
        listeners[name].push(cb);
      },
      removeEventListener: (name: string, cb: Function) => {
        listeners[name] = (listeners[name] || []).filter((x) => x !== cb);
      },
    })) as any;

    render(
      <ThemeProvider>
        <TestProbe />
      </ThemeProvider>
    );

    // No saved theme: listener added; simulate a change event
    const ev = { matches: true } as any;
    (listeners.change?.[0] as any)?.(ev);

    // Theme should flip to dark
    expect(screen.getByTestId("theme").textContent).toBe("dark");
  });

  it("useTheme throws outside provider", () => {
    const ErrProbe: React.FC = () => {
      expect(() => useTheme()).toThrow(/must be used inside ThemeProvider/i);
      return null;
    };
    render(<ErrProbe />);
  });
});
