import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "../../../../../test/renderWithProviders";

const progressState = { progress: 42.1234 };
vi.mock("@react-three/drei", () => ({
  __esModule: true,
  Html: ({ children }: any) => <div data-testid="html">{children}</div>,
  useProgress: () => progressState,
}));

import Loader from "./Loader";

describe("CanvasLoader", () => {
  it("renders progress with two decimals", () => {
    render(<Loader />);
    expect(screen.getByText(/42.12%/)).toBeInTheDocument();
  });
});
