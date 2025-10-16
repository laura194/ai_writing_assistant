import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { vi, beforeEach, describe, it, expect } from "vitest";

vi.mock("framer-motion", () => {
  // simple passthrough factory
  const passthrough = (el: any) => (props: any) =>
    React.createElement(el, props, props.children);
  return {
    motion: {
      button: passthrough("button"),
      div: passthrough("div"),
      span: passthrough("span"),
    },
  };
});

// Import component under test after mocking
import AnimatedToggle from "./AnimatedToggle";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AnimatedToggle", () => {
  it("renders with default props and accessibility attributes", () => {
    const onChange = vi.fn();
    render(<AnimatedToggle checked={false} onChange={onChange} />);

    // role switch with aria-checked false
    const btn = screen.getByRole("switch");
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute("aria-checked", "false");

    // default aria-label is "Toggle"
    expect(btn).toHaveAttribute("aria-label", "Toggle");
    // button is not disabled by default
    expect(btn).not.toBeDisabled();
  });

  it("renders provided ariaLabel and reflects checked=true", () => {
    const onChange = vi.fn();
    render(
      <AnimatedToggle
        checked={true}
        onChange={onChange}
        ariaLabel="My toggle"
      />,
    );

    const btn = screen.getByRole("switch");
    expect(btn).toHaveAttribute("aria-checked", "true");
    expect(btn).toHaveAttribute("aria-label", "My toggle");
  });

  it("calls onChange with inverse value when clicked", () => {
    const onChange = vi.fn();
    render(<AnimatedToggle checked={false} onChange={onChange} />);

    const btn = screen.getByRole("switch");
    fireEvent.click(btn);

    // clicked once -> should be called with true (inverse of false)
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("does not call onChange when disabled and has disabled attribute", () => {
    const onChange = vi.fn();
    render(<AnimatedToggle checked={false} onChange={onChange} disabled />);

    const btn = screen.getByRole("switch");
    expect(btn).toBeDisabled();

    fireEvent.click(btn);
    expect(onChange).not.toHaveBeenCalled();

    // pressing Enter or Space should also do nothing
    fireEvent.keyDown(btn, { key: "Enter", code: "Enter" });
    fireEvent.keyDown(btn, { key: " ", code: "Space" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("toggles via keyboard: Enter and Space call onChange", () => {
    const onChange = vi.fn();
    render(<AnimatedToggle checked={false} onChange={onChange} />);

    const btn = screen.getByRole("switch");

    // Enter key
    fireEvent.keyDown(btn, { key: "Enter", code: "Enter" });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);

    // Space key: use " " as key because the component checks for ' ' explicitly
    fireEvent.keyDown(btn, { key: " ", code: "Space" });
    expect(onChange).toHaveBeenCalledTimes(2);

    // Note: AnimatedToggle is controlled and uses the provided `checked` prop for each event,
    // therefore both Enter and Space will call onChange(!checked) where `checked` is still the original prop.
    // Since we rendered with checked={false}, both calls should pass `true`.
    expect(onChange).toHaveBeenLastCalledWith(true);
  });

  it("does not toggle for unrelated keys", () => {
    const onChange = vi.fn();
    render(<AnimatedToggle checked={false} onChange={onChange} />);

    const btn = screen.getByRole("switch");
    fireEvent.keyDown(btn, { key: "a", code: "KeyA" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("applies different size styles for sm, md, lg (track width check)", () => {
    const onChange = vi.fn();

    // sm
    const { unmount: unmountSm } = render(
      <AnimatedToggle checked={false} onChange={onChange} size="sm" />,
    );
    const btnSm = screen.getByRole("switch");
    // the first inner div used as the track is expected to have style.width set to 36px for sm
    const trackSm = btnSm.querySelector("div");
    expect(trackSm).toBeTruthy();
    expect(trackSm!.style.width).toContain("36");
    unmountSm();

    // md
    const { unmount: unmountMd } = render(
      <AnimatedToggle checked={false} onChange={onChange} size="md" />,
    );
    const btnMd = screen.getByRole("switch");
    const trackMd = btnMd.querySelector("div");
    expect(trackMd).toBeTruthy();
    expect(trackMd!.style.width).toContain("44");
    unmountMd();

    // lg
    render(<AnimatedToggle checked={false} onChange={onChange} size="lg" />);
    const btnLg = screen.getByRole("switch");
    const trackLg = btnLg.querySelector("div");
    expect(trackLg).toBeTruthy();
    expect(trackLg!.style.width).toContain("56");
  });
});
