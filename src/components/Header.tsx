import { UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import logo from "/logo.svg";

const Header = () => {
  return (
    <header className="w-full bg-gray-300 border-b border-gray-300 px-4 py-1.5 shadow-sm flex items-center justify-between h-12 z-100">
      {/* Logo und Titel als Link */}
      <Link
        to="/home"
        className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
      >
        <img src={logo} alt="Logo" className="h-7 w-7" />
        <span className="text-gray-700 font-medium text-base">
          AI Writing Assistant
        </span>
      </Link>

      {/* Profilbild von Clerk */}
      <div className="flex items-center">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
      </div>
    </header>
  );
};

export default Header;
