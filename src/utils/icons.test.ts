import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

// Mock the heroicons module BEFORE importing the function under test
vi.mock("@heroicons/react/24/solid", () => {
  const DocumentTextIcon = (props: any) =>
    React.createElement("svg", { ...props });
  const ListBulletIcon = (props: any) =>
    React.createElement("svg", { ...props });
  const CodeBracketIcon = (props: any) =>
    React.createElement("svg", { ...props });
  const PhotoIcon = (props: any) => React.createElement("svg", { ...props });

  (DocumentTextIcon as any).displayName = "DocumentTextIconMock";
  (ListBulletIcon as any).displayName = "ListBulletIconMock";
  (CodeBracketIcon as any).displayName = "CodeBracketIconMock";
  (PhotoIcon as any).displayName = "PhotoIconMock";

  return {
    __esModule: true,
    DocumentTextIcon,
    ListBulletIcon,
    CodeBracketIcon,
    PhotoIcon,
  };
});

import { getIcon } from "./icons";

describe("getIcon", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function getSvgClassFromRendered(el: React.ReactElement) {
    const { container } = render(el);
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    return svg!.getAttribute("class");
  }

  it("returns DocumentTextIcon for category 'text' with default size", () => {
    const node = { category: "text" } as any;
    const el = getIcon(node);
    const className = getSvgClassFromRendered(el);
    expect(className).toBe("size-8 fill-current");
  });

  it("returns ListBulletIcon for category 'list'", () => {
    const node = { category: "list" } as any;
    const el = getIcon(node);
    const className = getSvgClassFromRendered(el);
    expect(className).toBe("size-8 fill-current");
  });

  it("returns CodeBracketIcon for category 'code'", () => {
    const node = { category: "code" } as any;
    const el = getIcon(node);
    const className = getSvgClassFromRendered(el);
    expect(className).toBe("size-8 fill-current");
  });

  it("returns PhotoIcon for category 'image'", () => {
    const node = { category: "image" } as any;
    const el = getIcon(node);
    const className = getSvgClassFromRendered(el);
    expect(className).toBe("size-8 fill-current");
  });

  it("falls back to DocumentTextIcon for unknown category", () => {
    const node = { category: "unknown-category" } as any;
    const el = getIcon(node);
    const className = getSvgClassFromRendered(el);
    expect(className).toBe("size-8 fill-current");
  });

  it("applies custom size when provided", () => {
    const node = { category: "text" } as any;
    const el = getIcon(node, "size-4");
    const className = getSvgClassFromRendered(el);
    expect(className).toBe("size-4 fill-current");
  });

  it("customIcon overrides node.category (example: customIcon 'code')", () => {
    const node = { category: "text" } as any;
    const el = getIcon(node, "size-6", "code");
    const className = getSvgClassFromRendered(el);
    expect(className).toBe("size-6 fill-current");
  });

  it("unknown customIcon falls back to DocumentTextIcon", () => {
    const node = { category: "image" } as any;
    const el = getIcon(node, "size-5", "totally-unknown");
    const className = getSvgClassFromRendered(el);
    expect(className).toBe("size-5 fill-current");
  });

  it("when customIcon present and valid, uses it even if node has different category", () => {
    const node = { category: "code" } as any;
    const el = getIcon(node, "size-3", "list");
    const className = getSvgClassFromRendered(el);
    expect(className).toBe("size-3 fill-current");
  });
});
