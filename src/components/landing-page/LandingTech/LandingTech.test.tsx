import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import React from "react";
import { render } from "../../../../test/renderWithProviders";

vi.mock("../../hoc", () => ({
  __esModule: true,
  SectionWrapper: (Comp: React.FC, _id: string) => () => <Comp />,
}));

vi.mock("./canvas/BallCanvas", () => ({
  __esModule: true,
  default: ({ icon }: { icon: string }) => (
    <div data-testid="ball-canvas" data-icon={icon} />
  ),
}));

// Fix virtual imports for wrapper
vi.mock("../../hoc", () => ({
  __esModule: true,
  SectionWrapper: (C: any) => C,
}));

import Tech from "./LandingTech";
import { technologies } from "../../../constants/LandingPageText";

describe("LandingTech", () => {
  it("renders a BallCanvas for each technology with correct icon", () => {
    render(<Tech />);

    const balls = screen.getAllByTestId("ball-canvas");
    expect(balls).toHaveLength(technologies.length);
    balls.forEach((el, idx) => {
      expect(el).toHaveAttribute("data-icon", technologies[idx].icon);
    });
  });
});
