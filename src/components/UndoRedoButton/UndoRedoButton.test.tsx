import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { vi } from "vitest";
import { UndoRedoButton } from "./UndoRedoButton";

describe("UndoRedoButton", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    // restore timers and mocks to avoid cross-test leakage
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("renders undo and redo buttons with correct aria labels and disabled state", () => {
    const { container } = render(
      <UndoRedoButton canUndo={true} canRedo={false} />
    );

    const undoBtn = screen.getByLabelText(/Undo — Ctrl\/Cmd \+ Z/i);
    const redoBtn = screen.getByLabelText(/Redo — Ctrl\/Cmd \+ Y/i);

    expect(undoBtn).toBeInTheDocument();
    expect(redoBtn).toBeInTheDocument();

    // aria-disabled should reflect boolean prop
    expect(undoBtn).toHaveAttribute("aria-disabled", "false");
    expect(redoBtn).toHaveAttribute("aria-disabled", "true");

    // and redo should include the "cursor-not-allowed" class (component uses it)
    expect(redoBtn.className).toEqual(
      expect.stringContaining("cursor-not-allowed")
    );

    // sanity: container contains both buttons
    expect(
      container.querySelectorAll('button[aria-label*="Undo —"]').length
    ).toBeGreaterThanOrEqual(1);
    expect(
      container.querySelectorAll('button[aria-label*="Redo —"]').length
    ).toBeGreaterThanOrEqual(1);
  });

  test("hover less than timeout does NOT show tooltip", () => {
    render(<UndoRedoButton canUndo={true} />);

    const undoBtn = screen.getByLabelText(/Undo — Ctrl\/Cmd \+ Z/i);
    const wrapper = undoBtn.closest("div")!;

    // start hover
    fireEvent.mouseEnter(wrapper);

    // advance less than 1500ms
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // tooltip must NOT be present
    expect(screen.queryByText("UNDO")).toBeNull();

    // cleanup
    fireEvent.mouseLeave(wrapper);
    act(() => {
      // allow any cleanup timers (if any)
      vi.advanceTimersByTime(100);
    });
  });

  test("clicking undo calls onUndo and clears timer (no tooltip after click)", () => {
    const onUndo = vi.fn();
    render(<UndoRedoButton canUndo={true} onUndo={onUndo} />);

    const undoBtn = screen.getByLabelText(/Undo — Ctrl\/Cmd \+ Z/i);
    const wrapper = undoBtn.closest("div")!;

    // start hover (timer started)
    fireEvent.mouseEnter(wrapper);

    // click before timer completed
    fireEvent.click(undoBtn);
    expect(onUndo).toHaveBeenCalledTimes(1);

    // advance beyond timeout -> tooltip must NOT appear because click cleared timer
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.queryByText("UNDO")).toBeNull();
  });

  test("clicking redo calls onRedo and clears timer (no tooltip after click)", () => {
    const onRedo = vi.fn();
    render(<UndoRedoButton canRedo={true} onRedo={onRedo} />);

    const redoBtn = screen.getByLabelText(/Redo — Ctrl\/Cmd \+ Y/i);
    const wrapper = redoBtn.closest("div")!;

    fireEvent.mouseEnter(wrapper);
    fireEvent.click(redoBtn);

    expect(onRedo).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.queryByText("REDO")).toBeNull();
  });

  test("className prop is applied to outer container", () => {
    const { container } = render(<UndoRedoButton className="my-test-class" />);

    // component wraps both buttons in a root div that should include supplied className
    const found = container.querySelector(".my-test-class");
    expect(found).toBeTruthy();
    expect(found?.className).toEqual(expect.stringContaining("my-test-class"));
  });

  test("unmount clears pending timer (no tooltip after unmount)", () => {
    const { unmount } = render(<UndoRedoButton canUndo={true} />);

    const undoBtn = screen.getByLabelText(/Undo — Ctrl\/Cmd \+ Z/i);
    const wrapper = undoBtn.closest("div")!;

    fireEvent.mouseEnter(wrapper);

    // unmount before timer fires
    unmount();

    // advance timers — should not throw and tooltip should not be present
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByText("UNDO")).toBeNull();
  });

  test("hovering different buttons updates hovered state and shows correct tooltip", () => {
    render(<UndoRedoButton canUndo={true} canRedo={true} />);

    const undoBtn = screen.getByLabelText(/Undo — Ctrl\/Cmd \+ Z/i);
    const redoBtn = screen.getByLabelText(/Redo — Ctrl\/Cmd \+ Y/i);

    const undoWrapper = undoBtn.closest("div")!;
    const redoWrapper = redoBtn.closest("div")!;

    // hover undo -> show undo tooltip
    fireEvent.mouseEnter(undoWrapper);
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByText("UNDO")).toBeInTheDocument();

    // move to redo: leave undo, enter redo (timer restarts)
    fireEvent.mouseLeave(undoWrapper);
    fireEvent.mouseEnter(redoWrapper);

    // advance less than full timeout: no redo tooltip yet
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByText("REDO")).toBeNull();

    // advance remainder -> should show redo tooltip
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(screen.getByText("REDO")).toBeInTheDocument();
  });
});
