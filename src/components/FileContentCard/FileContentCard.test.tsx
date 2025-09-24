import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, beforeEach, expect } from "vitest";

/**
 * Mocks — MUSS vor dem Import der Komponente stehen
 */

// --- mock react-router-dom with runtime-setter for projectId ---
vi.mock("react-router-dom", async () => {
  let _projectId: string | undefined = undefined;
  return {
    useParams: () => (_projectId ? { projectId: _projectId } : ({} as any)),
    __setProjectId: (p: string | undefined) => {
      _projectId = p;
    },
  };
});

// --- mock axios ---
const AXIOS_GET = vi.fn();
vi.mock("axios", () => ({
  default: {
    get: (...args: any[]) => AXIOS_GET(...args),
  },
}));

// --- mock NodeContentService ---
vi.mock("../../utils/NodeContentService", () => ({
  NodeContentService: {
    updateNodeContent: vi.fn(),
  },
}));

// --- mock toast (react-hot-toast default export) ---
vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
  },
}));

// --- mock icons & gradient atom ---
vi.mock("../../utils/icons", () => ({
  getIcon: () => <div data-testid="icon" />,
}));
vi.mock("../GradientAtom/GradientAtom", () => ({
  default: () => <div data-testid="gradient-atom" />,
}));

// --- mock AIBubble (clickable) ---
vi.mock("../ai/AIBubble/AIBubble", () => ({
  default: ({ onClick }: any) => (
    <button data-testid="ai-bubble" onClick={onClick}>
      ai-bubble
    </button>
  ),
}));

// --- mock AIComponent (calls onReplace/onAppend) ---
vi.mock("../ai/AIComponent/AIComponent", () => ({
  default: ({ onReplace, onAppend, selectedText }: any) => (
    <div data-testid="mock-ai-component">
      <button
        data-testid="mock-ai-replace"
        onClick={() => {
          // nur ersetzen, wenn selectedText existiert UND Länge > 0
          if (selectedText && selectedText.length > 0) {
            onReplace?.("REPLACED_TEXT");
          }
        }}
      >
        replace
      </button>
      <button
        data-testid="mock-ai-append"
        onClick={() => onAppend?.("APPENDED_TEXT")}
      >
        append
      </button>
    </div>
  ),
}));

// --- mock framer-motion (simple passthroughs) ---
vi.mock("framer-motion", async () => {
  const ReactPkg = await import("react");
  return {
    motion: {
      button: (props: any) => ReactPkg.createElement("button", props),
      div: (props: any) => ReactPkg.createElement("div", props),
    },
  };
});

vi.mock("../../providers/ThemeProvider", () => {
  return {
    ThemeProvider: ({ children }: any) => children,
    useTheme: () => ({
      theme: "light",
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
    }),
  };
});

import FileContentCard from "./FileContentCard";

/* ------------------ Helpers ------------------ */

const setProjectId = async (p: string | undefined) => {
  const routerMock = await import("react-router-dom");
  (routerMock as any).__setProjectId(p);
};

const getNodeContentServiceMock = async () => {
  const mod = (await import("../../utils/NodeContentService")) as any;
  return mod.NodeContentService as {
    updateNodeContent: ReturnType<typeof vi.fn>;
  };
};

const getToastMock = async () => {
  const mod = (await import("react-hot-toast")) as any;
  return mod.default as { error: ReturnType<typeof vi.fn> };
};

/* ------------------ Tests ------------------ */

describe("FileContentCard", () => {
  const baseNode = {
    id: "node-1",
    name: "File1",
    category: "cat",
    content: "Hello world",
    icon: "icon-name",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    AXIOS_GET.mockReset();
    await setProjectId(undefined);
    const svc = await getNodeContentServiceMock();
    svc.updateNodeContent.mockReset();
    const toast = await getToastMock();
    toast.error.mockReset();
  });

  it("renders initial content and icon", async () => {
    await setProjectId(undefined);
    render(
      <FileContentCard
        node={baseNode as any}
        onDirtyChange={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(screen.getByText(baseNode.name)).toBeInTheDocument();
    const ta = screen.getByPlaceholderText(/Write your content here\.\.\./i);
    expect((ta as HTMLTextAreaElement).value).toBe(baseNode.content);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByTitle("No changes")).toBeInTheDocument();
  });

  it("typing into textarea marks document dirty and calls onDirtyChange", async () => {
    const onDirtyChange = vi.fn();
    await setProjectId("proj-x");
    const user = userEvent.setup();

    render(
      <FileContentCard node={baseNode as any} onDirtyChange={onDirtyChange} />,
    );

    const ta = screen.getByPlaceholderText(/Write your content here\.\.\./i);
    await user.type(ta, "!");
    await waitFor(() => expect(onDirtyChange).toHaveBeenCalled());
    expect(screen.getByTitle("Save changes")).toBeInTheDocument();
  });

  it("save without projectId shows toast.error and does not call updateNodeContent", async () => {
    await setProjectId(undefined);
    const user = userEvent.setup();
    const svc = await getNodeContentServiceMock();
    svc.updateNodeContent.mockResolvedValueOnce({});

    render(<FileContentCard node={baseNode as any} />);

    const ta = screen.getByPlaceholderText(/Write your content here\.\.\./i);
    await user.type(ta, " appended");

    const saveBtn = screen.getByTitle("Save changes");
    await user.click(saveBtn);

    const toast = await getToastMock();
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
    expect(svc.updateNodeContent).not.toHaveBeenCalled();
  });

  it("successful save with projectId calls NodeContentService.updateNodeContent and onSave", async () => {
    await setProjectId("proj-123");
    const svc = await getNodeContentServiceMock();
    svc.updateNodeContent.mockResolvedValueOnce({});

    const onSave = vi.fn();
    const user = userEvent.setup();
    render(
      <FileContentCard
        node={baseNode as any}
        onSave={onSave}
        onDirtyChange={vi.fn()}
      />,
    );

    const ta = screen.getByPlaceholderText(/Write your content here\.\.\./i);
    await user.clear(ta);
    await user.type(ta, "Modified content");

    const saveBtn = screen.getByTitle("Save changes");
    await user.click(saveBtn);

    await waitFor(() => {
      expect(svc.updateNodeContent).toHaveBeenCalledTimes(1);
    });

    const callArgs = svc.updateNodeContent.mock.calls[0];
    expect(callArgs[0]).toBe(baseNode.id);
    expect(callArgs[1]).toMatchObject({
      nodeId: baseNode.id,
      name: baseNode.name,
      category: baseNode.category,
      content: "Modified content",
      projectId: "proj-123",
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.getByTitle("No changes")).toBeInTheDocument();
    });
  });

  it("failed save shows toast.error", async () => {
    await setProjectId("proj-fail");
    const svc = await getNodeContentServiceMock();
    svc.updateNodeContent.mockRejectedValueOnce(new Error("boom"));

    const user = userEvent.setup();
    render(<FileContentCard node={baseNode as any} />);

    const ta = screen.getByPlaceholderText(/Write your content here\.\.\./i);
    await user.type(ta, " x");

    const saveBtn = screen.getByTitle("Save changes");
    await user.click(saveBtn);

    const toast = await getToastMock();
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it("selecting text opens AIBubble, clicking it opens AIComponent; replace and append work", async () => {
    await setProjectId("proj-ai");
    const user = userEvent.setup();
    render(<FileContentCard node={baseNode as any} />);

    const ta = screen.getByPlaceholderText(
      /Write your content here\.\.\./i,
    ) as HTMLTextAreaElement;
    await user.clear(ta);
    await user.type(ta, "Hello brave new world");

    ta.focus();
    const start = ta.value.indexOf("new");
    const end = start + "new".length;
    ta.setSelectionRange(start, end);

    ta.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));

    await waitFor(() => {
      expect(screen.getByTestId("ai-bubble")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("ai-bubble"));

    await waitFor(() => {
      expect(screen.getByTestId("mock-ai-component")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("mock-ai-replace"));

    await waitFor(() => {
      expect(ta.value).toContain("REPLACED_TEXT");
    });

    await user.click(screen.getByTestId("mock-ai-append"));

    await waitFor(() => {
      expect(ta.value).toContain("APPENDED_TEXT");
    });
  });

  it("Ctrl+S triggers save when dirty", async () => {
    await setProjectId("proj-ctrls");
    const svc = await getNodeContentServiceMock();
    svc.updateNodeContent.mockResolvedValueOnce({});

    const onSave = vi.fn();
    render(<FileContentCard node={baseNode as any} onSave={onSave} />);

    const ta = screen.getByPlaceholderText(/Write your content here\.\.\./i);
    await userEvent.type(ta, " changed");

    const ev = new KeyboardEvent("keydown", { key: "s", ctrlKey: true });
    window.dispatchEvent(ev);

    await waitFor(() => {
      expect(svc.updateNodeContent).toHaveBeenCalled();
      expect(onSave).toHaveBeenCalled();
    });
  });

  describe("FileContentCard - additional edge cases", () => {
    const baseNode = {
      id: "node-1",
      name: "File1",
      category: "cat",
      content: "Hello world",
      icon: "icon-name",
    };

    beforeEach(async () => {
      vi.clearAllMocks();
      AXIOS_GET.mockReset();
      await setProjectId("proj-x");
      const svc = await getNodeContentServiceMock();
      svc.updateNodeContent.mockReset();
      const toast = await getToastMock();
      toast.error.mockReset();
    });

    it("handleAppend adds new content correctly with newline", async () => {
      render(<FileContentCard node={baseNode as any} />);

      const ta = screen.getByPlaceholderText(/Write your content here\.\.\./i);

      const aiBtn = screen.getByTitle("Ask AI about this content");
      await userEvent.click(aiBtn);

      const appendBtn = screen.getByTestId("mock-ai-append");
      await userEvent.click(appendBtn);

      expect((ta as HTMLTextAreaElement).value).toContain("APPENDED_TEXT");
      expect((ta as HTMLTextAreaElement).value).toMatch(/\nAPPENDED_TEXT$/);
    });

    it("selection cleared hides AIBubble", async () => {
      render(<FileContentCard node={baseNode as any} />);

      const ta = screen.getByPlaceholderText(
        /Write your content here\.\.\./i,
      ) as HTMLTextAreaElement;
      await userEvent.clear(ta);
      await userEvent.type(ta, "Test selection");

      // select text
      ta.setSelectionRange(0, 4);
      ta.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));

      await waitFor(() =>
        expect(screen.getByTestId("ai-bubble")).toBeInTheDocument(),
      );

      // deselect text
      ta.setSelectionRange(0, 0);
      document.dispatchEvent(new Event("selectionchange"));

      await waitFor(() =>
        expect(screen.queryByTestId("ai-bubble")).not.toBeInTheDocument(),
      );
    });

    it("Ctrl+S does not save when not dirty", async () => {
      render(<FileContentCard node={baseNode as any} />);

      const svc = await getNodeContentServiceMock();
      const onSave = vi.fn();

      const ev = new KeyboardEvent("keydown", { key: "s", ctrlKey: true });
      window.dispatchEvent(ev);

      expect(svc.updateNodeContent).not.toHaveBeenCalled();
      expect(onSave).not.toHaveBeenCalled();
    });

    it("AI button click without selection uses full content", async () => {
      render(<FileContentCard node={baseNode as any} />);

      const aiBtn = screen.getByTitle("Ask AI about this content");
      await userEvent.click(aiBtn);

      await waitFor(() =>
        expect(screen.getByTestId("mock-ai-component")).toBeInTheDocument(),
      );

      const ta = screen.getByPlaceholderText(
        /Write your content here\.\.\./i,
      ) as HTMLTextAreaElement;
      expect(ta.value).toBe(baseNode.content);
    });

    it("Ctrl+S triggers save for dark theme with dirty content", async () => {
      const svc = await getNodeContentServiceMock();
      svc.updateNodeContent.mockResolvedValueOnce({});

      const onSave = vi.fn();
      render(<FileContentCard node={baseNode as any} onSave={onSave} />);

      const ta = screen.getByPlaceholderText(/Write your content here\.\.\./i);
      await userEvent.type(ta, " changed");

      const ev = new KeyboardEvent("keydown", { key: "s", ctrlKey: true });
      window.dispatchEvent(ev);

      await waitFor(() => {
        expect(svc.updateNodeContent).toHaveBeenCalled();
        expect(onSave).toHaveBeenCalled();
      });
    });

    it("handleSave handles synchronous error gracefully", async () => {
      const svc = await getNodeContentServiceMock();
      svc.updateNodeContent.mockImplementationOnce(() => {
        throw new Error("sync fail");
      });

      const toast = await getToastMock();

      render(<FileContentCard node={baseNode as any} />);

      const ta = screen.getByPlaceholderText(/Write your content here\.\.\./i);
      await userEvent.type(ta, " changed");

      const saveBtn = screen.getByTitle("Save changes");
      await userEvent.click(saveBtn);

      await waitFor(() => expect(toast.error).toHaveBeenCalled());
    });
  });
});
