import { useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../providers/ThemeProvider";

export default function ThemeToggleButton({
  className = "",
}: {
  className?: string;
}) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    try {
      let meta = document.querySelector(
        'meta[name="theme-color"]'
      ) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "theme-color";
        document.head.appendChild(meta);
      }
      meta.content = isDark ? "#090325" : "#ffffff";
    } catch (e) {
      console.error("Cant switch Theme Color: ", e);
    }
  }, [isDark]);

  return (
    <button
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={isDark ? "Change to Light Mode" : "Change to Dark Mode"}
      title={isDark ? "Light Mode" : "Dark Mode"}
      className={`relative inline-flex items-center p-3 rounded-full focus:outline-none focus:ring-[#7c3aed] ${className} cursor-pointer`}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`relative h-9 w-20 rounded-full transition-colors duration-300
           ${
             isDark
               ? "bg-gradient-to-r from-purple-700 via-purple-500 to-teal-400/70 shadow-[0_2px_18px_rgba(124,58,237,0.2)] hover:shadow-purple-700/60"
               : "bg-slate-100/80 shadow-[0_2px_18px_rgba(2,6,23,0.3)] hover:shadow-teal-500/25"
           }`}
      >
        <span
          className={`absolute -inset-px rounded-full pointer-events-none opacity-0 transition-opacity duration-300 ${isDark ? "opacity-80" : "opacity-0"}`}
          style={{
            boxShadow: isDark ? "0 4px 24px rgba(124,58,237,0.15)" : undefined,
          }}
        />

        <div className="absolute inset-0 flex items-center justify-between px-2.5">
          <Sun
            className={`w-4.5 h-4.5 transition-colors ${isDark ? "text-yellow-300/90" : "text-yellow-500"}`}
          />
          <Moon
            className={`w-4.5 h-4.5 transition-colors ${isDark ? "text-cyan-200" : "text-slate-500"}`}
          />
        </div>

        <motion.div
          layout
          initial={false}
          animate={{ x: isDark ? 44 : 2 }}
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
          className={`absolute top-1 left-1 h-7 w-7 rounded-full bg-white dark:bg-[#0b0a17] shadow-[0_2px_18px_rgba(2,6,23,0.2)] flex items-center justify-center`}
          style={{
            boxShadow: isDark
              ? "0 2px 20px rgba(0,255,209,0.5)"
              : "0 4px 20px rgba(0,0,0,0.35)",
          }}
        >
          <motion.span
            key={isDark ? "moon" : "sun"}
            initial={{ rotate: isDark ? -40 : 40, scale: 0.8, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center"
          >
            {isDark ? (
              <Moon className="w-4 h-4 text-[#36ffda]" />
            ) : (
              <Sun className="w-4 h-4 text-yellow-600" />
            )}
          </motion.span>
        </motion.div>
      </motion.div>
    </button>
  );
}
