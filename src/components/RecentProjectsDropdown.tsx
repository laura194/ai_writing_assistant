import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { ProjectService } from "../utils/ProjectService";
import { Project } from "../utils/types";

export const RecentProjectsDropdown = () => {
  const { user } = useUser();
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchRecent = async () => {
      if (!user?.username) return;

      try {
        const projects = await ProjectService.getRecentProjectsByUsername(
          user.username
        );
        setRecentProjects(projects.slice(0, 3));
      } catch (error) {
        console.error("❌ Failed to load recent projects:", error);
      }
    };

    fetchRecent();
  }, [user]);

  return (
    <div className="relative group">
      <button className="text-sm text-[#dfdaf1]">Recent Projects</button>
      <div className="absolute top-full mt-2 w-max whitespace-nowrap bg-[#1e1538] border border-[#32265b] rounded-xl shadow-[0_2px_50px_rgba(0,0,0,0.3)] px-4 pt-2 pb-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-50">
        {recentProjects.length > 0 ? (
          recentProjects.map((p) => (
            <Link
              key={p._id}
              to={`/edit/${p._id}`}
              className="block text-sm text-[#dfdaf1] hover:text-white mb-2"
            >
              {p.name}
            </Link>
          ))
        ) : (
          <p className="text-xs text-[#dfdaf1]">No recent projects.</p>
        )}
      </div>
    </div>
  );
};
