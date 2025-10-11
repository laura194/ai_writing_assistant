import { useEffect, useState, useRef, KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { ProjectService } from "../../utils/ProjectService";
import { Project } from "../../utils/types";

export const RecentProjectsDropdown = () => {
  const { user } = useUser();
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuId = "recent-projects-menu";

  useEffect(() => {
    const fetchRecent = async () => {
      if (!user?.username) return;

      try {
        const projects = await ProjectService.getRecentProjectsByUsername(
          user.username,
        );
        setRecentProjects(projects.slice(0, 3));
      } catch (error) {
        console.error("❌ Failed to load recent projects:", error);
      }
    };

    fetchRecent();
  }, [user]);

  useEffect(() => {
    if (!isOpen) return;

    const handleDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const target = e.target as Node | null;
      if (target && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    const handleEsc = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  const toggleOpen = () => setIsOpen((v) => !v);

  const onButtonKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleOpen();
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={toggleOpen}
        onKeyDown={onButtonKeyDown}
        className="text-sm text-[#261e3b] dark:text-[#afa6c5] cursor-pointer hover:text-[#9c85d4] dark:hover:text-[#ffffff] transition-colors duration-150"
      >
        Recent Projects
      </button>
      <div
        id={menuId}
        role="menu"
        aria-hidden={!isOpen}
        className={`absolute top-full mt-2 w-max whitespace-nowrap bg-[#e7e3f6] dark:bg-[#1e1538] border border-[#aca0d6] dark:border-[#32265b] rounded-xl shadow-[0_2px_50px_rgba(0,0,0,0.3)] px-4 pt-2 pb-0 transition-all duration-300 z-50
          ${isOpen ? "opacity-100 translate-y-0 pointer-events-auto transition duration-600" : "opacity-0 translate-y-1 pointer-events-none transition duration-600"}`}
      >
        {recentProjects.length > 0 ? (
          recentProjects.map((p) => (
            <Link
              key={p._id}
              to={`/edit/${p._id}`}
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="block text-sm text-[#261e3b] dark:text-[#c2bad8] hover:text-[#917dc4] dark:hover:text-white mb-2"
            >
              {p.name}
            </Link>
          ))
        ) : (
          <p className="text-xs text-[#261e3b] dark:text-[#dfdaf1] mb-3">
            No recent projects.
          </p>
        )}
      </div>
    </div>
  );
};
