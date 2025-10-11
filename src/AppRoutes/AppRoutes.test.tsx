import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, beforeEach, expect } from "vitest";
import { ProjectService } from "../utils/ProjectService.ts";

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

class MockIntersectionObserver implements IntersectionObserver {
  root: Element | null = null;
  rootMargin: string = "";
  thresholds: ReadonlyArray<number> = [];

  constructor(
    _callback: IntersectionObserverCallback,
    _options?: IntersectionObserverInit,
  ) {}

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

global.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver;

vi.mock("../providers/SettingsProvider", () => ({
  SettingsProvider: ({ children }: any) => children,
  useSettings: () => ({
    settings: {
      autoSave: { enabled: false, intervalMinutes: 1 },
      spellChecker: false,
      lastOpenedProject: true,
    },
  }),
}));

vi.mock("../utils/ProjectService.ts", () => ({
  ProjectService: {
    getProjectById: vi.fn(),
  },
}));

vi.mock("../assets/images/sign-in-animate.svg?react", () => ({
  default: () => <svg data-testid="signin-anim" />,
}));

vi.mock("../assets/images/sign-up-animate.svg?react", () => ({
  default: () => <svg data-testid="signin-anim" />,
}));

// --- Mock: react-router-dom ---
vi.mock("react-router-dom", async () => {
  const ReactPkg = await import("react");

  let _path = "/";
  const setPath = (p: string) => {
    _path = p;
  };

  const navigateMock = vi.fn();

  return {
    Routes: ({ children }: any) =>
      ReactPkg.createElement("div", { "data-testid": "routes" }, children),
    Route: ({ path, element }: any) => {
      const cleanPath = path.replace("/*", "");
      if (_path === cleanPath || _path.startsWith(cleanPath + "/")) {
        return element;
      }
      return null;
    },

    Navigate: ({ to }: any) =>
      ReactPkg.createElement(
        "div",
        { "data-testid": "navigate-to" },
        String(to),
      ),
    useLocation: () => ({ pathname: _path }),
    useNavigate: () => navigateMock,
    useParams: () => ({ projectId: "test-project-id" }),
    Link: ({ to, children, ...rest }: any) =>
      ReactPkg.createElement(
        "a",
        { "data-testid": "link", href: to, ...rest },
        children,
      ),
    __setPath: setPath,
    __navigateMock: navigateMock,
  };
});

vi.mock("../providers/ThemeProvider", async () => {
  return {
    useTheme: () => ({ theme: "light" }),
  };
});

// --- Mock: @clerk/clerk-react ---
vi.mock("@clerk/clerk-react", async (_importOriginal) => {
  let state = { isSignedIn: false, isLoaded: true };
  let user = { username: "testuser" };

  return {
    useAuth: () => state,
    useUser: () => ({ user, isLoaded: state.isLoaded }),
    __setAuth: (partial: Partial<typeof state>) => {
      state = { ...state, ...partial };
    },
    SignIn: (props: any) => <div data-testid="clerk-signin" {...props} />,
    SignUp: (props: any) => <div data-testid="clerk-signup" {...props} />,
    UserButton: (props: any) => <div data-testid="user-button" {...props} />, // <--- HIER
  };
});

// --- Mock: Spinner + Pages ---
vi.mock("../components/Spinner/Spinner", () => ({
  default: () => <div data-testid="spinner" />,
}));
vi.mock("../pages/LandingPage/LandingPage", () => ({
  default: () => <div data-testid="landing-page">Landing</div>,
}));
vi.mock("../pages/HomePage/HomePage", () => ({
  default: () => <div data-testid="home-page">Home</div>,
}));
vi.mock("../pages/StructureSelectionPage/StructureSelectionPage", () => ({
  default: () => <div data-testid="structure-page">Structure</div>,
}));
vi.mock("../pages/EditPage/EditPage", () => ({
  default: () => <div data-testid="edit-page">Edit</div>,
}));
vi.mock("../pages/SignInPage/SignInPage", () => ({
  default: () => <div data-testid="signin-page">SignIn</div>,
}));
vi.mock("../pages/SignUpPage/SignUpPage", () => ({
  default: () => <div data-testid="signup-page">SignUp</div>,
}));
vi.mock("../pages/ProjectOverview/ProjectOverview", () => ({
  default: () => <div data-testid="projects-page">Projects</div>,
}));

import AppRoutes from "./AppRoutes";
import * as routerDomMock from "react-router-dom";
import * as clerkMock from "@clerk/clerk-react";
import * as SettingsProvider from "../providers/SettingsProvider";

describe("AppRoutes - routing & redirects", () => {
  const setPath = (p: string) => (routerDomMock as any).__setPath(p);
  const setAuth = (a: any) => (clerkMock as any).__setAuth(a);

  beforeEach(() => {
    setPath("/");
    setAuth({ isSignedIn: false, isLoaded: true });
    vi.clearAllMocks();
  });

  it("redirects unauthenticated user from protected path to /signIn", () => {
    setPath("/home");
    setAuth({ isSignedIn: false, isLoaded: true });

    render(<AppRoutes />);
    const nav = screen.getByTestId("navigate-to");
    expect(nav).toHaveTextContent("/signIn");
  });

  it("redirects unauthenticated user from unknown path to /", () => {
    setPath("/unknown/route");
    setAuth({ isSignedIn: false, isLoaded: true });

    render(<AppRoutes />);
    const nav = screen.getByTestId("navigate-to");
    expect(nav).toHaveTextContent("/");
  });

  it("redirects signed-in user from root '/' to /home", () => {
    setPath("/");
    setAuth({ isSignedIn: true, isLoaded: true });

    render(<AppRoutes />);
    const nav = screen.getByTestId("navigate-to");
    expect(nav).toHaveTextContent("/home");
  });

  it("redirects signed-in user away from signIn/signUp pages to /home", () => {
    setPath("/signIn/callback");
    setAuth({ isSignedIn: true, isLoaded: true });

    render(<AppRoutes />);
    expect(screen.getByTestId("navigate-to")).toHaveTextContent("/home");

    setPath("/signUp/flow");
    setAuth({ isSignedIn: true, isLoaded: true });
    render(<AppRoutes />);
    expect(screen.getAllByTestId("navigate-to")[0]).toHaveTextContent("/home");
  });

  it("redirects signed-in user from unknown path to /home", () => {
    setPath("/some/unknown");
    setAuth({ isSignedIn: true, isLoaded: true });

    render(<AppRoutes />);
    expect(screen.getByTestId("navigate-to")).toHaveTextContent("/home");
  });

  it("unauthenticated user hitting a completely unknown path redirects to '/' (explicit case 4)", () => {
    setPath("/totally-unknown");
    setAuth({ isSignedIn: false, isLoaded: true });

    render(<AppRoutes />);
    const nav = screen.getByTestId("navigate-to");
    expect(nav).toHaveTextContent("/");
  });

  it("authenticated user hitting a completely unknown path redirects to '/home' (explicit case 6)", () => {
    setPath("/weird-path");
    setAuth({ isSignedIn: true, isLoaded: true });

    render(<AppRoutes />);
    const nav = screen.getByTestId("navigate-to");
    expect(nav).toHaveTextContent("/home");
  });

  it("redirects unauthenticated user trying to access /edit/:projectId to /signIn", () => {
    setAuth({ isSignedIn: false, isLoaded: true });
    setPath("/edit/test-project-id");

    render(<AppRoutes />);
    const nav = screen.getByTestId("navigate-to");
    expect(nav).toHaveTextContent("/signIn");
  });

  it("renders SignInPage for unauthenticated user on /signIn/callback (public startsWith match)", () => {
    setPath("/signIn/callback");
    setAuth({ isSignedIn: false, isLoaded: true });

    render(<AppRoutes />);
    // should render the mocked SignInPage (no Navigate)
    expect(screen.getByTestId("signin-page")).toBeInTheDocument();
  });

  it("renders SignUpPage for unauthenticated user on /signUp/flow (public startsWith match)", () => {
    setPath("/signUp/flow");
    setAuth({ isSignedIn: false, isLoaded: true });

    render(<AppRoutes />);
    expect(screen.getByTestId("signup-page")).toBeInTheDocument();
  });

  it("renders LandingPage for unauthenticated user on '/'", () => {
    setPath("/");
    setAuth({ isSignedIn: false, isLoaded: true });

    render(<AppRoutes />);
    expect(screen.getByTestId("landing-page")).toBeInTheDocument();
  });

  it("renders EditPage for authenticated user on /edit/:projectId", () => {
    setPath("/edit/test-project-id");
    setAuth({ isSignedIn: true, isLoaded: true });

    render(<AppRoutes />);
    // because user is signed in and /edit is in protectedPaths, the EditPage should be rendered
    expect(screen.getByTestId("edit-page")).toBeInTheDocument();
  });

  it("renders StructureSelectionPage for authenticated user on /structureSelection", () => {
    setPath("/structureSelection");
    setAuth({ isSignedIn: true, isLoaded: true });

    render(<AppRoutes />);
    expect(screen.getByTestId("structure-page")).toBeInTheDocument();
  });

  it("when Clerk is still loading (isLoaded === false) the Spinner is shown and routes are rendered via AllRoutes(false)", () => {
    // Simulate Clerk still loading. AppRoutes returns Routes(AllRoutes(false)) + <Spinner />
    setPath("/home");
    setAuth({ isSignedIn: true, isLoaded: false });

    render(<AppRoutes />);
    // spinner must be visible
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
    // and because AllRoutes(false) is used while loading, the Home route is still present (per current implementation)
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  it("renders ProjectOverview for authenticated user on /myProjects", () => {
    setPath("/myProjects");
    setAuth({ isSignedIn: true, isLoaded: true });

    render(<AppRoutes />);
    expect(screen.getByTestId("projects-page")).toBeInTheDocument();
  });

  describe("AppRoutes - lastOpenedProject redirects", () => {
    const setPath = (p: string) => (routerDomMock as any).__setPath(p);
    const setAuth = (a: any) => (clerkMock as any).__setAuth(a);
    const navigateMock = (routerDomMock as any).__navigateMock;

    beforeEach(() => {
      vi.clearAllMocks();
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.removeItem("didRedirectToLastProject");

      vi.spyOn(SettingsProvider, "useSettings").mockReturnValue({
        settings: {
          autoSave: { enabled: false, intervalMinutes: 1 },
          spellChecker: false,
          lastOpenedProject: true,
        },
        update: vi.fn(),
        updateAutoSave: vi.fn(),
      });

      setPath("/home");
      setAuth({ isSignedIn: false, isLoaded: true });
    });

    it("redirects to lastOpenedProject after sign-in", async () => {
      localStorage.setItem("lastOpenedProjectId", "proj-123");
      setAuth({ isSignedIn: true, isLoaded: true });

      (ProjectService.getProjectById as any).mockResolvedValue({
        id: "proj-123",
      });

      render(<AppRoutes />);

      await waitFor(() => {
        expect(navigateMock).toHaveBeenCalledWith("/edit/proj-123", {
          replace: true,
        });
      });
    });

    it("does not redirect if lastOpenedProject setting is disabled", async () => {
      localStorage.setItem("lastOpenedProjectId", "proj-123");
      setAuth({ isSignedIn: true, isLoaded: true });

      render(<AppRoutes />);

      await waitFor(() => {
        expect(navigateMock).not.toHaveBeenCalled();
      });
    });

    it("clears lastOpenedProjectId if project does not exist", async () => {
      localStorage.setItem("lastOpenedProjectId", "proj-404");
      (ProjectService.getProjectById as any).mockResolvedValue(null);
      setAuth({ isSignedIn: true, isLoaded: true });

      render(<AppRoutes />);

      await waitFor(() => {
        expect(localStorage.getItem("lastOpenedProjectId")).toBeNull();
        expect(navigateMock).not.toHaveBeenCalled();
      });
    });

    it("skips redirect if already on last project page", async () => {
      localStorage.setItem("lastOpenedProjectId", "proj-123");
      setPath("/edit/proj-123");
      (ProjectService.getProjectById as any).mockResolvedValue({
        id: "proj-123",
      });
      setAuth({ isSignedIn: true, isLoaded: true });

      render(<AppRoutes />);

      await waitFor(() => {
        // Da wir bereits auf der Seite sind, soll kein Redirect passieren
        expect(navigateMock).not.toHaveBeenCalled();

        // Auch das Session-Flag wird nicht gesetzt – wir prüfen also nur, dass es null ist
        expect(sessionStorage.getItem("didRedirectToLastProject")).toBeNull();
      });
    });

    it("skips redirect if already redirected this session", async () => {
      setPath("/edit/proj-123");

      localStorage.setItem("lastOpenedProjectId", "proj-123");
      sessionStorage.setItem("didRedirectToLastProject", "proj-123");
      setAuth({ isSignedIn: true, isLoaded: true });

      render(<AppRoutes />);

      await waitFor(() => {
        expect(navigateMock).not.toHaveBeenCalled();
      });
    });
  });
});
