import { vi } from "vitest";
import { fireEvent, screen, waitFor, act } from "@testing-library/react";
import { render } from "../../../test/renderWithProviders";
import EditPage from "./EditPage";

// Mock stylesheet import from EditPage
vi.mock("../../App/App.css", () => ({}));

// Mock DnD provider to simple passthrough
vi.mock("react-dnd", () => ({
  DndProvider: ({ children }: any) => <div>{children}</div>,
}));
vi.mock("react-dnd-html5-backend", () => ({ HTML5Backend: {} }));

// Mock child components minimally to avoid complex internals
vi.mock("../../components/Folder/Folder", () => ({
  __esModule: true,
  default: ({
    node,
    onNodeClick,
    onAdd,
    onRemove,
    onRenameOrIconUpdate,
    onMove,
  }: any) => (
    <li data-testid={`folder-item-${node.id}`}>
      <div>{node.name}</div>
      <button
        data-testid={`folder-select-${node.id}`}
        onClick={() => onNodeClick(node)}
      >
        select
      </button>
      <button
        data-testid={`folder-add-${node.id}`}
        onClick={() =>
          onAdd(node.id, { id: `${node.id}-new`, name: "New", nodes: [] })
        }
      >
        add
      </button>
      <button
        data-testid={`folder-remove-${node.id}`}
        onClick={() => onRemove(node.id)}
      >
        remove
      </button>
      <button
        data-testid={`folder-rename-${node.id}`}
        onClick={() =>
          onRenameOrIconUpdate({
            ...node,
            name: node.name + "-renamed",
            icon: "i",
          })
        }
      >
        rename
      </button>
      <button
        data-testid={`folder-move-${node.id}`}
        onClick={() => onMove(node.id, node.id === "2" ? "1" : "2")}
      >
        move
      </button>
    </li>
  ),
}));
vi.mock("../../components/FileContentCard/FileContentCard", () => ({
  __esModule: true,
  default: ({ onDirtyChange, onSave }: any) => (
    <div data-testid="file-card">
      <button data-testid="mark-dirty" onClick={() => onDirtyChange(true)}>
        mark-dirty
      </button>
      <button data-testid="clear-dirty" onClick={() => onDirtyChange(false)}>
        clear-dirty
      </button>
      <button data-testid="save-node" onClick={() => onSave()}>
        save
      </button>
    </div>
  ),
}));
vi.mock("../../components/AIProtocolCard/AIProtocolCard", () => ({
  __esModule: true,
  default: () => <div data-testid="ai-card" />,
}));
vi.mock("../../components/FullDocumentCard/FullDocumentCard", () => ({
  __esModule: true,
  default: () => <div data-testid="full-doc" />,
}));
vi.mock("../../components/BottomNavigationBar/BottomNavigationBar", () => ({
  __esModule: true,
  default: ({ onChangeView }: any) => (
    <nav>
      <button onClick={() => onChangeView("file")} data-testid="view-file">
        file
      </button>
      <button onClick={() => onChangeView("ai")} data-testid="view-ai">
        ai
      </button>
      <button
        onClick={() => onChangeView("fullDocument")}
        data-testid="view-full"
      >
        full
      </button>
    </nav>
  ),
}));
vi.mock("../../components/Header/Header", () => ({
  __esModule: true,
  default: () => <header data-testid="header" />,
}));
vi.mock("../../components/UnsavedChangesDialog/UnsavedChangesDialog", () => ({
  __esModule: true,
  default: ({ isOpen, onConfirm, onCancel }: any) =>
    isOpen ? (
      <div role="dialog">
        <button data-testid="dialog-confirm" onClick={onConfirm}>
          confirm
        </button>
        <button data-testid="dialog-cancel" onClick={onCancel}>
          cancel
        </button>
      </div>
    ) : null,
}));

// Mock motion wrappers
vi.mock("framer-motion", () => ({
  motion: new Proxy({}, { get: () => (p: any) => <div {...p} /> }),
}));

// Mock services
const getProjectById = vi.fn();
const updateProject = vi.fn();
vi.mock("../../utils/ProjectService", () => ({
  ProjectService: {
    getProjectById: (...a: any[]) => getProjectById(...a),
    updateProject: (...a: any[]) => updateProject(...a),
  },
}));

const getOrCreateNodeContent = vi.fn();
const getNodeContentById = vi.fn();
const updateNodeContent = vi.fn(() => Promise.resolve());
vi.mock("../../utils/NodeContentService", () => ({
  NodeContentService: {
    getOrCreateNodeContent: (...a: any[]) => getOrCreateNodeContent(...a),
    getNodeContentById: (...a: any[]) => getNodeContentById(...a),
    updateNodeContent: (...a: any) => (updateNodeContent as any)(...a),
  },
}));

// Mock router params
vi.mock("react-router-dom", async (orig) => {
  const actual = await (orig as any)();
  return { ...actual, useParams: () => ({ projectId: "p1" }) };
});

// LocalStorage helpers
const store = new Map<string, string>();
beforeAll(() => {
  vi.spyOn(window, "localStorage", "get").mockReturnValue({
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    length: 0,
  } as any);
});

describe("EditPage", () => {
  beforeEach(() => {
    store.clear();
    vi.clearAllMocks();

    getProjectById.mockResolvedValue({
      _id: "p1",
      name: "Proj",
      username: "u",
      projectStructure: [
        { id: "1", name: "Chapter structure", nodes: [] },
        { id: "2", name: "Intro", nodes: [] },
      ],
    });

    getOrCreateNodeContent.mockResolvedValue({
      nodeId: "2",
      content: "c",
      name: "Intro",
      category: "cat",
    });

    getNodeContentById.mockResolvedValue({
      nodeId: "2",
      content: "c",
      name: "Intro",
      category: "cat",
    });

    updateProject.mockResolvedValue({});
  });

  test("renders header and sidebar with folders and nav buttons", async () => {
    render(<EditPage />);
    await screen.findByTestId("header");

    expect(screen.getByTestId("folder-item-1")).toBeInTheDocument();
    expect(screen.getByTestId("folder-item-2")).toBeInTheDocument();

    // Bottom nav
    expect(screen.getByTestId("view-file")).toBeInTheDocument();
    expect(screen.getByTestId("view-ai")).toBeInTheDocument();
    expect(screen.getByTestId("view-full")).toBeInTheDocument();
  });

  test("clicking a content node triggers content fetch and persists selected id", async () => {
    render(<EditPage />);
    await screen.findByText("Intro");

    fireEvent.click(screen.getByTestId("folder-select-2"));

    await waitFor(() => expect(getOrCreateNodeContent).toHaveBeenCalled());
    expect(store.get("selectedNodeId_p1")).toBe("2");
  });

  test("ignores click on 'Chapter structure' root", async () => {
    render(<EditPage />);
    await screen.findByText("Intro");

    fireEvent.click(screen.getByTestId("folder-select-1"));
    expect(getOrCreateNodeContent).not.toHaveBeenCalled();
  });

  test("view switching buttons are clickable without errors", async () => {
    render(<EditPage />);
    await screen.findByText("Intro");

    fireEvent.click(screen.getByTestId("view-ai"));
    fireEvent.click(screen.getByTestId("view-full"));
    fireEvent.click(screen.getByTestId("view-file"));
  });

  test("selecting a node triggers content fetch", async () => {
    render(<EditPage />);
    await screen.findByText("Intro");

    fireEvent.click(screen.getByTestId("folder-select-2"));
    await waitFor(() => expect(getOrCreateNodeContent).toHaveBeenCalled());
  });

  describe("EditPage - additional coverage", () => {
    test("menuOpen restored from localStorage (false hides folder list)", async () => {
      store.set("menuOpen", JSON.stringify(false)); // should initialize menuOpen = false
      render(<EditPage />);

      // header still renders
      await screen.findByTestId("header");

      // folder items should NOT be present because menuOpen false
      expect(screen.queryByTestId("folder-item-1")).not.toBeInTheDocument();
      expect(screen.queryByTestId("folder-item-2")).not.toBeInTheDocument();
    });

    test("restores selected node from localStorage and shows file-card (activeView file)", async () => {
      // persist selection and activeView to localStorage
      store.set("selectedNodeId_p1", "2");
      store.set("activeView", "file");

      render(<EditPage />);

      // File card is shown after the node content is loaded
      await waitFor(() =>
        expect(getNodeContentById).toHaveBeenCalledWith("2", "p1"),
      );
      expect(await screen.findByTestId("file-card")).toBeInTheDocument();
    });

    test("dirty navigation -> dialog confirm applies pending view", async () => {
      render(<EditPage />);
      await screen.findByTestId("header");

      // select node 2
      fireEvent.click(screen.getByTestId("folder-select-2"));
      await waitFor(() => expect(getOrCreateNodeContent).toHaveBeenCalled());

      // mark as dirty
      fireEvent.click(screen.getByTestId("mark-dirty"));
      // try to switch view -> should open dialog instead
      fireEvent.click(screen.getByTestId("view-ai"));

      // dialog should appear
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      // confirm dialog -> should switch to ai and close dialog
      fireEvent.click(screen.getByTestId("dialog-confirm"));
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );

      // AI card should be present
      expect(screen.getByTestId("ai-card")).toBeInTheDocument();
    });

    test("addChapter triggers ProjectService.updateProject", async () => {
      render(<EditPage />);
      await screen.findByTestId("header");

      // click add on folder 1 (adds new child under node 1)
      fireEvent.click(screen.getByTestId("folder-add-1"));

      // updateProject should be called once (saveProjectStructure inside addChapter)
      await waitFor(() => expect(updateProject).toHaveBeenCalled());
      // check last call structure includes newly added node id "1-new"
      const lastArg = (updateProject as any).mock.calls.slice(-1)[0][1];
      expect(JSON.stringify(lastArg.projectStructure)).toContain("1-new");
    });

    test("rename updates node content metadata and calls updateNodeContent + updateProject", async () => {
      render(<EditPage />);
      await screen.findByTestId("header");

      // select node 2 to make it selectedNode
      fireEvent.click(screen.getByTestId("folder-select-2"));
      await waitFor(() => expect(getOrCreateNodeContent).toHaveBeenCalled());

      // click rename (calls onRenameOrIconUpdate)
      fireEvent.click(screen.getByTestId("folder-rename-2"));

      // updateProject should be called to persist renamed node
      await waitFor(() => expect(updateProject).toHaveBeenCalled());

      // updateNodeContent should be called to persist node metadata
      await waitFor(() =>
        expect(updateNodeContent).toHaveBeenCalledWith(
          "2",
          expect.objectContaining({
            projectId: "p1",
            nodeId: "2",
            name: expect.stringContaining("Intro-renamed"),
          }),
        ),
      );
    });

    test("move node triggers debounced updateProject (real timers, wait 600ms)", async () => {
      render(<EditPage />);
      await screen.findByTestId("header");

      fireEvent.click(screen.getByTestId("folder-move-2"));

      expect(updateProject).not.toHaveBeenCalled();

      await act(async () => {
        await new Promise((res) => setTimeout(res, 600));
      });

      await waitFor(() => expect(updateProject).toHaveBeenCalled(), {
        timeout: 2000,
      });
    });

    test("beforeunload handler prevents unload when isDirty", async () => {
      // Spy both add/remove so we can detect the handler refresh
      const addSpy = vi.spyOn(window, "addEventListener");
      const removeSpy = vi.spyOn(window, "removeEventListener");

      render(<EditPage />);
      await screen.findByTestId("header");

      // initial handler was registered at mount
      expect(addSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));

      // select node 2 and wait for content load
      fireEvent.click(screen.getByTestId("folder-select-2"));
      await waitFor(() => expect(getOrCreateNodeContent).toHaveBeenCalled());

      // make component dirty
      fireEvent.click(screen.getByTestId("mark-dirty"));

      // Wait until the effect cleanup ran (old handler removed) — indicates re-registration will happen
      await waitFor(() =>
        expect(removeSpy).toHaveBeenCalledWith(
          "beforeunload",
          expect.any(Function),
        ),
      );

      // Now take the *last* registered beforeunload handler (the fresh one)
      const beforeUnloadCalls = addSpy.mock.calls.filter(
        (c) => c[0] === "beforeunload",
      );
      expect(beforeUnloadCalls.length).toBeGreaterThan(0);
      const lastCall = beforeUnloadCalls[beforeUnloadCalls.length - 1];
      const handler = lastCall[1] as EventListener;

      // call the handler with a fake event and assert it sets returnValue
      const fakeEvent: any = { returnValue: undefined };
      (handler as any)(fakeEvent);

      expect(fakeEvent.returnValue).toBeDefined();
      expect(String(fakeEvent.returnValue)).toContain("unsaved changes");
    });
  });
});
