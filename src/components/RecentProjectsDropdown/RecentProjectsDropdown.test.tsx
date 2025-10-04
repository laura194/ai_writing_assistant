import { render, screen, waitFor } from "@testing-library/react";
import { RecentProjectsDropdown } from "./RecentProjectsDropdown";
import { useUser } from "@clerk/clerk-react";
import { ProjectService } from "../../utils/ProjectService";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

vi.mock("@clerk/clerk-react", () => ({
  useUser: vi.fn(),
}));

vi.mock("../../utils/ProjectService", () => ({
  ProjectService: {
    getRecentProjectsByUsername: vi.fn(),
  },
}));

const mockUser = { username: "testuser" };
const mockProjects = [
  { _id: "1", name: "Project One" },
  { _id: "2", name: "Project Two" },
  { _id: "3", name: "Project Three" },
  { _id: "4", name: "Project Four" },
];

const renderWithRouter = (ui: React.ReactNode) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe("RecentProjectsDropdown Unit Tests", () => {
  beforeEach(() => {
    (useUser as any).mockReturnValue({ user: mockUser });
    (ProjectService.getRecentProjectsByUsername as any).mockReset();
  });

  test("renders the button", () => {
    renderWithRouter(<RecentProjectsDropdown />);
    expect(
      screen.getByRole("button", { name: /Recent Projects/i }),
    ).toBeInTheDocument();
  });

  test("shows fallback message when no projects", async () => {
    (ProjectService.getRecentProjectsByUsername as any).mockResolvedValue([]);

    renderWithRouter(<RecentProjectsDropdown />);

    await waitFor(() =>
      expect(screen.getByText(/No recent projects/i)).toBeInTheDocument(),
    );
  });

  test("renders up to 3 recent projects", async () => {
    (ProjectService.getRecentProjectsByUsername as any).mockResolvedValue(
      mockProjects,
    );

    renderWithRouter(<RecentProjectsDropdown />);

    await waitFor(() => {
      expect(screen.getByText("Project One")).toBeInTheDocument();
      expect(screen.getByText("Project Two")).toBeInTheDocument();
      expect(screen.getByText("Project Three")).toBeInTheDocument();
      expect(screen.queryByText("Project Four")).not.toBeInTheDocument();
    });
  });

  test("projects links have correct href", async () => {
    (ProjectService.getRecentProjectsByUsername as any).mockResolvedValue(
      mockProjects,
    );

    renderWithRouter(<RecentProjectsDropdown />);

    await waitFor(() => {
      const link = screen.getByText("Project One").closest("a");
      expect(link).toHaveAttribute("href", "/edit/1");
    });
  });

  test("does not crash if user is undefined", async () => {
    (useUser as any).mockReturnValue({ user: undefined });

    renderWithRouter(<RecentProjectsDropdown />);

    expect(
      screen.getByRole("button", { name: /Recent Projects/i }),
    ).toBeInTheDocument();

    expect(await screen.findByText(/No recent projects/i)).toBeInTheDocument();
  });
});

describe("RecentProjectsDropdown Mutation-focused Tests", () => {
  beforeEach(() => {
    (useUser as any).mockReturnValue({ user: mockUser });
    (ProjectService.getRecentProjectsByUsername as any).mockReset();
  });

  test("calls ProjectService.getRecentProjectsByUsername with the correct username", async () => {
    (ProjectService.getRecentProjectsByUsername as any).mockResolvedValue(
      mockProjects,
    );

    renderWithRouter(<RecentProjectsDropdown />);

    await waitFor(() => {
      expect(
        (ProjectService.getRecentProjectsByUsername as any).mock.calls.length,
      ).toBeGreaterThanOrEqual(1);
      expect(
        (ProjectService.getRecentProjectsByUsername as any).mock.calls[0][0],
      ).toBe("testuser");
    });
  });

  test("does not call ProjectService when user exists but has no username (early return)", () => {
    (useUser as any).mockReturnValue({ user: {} });

    renderWithRouter(<RecentProjectsDropdown />);

    expect(
      (ProjectService.getRecentProjectsByUsername as any).mock.calls.length,
    ).toBe(0);
    expect(
      screen.getByRole("button", { name: /Recent Projects/i }),
    ).toBeInTheDocument();
  });

  test("handles service error and logs to console", async () => {
    const error = new Error("service-failure");
    (ProjectService.getRecentProjectsByUsername as any).mockRejectedValue(
      error,
    );

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderWithRouter(<RecentProjectsDropdown />);

    await waitFor(() =>
      expect(consoleSpy).toHaveBeenCalledWith(
        "❌ Failed to load recent projects:",
        expect.any(Error),
      ),
    );

    consoleSpy.mockRestore();
  });

  test("renders correctly when fewer than 3 projects returned", async () => {
    const smallList = [{ _id: "1", name: "Only One" }];
    (ProjectService.getRecentProjectsByUsername as any).mockResolvedValue(
      smallList,
    );

    renderWithRouter(<RecentProjectsDropdown />);

    await waitFor(() => {
      expect(screen.getByText("Only One")).toBeInTheDocument();
      const links = screen.queryAllByRole("link");
      expect(links.length).toBe(1);
      expect(links[0]).toHaveAttribute("href", "/edit/1");
    });
  });
});
