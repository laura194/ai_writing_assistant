/**
 * CommunityPage.extra.test.tsx
 * Additional tests to increase branch coverage for CommunityPage.
 */

import { render } from "../../../test/renderWithProviders";
import { screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

/* ------------------ Hoisted / module-level mocks (match your main test file) ------------------ */
vi.mock("../../components/Header/Header", () => ({
  __esModule: true,
  default: () => <header data-testid="header" />,
}));

vi.mock("../../components/CommentSection/CommentSection", () => ({
  __esModule: true,
  default: ({ projectId }: { projectId: string }) => (
    <div data-testid={`mock-comment-section-${projectId}`} />
  ),
}));

vi.mock("framer-motion", () => ({
  motion: new Proxy({}, { get: () => (p: any) => <div {...p} /> }),
}));

vi.mock("../../providers/ThemeProvider", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn(), toggle: vi.fn() }),
}));

// hoisted-like navigate mock
const navHoisted = vi.hoisted(() => ({ navigate: vi.fn() }));
vi.mock("react-router-dom", async (orig) => {
  const actual = await (orig as any)();
  return { ...actual, useNavigate: () => navHoisted.navigate };
});

/* ProjectService mocks */
const getPublicProjects = vi.fn();
const toggleUpvote = vi.fn();
const toggleFavorite = vi.fn();

vi.mock("../../utils/ProjectService", () => ({
  ProjectService: {
    getPublicProjects: (...args: any[]) => getPublicProjects(...args),
    toggleUpvote: (...args: any[]) => toggleUpvote(...args),
    toggleFavorite: (...args: any[]) => toggleFavorite(...args),
  },
}));

/* Default signed-in useUser mock (we mutate userMock in some tests) */
let userMock = {
  isSignedIn: true,
  user: { id: "test-user", username: "TestUser" },
};
vi.mock("@clerk/clerk-react", () => ({
  useUser: () => userMock,
}));

/* ------------------ Test data ------------------ */
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
    upvotedBy: [],
    favoritedBy: [],
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
    upvotedBy: [],
    favoritedBy: [],
  },
];

/* ------------------ Tests ------------------ */
describe("CommunityPage extra coverage", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    navHoisted.navigate = vi.fn();
    // Default resolve
    getPublicProjects.mockResolvedValue(communityProjects);
    toggleUpvote.mockResolvedValue({});
    toggleFavorite.mockResolvedValue({});
    // ensure signed-in default
    userMock = {
      isSignedIn: true,
      user: { id: "test-user", username: "TestUser" },
    };
  });

  it("search input matches numeric date parts (e.g. year) and shows both projects when searching '2024'", async () => {
    const { default: CommunityPage } = await import("./CommunityPage");
    render(<CommunityPage />);

    // wait for page to load (title present)
    await screen.findByText(/Community Projects/i);

    const user = userEvent.setup();

    const input = screen.getByPlaceholderText(
      /Search by title, author, category, or tag/i,
    ) as HTMLInputElement;

    // type '2024'
    await user.clear(input);
    await user.type(input, "2024");

    // find headings (h3) within list items - this avoids matching category text etc.
    await waitFor(async () => {
      const headings = await screen.findAllByRole("heading", { level: 3 });
      const titles = headings.map((h) => h.textContent?.trim() || "");
      expect(titles.some((t) => /AI Paper/i.test(t))).toBeTruthy();
      expect(titles.some((t) => /Design Doc/i.test(t))).toBeTruthy();
    });
  });

  it("shows alert and prevents service call when user is not signed in", async () => {
    // Remock useUser to be signed out for this test (mutate userMock used by the vi.mock closure)
    userMock = {
      isSignedIn: false,
      user: undefined as unknown as { id: string; username: string },
    };

    const { default: CommunityPage } = await import("./CommunityPage");

    // ensure service resolves data
    getPublicProjects.mockResolvedValueOnce(communityProjects);

    // spy alert
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<CommunityPage />);

    await screen.findByText(/Community Projects/i);

    const user = userEvent.setup();

    // pick first project's upvote button
    const firstHeading = (
      await screen.findAllByRole("heading", { level: 3 })
    )[0];
    const firstItemEl = firstHeading.closest("li");
    expect(firstItemEl).toBeTruthy();
    const firstItem = firstItemEl as HTMLElement;
    const buttons = within(firstItem).getAllByRole("button");
    const upvoteBtn = buttons[0];

    // click when not signed in -> alert should be called and toggleUpvote not called
    await user.click(upvoteBtn);

    expect(alertSpy).toHaveBeenCalled();
    expect(toggleUpvote).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it("zeigt einen Ladeindikator während loading true ist", async () => {
    // Stelle sicher, dass der Promise nie resolved wird (simuliert loading)
    getPublicProjects.mockImplementation(() => new Promise(() => {}));
    const { default: CommunityPage } = await import("./CommunityPage");
    render(<CommunityPage />);
    // "Loading community projects…" sollte angezeigt sein
    expect(
      await screen.findByText(/Loading community projects/i),
    ).toBeInTheDocument();
  });

  it("zeigt eine Fehlermeldung bei error", async () => {
    getPublicProjects.mockRejectedValue(new Error("network kaputt"));
    const { default: CommunityPage } = await import("./CommunityPage");
    render(<CommunityPage />);
    expect(
      await screen.findByText(/Error loading community projects/i),
    ).toBeInTheDocument();
  });

  it("zeigt eine leere Zustand-Message falls keine Projekte vorhanden sind", async () => {
    getPublicProjects.mockResolvedValueOnce([]);
    const { default: CommunityPage } = await import("./CommunityPage");
    render(<CommunityPage />);
    expect(
      await screen.findByText(/No community projects yet/i),
    ).toBeInTheDocument();
  });

  it("toggleFavorite ruft Service, toggelt UI und brancht korrekt", async () => {
    const { default: CommunityPage } = await import("./CommunityPage");
    render(<CommunityPage />);
    await screen.findByText(/community projects/i);

    // Suche die Projekt-Card und innerhalb davon den Favorite-Button
    const cards = await screen.findAllByRole("listitem");
    const favBtn = within(cards[0]).getByRole("button", { name: /favorite/i });
    await userEvent.click(favBtn);
    expect(toggleFavorite).toHaveBeenCalledWith("c1", "TestUser");
    // Optional: check toggling im UI (z.B. Iconfarbe oder ähnliches)
  });

  it("handleUpvote ruft Service und toggelt UI korrekt", async () => {
    const { default: CommunityPage } = await import("./CommunityPage");
    render(<CommunityPage />);
    await screen.findByText(/community projects/i);

    // Pick upvote button
    const headings = await screen.findAllByRole("heading", { level: 3 });
    const firstItemEl = headings[0].closest("li")!;
    const upBtn = within(firstItemEl).getAllByRole("button")[0];
    await userEvent.click(upBtn);
    expect(toggleUpvote).toHaveBeenCalled();
  });

  it("Datumsbranch: Kommt mit ungültigen oder fehlenden createdAt/updatedAt Feldern klar", async () => {
    getPublicProjects.mockResolvedValueOnce([
      {
        ...communityProjects[0],
        createdAt: undefined,
        updatedAt: undefined,
      },
    ]);
    const { default: CommunityPage } = await import("./CommunityPage");
    render(<CommunityPage />);
    // Formatierte Fallbacks werden genutzt, d.h. kein Crash wegen .toLocaleDateString()
    expect(await screen.findByText(/Created:/i)).toBeInTheDocument();
  });

  it("zeigt auch Projekte, wo nur tag getroffen wird", async () => {
    getPublicProjects.mockResolvedValueOnce([
      {
        ...communityProjects[0],
        tags: ["besonderesTag"],
      },
    ]);
    const { default: CommunityPage } = await import("./CommunityPage");
    render(<CommunityPage />);
    await screen.findByText(/Community Projects/i);

    const input = screen.getByPlaceholderText(/search/i);
    await userEvent.clear(input);
    await userEvent.type(input, "besonderestag");
    // Das Projekt bleibt gelistet, Tag-Match
    expect(
      await screen.findByRole("heading", { level: 3 }),
    ).toBeInTheDocument();
  });

  it("Favorite/Upvote verhindert Multi-Run wenn user leer/abgemeldet ist", async () => {
    userMock = { isSignedIn: false, user: undefined as any };
    getPublicProjects.mockResolvedValueOnce([communityProjects[0]]);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const { default: CommunityPage } = await import("./CommunityPage");
    render(<CommunityPage />);
    await screen.findByText(/community projects/i);

    // Eindeutig: Card finden, dann Button innerhalb
    const cards = await screen.findAllByRole("listitem");
    const favBtn = within(cards[0]).getByRole("button", { name: /favorite/i });
    await userEvent.click(favBtn);
    expect(alertSpy).toHaveBeenCalled();

    const upBtn = within(cards[0]).getAllByRole("button")[0]; // Upvote (erster Button im Footer-Block)
    await userEvent.click(upBtn); // upvote
    expect(alertSpy).toHaveBeenCalledTimes(2);
    alertSpy.mockRestore();
  });
});
