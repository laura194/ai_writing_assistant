import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectService } from "../utils/ProjectService";
import { useUser } from "@clerk/clerk-react";
import { Project } from "../utils/types";
import Header from "../components/Header";
import {
  FolderOpen,
  Trash2,
  FolderPlus,
  Edit,
  CircleCheckBig,
  CircleX,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useTheme } from "../providers/ThemeProvider";

const ProjectOverview = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>("");
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
        toast.error(
          "Failed to delete project. Please try again or contact: plantfriends@gmail.com",
          {
            duration: 10000,
            icon: "❌",
            style: {
              background: "#2a1b1e",
              color: "#ffe4e6",
              padding: "16px 20px",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: "500",
              boxShadow: "0 4px 12px rgba(255, 0, 80, 0.1)",
              border: "1px solid #ef4444",
            },
          }
        );
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
      toast.error(
        "Failed to update project. Please try again or contact: plantfriends@gmail.com",
        {
          duration: 10000,
          icon: "❌",
          style: {
            background: "#2a1b1e",
            color: "#ffe4e6",
            padding: "16px 20px",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: "500",
            boxShadow: "0 4px 12px rgba(255, 0, 80, 0.1)",
            border: "1px solid #ef4444",
          },
        }
      );
      console.error(e);
    } finally {
      setEditingProjectId(null);
      setEditedName("");
    }
  };

  return (
    <div className="min-h-screen bg-[#e0dbf4] text-[#362466] dark:bg-[#090325] dark:text-white relative overflow-hidden flex flex-col items-center">
      <Header />

      <motion.div
        className="absolute top-[-4rem] right-[-4rem] w-84 h-84 bg-[#f1d818] opacity-35 dark:bg-[#fce009] dark:opacity-20 blur-3xl rotate-12 rounded-[1.25rem]"
        animate={{ scale: [1, 0.85, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute bottom-[-6rem] left-[-4rem] w-80 h-80 bg-[#e16015] opacity-30 dark:bg-[#f97a30] dark:opacity-20 blur-3xl -rotate-12 rounded-[1.25rem]"
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="flex-1 flex items-center justify-center relative pt-14">
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="w-[900px] h-[900px] bg-[#bb6108] opacity-20 dark:bg-[#f79635] dark:opacity-10 blur-3xl rounded-full mix-blend-screen" />
        </div>
        <main className="flex-1 w-full flex items-center justify-center py-10 z-10">
          <motion.div
            initial={{ opacity: 0, x: 200 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.4 }}
          >
            <motion.div
              initial={{ backgroundPosition: "0% 50%" }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{
                ease: "linear",
                duration: 4,
                repeat: Infinity,
              }}
              className="p-[3px] rounded-3xl shadow-[0_0_30px_rgba(251,146,60,0.7)] dark:shadow-[0_0_30px_rgba(251,146,60,0.25)] w-full max-w-3xl"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #9e1d0b, #f77d19, #fcf10f)",
                backgroundSize: "200% 200%",
              }}
            >
              <div className="w-full max-w-3xl bg-[#e9e5f8] dark:bg-[#1e1538] rounded-3xl px-10 py-10 shadow-[0_0_40px_rgba(251,146,60,0.2)]">
                <h1
                  data-aos="fade-down"
                  data-aos-duration="800"
                  data-aos-delay="1400"
                  className="text-5xl font-bold text-center mb-6 uppercase"
                >
                  Your Projects
                </h1>
                <p
                  data-aos="fade-up"
                  data-aos-duration="500"
                  data-aos-delay="1800"
                  className="text-[#261e3b] dark:text-[#aaa6c3] max-w-[600px] leading-relaxed mb-8 mx-auto text-center"
                >
                  This is an overview of all your created projects. You can
                  open, edit and delete projects as needed.
                </p>
                {loading ? (
                  <div className="flex justify-center">
                    <div className="animate-pulse px-6 py-4 bg-[#e0dbf4] dark:bg-[#090325] bg-opacity-30 rounded-full text-[#362466] dark:text-[#fee2e2] font-medium">
                      Loading your projects…
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex justify-center">
                    <div className="px-6 py-4 bg-[#a50f0f] bg-opacity-30 rounded-full text-[#fee2e2] font-medium">
                      {error}
                    </div>
                  </div>
                ) : projects.length === 0 ? (
                  <div className="flex flex-col items-center gap-4">
                    <div
                      data-aos="fade-left"
                      data-aos-duration="800"
                      data-aos-delay="2400"
                      className="font-bold text-xl text-center mb-6"
                    >
                      <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
                        No projects yet. Let's create one!
                      </span>
                    </div>
                    <div
                      data-aos="fade-up"
                      data-aos-duration="800"
                      data-aos-delay="2800"
                    >
                      <motion.div
                        onClick={() => navigate("/structureSelection")}
                        whileHover={{
                          scale: 1.075,
                          boxShadow: isDark
                            ? "0 0 20px rgba(0,255,163,0.5)"
                            : "0 0 20px rgba(0,255,163,0.7)",
                        }}
                        className="cursor-pointer p-[2px] rounded-xl bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500"
                      >
                        <div className="group flex items-center justify-center w-full bg-[#e9e5f8] dark:bg-[#1e1538] dark:bg-opacity-90 backdrop-blur-md p-6 rounded-xl shadow-inner/10 dark:shadow-inner shadow-cyan-800/40 border border-[#dad1f5] dark:border-[#32265b]">
                          <FolderPlus className="w-8 h-8 stroke-[#14ab94] dark:stroke-[#00FFD1]" />
                          <span className="ml-4 text-xl text-[#14ab94] dark:text-[#00FFD1] font-semibold transition-colors duration-300 group-hover:text-[#0d6e60] dark:group-hover:text-[#d7faf3] relative before:absolute before:-bottom-1 before:left-0 before:w-0 before:h-[2px] before:bg-[#00FFD1] group-hover:before:w-full before:transition-all before:duration-300">
                            Create New Project
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                ) : (
                  <ul className="space-y-6">
                    {projects.map((project) => {
                      const isEditing = editingProjectId === project._id;

                      return (
                        <li key={project._id}>
                          <div
                            data-aos="zoom-in"
                            data-aos-duration="800"
                            data-aos-delay="2100"
                          >
                            <motion.div
                              whileHover={{
                                scale: 1.05,
                                boxShadow: isDark
                                  ? "0 2px 24px rgba(251,146,60,0.35)"
                                  : "0 2px 24px rgba(251,146,60,0.6)",
                              }}
                              onClick={() => handleProjectClick(project._id!)}
                              className="group flex items-center justify-between px-6 py-4 bg-[#dad5ee] dark:bg-[#2a1e44] rounded-xl shadow-[0_2px_12px_rgba(139,92,246,0.15)] transition cursor-pointer relative group"
                            >
                              {/* Title & Actions */}
                              <div className="flex items-center gap-3 max-w-[60%] overflow-hidden">
                                <FolderOpen className="w-6 h-6 stroke-[#cb8a07] dark:stroke-[#fb923c]" />
                                {isEditing ? (
                                  <input
                                    className="bg-[#e0dbf4] dark:bg-[#1e1538] border border-[#cb8a07] dark:border-[#fb923c] rounded px-2 py-1.5 text-sm text-[#362466] dark:text-white outline-none flex-1 focus:bg-[#e7e4f4] dark:focus:bg-[#3a2e54] focus:border-2 focus:border-[#cb8a07] dark:focus:border-[#ffa200] transition"
                                    value={editedName}
                                    onChange={(e) =>
                                      setEditedName(e.target.value)
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                ) : (
                                  <span
                                    className="text-lg font-semibold truncate transition-colors duration-300 group-hover:text-[#cb8a07] dark:group-hover:text-[#fb923c]"
                                    title={project.name}
                                  >
                                    {project.name}
                                  </span>
                                )}
                              </div>

                              {/* Meta & Controls */}
                              <div className="flex items-center gap-4">
                                <div className="text-sm text-right text-[#261e3b] dark:text-[#aaa6c3] min-w-[120px]">
                                  <div>
                                    <span className="font-medium text-[#c54516] dark:text-[#ff662f]">
                                      Created:
                                    </span>{" "}
                                    {formatDate(project.createdAt!)}
                                  </div>
                                  <div>
                                    <span className="font-medium text-[#d49307] dark:text-[#fcc141]">
                                      Updated:
                                    </span>{" "}
                                    {formatDate(project.updatedAt!)}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {isEditing ? (
                                    <>
                                      <motion.div
                                        whileHover={{
                                          scale: 1.2,
                                        }}
                                      >
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateProjectName(project);
                                          }}
                                          disabled={
                                            !editedName.trim() ||
                                            editedName.trim() ===
                                              project.name.trim()
                                          }
                                          className={`p-1 rounded transition ${
                                            !editedName.trim() ||
                                            editedName.trim() ===
                                              project.name.trim()
                                              ? "text-[#0e9c1a] dark:text-[#39d646] opacity-40 cursor-not-allowed"
                                              : "text-[#0e9c1a] dark:text-[#39d646] cursor-pointer hover:text-[#32d00a] dark:hover:text-[#52f629] transition"
                                          }`}
                                          title="Save"
                                        >
                                          <CircleCheckBig className="w-5 h-5" />
                                        </button>
                                      </motion.div>
                                      <motion.div
                                        whileHover={{
                                          scale: 1.2,
                                        }}
                                      >
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingProjectId(null);
                                            setEditedName("");
                                          }}
                                          className="p-1 text-[#261e3b] dark:text-[#aaa6c3] hover:text-[#e0551e] dark:hover:text-[#f5662d] transition cursor-pointer"
                                          title="Cancel"
                                        >
                                          <CircleX className="w-5 h-5" />
                                        </button>
                                      </motion.div>
                                    </>
                                  ) : (
                                    <>
                                      <motion.div
                                        whileHover={{
                                          scale: 1.2,
                                        }}
                                      >
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingProjectId(project._id!);
                                            setEditedName(project.name);
                                          }}
                                          className="p-1 text-[#261e3b] dark:text-[#aaa6c3] hover:text-[#dc8317] dark:hover:text-[#fba53c] transition cursor-pointer"
                                          title="Edit"
                                        >
                                          <Edit className="w-5 h-5" />
                                        </button>
                                      </motion.div>
                                      <motion.div
                                        whileHover={{
                                          scale: 1.2,
                                        }}
                                      >
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(project._id!);
                                          }}
                                          className="p-1 text-[#261e3b] dark:text-[#aaa6c3] hover:text-[#f42f2f] transition cursor-pointer"
                                          title="Delete"
                                        >
                                          <Trash2 className="w-5 h-5" />
                                        </button>
                                      </motion.div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default ProjectOverview;
