import { render, screen } from "@testing-library/react";
import Spinner from "./Spinner";

describe("Spinner Unit Tests", () => {
  test("renders the overlay div with correct classes", () => {
    render(<Spinner />);
    const overlay =
      screen.getByRole("presentation", { hidden: true }) ||
      document.querySelector("div");
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass(
      "fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-60"
    );
  });

  test("renders svg with animate-spin class and correct size", () => {
    render(<Spinner />);
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "100");
    expect(svg).toHaveAttribute("height", "100");
    expect(svg).toHaveClass("animate-spin");
  });

  test("svg contains defs and linearGradient", () => {
    render(<Spinner />);
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();

    const defs = svg?.querySelector("defs");
    expect(defs).toBeInTheDocument();

    const gradient = defs?.querySelector("linearGradient");
    expect(gradient).toBeInTheDocument();
    expect(gradient).toHaveAttribute("id", "gradient");
  });

  test("renders circle with gradient stroke and correct attributes", () => {
    render(<Spinner />);
    const circle = document.querySelector("circle");
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveAttribute("cx", "50");
    expect(circle).toHaveAttribute("cy", "50");
    expect(circle).toHaveAttribute("r", "40");
    expect(circle).toHaveAttribute("stroke", "url(#gradient)");
    expect(circle).toHaveAttribute("stroke-width", "10");
    expect(circle).toHaveAttribute("fill", "none");
    expect(circle).toHaveAttribute("stroke-linecap", "round");
  });
});

describe("Spinner Mutation Tests", () => {
  test("renders correctly if gradient stops are present", () => {
    render(<Spinner />);
    const stops = document.querySelectorAll("stop");
    expect(stops.length).toBe(3);
    expect(stops[0]).toHaveAttribute("stop-color", "#7c3aed");
    expect(stops[1]).toHaveAttribute("stop-color", "#db2777");
    expect(stops[2]).toHaveAttribute("stop-color", "#facc15");
  });

  test("svg still renders if defs or gradient are missing", () => {
    render(<Spinner />);
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
    const circle = svg?.querySelector("circle");
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveAttribute("stroke", "url(#gradient)");
  });

  test("overlay div remains present in the document", () => {
    render(<Spinner />);
    const overlay = document.querySelector("div");
    expect(overlay).toBeInTheDocument();
  });
});
