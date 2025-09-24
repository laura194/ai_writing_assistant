// EarthCanvas.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// Mock Canvas from @react-three/fiber to render children as a simple div
vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: any) => (
    <div data-testid="mock-canvas">{children}</div>
  ),
  // other exports (if used) can be mocked as needed
}));

// Mock drei exports: OrbitControls, Preload, useGLTF
vi.mock("@react-three/drei", async () => {
  return {
    OrbitControls: (props: any) => (
      <div data-testid="orbit-controls" {...props} />
    ),
    Preload: (props: any) => <div data-testid="preload" {...props} />,
    useGLTF: () => ({ scene: { _mockScene: true } }),
  };
});

// Mock CanvasLoader (local loader component)
vi.mock("./Loader", () => ({
  __esModule: true,
  default: () => <div data-testid="canvas-loader">loading</div>,
}));

// Now import the EarthCanvas module under test
import EarthCanvas from "./EarthCanvas";

describe("EarthCanvas", () => {
  it("renders the Canvas and contained components (mocked)", () => {
    render(<EarthCanvas />);

    // Canvas should be the mocked container
    expect(screen.getByTestId("mock-canvas")).toBeInTheDocument();

    // Loader exists in fallback but since we used Suspense, loader may be present in DOM (mocked)
    // the OrbitControls and Preload are mocked, so they should be present
    expect(screen.getByTestId("orbit-controls")).toBeInTheDocument();
    expect(screen.getByTestId("preload")).toBeInTheDocument();

    // The Earth component renders a <primitive /> element — React will render that tag name.
    // We can assert that a 'primitive' node exists in the container
    const primitive = document.querySelector("primitive");
    expect(primitive).toBeTruthy();
  });
});
