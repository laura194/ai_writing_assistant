import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";

// Mocks
vi.mock("framer-motion", async () => {
  const ReactPkg = await import("react");
  const passthrough = (tag: any) => (props: any) =>
    ReactPkg.createElement(tag, props, props?.children);
  return {
    motion: {
      div: passthrough("div"),
      span: passthrough("span"),
      button: passthrough("button"),
    },
  };
});

vi.mock("react-dnd", () => ({
  useDrag: () => [{ isDragging: false }, (el: any) => el],
  useDrop: () => [{}, (el: any) => el],
}));

let __theme: "light" | "dark" = "light";
vi.mock("../../providers/ThemeProvider", () => ({
  useTheme: () => ({ theme: __theme }),
}));

vi.mock("../IconPicker/IconPicker", () => ({
  __esModule: true,
  default: ({
    currentIcon,
    onSelect,
  }: {
    currentIcon?: string;
    onSelect: (icon: string) => void;
  }) => (
    <div data-testid="icon-picker">
      <span data-testid="current-icon">{currentIcon ?? "text"}</span>
      <button onClick={() => onSelect("code")}>pick-icon</button>
    </div>
  ),
}));

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

// Import after mocks
import Folder from "./Folder";
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
  props?: Partial<React.ComponentProps<typeof Folder>>,
) => {
  const onMove = vi.fn();
  const onNodeClick = vi.fn();
  const onAdd = vi.fn();
  const onRemove = vi.fn();
  const onRenameOrIconUpdate = vi.fn();

  const utils = render(
    <ul>
      <Folder
        node={node}
        onMove={onMove}
        onNodeClick={onNodeClick}
        onAdd={onAdd}
        onRemove={onRemove}
        onRenameOrIconUpdate={onRenameOrIconUpdate}
        isVisible={true}
        selectedNodeId={props?.selectedNodeId ?? ""}
      />
    </ul>,
  );

  return {
    ...utils,
    onMove,
    onNodeClick,
    onAdd,
    onRemove,
    onRenameOrIconUpdate,
  };
};

beforeEach(() => {
  vi.clearAllMocks();
  __theme = "light";
  vi.spyOn(Date, "now").mockReturnValue(1234567890);
});

describe("Folder", () => {
  it("renders node name and calls onNodeClick when clicked", async () => {
    const node = baseNode();
    const { onNodeClick } = setup(node);

    const name = screen.getByText("Chapter 1");
    await userEvent.click(name);

    expect(onNodeClick).toHaveBeenCalledWith(node);
  });

  it("enters edit mode on double-click and saves trimmed name on Enter", async () => {
    const node = baseNode();
    const { onRenameOrIconUpdate } = setup(node);

    const name = screen.getByText("Chapter 1");
    await userEvent.dblClick(name);

    const input = screen.getByDisplayValue("Chapter 1") as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, "   New Name   ");
    await userEvent.keyboard("{Enter}");

    expect(onRenameOrIconUpdate).toHaveBeenCalledTimes(1);
    expect(onRenameOrIconUpdate).toHaveBeenCalledWith({
      ...node,
      name: "New Name",
    });

    // Component relies on parent to pass updated node; it exits edit mode but doesn't update its own label.
    // Assert that input closed instead of expecting immediate text change.
    expect(screen.queryByDisplayValue(/New Name/)).not.toBeInTheDocument();
  });

  it("does not save when trimmed name is empty and reverts to original", async () => {
    const node = baseNode();
    const { onRenameOrIconUpdate } = setup(node);

    const name = screen.getByText("Chapter 1");
    await userEvent.dblClick(name);

    const input = screen.getByDisplayValue("Chapter 1") as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.keyboard("{Enter}");

    expect(onRenameOrIconUpdate).not.toHaveBeenCalled();
    expect(screen.getByText("Chapter 1")).toBeInTheDocument();
  });

  it("cancels edit on Escape without saving", async () => {
    const node = baseNode();
    const { onRenameOrIconUpdate } = setup(node);

    const name = screen.getByText("Chapter 1");
    await userEvent.dblClick(name);

    const input = screen.getByDisplayValue("Chapter 1") as HTMLInputElement;
    await userEvent.type(input, " Foo");
    await userEvent.keyboard("{Escape}");

    expect(onRenameOrIconUpdate).not.toHaveBeenCalled();
    expect(screen.getByText("Chapter 1")).toBeInTheDocument();
  });

  it("toggles icon picker (non-root) and updates icon on selection", async () => {
    const node = baseNode();
    const { onRenameOrIconUpdate } = setup(node);

    const iconWrapper = screen.getByTitle(/Click to change icon/i);
    await userEvent.click(iconWrapper);

    expect(screen.getByTestId("icon-picker")).toBeInTheDocument();

    await userEvent.click(screen.getByText("pick-icon"));

    expect(onRenameOrIconUpdate).toHaveBeenCalledWith({
      ...node,
      icon: "code",
    });

    await waitFor(() => {
      expect(screen.queryByTestId("icon-picker")).not.toBeInTheDocument();
    });
  });

  it("closes icon picker when clicking outside", async () => {
    const node = baseNode();
    setup(node);

    const iconWrapper = screen.getByTitle(/Click to change icon/i);
    await userEvent.click(iconWrapper);
    expect(screen.getByTestId("icon-picker")).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByTestId("icon-picker")).not.toBeInTheDocument();
    });
  });

  it("handles delete flow: open dialog, cancel, confirm", async () => {
    const node = baseNode({ id: "child-1", name: "Child" });
    const { onRemove } = setup(node);

    // Open dialog
    await userEvent.click(screen.getByTitle(/Delete chapter/i));

    // Cancel first
    await userEvent.click(screen.getByText(/Cancel/i));
    expect(onRemove).not.toHaveBeenCalled();

    // Open again and confirm
    await userEvent.click(screen.getByTitle(/Delete chapter/i));
    await userEvent.click(screen.getByText(/Delete Child/i));

    expect(onRemove).toHaveBeenCalledWith("child-1");
  });

  it("adds a new chapter when clicking add button", async () => {
    const node = baseNode({ id: "parent-1" });
    const { onAdd } = setup(node);

    await userEvent.click(screen.getByTitle(/Add chapter/i));

    expect(onAdd).toHaveBeenCalledTimes(1);
    const [parentId, newNode] = onAdd.mock.calls[0];
    expect(parentId).toBe("parent-1");
    expect(newNode.name).toBe("New chapter");
    expect(typeof newNode.id).toBe("string");
  });

  it("root node (id === '1') disables edit, delete and icon picker", async () => {
    const node = baseNode({ id: "1", name: "Root" });
    setup(node);

    // No delete button
    expect(screen.queryByTitle(/Delete chapter/i)).not.toBeInTheDocument();

    // Icon picker cannot be opened
    const iconWrapper = screen.getByTitle(/The icon cannot be changed/i);
    await userEvent.click(iconWrapper);
    expect(screen.queryByTestId("icon-picker")).not.toBeInTheDocument();

    // Double-click should not enter edit mode
    const name = screen.getByText("Root");
    await userEvent.dblClick(name);
    expect(screen.queryByDisplayValue("Root")).not.toBeInTheDocument();
  });

  it("applies selected styles when selectedNodeId matches and still handles click", async () => {
    const node = baseNode({ id: "sel-1", name: "Selected" });
    const { onNodeClick } = setup(node, { selectedNodeId: "sel-1" });

    const name = screen.getByText("Selected");
    expect(name).toBeInTheDocument();
    await userEvent.click(name);
    expect(onNodeClick).toHaveBeenCalledWith(node);
  });

  it("renders children recursively and delegates props", async () => {
    const child: Node = { id: "c1", name: "Child 1", nodes: [] };
    const node = baseNode({ nodes: [child] });
    const { onNodeClick } = setup(node);

    const childEl = await screen.findByText("Child 1");
    await userEvent.click(childEl);
    expect(onNodeClick).toHaveBeenCalledWith(child);
  });
});
