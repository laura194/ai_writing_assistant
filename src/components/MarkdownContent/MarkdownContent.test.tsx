// src/components/MarkdownContent/MarkdownContent.test.tsx
import { render, screen } from "@testing-library/react";
import MarkdownContent from "./MarkdownContent";
import { vi } from "vitest";

function setSelection(text: string) {
  const range = document.createRange();
  const textNode = document.createTextNode(text);
  document.body.appendChild(textNode);
  range.selectNodeContents(textNode);

  const selection = window.getSelection();
  if (!selection) return { textNode, selection: null };

  if (typeof selection.removeAllRanges === "function") {
    selection.removeAllRanges();
  }

  if (typeof selection.addRange === "function") {
    selection.addRange(range);
    return { textNode, selection };
  }

  try {
    const docSel =
      (document as any).getSelection && (document as any).getSelection();
    if (docSel && typeof docSel.addRange === "function") {
      docSel.removeAllRanges && docSel.removeAllRanges();
      docSel.addRange(range);
      return { textNode, selection: docSel as any };
    }
  } catch (e) {
    // fallback
  }

  return { textNode, selection };
}

/**
 * mockSelection now returns both a restore fn and the selection stub itself
 * so tests can assert on the stub (e.g. removeAllRanges calls or toString content).
 */
function mockSelection(text: string) {
  let currentText = text;
  let currentRangeCount = 1;

  const mockRect = {
    left: 0,
    top: 0,
    width: 100,
    height: 20,
    right: 100,
    bottom: 20,
    x: 0,
    y: 0,
    toJSON: () => {},
  };

  const range = {
    getBoundingClientRect: () => mockRect,
    toString: () => currentText,
  };

  const selectionStub: any = {
    removeAllRanges: vi.fn(() => {
      currentText = "";
      currentRangeCount = 0;
    }),
    addRange: vi.fn((_r: any) => {
      currentRangeCount = 1;
    }),
    getRangeAt: () => range,
    get rangeCount() {
      return currentRangeCount;
    },
    toString: () => currentText,
  };

  const original = window.getSelection;
  window.getSelection = () => selectionStub;

  const restore = () => {
    window.getSelection = original;
  };

  return { restore, selectionStub };
}

describe("MarkdownContent Unit Tests", () => {
  test("renders markdown with custom components", () => {
    render(<MarkdownContent content={"**Bold**\n\n- Item1\n1. First"} />);
    expect(screen.getByText("Bold").tagName.toLowerCase()).toBe("strong");
    expect(screen.getByText("Item1").tagName.toLowerCase()).toBe("li");
    expect(screen.getByText("First").tagName.toLowerCase()).toBe("li");
  });

  test("calls onTextSelect when text is selected", () => {
    const mockCb = vi.fn();
    const { restore } = mockSelection("Hello");

    try {
      render(<MarkdownContent content={"Hello"} onTextSelect={mockCb} />);
      const container = screen.getByText("Hello");
      container.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));

      expect(mockCb).toHaveBeenCalledTimes(1);
      expect(mockCb).toHaveBeenCalledWith(
        "Hello",
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
        })
      );
    } finally {
      restore();
    }
  });

  test("does nothing if no text is selected (rangeCount === 0)", () => {
    const mockCb = vi.fn();

    const originalGetSelection = window.getSelection;
    window.getSelection = () =>
      ({
        removeAllRanges: vi.fn(),
        rangeCount: 0,
      }) as any;

    try {
      render(<MarkdownContent content={"Hello"} onTextSelect={mockCb} />);
      const container = screen.getByText("Hello");
      container.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));

      expect(mockCb).not.toHaveBeenCalled();
    } finally {
      window.getSelection = originalGetSelection;
    }
  });

  test("clears selection when clicking outside container (toString path)", () => {
    // this covers the case where selection.toString exists and removeAllRanges is called
    const { restore, selectionStub } = mockSelection("Outside");

    try {
      render(<MarkdownContent content={"Outside click test"} />);
      // create an actual selection in the document to simulate reality (not strictly necessary but harmless)
      const { textNode } = setSelection("Outside");

      document.body.dispatchEvent(
        new MouseEvent("mousedown", { bubbles: true })
      );

      // removeAllRanges should have been called on our stub (and stub's toString should be empty)
      expect(selectionStub.removeAllRanges).toHaveBeenCalled();
      expect(selectionStub.toString()).toBe("");
      textNode.remove();
    } finally {
      restore();
    }
  });
});

/**
 * New tests to cover the four specific code branches you requested:
 * 1) selection.toString is not a function -> fallback "" in handleMouseUp (no callback)
 * 2) typeof rangeCount !== 'number' -> fallback 0 (no callback)
 * 3) handleClickOutside fallback: Boolean(selection.rangeCount) is used when toString missing
 * 4) removeAllRanges path from the hasText branch (covered by 3 and above)
 */
describe("MarkdownContent explicit branch coverage", () => {
  test("handleMouseUp: selection.toString is default Object.prototype.toString -> returns early", () => {
    const mockCb = vi.fn();
    const originalGetSelection = window.getSelection;

    window.getSelection = () =>
      ({
        rangeCount: 1,
        getRangeAt: () => ({
          getBoundingClientRect: () => ({
            left: 0,
            top: 0,
            width: 10,
            height: 10,
          }),
        }),
        toString: Object.prototype.toString,
      }) as any;

    try {
      render(<MarkdownContent content={"Hello"} onTextSelect={mockCb} />);
      const container = screen.getByText("Hello");
      container.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));

      expect(mockCb).not.toHaveBeenCalled();
    } finally {
      window.getSelection = originalGetSelection;
    }
  });

  test("handleMouseUp: rangeCount fallback to 0 when rangeCount missing -> returns early", () => {
    const mockCb = vi.fn();
    const originalGetSelection = window.getSelection;
    // toString exists and returns non-empty, but no numeric rangeCount -> fallback to 0
    window.getSelection = () =>
      ({
        toString: () => "Hi",
        // intentionally no rangeCount and no getRangeAt
      }) as any;

    try {
      render(<MarkdownContent content={"Hello"} onTextSelect={mockCb} />);
      const container = screen.getByText("Hello");
      container.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));

      expect(mockCb).not.toHaveBeenCalled();
    } finally {
      window.getSelection = originalGetSelection;
    }
  });

  test("handleClickOutside: when toString missing, uses Boolean(rangeCount) and calls removeAllRanges", () => {
    const originalGetSelection = window.getSelection;

    // create a stub selection where toString is missing, but rangeCount is truthy and removeAllRanges exists
    const selectionStub: any = {
      // no toString function intentionally
      rangeCount: 1,
      removeAllRanges: vi.fn(),
    };

    window.getSelection = () => selectionStub;

    try {
      render(<MarkdownContent content={"Hello"} />);
      // simulate a selection existing (no DOM setSelection used because we stubbed window.getSelection)
      document.body.dispatchEvent(
        new MouseEvent("mousedown", { bubbles: true })
      );

      expect(selectionStub.removeAllRanges).toHaveBeenCalled();
    } finally {
      window.getSelection = originalGetSelection;
    }
  });
});
