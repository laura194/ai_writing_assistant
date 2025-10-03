import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, beforeEach, expect } from "vitest";

// --- mock icons ---
vi.mock("../../utils/icons", () => ({
  getIcon: () => <div data-testid="icon" />,
}));

import FileContentCardRead from "./FileContentCardRead";

describe("FileContentCardRead", () => {
  const baseNode = {
    id: "n1",
    name: "MyFile",
    category: "docs",
    content: "Hello world",
    icon: "icon-file",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders name, icon and initial content", () => {
    render(<FileContentCardRead node={baseNode as any} />);

    expect(screen.getByText(baseNode.name)).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();

    const ta = screen.getByPlaceholderText(
      /Write your content here/i
    ) as HTMLTextAreaElement;
    expect(ta.value).toBe("Hello world");
  });

  it("falls back to '...' if node.content is missing", () => {
    const node = { ...baseNode, content: undefined };
    render(<FileContentCardRead node={node as any} />);
    const ta = screen.getByPlaceholderText(
      /Write your content here/i
    ) as HTMLTextAreaElement;
    expect(ta.value).toBe("...");
  });

  it("typing updates the textarea value", async () => {
    const user = userEvent.setup();
    render(<FileContentCardRead node={baseNode as any} />);

    const ta = screen.getByPlaceholderText(
      /Write your content here/i
    ) as HTMLTextAreaElement;
    await user.clear(ta);
    await user.type(ta, "New content here");
    expect(ta.value).toBe("New content here");
  });

  it("updates content when new node prop arrives", async () => {
    const { rerender } = render(<FileContentCardRead node={baseNode as any} />);
    const ta = screen.getByPlaceholderText(
      /Write your content here/i
    ) as HTMLTextAreaElement;

    expect(ta.value).toBe("Hello world");

    const newNode = { ...baseNode, content: "Fresh data" };
    rerender(<FileContentCardRead node={newNode as any} />);

    await waitFor(() => {
      expect(ta.value).toBe("Fresh data");
    });
  });

  it("syncScroll copies textarea scrollTop to overlay", () => {
    render(<FileContentCardRead node={baseNode as any} />);
    const ta = screen.getByPlaceholderText(
      /Write your content here/i
    ) as HTMLTextAreaElement;

    // Finde overlayRef -> parent von Textarea
    const container = ta.closest("div.relative.flex-1") as HTMLElement;
    expect(container).toBeInTheDocument();

    // Scroll simulieren
    ta.scrollTop = 42;
    ta.dispatchEvent(new Event("scroll"));

    // OverlayRef sollte denselben scrollTop haben
    // -> Zugriff über sibling im gleichen Container
    const overlayDiv = container.querySelector("div");
    if (overlayDiv) {
      expect(overlayDiv.scrollTop).toBe(ta.scrollTop);
    }
  });
});
