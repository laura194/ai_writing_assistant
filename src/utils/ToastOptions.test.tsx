import { describe, it, expect } from "vitest";
import { getToastOptions } from "./ToastOptionsSSP";
import type { Theme } from "../providers/ThemeProvider";

describe("getToastOptions", () => {
  it("returns dark theme styles when theme is 'dark'", () => {
    const result = getToastOptions("dark" as Theme);

    expect(result.duration).toBe(4000);
    expect(result.icon).toBe("⚠️");
    expect(result.style.background).toBe("#1e1538");
    expect(result.style.color).toBe("#c4b5fd");
    expect(result.style.boxShadow).toBe("0 4px 12px rgba(139, 92, 246, 0.2)");
    expect(result.style.border).toBe("1px solid #7c3aed");

    // shared styles
    expect(result.style.padding).toBe("16px 20px");
    expect(result.style.borderRadius).toBe("12px");
    expect(result.style.fontSize).toBe("18px");
    expect(result.style.fontWeight).toBe(600);
  });

  it("returns light theme styles when theme is not 'dark'", () => {
    const result = getToastOptions("light" as Theme);

    expect(result.duration).toBe(4000);
    expect(result.icon).toBe("⚠️");
    expect(result.style.background).toBe("#e0dbf4");
    expect(result.style.color).toBe("#261e3b");
    expect(result.style.boxShadow).toBe("0 6px 20px rgba(2,6,23,0.4)");
    expect(result.style.border).toBe("1px solid #c5b6f7");

    expect(result.style.padding).toBe("16px 20px");
    expect(result.style.borderRadius).toBe("12px");
    expect(result.style.fontSize).toBe("18px");
    expect(result.style.fontWeight).toBe(600);
  });
});
