import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BottomNavigationBar from "./BottomNavigationBar";
import { vi } from "vitest";

describe("BottomNavigationBar Unit Tests", () => {
  const onChangeViewMock = vi.fn();

  beforeEach(() => {
    onChangeViewMock.mockClear();
  });

  test("renders all three buttons", () => {
    render(
      <BottomNavigationBar
        activeView="ai"
        onChangeView={onChangeViewMock}
        menuOpen={false}
      />
    );

    expect(screen.getByTitle(/AI Protocol/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Full Document View/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Contribution View/i)).toBeInTheDocument();
  });

  test("active button receives correct classes", () => {
    render(
      <BottomNavigationBar
        activeView="fullDocument"
        onChangeView={onChangeViewMock}
        menuOpen={false}
      />
    );

    const activeButton = screen.getByTitle(/Full Document View/i);
    expect(activeButton.className).toMatch(/bg-gradient-to-tr/);

    const inactiveButton = screen.getByTitle(/AI Protocol/i);
    expect(inactiveButton.className).not.toMatch(/bg-gradient-to-tr/);
  });

  test("clicking a button calls onChangeView with the correct value", async () => {
    const user = userEvent.setup();

    render(
      <BottomNavigationBar
        activeView="ai"
        onChangeView={onChangeViewMock}
        menuOpen={false}
      />
    );

    const contributionButton = screen.getByTitle(/Contribution View/i);
    await user.click(contributionButton);

    expect(onChangeViewMock).toHaveBeenCalledTimes(1);
    expect(onChangeViewMock).toHaveBeenCalledWith("contribution");
  });

  test("menuOpen true applies the correct container class", () => {
    const { container } = render(
      <BottomNavigationBar
        activeView="ai"
        onChangeView={onChangeViewMock}
        menuOpen={true}
      />
    );

    expect(container.firstChild).toHaveClass("flex justify-around");
  });

  test("menuOpen false applies the correct container class", () => {
    const { container } = render(
      <BottomNavigationBar
        activeView="ai"
        onChangeView={onChangeViewMock}
        menuOpen={false}
      />
    );

    expect(container.firstChild).toHaveClass("flex flex-col items-center");
  });
});

describe("BottomNavigationBar Mutation Coverage Tests", () => {
  const views = ["ai", "fullDocument", "contribution"] as const;

  views.forEach((activeView) => {
    test(`renders correctly with activeView="${activeView}"`, () => {
      const onChangeViewMock = vi.fn();
      render(
        <BottomNavigationBar
          activeView={activeView}
          onChangeView={onChangeViewMock}
          menuOpen={false}
        />
      );

      views.forEach((view) => {
        const button = screen.getByTitle(
          view === "ai"
            ? /AI Protocol/i
            : view === "fullDocument"
              ? /Full Document View/i
              : /Contribution View/i
        );

        if (view === activeView) {
          expect(button.className).toMatch(/bg-gradient-to-tr/);
        } else {
          expect(button.className).not.toMatch(/bg-gradient-to-tr/);
        }
      });
    });
  });

  test("clicking each button calls onChangeView with correct value", async () => {
    const user = userEvent.setup();
    const onChangeViewMock = vi.fn();
    render(
      <BottomNavigationBar
        activeView="ai"
        onChangeView={onChangeViewMock}
        menuOpen={false}
      />
    );

    const aiButton = screen.getByTitle(/AI Protocol/i);
    const fullButton = screen.getByTitle(/Full Document View/i);
    const contributionButton = screen.getByTitle(/Contribution View/i);

    await user.click(aiButton);
    await user.click(fullButton);
    await user.click(contributionButton);

    expect(onChangeViewMock).toHaveBeenCalledTimes(3);
    expect(onChangeViewMock).toHaveBeenCalledWith("ai");
    expect(onChangeViewMock).toHaveBeenCalledWith("fullDocument");
    expect(onChangeViewMock).toHaveBeenCalledWith("contribution");
  });

  test("renders correctly when menuOpen is true", () => {
    const onChangeViewMock = vi.fn();
    const { container } = render(
      <BottomNavigationBar
        activeView="ai"
        onChangeView={onChangeViewMock}
        menuOpen={true}
      />
    );
    expect(container.firstChild).toHaveClass("flex justify-around");
  });

  test("renders correctly when menuOpen is false", () => {
    const onChangeViewMock = vi.fn();
    const { container } = render(
      <BottomNavigationBar
        activeView="ai"
        onChangeView={onChangeViewMock}
        menuOpen={false}
      />
    );
    expect(container.firstChild).toHaveClass("flex flex-col items-center");
  });
});
