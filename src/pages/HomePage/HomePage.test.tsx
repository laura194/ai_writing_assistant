import { vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { render } from "../../../test/renderWithProviders";
import HomePage from "./HomePage";

// Mock Header to isolate HomePage
vi.mock("../../components/Header/Header", () => ({
  __esModule: true,
  default: () => <header data-testid="header" />,
}));

// Mock Clerk useUser
// Hoisted stateful mocks for navigation and user
const hoisted = vi.hoisted(() => ({
  navigate: vi.fn(),
  user: undefined as any,
}));

vi.mock("@clerk/clerk-react", () => ({
  useUser: () => ({ user: hoisted.user }),
}));

// Mock ThemeProvider hook
vi.mock("../../providers/ThemeProvider", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn(), toggle: vi.fn() }),
}));

// Mock framer-motion to render its children directly (no animations side-effects)
vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: () => (props: any) => <div {...props} />,
    }
  ),
}));

// Mock useNavigate bound to hoisted.navigate
vi.mock("react-router-dom", async (orig) => {
  const actual = await (orig as any)();
  return {
    ...actual,
    useNavigate: () => hoisted.navigate,
  };
});

describe("HomePage", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    hoisted.navigate = vi.fn();
    hoisted.user = undefined;
  });

  test("renders header and main sections", async () => {
    render(<HomePage />);

    expect(screen.getByTestId("header")).toBeInTheDocument();

    // Headline text is present
    expect(
      screen.getByRole("heading", { name: /Welcome to your/i })
    ).toBeInTheDocument();

    // Buttons' labels are present
    expect(screen.getByText(/Create New Project/i)).toBeInTheDocument();
    expect(screen.getByText(/Open Existing Project/i)).toBeInTheDocument();
  });

  test("navigates to structure selection when clicking Create New Project", () => {
    const { rerender } = render(<HomePage />);

    fireEvent.click(screen.getByText(/Create New Project/i));
    expect(hoisted.navigate).toHaveBeenCalledWith("/structureSelection");

    // Rerender to ensure component stability
    rerender(<HomePage />);
  });

  test("navigates to project overview when clicking Open Existing Project", () => {
    render(<HomePage />);

    fireEvent.click(screen.getByText(/Open Existing Project/i));
    expect(hoisted.navigate).toHaveBeenCalledWith("/myProjects");
  });

  test("displays personalized greeting using Clerk user name branches", async () => {
    // FirstName branch
    hoisted.user = { firstName: "Lena", username: "lena01" } as any;
    const { rerender } = render(<HomePage />);
    expect(screen.getByText(/Lena!/i)).toBeInTheDocument();

    // Username branch
    hoisted.user = { username: "tommy" } as any;
    rerender(<HomePage />);
    expect(screen.getByText(/tommy!/i)).toBeInTheDocument();

    // No user branch
    hoisted.user = undefined;
    rerender(<HomePage />);
    // Just exclamation should remain (no dynamic name)
    expect(screen.getAllByText("!")).toBeTruthy();
  });

  test("applies theme-based hover boxShadow variants without throwing (light vs dark)", () => {
    // Light theme
    vi.doMock("../../providers/ThemeProvider", () => ({
      useTheme: () => ({ theme: "light", setTheme: vi.fn(), toggle: vi.fn() }),
    }));
    const { rerender } = render(<HomePage />);
    const createCard = screen.getByText(/Create New Project/i).closest("div");
    expect(createCard).toBeInTheDocument();

    // Dark theme
    vi.doMock("../../providers/ThemeProvider", () => ({
      useTheme: () => ({ theme: "dark", setTheme: vi.fn(), toggle: vi.fn() }),
    }));
    rerender(<HomePage />);
    const openCard = screen.getByText(/Open Existing Project/i).closest("div");
    expect(openCard).toBeInTheDocument();
  });

  test("renders animated background blobs and containers (structure checks)", () => {
    const { container } = render(<HomePage />);

    // Expect multiple motion container wrappers to be present
    const wrappers = container.querySelectorAll("div");
    expect(wrappers.length).toBeGreaterThan(10);

    // Presence of main region and ensure it's within the page
    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();
  });
});
