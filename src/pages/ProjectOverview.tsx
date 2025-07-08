import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectService } from "../utils/ProjectService";
import { useUser } from "@clerk/clerk-react";
import { Project } from "../utils/types";
import Header from "../components/Header";
import { FolderOpen, Trash2, Pencil, FolderPlus } from "lucide-react";

const ProjectOverview = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>("");

  useEffect(() => {
    const fetchProjects = async () => {
      if (!isLoaded) return;

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
  }, [user, isLoaded]);

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

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await ProjectService.deleteProject(id);
        setProjects((prev) => prev.filter((p) => p._id !== id));
      } catch (error) {
        console.error("Failed to delete project:", error);
        alert("Failed to delete project.");
      }
    }
  };

  // Methode zum Aktualisieren des Projekts
  const updateProjectName = async (project: Project) => {
    try {
      // Kopiere die projectStructure, um den Namen des ersten Nodes zu aktualisieren
      const updatedProjectStructure = [...project.projectStructure];
      const firstNode = updatedProjectStructure.find(
        (structure) => structure.id === "1"
      );
      if (firstNode) {
        firstNode.name = editedName; // Setze den neuen Projektnamen
      }

      // Projekt aktualisieren
      const updated = await ProjectService.updateProject(project._id!, {
        name: editedName,
        username: user?.username || "",
        projectStructure: updatedProjectStructure, // Sende die aktualisierte Struktur
      });

      // Projekte im Zustand aktualisieren
      setProjects((prev) =>
        prev.map((p) => (p._id === project._id ? updated : p))
      );
    } catch (e) {
      alert("Failed to update project");
      console.error(e);
    } finally {
      setEditingProjectId(null);
      setEditedName("");
    }
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
              {projects.map((project) => {
                const isEditing = editingProjectId === project._id;

                return (
                  <li
                    key={project._id}
                    className="bg-gray-100 rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-gray-800 font-medium text-lg max-w-[60%] overflow-hidden">
                        <FolderOpen className="w-5 h-5 shrink-0" />

                        {/* Edit mode or normal name */}
                        {isEditing ? (
                          <input
                            className="border rounded px-2 py-1 text-sm w-full max-w-[200px]"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            autoFocus
                          />
                        ) : (
                          <span
                            onClick={() =>
                              handleProjectClick(project._id ?? "")
                            }
                            className="cursor-pointer hover:text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis"
                            title={project.name}
                          >
                            {project.name}
                          </span>
                        )}

                        {/* Action Buttons */}
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => updateProjectName(project)} // Hier wird die Methode aufgerufen
                              disabled={
                                editedName.trim() === "" ||
                                editedName.trim() === project.name.trim()
                              }
                              className={`p-1 transition ${
                                editedName.trim() === "" ||
                                editedName.trim() === project.name.trim()
                                  ? "text-blue-300 cursor-not-allowed"
                                  : "text-blue-600 hover:text-blue-800"
                              }`}
                              title="Save"
                            >
                              ✓
                            </button>

                            <button
                              onClick={() => {
                                setEditingProjectId(null);
                                setEditedName("");
                              }}
                              className="text-blue-600 hover:text-blue-800 p-1 transition"
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingProjectId(project._id ?? null);
                                setEditedName(project.name);
                              }}
                              className="text-gray-500 hover:text-blue-600 p-1"
                              title="Edit project"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(project._id ?? "")}
                              className="text-gray-500 hover:text-red-600 p-1"
                              title="Delete project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>

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
                );
              })}
            </ul>
          ) : (
            <div className="text-gray-600 text-center flex flex-col items-center gap-4">
              <button
                onClick={() => navigate("/structureSelection")}
                className="flex items-center justify-center gap-2 bg-gray-400 hover:bg-gray-500 text-white font-medium py-3 px-4 rounded-md transition"
              >
                <FolderPlus className="w-5 h-5" />
                Create First Project
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;
