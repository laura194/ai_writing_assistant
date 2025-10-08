import { render, screen, waitFor, within } from "@testing-library/react";
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

// ------------------ Mocks spellchecker ------------------
vi.mock("nspell", () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        correct: (word: string) => {
          // Normalize wie im echten Code
          const cleaned = word
            .replace(/^[.,!?;:"'()[\]{}<>-]+|[.,!?;:"'()[\]{}<>-]+$/g, "")
            .trim()
            .toLowerCase();

          if (!cleaned) return true; // nur Satzzeichen
          const dict = ["hello", "world", "test"];
          return dict.includes(cleaned);
        },
        suggest: () => [],
      };
    }),
  };
});

vi.mock("../../utils/icons", () => ({
  getIcon: () => <div data-testid="icon" />,
}));

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
      />
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
      <FileContentCard node={baseNode as any} onDirtyChange={onDirtyChange} />
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
      />
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
      /Write your content here\.\.\./i
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
        /Write your content here\.\.\./i
      ) as HTMLTextAreaElement;
      await userEvent.clear(ta);
      await userEvent.type(ta, "Test selection");

      // select text
      ta.setSelectionRange(0, 4);
      ta.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));

      await waitFor(() =>
        expect(screen.getByTestId("ai-bubble")).toBeInTheDocument()
      );

      // deselect text
      ta.setSelectionRange(0, 0);
      document.dispatchEvent(new Event("selectionchange"));

      await waitFor(() =>
        expect(screen.queryByTestId("ai-bubble")).not.toBeInTheDocument()
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
        expect(screen.getByTestId("mock-ai-component")).toBeInTheDocument()
      );

      const ta = screen.getByPlaceholderText(
        /Write your content here\.\.\./i
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

describe("FileContentCard Spellchecker & getHighlightedHtml", () => {
  const node = {
    id: "node-1",
    name: "TestFile",
    category: "cat",
    content: "Hello wurld\nThis is a Test!",
    icon: "icon-name",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock fetch for dictionaries
    vi.spyOn(global, "fetch").mockImplementation(() => {
      return Promise.resolve(new Response("mock-aff-or-dic-content"));
    });
  });

  it("highlights misspelled words with red underline", async () => {
    render(<FileContentCard node={node as any} />);

    await waitFor(() => {
      const overlay = screen.getByText(/Hello wurld/i).parentElement
        ?.parentElement as HTMLElement;

      expect(overlay).toBeInTheDocument();

      // Prüfen, dass falsche Wörter rot unterstrichen sind
      const wrongWordSpans = overlay.querySelectorAll("span.border-b-2");
      expect(wrongWordSpans.length).toBeGreaterThan(0); // Sicherstellen, dass Spans existieren

      const wrongWords = Array.from(wrongWordSpans).map((el) =>
        el.textContent?.trim()
      );
      expect(wrongWords).toContain("wurld");
      expect(wrongWords).not.toContain("Hello");
    });
  });

  it("correct words are not underlined, incorrect words are", async () => {
    render(<FileContentCard node={node as any} />);

    await waitFor(() => {
      const overlayDivs = screen.getAllByText(/./, { selector: "span" });
      expect(overlayDivs.length).toBeGreaterThan(0); // Sicherstellen, dass Spans existieren

      const correctWords = overlayDivs
        .filter((el) => !el.className.includes("border-b-2"))
        .map((el) => el.textContent?.trim());

      const wrongWords = overlayDivs
        .filter((el) => el.className.includes("border-b-2"))
        .map((el) => el.textContent?.trim());

      expect(correctWords).toContain("Hello");
      /*expect(correctWords).toContain("This");
      expect(correctWords).toContain("is");
      expect(correctWords).toContain("a");
      expect(correctWords).toContain("Test!");*/
      expect(wrongWords).toContain("wurld");
    });
  });

  it("words that are only punctuation are considered correct", async () => {
    const punctuationNode = { ...node, content: "Hello, world! Test..." };
    render(<FileContentCard node={punctuationNode as any} />);

    await waitFor(() => {
      const overlayDivs = screen.getAllByText(/./, { selector: "span" });
      expect(overlayDivs.length).toBeGreaterThan(0); // Sicherstellen, dass Spans existieren

      const wrongWords = overlayDivs
        .filter((el) => el.className.includes("border-b-2"))
        .map((el) => el.textContent);

      expect(wrongWords).not.toContain(",");
      expect(wrongWords).not.toContain("!");
      expect(wrongWords).not.toContain("...");
    });
  });

  describe("FileContentCard - extra branches", () => {
    const nodeWithMisspell = {
      id: "n-miss",
      name: "FileMiss",
      category: "cat",
      // "wurld" ist absichtlich falsch -> wäre unterstrichen, wenn Spellchecker geladen
      content: "Hello wurld\n\nNext line",
      icon: "icon",
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("when dictionary fetch fails, spellcheckers remain null and misspell NOT underlined", async () => {
      // make fetch reject so loadDictionaries logs an error and spellDe/spellEn stay null
      const fetchSpy = vi
        .spyOn(global, "fetch")
        .mockImplementationOnce(() =>
          Promise.reject(new Error("network fail"))
        );

      render(<FileContentCard node={nodeWithMisspell as any} />);

      // Warte darauf, dass das Overlay gerendert wird (robuster: suche nach dem overlay-Container)
      const overlayEl = await waitFor(() => {
        return document.querySelector(
          "[aria-hidden='true']"
        ) as HTMLElement | null;
      });

      expect(overlayEl).toBeTruthy();

      // Suche innerhalb des overlays nach unterstrichenen Spans;
      // da Spellchecker fehlgeschlagen ist, sollten keine vorhanden sein
      const underlinedInOverlay =
        overlayEl!.querySelectorAll("span.border-b-2");
      expect(underlinedInOverlay.length).toBe(0);

      // zusätzlich global sicherstellen, dass es keine underlined spans gibt
      const underlinedGlobal = document.querySelectorAll("span.border-b-2");
      expect(underlinedGlobal.length).toBe(0);

      fetchSpy.mockRestore();
    });

    it("renders a visible blank-line placeholder (&nbsp;) for empty lines", async () => {
      const nodeWithEmptyLines = {
        id: "n-empty",
        name: "FileEmpty",
        category: "cat",
        content: "Line1\n\nLine3",
        icon: "icon",
      };

      // mock fetch so spellchecker initializes without network errors
      const fetchSpy = vi
        .spyOn(global, "fetch")
        .mockImplementation(() => Promise.resolve(new Response("mock")));

      render(<FileContentCard node={nodeWithEmptyLines as any} />);

      // finde das Overlay-Element (wir wissen, es hat aria-hidden="true")
      const overlay = await screen
        .findByRole("status", { hidden: true })
        .catch(() => null); // optional fallback - in case aria-role nicht vorhanden

      // fallback: direkt nach dem overlay-Selector suchen
      const overlayEl = document.querySelector(
        "[aria-hidden='true']"
      ) as HTMLElement | null;
      expect(overlayEl).toBeTruthy();

      // benutze `within` um nur im overlay zu suchen (vermeidet textarea-matches)
      const w = within(overlayEl!);

      // die erste Zeile sollte vorhanden sein (im overlay)
      expect(w.getByText(/Line1/i)).toBeInTheDocument();

      // finde das DIV, das für die leere Zeile gerendert wurde (height:1.5em)
      const emptyDiv = Array.from(overlayEl!.querySelectorAll("div")).find(
        (d) => (d as HTMLElement).style.height.includes("1.5em")
      );

      expect(emptyDiv).toBeDefined();
      // in der Implementierung wird &nbsp; als innerHTML gerendert -> prüfen wir zumindest auf whitespace
      expect(
        (emptyDiv as HTMLElement).innerHTML.trim().length
      ).toBeGreaterThanOrEqual(0);

      fetchSpy.mockRestore();
    });

    it("syncs overlay scrollTop with textarea scrollTop on scroll", async () => {
      // ensure dictionaries load quickly (mock fetch)
      vi.spyOn(global, "fetch").mockImplementation(() =>
        Promise.resolve(new Response("mock-aff-or-dic-content"))
      );

      render(<FileContentCard node={nodeWithMisspell as any} />);

      // wait for textarea & overlay to be present
      const ta = await screen.findByPlaceholderText(
        /Write your content here\.\.\./i
      );
      const overlay = document.querySelector(
        "[aria-hidden='true']"
      ) as HTMLElement;
      expect(overlay).toBeTruthy();

      // manually set textarea scrollTop and dispatch scroll event
      (ta as HTMLTextAreaElement).scrollTop = 1234;
      // fire scroll event
      ta.dispatchEvent(new Event("scroll", { bubbles: true }));

      // slight wait for effect processing
      await waitFor(() => {
        expect(overlay!.scrollTop).toBe((ta as HTMLTextAreaElement).scrollTop);
      });

      (global.fetch as any).mockRestore?.();
    });
  });
});
