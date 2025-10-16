import React, { createContext, useContext, useEffect, useState } from "react";

export type Settings = {
  lastOpenedProject: boolean;
  autoSave: {
    enabled: boolean;
    intervalMinutes: number;
  };
  spellChecker: boolean;
};

type SettingsContextValue = {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  updateAutoSave: (patch: Partial<Settings["autoSave"]>) => void;
};

const DEFAULT: Settings = {
  lastOpenedProject: false,
  autoSave: { enabled: true, intervalMinutes: 3 },
  spellChecker: true,
};

const STORAGE_KEY = "appSettings";

const ctx = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT, ...parsed };
    } catch {
      return DEFAULT;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn("Could not persist settings", e);
    }
  }, [settings]);

  const update = (patch: Partial<Settings>) =>
    setSettings((s) => ({ ...s, ...patch }));
  const updateAutoSave = (patch: Partial<Settings["autoSave"]>) =>
    setSettings((s) => ({ ...s, autoSave: { ...s.autoSave, ...patch } }));

  return (
    <ctx.Provider value={{ settings, update, updateAutoSave }}>
      {children}
    </ctx.Provider>
  );
};

export const useSettings = (): SettingsContextValue => {
  const v = useContext(ctx);
  if (!v) throw new Error("useSettings must be used inside SettingsProvider");
  return v;
};
