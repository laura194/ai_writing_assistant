import { UserButton } from "@clerk/clerk-react";
import { Link, useLocation, matchPath } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import logo from "/logo.svg";
import { RecentProjectsDropdown } from "../RecentProjectsDropdown/RecentProjectsDropdown";
import { FAQDropdown } from "../FAQDropdown";
import ThemeToggleButton from "../ThemeToggleButton/ThemeToggleButton";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { SettingsButton } from "../SettingsButton/SettingsButton";

interface HeaderProps {
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const tooltipVariants = {
  enter: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.14 } },
  exit: { opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.12 } },
};

const Header = ({
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: HeaderProps) => {
  const { user } = useUser();
  const { pathname } = useLocation();

  const excludedPatterns = ["/home", "/structureSelection", "/myProjects"];

  const hideUndoRedo = excludedPatterns.some(
    (pattern) => !!matchPath({ path: pattern, end: false }, pathname)
  );

  return (
    <header className="fixed top-0 left-0 w-full h-14 pl-6 pr-8 backdrop-blur-md bg-[#e7e3f6]/75 dark:bg-[#1e1538]/75 border-b border-[#beb1e7] dark:border-[#332857] shadow-[0_4px_50px_rgba(0,0,0,0.175)] dark:shadow-[0_4px_50px_rgba(0,0,0,0.3)] z-50 flex items-center">
      {/* ===== LEFT BLOCK: Logo + Gruppe 1 (Projects) ===== */}
      <div className="flex items-center">
        <Link
          to="/home"
          className="group flex items-center space-x-3 transition-transform duration-300 hover:scale-103 hover:animate-pulse"
        >
          <img
            src={logo}
            alt="Logo"
            className="h-8 w-8 object-contain drop-shadow-md transition-filter duration-200 group-hover:drop-shadow-[0_0_4px_#9469f7]"
          />
          <span className="hidden sm:inline font-semibold text-lg tracking-wide bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-300 bg-clip-text text-transparent transition-filter duration-200 group-hover:drop-shadow-[0_0_8px_#664aa8] dark:group-hover:drop-shadow-[0_0_12px_#9469f7] uppercase">
            AI Writing Assistant
          </span>
        </Link>

        <div className="ml-14" />

        {/* GROUP 1: Create / Open / Recent (gleichmäßiger Abstand zwischen den 3) */}
        <div className="flex items-center gap-4 text-sm font-medium dark:text-[#afa6c5] text-[#261e3b]">
          <Link
            to="/structureSelection"
            className="relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-[#00FFD1] after:transition-all after:duration-250 hover:text-[#14ab94] dark:hover:text-[#e1fffa] hover:after:w-full"
          >
            Create Project
          </Link>
          <Link
            to="/myProjects"
            className="relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-[#eeae38] after:transition-all after:duration-250 hover:text-[#cb8a07] dark:hover:text-[#fff6e4] hover:after:w-full"
          >
            Open Project
          </Link>
          {/* Recent Dropdown */}
          <div className="hidden lg:block">
            <RecentProjectsDropdown />
          </div>
        </div>
      </div>

      {/* GROUP 2: FAQ / Settings (zwischen FAQ und Settings derselbe gap wie oben) */}
      <div className="flex items-center ml-20 gap-6">
        <div className="hidden lg:block">
          <FAQDropdown />
        </div>

        <div className="hidden lg:block">
          <SettingsButton />
        </div>

        {/* Undo/Redo group */}
        {!hideUndoRedo && (
          <div className="ml-20 flex items-center gap-3">
            {/* Undo */}
            <div className="relative">
              <motion.button
                type="button"
                onClick={onUndo}
                disabled={!canUndo}
                aria-label="Undo — Strg/Cmd + Z"
                aria-disabled={!canUndo}
                className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400/60 ${
                  canUndo ? "cursor-pointer" : "cursor-not-allowed"
                }`}
                whileHover={canUndo ? { scale: 1.1 } : {}}
                whileTap={canUndo ? { scale: 0.9 } : {}}
                animate={{
                  scale: canUndo ? 1 : 0.98,
                  boxShadow: canUndo
                    ? "0 8px 24px rgba(120,69,239,0.18)"
                    : "0 0 0 rgba(0,0,0,0)",
                  opacity: canUndo ? 1 : 0.55,
                }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
              >
                <ChevronLeftIcon
                  className={`h-5 w-5 ${
                    canUndo
                      ? "text-[#473885] dark:text-[#c4b5fd]"
                      : "text-[#8b88b7] dark:text-[#504a6a]"
                  }`}
                />
              </motion.button>

              <AnimatePresence>
                {canUndo ? (
                  <motion.div
                    key="undo-tooltip"
                    initial="exit"
                    animate="enter"
                    exit="exit"
                    variants={tooltipVariants}
                    className="absolute -left-2 top-[48px] z-40 w-max rounded-md px-3 py-2 bg-[#0f172a] text-white text-xs shadow-lg"
                    role="status"
                  >
                    <div className="font-medium">Rückgängig</div>
                    <div className="text-xs opacity-80">Strg / Cmd + Z</div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="undo-tooltip-disabled"
                    initial="exit"
                    animate="enter"
                    exit="exit"
                    variants={tooltipVariants}
                    className="absolute -left-2 top-[48px] z-40 w-max rounded-md px-3 py-2 bg-[#ffffff] dark:bg-[#221633] text-[#222] dark:text-[#ddd] text-xs border border-[#e6e2f9]"
                    role="status"
                  >
                    <div className="font-medium">Rückgängig</div>
                    <div className="text-xs opacity-70">
                      Keine Aktion verfügbar
                    </div>
                    <div className="text-xs opacity-60 mt-0.5">
                      Strg / Cmd + Z
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Redo */}
            <div className="relative">
              <motion.button
                type="button"
                onClick={onRedo}
                disabled={!canRedo}
                aria-label="Redo (Wiederherstellen) — Strg/Cmd + Y"
                aria-disabled={!canRedo}
                className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400/60 ${
                  canRedo ? "cursor-pointer" : "cursor-not-allowed"
                }`}
                whileHover={canRedo ? { scale: 1.06 } : {}}
                whileTap={canRedo ? { scale: 0.96 } : {}}
                animate={{
                  scale: canRedo ? 1 : 0.98,
                  boxShadow: canRedo
                    ? "0 8px 24px rgba(120,69,239,0.18)"
                    : "0 0 0 rgba(0,0,0,0)",
                  opacity: canRedo ? 1 : 0.55,
                }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
              >
                <ChevronRightIcon
                  className={`h-5 w-5 ${
                    canRedo
                      ? "text-[#473885] dark:text-[#c4b5fd]"
                      : "text-[#8b88b7] dark:text-[#504a6a]"
                  }`}
                />
              </motion.button>

              <AnimatePresence>
                {canRedo ? (
                  <motion.div
                    key="redo-tooltip"
                    initial="exit"
                    animate="enter"
                    exit="exit"
                    variants={tooltipVariants}
                    className="absolute -left-2 top-[48px] z-40 w-max rounded-md px-3 py-2 bg-[#0f172a] text-white text-xs shadow-lg"
                    role="status"
                  >
                    <div className="font-medium">Wiederherstellen</div>
                    <div className="text-xs opacity-80">Strg / Cmd + Y</div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="redo-tooltip-disabled"
                    initial="exit"
                    animate="enter"
                    exit="exit"
                    variants={tooltipVariants}
                    className="absolute -left-2 top-[48px] z-40 w-max rounded-md px-3 py-2 bg-[#ffffff] dark:bg-[#221633] text-[#222] dark:text-[#ddd] text-xs border border-[#e6e2f9]"
                    role="status"
                  >
                    <div className="font-medium">Wiederherstellen</div>
                    <div className="text-xs opacity-70">
                      Keine Aktion verfügbar
                    </div>
                    <div className="text-xs opacity-60 mt-0.5">
                      Strg / Cmd + Y
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-4">
        <ThemeToggleButton />
        {user && (
          <span className="text-sm text-[#261e3b] dark:text-[#afa6c5] whitespace-nowrap">
            Hi,{" "}
            {user?.firstName
              ? `${user.firstName}`
              : user?.username
                ? `${user.username}`
                : ""}
          </span>
        )}

        <UserButton />
      </div>
    </header>
  );
};

export default Header;
