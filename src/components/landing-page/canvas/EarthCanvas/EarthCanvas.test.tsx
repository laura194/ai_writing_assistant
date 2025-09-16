import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "../../../../../test/renderWithProviders";

vi.mock("@react-three/fiber", () => ({
  __esModule: true,
  Canvas: ({ children }: any) => <div data-testid="canvas">{children}</div>,
}));
vi.mock("@react-three/drei", () => ({
  __esModule: true,
  OrbitControls: () => <div data-testid="orbit" />,
  Preload: () => <div data-testid="preload" />,
  useGLTF: () => ({ scene: {} }),
}));

// Virtual import fix for Loader path
vi.mock("../Loader/Loader", () => ({
  __esModule: true,
  default: () => <div data-testid="loader" />,
}));
vi.mock("./Loader", () => ({
  __esModule: true,
  default: () => <div data-testid="loader" />,
}));

import EarthCanvas from "./EarthCanvas";

describe("EarthCanvas", () => {
  it("renders canvas, controls and preload", () => {
    render(<EarthCanvas />);

    expect(screen.getByTestId("canvas")).toBeInTheDocument();
    expect(screen.getByTestId("orbit")).toBeInTheDocument();
    expect(screen.getByTestId("preload")).toBeInTheDocument();
  });
});
