import { vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { render } from "../../../test/renderWithProviders";
import StructureSelectionPage from "./StructureSelectionPage";

// Mock Header
vi.mock("../../components/Header/Header", () => ({
  __esModule: true,
  default: () => <header data-testid="header" />,
}));

// Mock framer motion wrappers
vi.mock("framer-motion", () => ({
  motion: new Proxy({}, { get: () => (props: any) => <div {...props} /> }),
}));

// Mock Clerk
vi.mock("@clerk/clerk-react", () => ({
  useUser: () => ({ user: { username: "demo" } }),
}));

// Mock theme
vi.mock("../../providers/ThemeProvider", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn(), toggle: vi.fn() }),
}));

// Mock toast - hoisted to avoid init order issues
const hoisted = vi.hoisted(() => ({
  toast: vi.fn(),
  error: vi.fn(),
  success: vi.fn(),
}));
vi.mock("react-hot-toast", () => ({
  __esModule: true,
  default: Object.assign(hoisted.toast, {
    error: hoisted.error,
    success: hoisted.success,
  }),
}));

// Mock getToastOptions
vi.mock("../../utils/ToastOptionsSSP", () => ({
  getToastOptions: () => ({ duration: 1 }),
}));

// Mock navigate (hoisted)
const navHoisted = vi.hoisted(() => ({ navigate: vi.fn() }));
vi.mock("react-router-dom", async (orig) => {
  const actual = await (orig as any)();
  return { ...actual, useNavigate: () => navHoisted.navigate };
});

// Mock ProjectService
const createProjectMock = vi.fn();
vi.mock("../../utils/ProjectService", () => ({
  ProjectService: {
    createProject: (...args: any[]) => createProjectMock(...args),
  },
}));

// Mock JSON structure assets to simple arrays
vi.mock("../../assets/imrad.json", () => ({
  default: [{ id: "1", name: "Chapter structure", nodes: [] }],
}));
vi.mock("../../assets/projectStructure.json", () => ({
  default: [{ id: "1", name: "Chapter structure", nodes: [] }],
}));
vi.mock("../../assets/storyForDesign.json", () => ({
  default: [{ id: "1", name: "Chapter structure", nodes: [] }],
}));

describe("StructureSelectionPage", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    hoisted.toast = vi.fn();
    hoisted.error = vi.fn();
    hoisted.success = vi.fn();
    navHoisted.navigate = vi.fn();
  });

  test("shows validations when missing project name and structure", async () => {
    render(<StructureSelectionPage />);

    fireEvent.click(screen.getByText(/Create Project/i));

    // Validation: should not attempt creation or navigate
    expect(createProjectMock).not.toHaveBeenCalled();
    expect(navHoisted.navigate).not.toHaveBeenCalled();

    fireEvent.change(screen.getByPlaceholderText(/Enter project title/i), {
      target: { value: "My Project" },
    });
    fireEvent.click(screen.getByText(/Create Project/i));

    expect(createProjectMock).not.toHaveBeenCalled();
    expect(navHoisted.navigate).not.toHaveBeenCalled();
  });

  test("creates project with selected imrad structure and navigates to edit page", async () => {
    createProjectMock.mockResolvedValueOnce({ _id: "abc123" });

    render(<StructureSelectionPage />);

    fireEvent.change(screen.getByPlaceholderText(/Enter project title/i), {
      target: { value: "Thesis" },
    });
    fireEvent.click(screen.getByText(/Story-for-Explanation/i));

    fireEvent.click(screen.getByText(/Create Project/i));

    await waitFor(() => expect(createProjectMock).toHaveBeenCalled());

    // Validate that the name is applied to first node in structure
    const payload = createProjectMock.mock.calls[0][0];
    expect(payload.name).toBe("Thesis");
    expect(Array.isArray(payload.projectStructure)).toBe(true);
    expect(payload.projectStructure[0].name).toBe("Thesis");

    expect(navHoisted.navigate).toHaveBeenCalledWith("/edit/abc123");
  });

  test("creates project using each structure option (storyForDesign, scratch)", async () => {
    createProjectMock.mockResolvedValue({ _id: "id" });

    render(<StructureSelectionPage />);

    fireEvent.change(screen.getByPlaceholderText(/Enter project title/i), {
      target: { value: "Doc" },
    });

    // storyForDesign
    fireEvent.click(screen.getByText(/Story-for-Design Pattern/i));
    fireEvent.click(screen.getByText(/Create Project/i));

    await waitFor(() => expect(createProjectMock).toHaveBeenCalled());
    expect(createProjectMock).toHaveBeenCalledTimes(1);

    // scratch
    fireEvent.click(screen.getByText(/Custom Structure/i));
    fireEvent.click(screen.getByText(/Create Project/i));
    await waitFor(() => expect(createProjectMock).toHaveBeenCalledTimes(2));

    expect(navHoisted.navigate).toHaveBeenCalledTimes(2);
  });

  test("handles service error: no navigation on failure", async () => {
    createProjectMock.mockRejectedValueOnce(new Error("fail"));

    render(<StructureSelectionPage />);

    fireEvent.change(screen.getByPlaceholderText(/Enter project title/i), {
      target: { value: "Zed" },
    });
    fireEvent.click(screen.getByText(/Custom Structure/i));
    fireEvent.click(screen.getByText(/Create Project/i));

    await waitFor(() => expect(createProjectMock).toHaveBeenCalled());
    expect(navHoisted.navigate).not.toHaveBeenCalled();
  });

  test("structure selection toggles styles and state", () => {
    render(<StructureSelectionPage />);

    const option = screen.getByText(/Custom Structure/i);
    fireEvent.click(option);

    // parent button should have gradient class when selected
    const btn = option.closest("button");
    // The class is applied on button wrapper when selected; simulate by clicking specific option
    expect(
      btn?.className.includes("bg-gradient-to-r") ||
        btn?.className.includes("bg-[#8b75cb]"),
    ).toBe(true);

    expect(typeof navHoisted.navigate).toBe("function");
  });
});
