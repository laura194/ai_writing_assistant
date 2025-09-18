import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "../../../../../test/renderWithProviders";

vi.mock("@react-three/fiber", () => ({
  __esModule: true,
  Canvas: ({ children }: any) => <div data-testid="canvas">{children}</div>,
  useFrame: (cb: any) => {
    if (typeof cb === "function") {
      cb({}, 0);
    }
  },
}));

vi.mock("@react-three/drei", () => ({
  __esModule: true,
  Points: ({ children, ...rest }: any) => (
    <div data-testid="points" {...rest}>
      {children}
    </div>
  ),
  PointMaterial: (props: any) => <div data-testid="point-mat" {...props} />,
  Preload: () => <div data-testid="preload" />,
}));
vi.mock("maath/random/dist/maath-random.esm", () => ({
  __esModule: true,
  default: {},
  inSphere: (arr: Float32Array) => arr,
}));

import StarsCanvas from "./StarsCanvas";

describe("StarsCanvas", () => {
  it("renders canvas with points and preload", () => {
    render(<StarsCanvas />);
    expect(screen.getByTestId("canvas")).toBeInTheDocument();
    expect(screen.getByTestId("points")).toBeInTheDocument();
    expect(screen.getByTestId("preload")).toBeInTheDocument();
  });
});
