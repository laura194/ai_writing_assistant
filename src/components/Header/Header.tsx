import { UserButton } from "@clerk/clerk-react";
import { Link, useLocation, matchPath } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import logo from "/logo.svg";
import { RecentProjectsDropdown } from "../RecentProjectsDropdown/RecentProjectsDropdown";
import { FAQDropdown } from "../FAQDropdown/FAQDropdown.tsx";
import ThemeToggleButton from "../ThemeToggleButton/ThemeToggleButton";
import { UndoRedoButton } from "../UndoRedoButton/UndoRedoButton";
import { SettingsButton } from "../SettingsButton/SettingsButton";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

// Simple magnifier icon (Heroicons)
// Accept an optional className so callers can set a fixed color to prevent
// the icon from inheriting parent hover text color.
const MagnifierIcon = ({ className = "" }: { className?: string }) => (
  <MagnifyingGlassIcon
    className={`inline-block align-middle mr-1 ${className}`}
    width={18}
    height={18}
  />
);

interface HeaderProps {
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onTutorialClick?: () => void;
  activeView?: string;
}

const Header = ({
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onTutorialClick,
  activeView,
}: HeaderProps) => {
  const { user } = useUser();
  const { pathname } = useLocation();

  const excludedPatterns = [
    "/home",
    "/structureSelection",
    "/myProjects",
    "communityPage",
  ];

  const hideUndoRedo = excludedPatterns.some(
    (pattern) => !!matchPath({ path: pattern, end: false }, pathname),
  );

  return (
    <header
      id="tutorial-header"
      className="fixed top-0 left-0 w-full h-14 px-4 sm:px-6 lg:px-8 backdrop-blur-md bg-[#e7e3f6]/75 dark:bg-[#1e1538]/75 border-b border-[#beb1e7] dark:border-[#332857] shadow-[0_4px_50px_rgba(0,0,0,0.175)] dark:shadow-[0_4px_50px_rgba(0,0,0,0.3)] z-50 flex items-center"
    >
      <div className="flex items-center w-full">
        {/* ===== LEFT BLOCK: Logo + Gruppe 1 (Projects) ===== */}
        <div className="flex flex-1 items-center gap-4 justify-start">
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
        </div>

        {/* GROUP 1: Create / Open / Recent (gleichmäßiger Abstand zwischen den 3) */}
        <div className="hidden lg:flex flex-1 items-center gap-4 justify-center text-sm font-medium dark:text-[#afa6c5] text-[#261e3b]">
          <Link
            to="/structureSelection"
            className="relative whitespace-nowrap after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-[#00FFD1] after:transition-all after:duration-250 hover:text-[#14ab94] dark:hover:text-[#e1fffa] hover:after:w-full"
          >
            Create Project
          </Link>
          <Link
            to="/myProjects"
            className="relative whitespace-nowrap after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-[#eeae38] after:transition-all after:duration-250 hover:text-[#cb8a07] dark:hover:text-[#fff6e4] hover:after:w-full"
          >
            Open Project
          </Link>
          {/* Recent Dropdown */}
          <div className="hidden lg:block whitespace-nowrap">
            <RecentProjectsDropdown />
          </div>
        </div>

        {/* GROUP 2: Community */}
        <div className="hidden lg:flex flex-1 items-center justify-center text-sm font-medium dark:text-[#afa6c5] text-[#261e3b]">
          <Link
            to="/communityPage"
            className="relative whitespace-nowrap after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-[#00FFD1] after:transition-all after:duration-250 hover:text-[#14ab94] dark:hover:text-[#e1fffa] hover:after:w-full flex items-center"
          >
            <MagnifierIcon className="text-[#261e3b] dark:text-[#afa6c5]" />
            <span>Community</span>
          </Link>
        </div>

        {/* GROUP 3: FAQ / Settings */}
        <div className="flex flex-1 items-center gap-16 justify-center">
          <div className="hidden lg:flex items-center gap-4">
            {/* Place Tutorial left of FAQ on large screens (only show when in file/editor view) */}
              {activeView === "file" && (
              <button
                type="button"
                onClick={onTutorialClick}
                title="Start Tutorial"
                aria-label="Start Tutorial"
                className="hidden lg:flex items-center gap-1 text-sm text-[#261e3b] dark:text-[#afa6c5] cursor-pointer hover:text-[#9c85d4] dark:hover:text-[#ffffff] transition-colors duration-150 font-medium px-3 py-1 rounded-md lg:-mr-2 focus:outline-none"
                style={{ fontSize: "15px" }}
              >
                <MagnifierIcon className="text-[#261e3b] dark:text-[#afa6c5]" />
                <span>Tutorial</span>
              </button>
            )}
            <FAQDropdown />
            <SettingsButton />
          </div>

          {/* Undo/Redo group */}
          {!hideUndoRedo && (
            <UndoRedoButton
              onUndo={onUndo}
              onRedo={onRedo}
              canUndo={canUndo}
              canRedo={canRedo}
            />
          )}
        </div>

        <div className="flex flex-1 items-center gap-4 justify-end">
          {/* Small-screen Tutorial Button (hidden on large screens) */}
          {activeView === "file" && (
            <button
              type="button"
              className="flex items-center gap-1 text-sm text-[#261e3b] dark:text-[#afa6c5] cursor-pointer hover:text-[#9c85d4] dark:hover:text-[#ffffff] transition-colors duration-150 font-medium px-3 py-1.5 rounded-md lg:hidden focus:outline-none"
              style={{ fontSize: "15px" }}
              onClick={onTutorialClick}
              aria-label="Start Tutorial"
            >
              <MagnifierIcon className="text-[#261e3b] dark:text-[#afa6c5]" />
              Tutorial
            </button>
          )}

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
      </div>
    </header>
  );
};

export default Header;
