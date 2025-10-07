import { UserButton } from "@clerk/clerk-react";
import { Link, useLocation, matchPath } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import logo from "/logo.svg";
import { RecentProjectsDropdown } from "../RecentProjectsDropdown/RecentProjectsDropdown";
import { FAQDropdown } from "../FAQDropdown/FAQDropdown.tsx";
import ThemeToggleButton from "../ThemeToggleButton/ThemeToggleButton";
import { UndoRedoButton } from "../UndoRedoButton/UndoRedoButton";
import { SettingsButton } from "../SettingsButton/SettingsButton";

interface HeaderProps {
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

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
          <div className="ml-40">
            <UndoRedoButton
              onUndo={onUndo}
              onRedo={onRedo}
              canUndo={canUndo}
              canRedo={canRedo}
            />
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
