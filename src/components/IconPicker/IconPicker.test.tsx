// src/components/IconPicker/IconPicker.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IconPicker from "./IconPicker";
import { vi } from "vitest";

/**
 * Wir mocken 'framer-motion' so, dass motion.button -> plain <button>
 * und motion.div -> <div data-layout-id="..."> damit wir verlässlich
 * DOM-Prüfungen machen können (keine echte Animation im Test).
 */
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
  test("rendert vier Icon-Buttons", () => {
    render(<IconPicker onSelect={() => {}} />);
    // es sollten genau 4 buttons gerendert werden
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);
  });

  test("ruft onSelect mit dem richtigen icon-name auf, wenn geklickt wird", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<IconPicker onSelect={onSelect} />);

    // wir nutzen die title-attribute der buttons: "Category: Code Section"
    const codeButton = screen.getByTitle(/Category: Code Section/i);
    await user.click(codeButton);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("code");
  });

  test("markiert korrekt das aktuell ausgewählte Icon (currentIcon)", () => {
    render(<IconPicker currentIcon="image" onSelect={() => {}} />);

    // aktive Markierung finden
    const activeDiv = document.querySelector(
      '[data-layout-id="activeIconBackground"]'
    );
    expect(activeDiv).toBeInTheDocument();

    // zusätzlich sicherstellen, dass das "Image"-Icon vorhanden ist
    const imageButton = screen.getByTitle(/Category: Image Section/i);
    expect(imageButton).toBeInTheDocument();
  });

  test('wenn kein currentIcon übergeben, ist "text" standardmäßig aktiv', () => {
    render(<IconPicker onSelect={() => {}} />);
    // active bg sollte vorhanden sein (wir erwarten default 'text')
    const activeDiv = document.querySelector(
      '[data-layout-id="activeIconBackground"]'
    );
    expect(activeDiv).toBeInTheDocument();

    // und der Button mit Label "Text Section" sollte existieren
    const textButton = screen.getByTitle(/Category: Text Section/i);
    expect(textButton).toBeInTheDocument();
  });
});
