import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AIBubble from "./AIBubble";

describe("AIBubble Unit Tests", () => {
  const position = { x: 50, y: 100 };
  const onClickMock = vi.fn();

  beforeEach(() => {
    onClickMock.mockClear();
  });

  test("renders the div with correct position", () => {
    render(<AIBubble position={position} onClick={onClickMock} />);

    const bubbleDiv = screen.getByTitle(
      /Ask the AI about the highlighted selection/i,
    );
    expect(bubbleDiv).toBeInTheDocument();

    expect(bubbleDiv).toHaveStyle({
      top: `${position.y}px`,
      left: `${position.x}px`,
    });
  });

  test("renders the inner span and icon", () => {
    render(<AIBubble position={position} onClick={onClickMock} />);

    const innerSpan = screen.getByText((_, element) => {
      return element?.tagName.toLowerCase() === "span";
    });
    expect(innerSpan).toBeInTheDocument();

    const atomIcon = innerSpan.querySelector("svg");
    expect(atomIcon).toBeInTheDocument();
    expect(atomIcon).toHaveClass("lucide-atom");
  });

  test("clicking the div calls onClick", async () => {
    const user = userEvent.setup();
    render(<AIBubble position={position} onClick={onClickMock} />);

    const bubbleDiv = screen.getByTitle(
      /Ask the AI about the highlighted selection/i,
    );
    await user.click(bubbleDiv);

    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});

describe("AIBubble Mutation Coverage Tests", () => {
  const positions = [
    { x: 10, y: 20 },
    { x: 50, y: 100 },
    { x: 0, y: 0 },
  ];

  positions.forEach((pos) => {
    test(`renders bubble correctly at position x:${pos.x}, y:${pos.y}`, () => {
      const onClickMock = vi.fn();
      render(<AIBubble position={pos} onClick={onClickMock} />);

      const bubbleDiv = screen.getByTitle(
        /Ask the AI about the highlighted selection/i,
      );
      expect(bubbleDiv).toBeInTheDocument();
      expect(bubbleDiv).toHaveStyle({
        top: `${pos.y}px`,
        left: `${pos.x}px`,
      });

      expect(bubbleDiv.className).toContain("absolute");
      expect(bubbleDiv.className).toContain("cursor-pointer");
    });
  });

  test("clicking the bubble calls onClick", async () => {
    const user = userEvent.setup();
    const onClickMock = vi.fn();
    render(<AIBubble position={{ x: 0, y: 0 }} onClick={onClickMock} />);

    const bubbleDiv = screen.getByTitle(
      /Ask the AI about the highlighted selection/i,
    );
    await user.click(bubbleDiv);
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  test("inner span and icon exist", () => {
    render(<AIBubble position={{ x: 0, y: 0 }} onClick={() => {}} />);

    const innerSpan = screen.getByText(
      (_, element) => element?.tagName === "SPAN",
    );
    expect(innerSpan).toBeInTheDocument();

    const atomIcon = innerSpan.querySelector("svg");
    expect(atomIcon).toBeInTheDocument();
    expect(atomIcon).toHaveClass("lucide-atom");
  });

  test("testing different onClick functions", async () => {
    const user = userEvent.setup();
    const spy1 = vi.fn();
    const spy2 = vi.fn();

    render(<AIBubble position={{ x: 1, y: 1 }} onClick={spy1} />);
    render(<AIBubble position={{ x: 2, y: 2 }} onClick={spy2} />);

    const allBubbles = screen.getAllByTitle(/Ask the AI/i);
    await user.click(allBubbles[0]);
    await user.click(allBubbles[1]);

    expect(spy1).toHaveBeenCalledTimes(1);
    expect(spy2).toHaveBeenCalledTimes(1);
  });
});
