import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "../../../../../test/renderWithProviders";

// Hoisted state to let mocks record props and simulate suspense
const h = vi.hoisted(() => ({
  canvasProps: {} as any,
  orbitProps: {} as any,
  textureArgs: [] as any[],
  suspend: { value: false },
}));

vi.mock("@react-three/fiber", () => ({
  __esModule: true,
  Canvas: ({ children, ...rest }: any) => {
    h.canvasProps = rest;
    const gl = rest?.gl ?? {};
    return (
      <div
        data-testid="canvas"
        data-frameloop={String(rest?.frameloop)}
        data-dpr={String(rest?.dpr)}
        data-gl-preserve={String(gl.preserveDrawingBuffer)}
        data-gl-antialias={String(gl.antialias)}
      >
        {children}
      </div>
    );
  },
}));

vi.mock("@react-three/drei", () => ({
  __esModule: true,
  Decal: (p: any) => (
    <div
      data-testid="decal"
      data-position={JSON.stringify(p.position)}
      data-rotation={JSON.stringify(p.rotation)}
      data-scale={String(p.scale)}
      data-map={String(p.map)}
    />
  ),
  Float: ({ children }: any) => <div data-testid="float">{children}</div>,
  OrbitControls: (p: any) => {
    h.orbitProps = p;
    return <div data-testid="orbit" data-enable-zoom={String(p?.enableZoom)} />;
  },
  Preload: (p: any) => (
    <div data-testid="preload" data-all={String(!!p?.all)} />
  ),
  useTexture: (...args: any[]) => {
    if (h.suspend.value) {
      // simulate suspense by throwing an unresolved promise
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      throw new Promise(() => {});
    }
    h.textureArgs = args;
    return ["tx"]; // mocked texture map
  },
}));

vi.mock("../Loader/Loader", () => ({
  __esModule: true,
  default: () => <div data-testid="loader" />,
}));
vi.mock("./Loader", () => ({
  __esModule: true,
  default: () => <div data-testid="loader" />,
}));

import BallCanvas from "./BallCanvas";

beforeEach(() => {
  h.canvasProps = {};
  h.orbitProps = {};
  h.textureArgs = [];
  h.suspend.value = false;
});

describe("BallCanvas", () => {
  it("renders loader fallback while children are suspended", () => {
    h.suspend.value = true;
    render(<BallCanvas icon="/icon.png" />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("renders canvas, controls, float, decal, and passes correct props", () => {
    render(<BallCanvas icon="/icon.png" />);

    // Canvas props
    const canvas = screen.getByTestId("canvas");
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute("data-frameloop", "always");
    expect(canvas).toHaveAttribute("data-dpr", "1");
    expect(canvas).toHaveAttribute("data-gl-preserve", "false");
    expect(canvas).toHaveAttribute("data-gl-antialias", "false");

    // OrbitControls props
    const orbit = screen.getByTestId("orbit");
    expect(orbit).toBeInTheDocument();
    expect(orbit).toHaveAttribute("data-enable-zoom", "false");

    // Float and Decal present
    expect(screen.getByTestId("float")).toBeInTheDocument();
    const decal = screen.getByTestId("decal");
    expect(decal).toBeInTheDocument();
    expect(decal).toHaveAttribute("data-map", "tx");

    // Decal transformation props
    const pos = JSON.parse(decal.getAttribute("data-position") || "null");
    const rot = JSON.parse(decal.getAttribute("data-rotation") || "null");
    const scl = decal.getAttribute("data-scale");

    expect(pos).toEqual([0, 0, 1]);
    expect(rot).toEqual([2 * Math.PI, 0, 6.25]);
    expect(scl).toBe("1");

    // Preload all
    const preload = screen.getByTestId("preload");
    expect(preload).toBeInTheDocument();
    expect(preload).toHaveAttribute("data-all", "true");

    // useTexture called with the passed icon path
    expect(h.textureArgs[0]).toEqual(["/icon.png"]);
  });
});
