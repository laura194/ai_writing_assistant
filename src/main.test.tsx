import { vi, describe, it, expect, beforeEach } from "vitest";

// Mocks
const renderMock = vi.fn();
vi.mock("react-dom/client", () => ({
  createRoot: vi.fn(() => ({
    render: renderMock,
  })),
}));

const infoMock = vi.fn();
const errorMock = vi.fn();
vi.mock("loglevel", () => ({
  default: {
    info: infoMock,
    error: errorMock,
  },
  info: infoMock,
  error: errorMock,
}));

vi.mock("./App/App.tsx", () => ({
  default: () => <div data-testid="app" />,
}));

vi.mock("./providers/ThemeProvider.tsx", () => ({
  ThemeProvider: ({ children }: any) => (
    <div data-testid="theme">{children}</div>
  ),
}));

vi.mock("@clerk/clerk-react", () => ({
  ClerkProvider: ({ children }: any) => (
    <div data-testid="clerk">{children}</div>
  ),
}));
vi.mock("react-router-dom", () => ({
  BrowserRouter: ({ children }: any) => (
    <div data-testid="router">{children}</div>
  ),
}));

describe("main.tsx", () => {
  beforeEach(() => {
    vi.resetModules();
    renderMock.mockClear();
    infoMock.mockClear();
    errorMock.mockClear();

    let envBackup: any;

    envBackup = { ...import.meta.env };
  });

  it("logs application start and renders App correctly", async () => {
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY = "fake_key";

    await import("./main.tsx");

    expect(infoMock).toHaveBeenCalledWith("[main.tsx] Application started 🥳");
    expect(renderMock).toHaveBeenCalled();
    const rendered = renderMock.mock.calls[0][0];
    expect(
      rendered.props.children.props.children.props.children.props.children.type
    ).toBeDefined();
  });

  it("throws error if VITE_CLERK_PUBLISHABLE_KEY is missing", async () => {
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY = "";

    await expect(import("./main.tsx")).rejects.toThrow(
      "Missing Clerk Publishable Key"
    );
    expect(errorMock).toHaveBeenCalledWith(
      "[main.tsx] Missing Clerk Publishable Key"
    );
  });
});
