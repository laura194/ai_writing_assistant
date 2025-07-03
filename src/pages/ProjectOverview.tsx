import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectService } from "../utils/ProjectService";
import { useUser } from "@clerk/clerk-react";
import { Project } from "../utils/types";
import Header from "../components/Header";
import { FolderOpen } from "lucide-react";

const ProjectOverview = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (user?.username) {
        try {
          const userProjects = await ProjectService.getProjectsByUsername(
            user.username
          );
          setProjects(userProjects);
        } catch (error) {
          setError("Error loading projects.");
          console.error("Error loading projects:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setError("Username not found.");
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const handleProjectClick = (id: string) => {
    navigate(`/edit/${id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-200 text-gray-800">
      <Header />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl bg-white shadow-md rounded-xl p-8 text-center">
          <h1 className="text-2xl font-semibold mb-6 text-left">
            Your Projects
          </h1>

          {loading ? (
            <div className="text-gray-600">Loading...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : projects.length > 0 ? (
            <ul className="space-y-4 text-left">
              {projects.map((project) => (
                <li
                  key={project._id}
                  onClick={() => handleProjectClick(project._id ?? "")}
                  className="bg-gray-100 rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    {/* Left: Project name */}
                    <div
                      className="flex items-center gap-2 text-gray-800 font-medium text-lg hover:text-gray-900 transition whitespace-nowrap overflow-hidden text-ellipsis max-w-[60%]"
                      title={project.name}
                    >
                      <FolderOpen className="w-5 h-5 shrink-0" />
                      {project.name}
                    </div>

                    {/* Right: Dates (stacked vertically) */}
                    <div className="flex flex-col text-sm text-gray-600 text-right min-w-[120px]">
                      <div>
                        <span className="font-medium text-gray-700">
                          Created:
                        </span>{" "}
                        {formatDate(project.createdAt ?? "")}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Updated:
                        </span>{" "}
                        {formatDate(project.updatedAt ?? "")}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-600">No projects found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;
