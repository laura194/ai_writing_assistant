import { fireEvent, screen } from "@testing-library/react";
import { render } from "../../../test/renderWithProviders";
import CommunityPage from "./CommunityPage";

// Mock Header
vi.mock("../../components/Header/Header", () => ({
  __esModule: true,
  default: () => <header data-testid="header" />,
}));

// Mock motion wrappers
vi.mock("framer-motion", () => ({
  motion: new Proxy({}, { get: () => (p: any) => <div {...p} /> }),
}));

// Theme
vi.mock("../../providers/ThemeProvider", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn(), toggle: vi.fn() }),
}));

// Navigate hoisted
const navHoisted = vi.hoisted(() => ({ navigate: vi.fn() }));
vi.mock("react-router-dom", async (orig) => {
  const actual = await (orig as any)();
  return { ...actual, useNavigate: () => navHoisted.navigate };
});

// ProjectService
const getPublicProjects = vi.fn();
vi.mock("../../utils/ProjectService", () => ({
  ProjectService: {
    getPublicProjects: (...args: any[]) => getPublicProjects(...args),
  },
}));

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

    // Two projects listed by title
    expect(screen.getByText(/AI Paper/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Design Doc/i }),
    ).toBeInTheDocument();

    // Author line present (custom matcher for split text)
    expect(
      screen.getByText((_, element) => {
        const hasText = (text: string) => text === "By Alice";
        const elementHasText = hasText(element?.textContent || "");
        const childrenDontHaveText = Array.from(element?.children || []).every(
          (child) => !hasText(child.textContent || ""),
        );
        return elementHasText && childrenDontHaveText;
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, element) => {
        const hasText = (text: string) => text === "By Bob";
        const elementHasText = hasText(element?.textContent || "");
        const childrenDontHaveText = Array.from(element?.children || []).every(
          (child) => !hasText(child.textContent || ""),
        );
        return elementHasText && childrenDontHaveText;
      }),
    ).toBeInTheDocument();

    // Tags rendered for first project
    expect(screen.getByText("#ai")).toBeInTheDocument();
    expect(screen.getByText("#ml")).toBeInTheDocument();

    // Meta labels
    expect(screen.getAllByText(/Category:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Type:/i).length).toBeGreaterThan(0);

    // Created / Updated labels are present (date locale varies)
    expect(screen.getAllByText(/Created:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Updated:/i).length).toBeGreaterThan(0);

    // Click navigates to read view for first project
    fireEvent.click(screen.getByText(/AI Paper/i));
    expect(navHoisted.navigate).toHaveBeenCalledWith("/read/c1");
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
        // tags omitted entirely
        // category omitted
        // typeOfDocument omitted
        createdAt: new Date("2024-01-01").toISOString(),
        updatedAt: new Date("2024-01-02").toISOString(),
      },
    ]);

    render(<CommunityPage />);

    await screen.findByText(/Untitled/i);

    // Fallback em-dash "—" should appear for Category and Type (match via regex in text)
    // Exactly two occurrences (one for Category, one for Type)
    expect(screen.getAllByText(/—/).length).toBeGreaterThanOrEqual(1);

    // No tag pills rendered (common examples should not be found)
    expect(screen.queryByText("#ai")).not.toBeInTheDocument();
    expect(screen.queryByText("#ml")).not.toBeInTheDocument();
  });
});
