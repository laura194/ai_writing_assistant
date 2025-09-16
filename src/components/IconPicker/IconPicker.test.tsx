import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IconPicker from "./IconPicker";
import { vi } from "vitest";

vi.mock("framer-motion", async () => {
  const ReactPkg = await import("react");
  return {
    motion: {
      button: (props: any) => ReactPkg.createElement("button", props),
      div: (props: any) => {
        const { layoutId, children, ...rest } = props || {};
        const attrs = layoutId ? { "data-layout-id": layoutId } : {};
        return ReactPkg.createElement("div", { ...attrs, ...rest }, children);
      },
    },
  };
});

describe("IconPicker", () => {
  test("rendert 4 Icon-Buttons", () => {
    render(<IconPicker onSelect={() => {}} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);
  });

  test("when is clicked, 'onSelect' will be called with icon-name ", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<IconPicker onSelect={onSelect} />);

    const codeButton = screen.getByTitle(/Category: Code Section/i);
    await user.click(codeButton);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("code");
  });

  test("correctly marking the current selected Icon (currentIcon)", () => {
    render(<IconPicker currentIcon="image" onSelect={() => {}} />);

    const activeDiv = document.querySelector(
      '[data-layout-id="activeIconBackground"]'
    );
    expect(activeDiv).toBeInTheDocument();

    const imageButton = screen.getByTitle(/Category: Image Section/i);
    expect(imageButton).toBeInTheDocument();
  });

  test('when no currentIcon given, then "text" is active', () => {
    render(<IconPicker onSelect={() => {}} />);
    const activeDiv = document.querySelector(
      '[data-layout-id="activeIconBackground"]'
    );
    expect(activeDiv).toBeInTheDocument();

    const textButton = screen.getByTitle(/Category: Text Section/i);
    expect(textButton).toBeInTheDocument();
  });
});

describe("IconPicker Additional Mutation Coverage", () => {
  const icons = ["text", "list", "code", "image"] as const;

  icons.forEach((iconName) => {
    test(`active icon "${iconName}" renders correctly`, () => {
      render(<IconPicker currentIcon={iconName} onSelect={() => {}} />);

      const activeDiv = document.querySelector(
        '[data-layout-id="activeIconBackground"]'
      );
      expect(activeDiv).toBeInTheDocument();

      const button = screen.getByTitle(
        new RegExp(`Category: ${iconName}`, "i")
      );
      expect(button).toBeInTheDocument();

      // Check that only this button is "active"
      const buttons = screen.getAllByRole("button");
      buttons.forEach((btn) => {
        if (btn === button) {
          expect(btn.className).toMatch(/border-2 border-white/);
        } else {
          expect(btn.className).toMatch(/border border-transparent/);
        }
      });
    });
  });

  test("click through all icons and verify currentIcon", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<IconPicker onSelect={onSelect} />);

    const buttons = screen.getAllByRole("button");
    for (const button of buttons) {
      await user.click(button);
    }

    expect(onSelect).toHaveBeenCalledTimes(4);
    expect(onSelect).toHaveBeenCalledWith("text");
    expect(onSelect).toHaveBeenCalledWith("list");
    expect(onSelect).toHaveBeenCalledWith("code");
    expect(onSelect).toHaveBeenCalledWith("image");
  });

  test("explicitly undefined currentIcon defaults to 'text'", () => {
    render(<IconPicker currentIcon={undefined} onSelect={() => {}} />);
    const activeDiv = document.querySelector(
      '[data-layout-id="activeIconBackground"]'
    );
    expect(activeDiv).toBeInTheDocument();
    const textButton = screen.getByTitle(/Category: Text Section/i);
    expect(textButton).toBeInTheDocument();
  });

  test("clicking a button without currentIcon triggers onSelect", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<IconPicker onSelect={onSelect} />);

    const firstButton = screen.getAllByRole("button")[0];
    await user.click(firstButton);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("text");
  });
});
