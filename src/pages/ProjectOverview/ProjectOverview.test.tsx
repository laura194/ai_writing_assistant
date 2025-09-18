import { vi, MockedFunction } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { render } from "../../../test/renderWithProviders";
import ProjectOverview from "./ProjectOverview";
import toast from "react-hot-toast";

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

// Toast - use hoisted to avoid init order issues
const hoisted = vi.hoisted(() => ({ toastError: vi.fn() }));
vi.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { error: hoisted.toastError },
}));

// Navigate hoisted
const navHoisted = vi.hoisted(() => ({ navigate: vi.fn() }));
vi.mock("react-router-dom", async (orig) => {
  const actual = await (orig as any)();
  return { ...actual, useNavigate: () => navHoisted.navigate };
});

// Mock Clerk
const baseUser = { username: "demo" };
const useUserMock = vi.fn(() => ({ user: baseUser, isLoaded: true }));
vi.mock("@clerk/clerk-react", () => {
  return {
    useUser: (...args: any) => (useUserMock as any)(...args),
  };
});

vi.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    error: vi.fn(),
  },
}));

// ProjectService
const getProjectsByUsername = vi.fn();
const deleteProject = vi.fn();
const updateProject = vi.fn();
vi.mock("../../utils/ProjectService", () => ({
  ProjectService: {
    getProjectsByUsername: (...args: any[]) => getProjectsByUsername(...args),
    deleteProject: (...args: any[]) => deleteProject(...args),
    updateProject: (...args: any[]) => updateProject(...args),
  },
}));

const projects = [
  {
    _id: "p1",
    name: "Project One",
    username: "demo",
    createdAt: new Date("2024-01-01").toISOString(),
    updatedAt: new Date("2024-02-01").toISOString(),
    projectStructure: [{ id: "1", name: "Chapter structure", nodes: [] }],
  },
  {
    _id: "p2",
    name: "Project Two",
    username: "demo",
    createdAt: new Date("2024-03-05").toISOString(),
    updatedAt: new Date("2024-04-10").toISOString(),
    projectStructure: [{ id: "1", name: "Chapter structure", nodes: [] }],
  },
];

describe("ProjectOverview", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    hoisted.toastError = vi.fn();
    navHoisted.navigate = vi.fn();
    getProjectsByUsername.mockResolvedValue(projects);
  });

  test("loads and lists projects with meta info", async () => {
    render(<ProjectOverview />);

    expect(screen.getByTestId("header")).toBeInTheDocument();

    // Wait for load
    await screen.findByText(/Your Projects/i);

    // Two projects listed
    expect(screen.getByText(/Project One/i)).toBeInTheDocument();
    expect(screen.getByText(/Project Two/i)).toBeInTheDocument();

    // Clicking item navigates to edit
    fireEvent.click(screen.getByText(/Project One/i));
    expect(navHoisted.navigate).toHaveBeenCalledWith("/edit/p1");

    expect(screen.getAllByText(/Created:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Updated:/i).length).toBeGreaterThan(0);
  });

  test("handles empty projects state and create navigation", async () => {
    getProjectsByUsername.mockResolvedValueOnce([]);
    render(<ProjectOverview />);

    await screen.findByText(/No projects yet/i);
    fireEvent.click(screen.getByText(/Create New Project/i));
    expect(navHoisted.navigate).toHaveBeenCalledWith("/structureSelection");
  });

  test("shows error when user missing or service fails", async () => {
    useUserMock.mockReturnValueOnce({
      user: undefined as unknown as { username: string },
      isLoaded: true,
    });
    render(<ProjectOverview />);
    await screen.findByText(/Username not found/i);

    getProjectsByUsername.mockRejectedValueOnce(new Error("boom"));
    useUserMock.mockReturnValueOnce({ user: baseUser, isLoaded: true });
    render(<ProjectOverview />);
    await screen.findByText(/Error loading projects/i);
    expect(navHoisted.navigate).not.toHaveBeenCalled();
  });

  test("delete project confirmation branch and service call", async () => {
    getProjectsByUsername.mockResolvedValueOnce(projects);
    deleteProject.mockResolvedValueOnce({});

    const confirmSpy = vi.spyOn(window, "confirm");
    confirmSpy.mockReturnValue(true);

    render(<ProjectOverview />);
    await screen.findByText(/Project One/i);

    const delButtons = screen.getAllByTitle("Delete");
    fireEvent.click(delButtons[0]);

    await waitFor(() => expect(deleteProject).toHaveBeenCalledWith("p1"));
    expect(navHoisted.navigate).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  test("delete project negative confirmation shows no call", async () => {
    getProjectsByUsername.mockResolvedValueOnce(projects);

    const confirmSpy = vi.spyOn(window, "confirm");
    confirmSpy.mockReturnValue(false);

    render(<ProjectOverview />);
    await screen.findByText(/Project Two/i);

    const delButtons = screen.getAllByTitle("Delete");
    fireEvent.click(delButtons[0]);
    expect(deleteProject).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });
});

describe("ProjectOverview - extra coverage (fixed)", () => {
  const projects = [
    {
      _id: "p1",
      name: "Project One",
      username: "demo",
      createdAt: new Date("2024-01-01").toISOString(),
      updatedAt: new Date("2024-02-01").toISOString(),
      projectStructure: [{ id: "1", name: "Chapter structure", nodes: [] }],
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    // Hier die hoisted mocks direkt verwenden
    getProjectsByUsername.mockResolvedValue(projects);
    updateProject.mockResolvedValue({
      ...projects[0],
      name: "Updated Project",
    });
    hoisted.toastError = vi.fn();
  });

  it("can enter edit mode and change project name", async () => {
    render(<ProjectOverview />);
    await screen.findByText(/Project One/i);

    fireEvent.click(screen.getByTitle("Edit"));
    const input = screen.getByDisplayValue("Project One");
    fireEvent.change(input, { target: { value: "Updated Project" } });

    const saveButton = screen.getByTitle("Save");
    fireEvent.click(saveButton);

    await waitFor(() =>
      expect(updateProject).toHaveBeenCalledWith(
        "p1",
        expect.objectContaining({ name: "Updated Project" }),
      ),
    );

    await waitFor(() =>
      expect(screen.queryByDisplayValue("Project One")).not.toBeInTheDocument(),
    );
  });

  it("cancel edit resets editing state", async () => {
    render(<ProjectOverview />);
    await screen.findByText(/Project One/i);

    fireEvent.click(screen.getByTitle("Edit"));
    fireEvent.click(screen.getByTitle("Cancel"));

    expect(screen.queryByDisplayValue("Project One")).not.toBeInTheDocument();
  });

  it("save button is disabled if name is unchanged or empty", async () => {
    render(<ProjectOverview />);
    await screen.findByText(/Project One/i);

    fireEvent.click(screen.getByTitle("Edit"));
    const input = screen.getByDisplayValue("Project One");

    fireEvent.change(input, { target: { value: " " } });
    const saveButton = screen.getByTitle("Save");
    expect(saveButton).toBeDisabled();

    fireEvent.change(input, { target: { value: "Project One" } });
    expect(saveButton).toBeDisabled();
  });

  it("shows toast on failed update", async () => {
    updateProject.mockRejectedValueOnce(new Error("fail"));

    render(<ProjectOverview />);
    await screen.findByText(/Project One/i);

    fireEvent.click(screen.getByTitle("Edit"));
    const input = screen.getByDisplayValue("Project One");
    fireEvent.change(input, { target: { value: "New Name" } });

    fireEvent.click(screen.getByTitle("Save"));

    const toastErrorMock = toast.error as MockedFunction<typeof toast.error>;

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledTimes(1);

      expect(toastErrorMock.mock.calls[0][0]).toMatch(/failed/i);

      expect(toastErrorMock.mock.calls[0][1]).toMatchObject({
        duration: 10000,
        icon: "❌",
      });
    });
  });

  it("shows loading skeleton before projects are loaded", async () => {
    getProjectsByUsername.mockImplementationOnce(() => new Promise(() => {}));

    render(<ProjectOverview />);
    expect(screen.getByText(/Loading your projects/i)).toBeInTheDocument();
  });
});
