import { render, screen, fireEvent, act, within } from "@testing-library/react";
import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";

// Mutable mocks used by the fake useSettings implementation below
let currentSettings = {
  lastOpenedProject: false,
  autoSave: { enabled: true, intervalMinutes: 3 },
  spellChecker: true,
};
const updateMock = vi.fn();
const updateAutoSaveMock = vi.fn();

// mock the provider hook so tests control settings & spies
vi.mock("../../providers/SettingsProvider", () => {
  return {
    useSettings: () => ({
      settings: currentSettings,
      update: updateMock,
      updateAutoSave: updateAutoSaveMock,
    }),
  };
});

// mock AnimatedToggle to a simple button which calls onChange(!checked)
vi.mock("../../components/AnimatedToggle/AnimatedToggle", () => {
  return {
    __esModule: true,
    default: ({ checked, onChange, ariaLabel }: any) => (
      <button
        data-testid={`toggle-${ariaLabel}`}
        onClick={() => onChange(!checked)}
      >
        {String(checked)}
      </button>
    ),
  };
});

// mock framer-motion as passthrough components to avoid animation internals
vi.mock("framer-motion", () => {
  return {
    motion: {
      div: (props: any) => <div {...props} />,
      button: (props: any) => <button {...props} />,
    },
  };
});

// Import the component under test AFTER mocks above
import SettingsButton from "./SettingsButton";

beforeEach(() => {
  // reset mocks and default settings for each test
  updateMock.mockReset();
  updateAutoSaveMock.mockReset();
  currentSettings = {
    lastOpenedProject: false,
    autoSave: { enabled: true, intervalMinutes: 3 },
    spellChecker: true,
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SettingsButton", () => {
  it("renders the Settings button and menu is initially hidden", () => {
    render(<SettingsButton />);
    const btn = screen.getByRole("button", { name: /Settings/i });
    expect(btn).toBeInTheDocument();

    // menu exists in DOM but aria-hidden should be "true" when closed
    const menu = screen.getByRole("menu", { hidden: true });
    expect(menu).toHaveAttribute("aria-hidden", "true");
  });

  it("opens menu on click and shows sections", () => {
    render(<SettingsButton />);
    const btn = screen.getByRole("button", { name: /Settings/i });
    fireEvent.click(btn);

    // when open, role queries should find it (aria-hidden="false")
    const menu = screen.getByRole("menu");
    expect(menu).toHaveAttribute("aria-hidden", "false");

    // check presence of titles/labels inside (use within(menu) to scope)
    const w = within(menu);
    // exact heading-like title "Open last project at startup"
    expect(w.getByText(/Open last project at startup/i)).toBeInTheDocument();
    expect(w.getByText(/Automatic saving/i)).toBeInTheDocument();

    // "Spell checker" appears both as title and inside a longer description; select the title exactly
    const spellMatches = w.getAllByText(/Spell checker/i);
    // ensure at least one match exists
    expect(spellMatches.length).toBeGreaterThanOrEqual(1);
    // ensure there exists an element whose textContent equals the short title (trimmed)
    const hasExactTitle = spellMatches.some(
      (el) => el.textContent?.trim().toLowerCase() === "spell checker",
    );
    expect(hasExactTitle).toBe(true);

    // interval input reflects settings (spinbutton role)
    const numInput = w.getByRole("spinbutton") as HTMLInputElement;
    expect(numInput.value).toBe(
      String(currentSettings.autoSave.intervalMinutes),
    );
  });

  it("clicking outside closes the menu", () => {
    render(<SettingsButton />);
    fireEvent.click(screen.getByRole("button", { name: /Settings/i }));
    // menu open
    expect(screen.getByRole("menu")).toHaveAttribute("aria-hidden", "false");

    // simulate click outside (target = document.body)
    act(() => {
      document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });

    // menu should be closed; query hidden allowed
    expect(screen.getByRole("menu", { hidden: true })).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("pressing Escape closes the menu", () => {
    render(<SettingsButton />);
    fireEvent.click(screen.getByRole("button", { name: /Settings/i }));
    expect(screen.getByRole("menu")).toHaveAttribute("aria-hidden", "false");

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });

    expect(screen.getByRole("menu", { hidden: true })).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("toggling 'Open last project at startup' calls update with proper value", () => {
    render(<SettingsButton />);
    fireEvent.click(screen.getByRole("button", { name: /Settings/i }));

    const toggle = screen.getByTestId("toggle-Open last project at startup");
    // initial checked false -> clicking will call update with true
    fireEvent.click(toggle);
    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledWith({ lastOpenedProject: true });
  });

  it("toggling AutoSave enabled calls updateAutoSave", () => {
    render(<SettingsButton />);
    fireEvent.click(screen.getByRole("button", { name: /Settings/i }));

    const toggle = screen.getByTestId("toggle-Enable automatic saving");
    fireEvent.click(toggle);
    expect(updateAutoSaveMock).toHaveBeenCalledTimes(1);
    // toggling from true -> onChange called with false
    expect(updateAutoSaveMock).toHaveBeenCalledWith({ enabled: false });
  });

  it("changing interval input calls updateAutoSave with sanitized value", () => {
    render(<SettingsButton />);
    fireEvent.click(screen.getByRole("button", { name: /Settings/i }));

    const numInput = screen.getByRole("spinbutton") as HTMLInputElement;
    // change to 10
    fireEvent.change(numInput, { target: { value: "10" } });

    expect(updateAutoSaveMock).toHaveBeenCalledTimes(1);
    expect(updateAutoSaveMock).toHaveBeenCalledWith({ intervalMinutes: 10 });
  });

  it("number input is disabled when autoSave.enabled is false (and we don't programmatically assert change)", () => {
    // set initial settings with autoSave disabled
    currentSettings = {
      lastOpenedProject: false,
      autoSave: { enabled: false, intervalMinutes: 5 },
      spellChecker: true,
    };

    render(<SettingsButton />);
    fireEvent.click(screen.getByRole("button", { name: /Settings/i }));

    const numInput = screen.getByRole("spinbutton") as HTMLInputElement;
    expect(numInput).toBeDisabled();

    // Do NOT call fireEvent.change on a disabled input (programmatic change bypasses browser constraints).
    // Instead just assert that the updateAutoSave was not called so far.
    expect(updateAutoSaveMock).not.toHaveBeenCalled();
  });

  it("toggling Spellchecker calls update", () => {
    render(<SettingsButton />);
    fireEvent.click(screen.getByRole("button", { name: /Settings/i }));

    const toggle = screen.getByTestId("toggle-Enable spell checker");
    fireEvent.click(toggle);

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledWith({ spellChecker: false });
  });

  it("clicking CLOSE button closes the menu", () => {
    render(<SettingsButton />);
    fireEvent.click(screen.getByRole("button", { name: /Settings/i }));

    // the CLOSE button is rendered inside the motion.div; locate by exact text
    const closeBtn = screen.getByText(/^CLOSE$/i);
    fireEvent.click(closeBtn);

    // closed -> menu hidden (allow hidden)
    expect(screen.getByRole("menu", { hidden: true })).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
