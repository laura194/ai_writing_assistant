import { useEffect, useState, useRef } from "react";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { useSettings } from "../../providers/SettingsProvider";
import AnimatedToggle from "../../components/AnimatedToggle/AnimatedToggle";
import { motion } from "framer-motion";

export const SettingsButton = () => {
  const { settings, update, updateAutoSave } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const t = e.target as Node | null;
      if (t && !containerRef.current.contains(t)) setIsOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative flex items-center gap-1">
      <Cog6ToothIcon className="h-5 w-5 text-[#473885] dark:text-[#c4b5fd]" />
      <button
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
        className="text-sm text-[#261e3b] dark:text-[#afa6c5] cursor-pointer hover:text-[#9c85d4] dark:hover:text-[#ffffff] transition-colors duration-150 font-medium"
      >
        Settings
      </button>

      <div
        role="menu"
        aria-hidden={!isOpen}
        className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 w-[90vw] max-w-md bg-[#e7e3f6] dark:bg-[#1e1538] border border-[#aca0d6] dark:border-[#32265b] rounded-xl shadow-[0_2px_50px_rgba(0,0,0,0.3)] p-4 z-50 transition-all duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <h3 className="text-lg font-bold mb-3 text-[#261e3b] dark:text-[#c2bad8]">
          Settings
        </h3>

        {/* Last opened project */}
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="font-medium text-sm text-[#261e3b] dark:text-[#d7cfef] mb-0.5">
              Open last project at startup
            </div>
            <div className="text-xs text-[#444] dark:text-[#9c91b9]">
              When enabled, the last opened project will be automatically opened
              when the application starts. This feature can be useful for
              quickly accessing your most recently used projects.
            </div>
          </div>
          <AnimatedToggle
            checked={settings.lastOpenedProject}
            onChange={(next) => update({ lastOpenedProject: next })}
            ariaLabel="Open last project at startup"
            size="md"
          />
        </div>

        <hr className="my-3 border-t-[#d9d2f5] dark:border-t-[#2b2346]" />

        {/* AutoSave */}
        <div className="py-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm text-[#261e3b] dark:text-[#d7cfef] mb-0.5">
                Automatic saving
              </div>
              <div className="text-xs text-[#444] dark:text-[#9c91b9]">
                When enabled, the project will be saved automatically
              </div>
            </div>
            <AnimatedToggle
              checked={settings.autoSave.enabled}
              onChange={(next) => updateAutoSave({ enabled: next })}
              ariaLabel="Enable automatic saving"
              size="md"
            />
          </div>

          <div className="mt-3 flex items-center">
            <label className="text-sm text-[#261e3b] dark:text-[#d7cfef]">
              Save interval:
            </label>
            <input
              type="number"
              min={1}
              disabled={!settings.autoSave.enabled}
              value={settings.autoSave.intervalMinutes}
              onChange={(e) => {
                const val = Math.max(1, Number(e.target.value || 1));
                updateAutoSave({ intervalMinutes: val });
              }}
              className={`
  w-14 px-2 py-1 rounded-md text-sm ml-3 mr-1.5
  ${
    settings.autoSave.enabled
      ? `bg-white dark:bg-[#2a213f] 
       border border-[#cfc6f6] dark:border-[#3a335a]
       focus-visible:outline-none
       focus-visible:ring-2 focus-visible:ring-purple-300
       dark:focus-visible:ring-purple-600
       focus-visible:ring-offset-2
       focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#2a213f]`
      : `bg-gray-100 dark:bg-neutral-800 
       border border-gray-200 dark:border-neutral-700 
       opacity-60 cursor-not-allowed`
  }
`}
            />
            <div className="text-sm text-[#372c59] dark:text-[#9c91b9]">
              Minutes
            </div>
          </div>
        </div>

        <hr className="my-3 border-t-[#d9d2f5] dark:border-t-[#2b2346]" />

        {/* Spellchecker */}
        <div className="py-2 flex items-center justify-between">
          <div>
            <div className="font-medium text-sm text-[#261e3b] dark:text-[#d7cfef] mb-0.5">
              Spell checker
            </div>
            <div className="text-xs text-[#444] dark:text-[#9c91b9]">
              When enabled, the spell checker will be enabled for English and
              German. This feature is useful for catching typos and grammar.
            </div>
          </div>
          <AnimatedToggle
            checked={settings.spellChecker}
            onChange={(next) => update({ spellChecker: next })}
            ariaLabel="Enable spell checker"
            size="md"
          />
        </div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(false)}
          title="Close and Save settings"
          className="
    relative flex justify-end mt-5
    px-0.5 py-0.5 rounded-md cursor-pointer
    transition-colors duration-200
    bg-[#d7c9f5] dark:bg-[#2e214b]
    hover:bg-[#b098e3] dark:hover:bg-[#443764]
    border border-[#b7a3ea]/40 dark:border-[#5c4a87]/40
    shadow-[0_0_10px_rgba(120,69,239,0.25)]
    dark:shadow-[0_0_10px_rgba(120,69,239,0.15)]
  "
        >
          <div
            className="
      w-full flex justify-center items-center text-lg font-bold tracking-wide
      py-1 rounded-md
      bg-[#e9e5f8] dark:bg-[#1e1538]
      text-[#665094] dark:text-[#a396c4]
      transition-colors duration-200
      hover:text-[#5622c9] dark:hover:text-[#faf8ff]
      border border-[#cbb9f3]/50 dark:border-[#3d2f5e]/50
    "
          >
            CLOSE
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsButton;
