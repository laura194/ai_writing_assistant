import { vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { render } from "../../../test/renderWithProviders";
import ReadingPage from "./ReadingPage";

// Mock CSS
vi.mock("../../App/App.css", () => ({}));

// Mock child components
vi.mock("../../components/Folder/FolderRead", () => ({
  __esModule: true,
  default: ({ node, onNodeClick, selectedNodeId }: any) => (
    <li data-testid={`folder-${node.id}`}>
      <div>{node.name}</div>
      <button
        data-testid={`folder-select-${node.id}`}
        onClick={() => onNodeClick(node)}
      >
        select
      </button>
      {selectedNodeId === node.id && (
        <span data-testid={`selected-${node.id}`}>[selected]</span>
      )}
    </li>
  ),
}));

vi.mock("../../components/FileContentCard/FileContentCardRead", () => ({
  __esModule: true,
  default: ({ node }: any) => (
    <div data-testid="file-card">content:{node.content}</div>
  ),
}));

vi.mock("../../components/Header/Header", () => ({
  __esModule: true,
  default: () => <header data-testid="header" />,
}));

// Mock motion
vi.mock("framer-motion", () => ({
  motion: new Proxy({}, { get: () => (p: any) => <div {...p} /> }),
}));

// Mock services
const getProjectById = vi.fn();
const getOrCreateNodeContent = vi.fn();
const getNodeContentById = vi.fn();
vi.mock("../../utils/ProjectService", () => ({
  ProjectService: {
    getProjectById: (...a: any[]) => getProjectById(...a),
  },
}));
vi.mock("../../utils/NodeContentService", () => ({
  NodeContentService: {
    getOrCreateNodeContent: (...a: any[]) => getOrCreateNodeContent(...a),
    getNodeContentById: (...a: any[]) => getNodeContentById(...a),
  },
}));

// Mock router params
vi.mock("react-router-dom", async (orig) => {
  const actual = await (orig as any)();
  return { ...actual, useParams: () => ({ projectId: "p1" }) };
});

// LocalStorage mock
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

describe("ReadingPage", () => {
  beforeEach(() => {
    store.clear();
    vi.clearAllMocks();

    getProjectById.mockResolvedValue({
      _id: "p1",
      name: "Proj",
      projectStructure: [
        { id: "1", name: "Chapter structure", nodes: [] },
        { id: "2", name: "Intro", nodes: [] },
      ],
    });

    getOrCreateNodeContent.mockResolvedValue({
      nodeId: "2",
      content: "intro-content",
      name: "Intro",
      category: "cat",
    });

    getNodeContentById.mockResolvedValue({
      nodeId: "2",
      content: "intro-content",
      name: "Intro",
      category: "cat",
    });
  });

  test("renders header and project structure", async () => {
    render(<ReadingPage />);
    await screen.findByTestId("header");

    expect(screen.getByTestId("folder-1")).toBeInTheDocument();
    expect(screen.getByTestId("folder-2")).toBeInTheDocument();
  });

  test("clicking a content node loads content and persists selected id", async () => {
    render(<ReadingPage />);
    await screen.findByText("Intro");

    fireEvent.click(screen.getByTestId("folder-select-2"));

    await waitFor(() => expect(getOrCreateNodeContent).toHaveBeenCalled());
    expect(store.get("selectedNodeId_p1")).toBe("2");
    expect(await screen.findByTestId("file-card")).toHaveTextContent(
      "intro-content"
    );
  });

  test("ignores click on root 'Chapter structure'", async () => {
    render(<ReadingPage />);
    await screen.findByText("Intro");

    fireEvent.click(screen.getByTestId("folder-select-1"));
    expect(getOrCreateNodeContent).not.toHaveBeenCalled();
    expect(
      screen.getByText(/Select an element on the left/i)
    ).toBeInTheDocument();
  });

  test("menuOpen restored from localStorage", async () => {
    store.set("menuOpen", JSON.stringify(false));
    render(<ReadingPage />);
    await screen.findByTestId("header");

    // Sidebar should be collapsed -> no folder items
    expect(screen.queryByTestId("folder-1")).not.toBeInTheDocument();
  });

  test("toggle menuOpen updates localStorage", async () => {
    render(<ReadingPage />);
    await screen.findByTestId("folder-1");

    // Find toggle button (Bars3Icon wrapper)
    const toggleBtn = screen
      .getAllByRole("button")
      .find((b) => b.querySelector("svg"));
    fireEvent.click(toggleBtn!);

    expect(JSON.parse(store.get("menuOpen")!)).toBe(false);
  });

  test("restores selected node from localStorage and shows FileContentCardRead", async () => {
    store.set("selectedNodeId_p1", "2");
    render(<ReadingPage />);
    await waitFor(() =>
      expect(getNodeContentById).toHaveBeenCalledWith("2", "p1")
    );
    expect(await screen.findByTestId("file-card")).toBeInTheDocument();
  });

  test("shows 'Unknown view selected' for non-file view", async () => {
    store.set("selectedNodeId_p1", "2");
    store.set("activeView", "something-else");
    render(<ReadingPage />);

    await waitFor(() => expect(getNodeContentById).toHaveBeenCalled());
    expect(
      await screen.findByText(/Unknown view selected/i)
    ).toBeInTheDocument();
  });
});
