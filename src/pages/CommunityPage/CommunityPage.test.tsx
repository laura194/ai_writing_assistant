import { fireEvent, screen } from "@testing-library/react";
import { render } from "../../../test/renderWithProviders";
import CommunityPage from "./CommunityPage";

// ✅ Mock Header
vi.mock("../../components/Header/Header", () => ({
  __esModule: true,
  default: () => <header data-testid="header" />,
}));

// ✅ Mock CommentSection (verhindert useUser()-Fehler)
vi.mock("../../components/CommentSection/CommentSection", () => ({
  __esModule: true,
  default: ({ projectId }: { projectId: string }) => (
    <div data-testid={`mock-comment-section-${projectId}`} />
  ),
}));

// ✅ Mock motion wrappers
vi.mock("framer-motion", () => ({
  motion: new Proxy({}, { get: () => (p: any) => <div {...p} /> }),
}));

// ✅ Mock ThemeProvider
vi.mock("../../providers/ThemeProvider", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn(), toggle: vi.fn() }),
}));

// ✅ Mock useNavigate (hoisted for control)
const navHoisted = vi.hoisted(() => ({ navigate: vi.fn() }));
vi.mock("react-router-dom", async (orig) => {
  const actual = await (orig as any)();
  return { ...actual, useNavigate: () => navHoisted.navigate };
});

// ✅ Mock ProjectService
const getPublicProjects = vi.fn();
vi.mock("../../utils/ProjectService", () => ({
  ProjectService: {
    getPublicProjects: (...args: any[]) => getPublicProjects(...args),
  },
}));

// 🧩 Testdaten
const communityProjects = [
  {
    _id: "c1",
    titleCommunityPage: "AI Paper",
    authorName: "Alice",
    tags: ["ai", "ml"],
    category: "Science",
    typeOfDocument: "Paper",
    createdAt: new Date("2024-05-01").toISOString(),
    updatedAt: new Date("2024-06-01").toISOString(),
  },
  {
    _id: "c2",
    titleCommunityPage: "Design Doc",
    authorName: "Bob",
    tags: [],
    category: "Design",
    typeOfDocument: "Doc",
    createdAt: new Date("2024-03-10").toISOString(),
    updatedAt: new Date("2024-04-20").toISOString(),
  },
];

describe("CommunityPage", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    navHoisted.navigate = vi.fn();
    getPublicProjects.mockResolvedValue(communityProjects);
  });

  test("loads and lists community projects with meta info and tags, and navigates to read view", async () => {
    render(<CommunityPage />);

    // Header present
    expect(screen.getByTestId("header")).toBeInTheDocument();

    // Wait until content loaded
    await screen.findByText(/Community Projects/i);

    // Projects listed
    expect(
      screen.getAllByText(
        (_, node) => node?.textContent?.includes("By Alice") ?? false
      ).length
    ).toBeGreaterThan(0);

    expect(
      screen.getAllByText(
        (_, node) => node?.textContent?.includes("By Bob") ?? false
      ).length
    ).toBeGreaterThan(0);

    // Tags rendered
    expect(screen.getByText("#ai")).toBeInTheDocument();
    expect(screen.getByText("#ml")).toBeInTheDocument();

    // Meta info
    expect(screen.getAllByText(/Category:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Type:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Created:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Updated:/i).length).toBeGreaterThan(0);

    // Click navigates to correct route
    fireEvent.click(screen.getByText(/AI Paper/i));
    expect(navHoisted.navigate).toHaveBeenCalledWith("/read/c1");

    // Mock comment sections rendered for each project
    expect(screen.getByTestId("mock-comment-section-c1")).toBeInTheDocument();
    expect(screen.getByTestId("mock-comment-section-c2")).toBeInTheDocument();
  });

  test("handles empty community state", async () => {
    getPublicProjects.mockResolvedValueOnce([]);
    render(<CommunityPage />);
    await screen.findByText(/No community projects yet/i);
  });

  test("shows error when service fails", async () => {
    getPublicProjects.mockRejectedValueOnce(new Error("boom"));
    render(<CommunityPage />);
    await screen.findByText(/Error loading community projects/i);
    expect(navHoisted.navigate).not.toHaveBeenCalled();
  });

  test("shows loading indicator before projects are loaded", async () => {
    getPublicProjects.mockImplementationOnce(() => new Promise(() => {}));
    render(<CommunityPage />);
    expect(screen.getByText(/Loading community projects/i)).toBeInTheDocument();
  });

  test("renders fallback meta and no tags when fields are missing", async () => {
    getPublicProjects.mockResolvedValueOnce([
      {
        _id: "c3",
        titleCommunityPage: "Untitled",
        authorName: "Cara",
        createdAt: new Date("2024-01-01").toISOString(),
        updatedAt: new Date("2024-01-02").toISOString(),
      },
    ]);

    render(<CommunityPage />);

    await screen.findByText(/Untitled/i);

    // Fallback "—" for missing category/type
    expect(screen.getAllByText(/—/).length).toBeGreaterThanOrEqual(1);

    // No tag pills rendered
    expect(screen.queryByText("#ai")).not.toBeInTheDocument();
    expect(screen.queryByText("#ml")).not.toBeInTheDocument();

    // Mock comment section present
    expect(screen.getByTestId("mock-comment-section-c3")).toBeInTheDocument();
  });
});
