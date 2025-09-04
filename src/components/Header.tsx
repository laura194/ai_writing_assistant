import { UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import logo from "/logo.svg";
import { RecentProjectsDropdown } from "./RecentProjectsDropdown";

const Header = () => {
  const { user } = useUser();

  return (
    <header className="fixed top-0 left-0 w-full h-14 px-8 backdrop-blur-md bg-[#1e1538]/75 border-b border-[#332857] shadow-[0_4px_50px_rgba(0,0,0,0.3)] z-50 flex items-center">
      {/* Left: Logo & Name mit gemeinsamem Hover */}
      <Link
        to="/home"
        className="group flex items-center space-x-3 transition-transform duration-300 hover:scale-103 hover:animate-pulse"
      >
        <img
          src={logo}
          alt="Logo"
          className="h-8 w-8 object-contain drop-shadow-md transition-filter duration-200 group-hover:drop-shadow-[0_0_4px_#9469f7]"
        />
        <span className="font-semibold text-lg tracking-wide bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-300 bg-clip-text text-transparent transition-filter duration-200 group-hover:drop-shadow-[0_0_10px_#9469f7] uppercase">
          AI Writing Assistant
        </span>
      </Link>

      {/* Center: Navigation */}
      <nav className="hidden md:flex flex-1 justify-center gap-8 text-sm font-medium text-[#afa6c5]">
        <Link
          to="/structureSelection"
          className="relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-[#00FFD1] after:transition-all after:duration-250 hover:text-[#e1fffa] hover:after:w-full"
        >
          Create Project
        </Link>
        <Link
          to="/myProjects"
          className="relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-[#eeae38] after:transition-all after:duration-250 hover:text-[#fff6e4] hover:after:w-full"
        >
          Open Project
        </Link>
        {/* Recent Dropdown */}
        <div className="hidden lg:block ml-28">
          <RecentProjectsDropdown />
        </div>
      </nav>

      {/* Right: User */}
      <div className="flex items-center space-x-4">
        {/* Username */}
        {user && (
          <span className="text-sm text-[#afa6c5] whitespace-nowrap">
            Hi,{" "}
            {user?.firstName
              ? `${user.firstName}`
              : user?.username
                ? `${user.username}`
                : ""}
          </span>
        )}

        {/* Avatar */}
        <UserButton />
      </div>
    </header>
  );
};

export default Header;
