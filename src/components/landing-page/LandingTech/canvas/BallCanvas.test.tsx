import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "../../../../../test/renderWithProviders";

// Hoisted capture to assert props flow through the re-export
const capture = vi.hoisted(() => ({ lastProps: null as any }));

vi.mock("../../canvas/BallCanvas/BallCanvas", () => ({
  __esModule: true,
  default: (props: any) => {
    capture.lastProps = props;
    return <div data-testid="proxied" data-icon={props.icon} />;
  },
}));

// Import the re-export AFTER the mock so it points to the mocked implementation
import ReexportedBallCanvas from "./BallCanvas";

describe("LandingTech/canvas/BallCanvas re-export", () => {
  it("forwards default export from ../../canvas/BallCanvas/BallCanvas and passes props through", async () => {
    // Render the re-exported component with a prop
    render(<ReexportedBallCanvas icon="/ic.png" />);

    // Assert that the mocked implementation rendered and received props
    const el = screen.getByTestId("proxied");
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute("data-icon", "/ic.png");
    expect(capture.lastProps).toEqual({ icon: "/ic.png" });

    // The re-exported symbol should be referentially equal to the mocked default
    const original = (await import("../../canvas/BallCanvas/BallCanvas"))
      .default;
    expect(ReexportedBallCanvas).toBe(original);
  });
});
