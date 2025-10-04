import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, beforeEach, expect } from "vitest";

/**
 * Test suite for FullDocumentCard
 * Notes:
 * - Mirrors mocking style from other component tests in this repo
 * - Covers loading, error branches, structure/content rendering, escaping and export button behavior
 * - Ensures theme-dependent branches are exercised
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

// --- mock ThemeProvider used by FullDocumentCard (note relative path inside component) ---
let __theme: "light" | "dark" = "light";
vi.mock("../providers/ThemeProvider", () => {
  return {
    useTheme: () => ({ theme: __theme }),
  };
});
// Also mock the correct path from src/providers in case helpers import it
vi.mock("../../providers/ThemeProvider", () => {
  return {
    useTheme: () => ({ theme: __theme }),
  };
});

// --- mock services as used by FullDocumentCard (note relative paths) ---
vi.mock("../utils/ProjectService", () => ({
  ProjectService: {
    getProjectById: vi.fn(),
  },
}));
vi.mock("../../utils/ProjectService", () => ({
  ProjectService: {
    getProjectById: vi.fn(),
  },
}));

vi.mock("../utils/NodeContentService", () => ({
  NodeContentService: {
    getNodeContents: vi.fn(),
  },
}));
vi.mock("../../utils/NodeContentService", () => ({
  NodeContentService: {
    getNodeContents: vi.fn(),
  },
}));

// --- mock exporters to verify button click behavior ---
vi.mock("../utils/DocumentExporters", () => ({
  handleExportWord: vi.fn(),
  handleExportPDF: vi.fn(),
  handleExportLATEX: vi.fn(),
}));
vi.mock("../../utils/DocumentExporters", () => ({
  handleExportWord: vi.fn(),
  handleExportPDF: vi.fn(),
  handleExportLATEX: vi.fn(),
}));

// Import after mocks
import FullDocumentCard from "./FullDocumentCard";

/* ------------------ Helpers ------------------ */

const setProjectId = async (p: string | undefined) => {
  const routerMock = await import("react-router-dom");
  (routerMock as any).__setProjectId(p);
};

const setTheme = async (t: "light" | "dark") => {
  __theme = t;
};

const getProjectServiceMock = async () => {
  const mod = (await import("../../utils/ProjectService")) as any;
  return mod.ProjectService as {
    getProjectById: ReturnType<typeof vi.fn>;
  };
};

const getNodeContentServiceMock = async () => {
  const mod = (await import("../../utils/NodeContentService")) as any;
  return mod.NodeContentService as {
    getNodeContents: ReturnType<typeof vi.fn>;
  };
};

const getExportersMock = async () => {
  const mod = (await import("../../utils/DocumentExporters")) as any;
  return mod as {
    handleExportWord: ReturnType<typeof vi.fn>;
    handleExportPDF: ReturnType<typeof vi.fn>;
    handleExportLATEX: ReturnType<typeof vi.fn>;
  };
};

/* ------------------ Shared Data ------------------ */

const sampleStructure = [
  { id: "1", name: "Introduction", nodes: [{ id: "1-1", name: "Background" }] },
  { id: "2", name: "Methods" },
];

const sampleContents = [
  {
    nodeId: "1",
    name: "Introduction",
    content: 'Hello <b>bold</b> & "quoted"',
  },
  { nodeId: "1-1", name: "Background", content: "Sub section" },
  { nodeId: "2", name: "Methods", content: "Methodology" },
];

/* ------------------ Tests ------------------ */

describe("FullDocumentCard", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await setProjectId(undefined);
    await setTheme("light");
    const svc1 = await getProjectServiceMock();
    const svc2 = await getNodeContentServiceMock();
    svc1.getProjectById.mockReset();
    svc2.getNodeContents.mockReset();
    const exp = await getExportersMock();
    exp.handleExportWord.mockReset();
    exp.handleExportPDF.mockReset();
    exp.handleExportLATEX.mockReset();
  });

  it("shows error when projectId is missing and stops loading", async () => {
    await setProjectId(undefined);

    render(<FullDocumentCard />);

    // Component shows the error immediately for missing projectId
    await waitFor(() =>
      expect(screen.getByText(/Projekt-ID not found\./i)).toBeInTheDocument(),
    );
    expect(screen.queryByText(/Loading…/i)).not.toBeInTheDocument();
  });

  it("fetches structure and contents, escapes HTML and renders built document", async () => {
    await setProjectId("proj-1");
    const svc1 = await getProjectServiceMock();
    const svc2 = await getNodeContentServiceMock();

    svc1.getProjectById.mockResolvedValue({
      projectStructure: sampleStructure,
    });
    svc2.getNodeContents.mockResolvedValue(sampleContents);

    render(<FullDocumentCard />);

    // Header rendered
    expect(
      screen.getByRole("heading", { name: /Full Document Overview/i }),
    ).toBeInTheDocument();

    // Wait for content (built via innerHTML)
    await waitFor(() => {
      // headings from structure should be present
      expect(screen.getByText("Introduction")).toBeInTheDocument();
      expect(screen.getByText("Background")).toBeInTheDocument();
      expect(screen.getByText("Methods")).toBeInTheDocument();
    });

    // Ensure bold is not rendered as HTML, but as escaped text
    const bTag = document.querySelector("b");
    expect(bTag).toBeNull();
    expect(
      screen.getByText(/Hello <b>bold<\/b> & \"quoted\"/),
    ).toBeInTheDocument();
  });

  it("shows error when project structure is empty or missing", async () => {
    await setProjectId("proj-empty");
    const svc1 = await getProjectServiceMock();
    const svc2 = await getNodeContentServiceMock();

    svc1.getProjectById.mockResolvedValue({});
    svc2.getNodeContents.mockResolvedValue(sampleContents);

    render(<FullDocumentCard />);

    await waitFor(() =>
      expect(
        screen.getByText(/Project structure is empty or unavailable/i),
      ).toBeInTheDocument(),
    );
  });

  it("shows error when fetching project structure fails", async () => {
    await setProjectId("proj-fail");
    const svc1 = await getProjectServiceMock();
    const svc2 = await getNodeContentServiceMock();

    svc1.getProjectById.mockRejectedValue(new Error("boom"));
    svc2.getNodeContents.mockResolvedValue(sampleContents);

    render(<FullDocumentCard />);

    await waitFor(() =>
      expect(
        screen.getByText(/Error loading the project structure\./i),
      ).toBeInTheDocument(),
    );
  });

  it("maps node contents defaults (nodeId -> '', content -> '') and renders no paragraph for empty content", async () => {
    await setProjectId("proj-map");
    const svc1 = await getProjectServiceMock();
    const svc2 = await getNodeContentServiceMock();

    const structure = [{ id: "x1", name: "Root" }];
    const contents = [
      { nodeId: undefined, name: "Root", content: undefined },
    ] as any;

    svc1.getProjectById.mockResolvedValue({ projectStructure: structure });
    svc2.getNodeContents.mockResolvedValue(contents);

    render(<FullDocumentCard />);

    await waitFor(() => expect(screen.getByText("Root")).toBeInTheDocument());

    // Should render the empty state message instead of null
    expect(
      screen.getByText(/No entries have been created in the AI protocol yet./i),
    ).toBeInTheDocument();
  });

  it("export buttons call the correct exporters with current structure and nodeContents", async () => {
    await setProjectId("proj-exp");
    const svc1 = await getProjectServiceMock();
    const svc2 = await getNodeContentServiceMock();
    const exp = await getExportersMock();

    svc1.getProjectById.mockResolvedValue({
      projectStructure: sampleStructure,
    });
    svc2.getNodeContents.mockResolvedValue(sampleContents);

    render(<FullDocumentCard />);

    await waitFor(() => screen.getByTitle(/Export as Word/i));

    await userEvent.click(screen.getByTitle(/Export as Word/i));
    await userEvent.click(screen.getByTitle(/Export as PDF/i));
    await userEvent.click(screen.getByTitle(/Export as LaTeX/i));

    expect(exp.handleExportWord).toHaveBeenCalledTimes(1);
    expect(exp.handleExportPDF).toHaveBeenCalledTimes(1);
    expect(exp.handleExportLATEX).toHaveBeenCalledTimes(1);

    const [wArgs, pArgs, lArgs] = [
      (exp.handleExportWord as any).mock.calls[0],
      (exp.handleExportPDF as any).mock.calls[0],
      (exp.handleExportLATEX as any).mock.calls[0],
    ];

    expect(wArgs[0]).toEqual(sampleStructure);
    expect(wArgs[1]).toEqual(sampleContents);
    expect(pArgs[0]).toEqual(sampleStructure);
    expect(pArgs[1]).toEqual(sampleContents);
    expect(lArgs[0]).toEqual(sampleStructure);
    expect(lArgs[1]).toEqual(sampleContents);
  });

  it("does not build HTML until both structure and nodeContents are available", async () => {
    await setProjectId("proj-half");
    const svc1 = await getProjectServiceMock();
    const svc2 = await getNodeContentServiceMock();

    // structure present, but contents empty
    svc1.getProjectById.mockResolvedValue({
      projectStructure: sampleStructure,
    });
    svc2.getNodeContents.mockResolvedValue([]);

    render(<FullDocumentCard />);

    // After fetches, there should be no content rendered from structure
    await waitFor(() => expect(screen.queryByText("Introduction")).toBeNull());

    // And no error (structure exists) — content is simply not built
    expect(screen.queryByText(/Error/i)).not.toBeInTheDocument();
  });

  it("renders in dark theme (exercises whileHover ternary) without crashing", async () => {
    await setProjectId("proj-dark");
    await setTheme("dark");

    const svc1 = await getProjectServiceMock();
    const svc2 = await getNodeContentServiceMock();

    svc1.getProjectById.mockResolvedValue({
      projectStructure: sampleStructure,
    });
    svc2.getNodeContents.mockResolvedValue(sampleContents);

    render(<FullDocumentCard />);

    await waitFor(() => screen.getByTitle(/Export as Word/i));

    // Sanity checks
    expect(
      screen.getByRole("heading", { name: /Full Document Overview/i }),
    ).toBeInTheDocument();
  });

  it("shows loading indicator initially and hides after data resolves", async () => {
    await setProjectId("proj-load");

    const svc1 = await getProjectServiceMock();
    const svc2 = await getNodeContentServiceMock();

    svc1.getProjectById.mockResolvedValue({
      projectStructure: sampleStructure,
    });
    svc2.getNodeContents.mockResolvedValue(sampleContents);

    render(<FullDocumentCard />);

    // Initially shows loading
    expect(screen.getByText(/Loading…/i)).toBeInTheDocument();

    // After data resolves, loading should be gone
    await waitFor(() => screen.getByTitle(/Export as Word/i));
    expect(screen.queryByText(/Loading…/i)).not.toBeInTheDocument();
  });

  it("shows error when fetching node contents fails", async () => {
    await setProjectId("proj-node-fail");

    const svc1 = await getProjectServiceMock();
    const svc2 = await getNodeContentServiceMock();

    svc1.getProjectById.mockResolvedValue({
      projectStructure: sampleStructure,
    });
    svc2.getNodeContents.mockRejectedValue(new Error("fail contents"));

    render(<FullDocumentCard />);

    await waitFor(() =>
      expect(
        screen.getByText(/Error loading the contents\./i),
      ).toBeInTheDocument(),
    );
  });

  it("re-fetches and rebuilds when projectId changes", async () => {
    await setProjectId("A");

    const svc1 = await getProjectServiceMock();
    const svc2 = await getNodeContentServiceMock();

    svc1.getProjectById.mockImplementation(async (pid: string) => ({
      projectStructure: [
        { id: "1", name: pid === "A" ? "Intro A" : "Intro B" },
      ],
    }));
    svc2.getNodeContents.mockResolvedValue([
      { nodeId: "1", name: "N1", content: "C1 with > and ' chars" },
    ]);

    const { rerender } = render(<FullDocumentCard />);

    await waitFor(() =>
      expect(screen.getByText("Intro A")).toBeInTheDocument(),
    );

    // Change route param and re-render
    await setProjectId("B");
    rerender(<FullDocumentCard />);

    await waitFor(() =>
      expect(screen.getByText("Intro B")).toBeInTheDocument(),
    );

    // Ensure refetch occurred at least twice (A then B)
    expect(svc1.getProjectById).toHaveBeenCalledTimes(2);
  });

  it("generates proper heading tag levels up to h6 for deeply nested nodes", async () => {
    await setProjectId("proj-depth");

    const svc1 = await getProjectServiceMock();
    const svc2 = await getNodeContentServiceMock();

    const deep = {
      id: "L1",
      name: "Level 1",
      nodes: [
        {
          id: "L2",
          name: "Level 2",
          nodes: [
            {
              id: "L3",
              name: "Level 3",
              nodes: [
                {
                  id: "L4",
                  name: "Level 4",
                  nodes: [
                    {
                      id: "L5",
                      name: "Level 5",
                      nodes: [{ id: "L6", name: "Level 6" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    svc1.getProjectById.mockResolvedValue({ projectStructure: [deep] });
    svc2.getNodeContents.mockResolvedValue([
      { nodeId: "L1", name: "Level 1", content: "c1" },
      { nodeId: "L2", name: "Level 2", content: "c2" },
      { nodeId: "L3", name: "Level 3", content: "c3" },
      { nodeId: "L4", name: "Level 4", content: "c4" },
      { nodeId: "L5", name: "Level 5", content: "c5" },
      { nodeId: "L6", name: "Level 6", content: "c6" },
    ]);

    render(<FullDocumentCard />);

    await waitFor(() =>
      expect(screen.getByText("Level 6")).toBeInTheDocument(),
    );

    const getTag = (text: string) => screen.getByText(text).tagName;

    expect(getTag("Level 1")).toBe("H2");
    expect(getTag("Level 2")).toBe("H3");
    expect(getTag("Level 3")).toBe("H4");
    expect(getTag("Level 4")).toBe("H5");
    expect(getTag("Level 5")).toBe("H6");
    expect(getTag("Level 6")).toBe("H6"); // capped at h6
  });

  it("allows exporting before data loads with empty arrays passed to exporters", async () => {
    await setProjectId("proj-early");

    const svc1 = await getProjectServiceMock();
    const svc2 = await getNodeContentServiceMock();
    const exp = await getExportersMock();

    // Keep promises pending so component stays in loading state
    svc1.getProjectById.mockReturnValue(new Promise(() => {}));
    svc2.getNodeContents.mockReturnValue(new Promise(() => {}));

    render(<FullDocumentCard />);

    await userEvent.click(screen.getByTitle(/Export as Word/i));
    await userEvent.click(screen.getByTitle(/Export as PDF/i));
    await userEvent.click(screen.getByTitle(/Export as LaTeX/i));

    expect(exp.handleExportWord).toHaveBeenCalledWith([], [], []);
    expect(exp.handleExportPDF).toHaveBeenCalledWith([], [], []);
    expect(exp.handleExportLATEX).toHaveBeenCalledWith([], [], []);
  });
});
