import { render, screen } from "@testing-library/react";
import App from "./App";
import { vi } from "vitest";
import AOS from "aos";

// --- Mocks ---
vi.mock("../AppRoutes/AppRoutes", () => ({
  default: vi.fn(() => <div data-testid="app-routes" />),
}));

vi.mock("aos", () => ({
  default: {
    init: vi.fn(),
  },
}));

let toasterProps: any = {};
vi.mock("react-hot-toast", () => {
  return {
    Toaster: (props: any) => {
      toasterProps = props;
      return <div data-testid="toaster" />;
    },
  };
});

describe("App Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    toasterProps = {};
  });

  test("calls AOS.init on mount", () => {
    render(<App />);
    expect(AOS.init).toHaveBeenCalledWith({
      duration: 1500,
      once: true,
      delay: 1200,
    });
  });

  test("renders AppRoutes component", () => {
    render(<App />);
    expect(screen.getByTestId("app-routes")).toBeInTheDocument();
  });

  test("renders Toaster with correct props", () => {
    render(<App />);
    expect(screen.getByTestId("toaster")).toBeInTheDocument();

    expect(toasterProps.position).toBe("top-center");
    expect(toasterProps.toastOptions).toMatchObject({
      duration: 4000,
      style: {
        background: "#1a1333",
        color: "#fff",
        fontSize: "16px",
        padding: "14px 20px",
        borderRadius: "12px",
      },
    });
  });
});
