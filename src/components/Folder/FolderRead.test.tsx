import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";

// --- mocks ---
vi.mock("framer-motion", async () => {
  const ReactPkg = await import("react");
  const passthrough = (tag: any) => (props: any) =>
    ReactPkg.createElement(tag, props, props?.children);
  return {
    motion: {
      div: passthrough("div"),
      span: passthrough("span"),
    },
  };
});

vi.mock("../../utils/icons", async () => {
  const ReactPkg = await import("react");
  return {
    getIcon: (_node: any, _size: string, icon?: string) =>
      ReactPkg.createElement("svg", {
        "data-testid": "node-icon",
        "data-icon": icon || "text",
      }),
  };
});

// --- import after mocks ---
import FolderRead from "./FolderRead";
import type { Node } from "../../utils/types";

const baseNode = (overrides?: Partial<Node>): Node => ({
  id: "n1",
  name: "Chapter 1",
  icon: "text",
  nodes: [],
  ...overrides,
});

const setup = (
  node: Node,
  props?: Partial<React.ComponentProps<typeof FolderRead>>
) => {
  const onNodeClick = vi.fn();
  const utils = render(
    <ul>
      <FolderRead node={node} onNodeClick={onNodeClick} {...props} />
    </ul>
  );
  return { ...utils, onNodeClick };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("FolderRead", () => {
  it("renders node name and icon", () => {
    const node = baseNode();
    setup(node);

    expect(screen.getByText("Chapter 1")).toBeInTheDocument();
    expect(screen.getByTestId("node-icon")).toHaveAttribute(
      "data-icon",
      "text"
    );
  });

  it("calls onNodeClick when name is clicked", async () => {
    const node = baseNode();
    const { onNodeClick } = setup(node);

    await userEvent.click(screen.getByText("Chapter 1"));
    expect(onNodeClick).toHaveBeenCalledWith(node);
  });

  it("applies selected styles when selectedNodeId matches", () => {
    const node = baseNode({ id: "sel-1", name: "Selected" });
    setup(node, { selectedNodeId: "sel-1" });

    // selected version renders with gradient underline span
    expect(screen.getByText("Selected")).toBeInTheDocument();
    expect(screen.getByText("Selected").closest("span")).toHaveClass(
      "relative"
    );
  });

  it("renders children recursively", () => {
    const child: Node = { id: "c1", name: "Child", nodes: [] };
    const node = baseNode({ nodes: [child] });

    setup(node);
    expect(screen.getByText("Child")).toBeInTheDocument();
  });

  it("applies hidden styles when isVisible=false", () => {
    const node = baseNode();
    setup(node, { isVisible: false });

    const li = screen.getByText("Chapter 1").closest("li");
    expect(li).toHaveClass("opacity-0");
    expect(li).toHaveClass("max-h-0");
  });
});
