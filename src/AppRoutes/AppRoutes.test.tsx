import { render, screen } from "@testing-library/react";
import { vi, describe, it, beforeEach, expect } from "vitest";

// --- Mock: react-router-dom ---
vi.mock("react-router-dom", async () => {
  const ReactPkg = await import("react");

  let _path = "/"; // default
  const setPath = (p: string) => {
    _path = p;
  };

  return {
    Routes: ({ children }: any) =>
      ReactPkg.createElement("div", { "data-testid": "routes" }, children),

    Route: ({ element }: any) => element,

    Navigate: ({ to }: any) =>
      ReactPkg.createElement(
        "div",
        { "data-testid": "navigate-to" },
        String(to)
      ),

    useLocation: () => ({ pathname: _path }),

    __setPath: setPath,
  };
});

// --- Mock: @clerk/clerk-react ---
vi.mock("@clerk/clerk-react", () => {
  let state = { isSignedIn: false, isLoaded: true };
  return {
    useAuth: () => state,
    __setAuth: (partial: Partial<typeof state>) => {
      state = { ...state, ...partial };
    },
  };
});

// --- Mock: Spinner + Pages ---
vi.mock("../components/Spinner/Spinner", () => ({
  default: () => <div data-testid="spinner" />,
}));

vi.mock("../pages/LandingPage", () => ({
  default: () => <div data-testid="landing-page">Landing</div>,
}));
vi.mock("../pages/HomePage", () => ({
  default: () => <div data-testid="home-page">Home</div>,
}));
vi.mock("../pages/StructureSelectionPage", () => ({
  default: () => <div data-testid="structure-page">Structure</div>,
}));
vi.mock("../pages/EditPage", () => ({
  default: () => <div data-testid="edit-page">Edit</div>,
}));
vi.mock("../pages/SignInPage", () => ({
  default: () => <div data-testid="signin-page">SignIn</div>,
}));
vi.mock("../pages/SignUpPage", () => ({
  default: () => <div data-testid="signup-page">SignUp</div>,
}));
vi.mock("../pages/ProjectOverview", () => ({
  default: () => <div data-testid="projects-page">Projects</div>,
}));

import AppRoutes from "./AppRoutes";
import * as routerDomMock from "react-router-dom";
import * as clerkMock from "@clerk/clerk-react";

describe("AppRoutes - routing & redirects", () => {
  const setPath = (p: string) => (routerDomMock as any).__setPath(p);
  const setAuth = (a: any) => (clerkMock as any).__setAuth(a);

  beforeEach(() => {
    setPath("/");
    setAuth({ isSignedIn: false, isLoaded: true });
    vi.clearAllMocks();
  });

  it("shows spinner + routes while Clerk is loading (isLoaded === false)", () => {
    setAuth({ isSignedIn: false, isLoaded: false });
    render(<AppRoutes />);

    expect(screen.getByTestId("routes")).toBeInTheDocument();
    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    expect(screen.queryByTestId("landing-page")).toBeInTheDocument();
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

  it("renders AllRoutes for public path when not signed in (landing page visible)", () => {
    setPath("/");
    setAuth({ isSignedIn: false, isLoaded: true });

    render(<AppRoutes />);

    expect(screen.getByTestId("routes")).toBeInTheDocument();
    expect(screen.getByTestId("landing-page")).toBeInTheDocument();
  });

  it("renders protected route elements when signed in and path matches protected path", () => {
    setPath("/edit");
    setAuth({ isSignedIn: true, isLoaded: true });

    render(<AppRoutes />);

    expect(screen.getByTestId("routes")).toBeInTheDocument();
    const editPages = screen.getAllByTestId("edit-page");
    expect(editPages).toHaveLength(2);
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
});
