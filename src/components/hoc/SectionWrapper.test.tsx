import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

if (typeof (globalThis as any).IntersectionObserver === "undefined") {
  (globalThis as any).IntersectionObserver = class {
    root: Element | null = null;
    rootMargin: string = "";
    thresholds: ReadonlyArray<number> = [];
    constructor(
      _cb?: IntersectionObserverCallback,
      _opts?: IntersectionObserverInit
    ) {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  };
}
if (typeof (globalThis as any).ResizeObserver === "undefined") {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

vi.resetModules();

import { SectionWrapper } from "./index";

const Dummy = () => <div data-testid="dummy">dummy</div>;

describe("SectionWrapper re-export", () => {
  it("wraps a component and exposes the id/anchor produced by the HOC", () => {
    expect(SectionWrapper).toBeDefined();

    const Wrapped = SectionWrapper(Dummy, "test-id");

    render(<Wrapped />);

    expect(screen.getByTestId("dummy")).toBeInTheDocument();

    const anchored = document.getElementById("test-id");
    expect(anchored).toBeTruthy();

    const wrapperByLabel = screen.queryByLabelText("test-id");
    if (wrapperByLabel) {
      expect(wrapperByLabel).toContainElement(screen.getByTestId("dummy"));
    } else {
      expect(anchored).toBeInTheDocument();
    }
  });
});
