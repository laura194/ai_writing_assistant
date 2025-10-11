import { render, screen, fireEvent, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { SettingsProvider, useSettings } from "./SettingsProvider";

const STORAGE_KEY = "appSettings";

function TestConsumer() {
  const { settings, update, updateAutoSave } = useSettings();

  return (
    <div>
      <div data-testid="json">{JSON.stringify(settings)}</div>

      <button
        data-testid="btn-set-last-opened"
        onClick={() => update({ lastOpenedProject: true })}
      >
        set-last
      </button>

      <button
        data-testid="btn-set-autosave-interval"
        onClick={() => updateAutoSave({ intervalMinutes: 10 })}
      >
        set-interval
      </button>

      <button
        data-testid="btn-disable-autosave"
        onClick={() =>
          update({ autoSave: { enabled: false, intervalMinutes: 3 } })
        }
      >
        disable-autosave
      </button>
    </div>
  );
}

function createMockLocalStorage({
  throwOnGet = false,
  throwOnSet = false,
  initial = new Map<string, string>(),
} = {}) {
  const store = new Map(initial);
  return {
    getItem: vi.fn((k: string) => {
      if (throwOnGet) throw new Error("getItem failure");
      return store.has(k) ? (store.get(k) as string) : null;
    }),
    setItem: vi.fn((k: string, v: string) => {
      if (throwOnSet) throw new Error("setItem failure");
      store.set(k, v);
    }),
    removeItem: vi.fn((k: string) => store.delete(k)),
    clear: vi.fn(() => store.clear()),
    // helper to inspect final store from tests
    __store: store,
  };
}

describe("SettingsProvider", () => {
  let realLocalStorage: Storage | undefined;

  beforeEach(() => {
    realLocalStorage = (global as any).localStorage;
  });

  afterEach(() => {
    // restore real localStorage
    (global as any).localStorage = realLocalStorage;
    vi.restoreAllMocks();
  });

  it("useSettings throws when used outside SettingsProvider", () => {
    const Outside = () => {
      useSettings();
      return <div>outside</div>;
    };

    expect(() => render(<Outside />)).toThrowError(
      "useSettings must be used inside SettingsProvider",
    );
  });

  it("provides default settings when no localStorage key exists", () => {
    const mockLS = createMockLocalStorage();
    (global as any).localStorage = mockLS;

    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>,
    );

    const json = screen.getByTestId("json").textContent ?? "";
    const parsed = JSON.parse(json);

    expect(parsed.lastOpenedProject).toBe(false);
    expect(parsed.autoSave.enabled).toBe(true);
    expect(parsed.autoSave.intervalMinutes).toBe(3);
    expect(parsed.spellChecker).toBe(true);
  });

  it("loads settings from localStorage and merges with defaults", () => {
    const stored = {
      lastOpenedProject: true,
      autoSave: { enabled: false, intervalMinutes: 7 },
    };
    const initial = new Map<string, string>([
      [STORAGE_KEY, JSON.stringify(stored)],
    ]);
    const mockLS = createMockLocalStorage({ initial });
    (global as any).localStorage = mockLS;

    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>,
    );

    const parsed = JSON.parse(screen.getByTestId("json").textContent ?? "{}");
    expect(parsed.lastOpenedProject).toBe(true);
    expect(parsed.autoSave.enabled).toBe(false);
    expect(parsed.autoSave.intervalMinutes).toBe(7);
    expect(parsed.spellChecker).toBe(true);
  });

  it("falls back to defaults if localStorage contains invalid JSON", () => {
    const initial = new Map<string, string>([[STORAGE_KEY, "not-a-json"]]);
    const mockLS = createMockLocalStorage({ initial });
    (global as any).localStorage = mockLS;

    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>,
    );

    const parsed = JSON.parse(screen.getByTestId("json").textContent ?? "{}");
    expect(parsed.lastOpenedProject).toBe(false);
    expect(parsed.autoSave.enabled).toBe(true);
    expect(parsed.autoSave.intervalMinutes).toBe(3);
    expect(parsed.spellChecker).toBe(true);
  });

  it("update(...) merges patch and persists to localStorage via setItem", async () => {
    const mockLS = createMockLocalStorage();
    (global as any).localStorage = mockLS;

    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>,
    );

    // initial: default lastOpenedProject false
    expect(
      JSON.parse(screen.getByTestId("json").textContent ?? "{}")
        .lastOpenedProject,
    ).toBe(false);

    await act(async () => {
      fireEvent.click(screen.getByTestId("btn-set-last-opened"));
    });

    expect(mockLS.setItem).toHaveBeenCalled();
    const storedArg = (mockLS.setItem as any).mock.calls.slice(-1)[0][1];
    const storedParsed = JSON.parse(storedArg);
    expect(storedParsed.lastOpenedProject).toBe(true);

    expect(
      JSON.parse(screen.getByTestId("json").textContent ?? "{}")
        .lastOpenedProject,
    ).toBe(true);
  });

  it("updateAutoSave(...) merges nested autoSave fields and persists", async () => {
    const mockLS = createMockLocalStorage();
    (global as any).localStorage = mockLS;

    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>,
    );

    // initial intervalMinutes = 3
    expect(
      JSON.parse(screen.getByTestId("json").textContent ?? "{}").autoSave
        .intervalMinutes,
    ).toBe(3);

    await act(async () => {
      fireEvent.click(screen.getByTestId("btn-set-autosave-interval"));
    });

    // check persisted value
    expect(mockLS.setItem).toHaveBeenCalled();
    const saved = JSON.parse(
      (mockLS.setItem as any).mock.calls.slice(-1)[0][1],
    );
    expect(saved.autoSave.intervalMinutes).toBe(10);

    // UI updated
    expect(
      JSON.parse(screen.getByTestId("json").textContent ?? "{}").autoSave
        .intervalMinutes,
    ).toBe(10);
  });

  it("update can replace nested autoSave when provided as whole object", async () => {
    const mockLS = createMockLocalStorage();
    (global as any).localStorage = mockLS;

    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("btn-disable-autosave"));
    });

    const saved = JSON.parse(
      (mockLS.setItem as any).mock.calls.slice(-1)[0][1],
    );
    expect(saved.autoSave.enabled).toBe(false);
    expect(saved.autoSave.intervalMinutes).toBe(3);

    expect(
      JSON.parse(screen.getByTestId("json").textContent ?? "{}").autoSave
        .enabled,
    ).toBe(false);
  });

  it("gracefully handles localStorage.setItem throwing (logs a warning)", async () => {
    const mockLS = createMockLocalStorage({ throwOnSet: true });
    (global as any).localStorage = mockLS;

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("btn-set-last-opened"));
    });

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Could not persist settings"),
      expect.any(Error),
    );

    warnSpy.mockRestore();
  });
});
