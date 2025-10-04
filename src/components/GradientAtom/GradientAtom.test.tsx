import { render, screen } from "@testing-library/react";
import GradientAtomIcon from "./GradientAtom";

vi.mock("../../assets/images/atom.svg?react", () => ({
  __esModule: true,
  default: (props: any) => (
    <svg data-testid="atom-svg" {...props}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
}));

describe("GradientAtomIcon Unit Tests", () => {
  test("renders an outer svg with correct classes and viewBox", () => {
    const { container } = render(<GradientAtomIcon />);
    const outerSvg = container.querySelector("svg");
    expect(outerSvg).toBeInTheDocument();
    expect(outerSvg).toHaveClass("w-9 h-9");
    expect(outerSvg).toHaveAttribute("viewBox", "0 0 24 24");
  });

  test("renders a linearGradient definition with correct id and stops", () => {
    render(<GradientAtomIcon />);
    const gradient = document.querySelector("linearGradient");
    expect(gradient).toBeInTheDocument();

    const stops = gradient?.querySelectorAll("stop") ?? [];
    expect(stops.length).toBe(3);
    expect(stops[0]).toHaveAttribute("stop-color", "#8b5cf6");
    expect(stops[1]).toHaveAttribute("stop-color", "#ec4899");
    expect(stops[2]).toHaveAttribute("stop-color", "#facc15");
  });

  test("renders the AtomSvg child with correct props", () => {
    render(<GradientAtomIcon />);
    const atom = screen.getByTestId("atom-svg");
    expect(atom).toBeInTheDocument();
    expect(atom).toHaveClass("w-full h-full");
    expect(atom).toHaveStyle({ stroke: "url(#grad)" });
  });
});

describe("GradientAtomIcon Mutation-focused Tests", () => {
  test("gradient id matches the stroke url in AtomSvg", () => {
    render(<GradientAtomIcon />);
    const atom = screen.getByTestId("atom-svg");
    const gradient = document.querySelector("linearGradient");
    expect(gradient?.id).toBe("grad");
    expect(atom).toHaveStyle({ stroke: `url(#${gradient?.id})` });
  });

  test("outer svg contains defs before AtomSvg", () => {
    const { container } = render(<GradientAtomIcon />);
    const outerSvg = container.querySelector("svg");
    const atom = screen.getByTestId("atom-svg");
    const children = Array.from(outerSvg?.children ?? []);
    expect(children[0].tagName.toLowerCase()).toBe("defs");
    expect(children[1]).toBe(atom);
  });

  test("mutating stop offsets would break gradient (ensures offsets are tested)", () => {
    render(<GradientAtomIcon />);
    const stops = document.querySelectorAll("linearGradient stop");
    expect(stops[0]).toHaveAttribute("offset", "0%");
    expect(stops[1]).toHaveAttribute("offset", "50%");
    expect(stops[2]).toHaveAttribute("offset", "100%");
  });
});
