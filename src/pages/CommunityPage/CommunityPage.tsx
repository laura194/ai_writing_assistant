import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectService } from "../../utils/ProjectService";
import { Project } from "../../utils/types";
import Header from "../../components/Header/Header";
import { FolderOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../../providers/ThemeProvider";

const CommunityPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const publicProjects = await ProjectService.getPublicProjects();
        setProjects(publicProjects);
      } catch (error) {
        setError("Error loading community projects.");
        console.error("Error loading projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleProjectClick = (id: string) => {
    navigate(`/community/${id}`); // eigene Route zur Detailansicht
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
    <div className="min-h-screen bg-[#e0dbf4] text-[#362466] dark:bg-[#090325] dark:text-white relative overflow-hidden flex flex-col items-center">
      <Header />

      {/* Hintergrund-Effekte */}
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
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
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
                  Community Projects
                </h1>
                <p
                  data-aos="fade-up"
                  data-aos-duration="500"
                  data-aos-delay="1800"
                  className="text-[#261e3b] dark:text-[#aaa6c3] max-w-[600px] leading-relaxed mb-8 mx-auto text-center"
                >
                  Explore published projects from the community. Discover work
                  by other users, view categories, and find inspiration.
                </p>

                {loading ? (
                  <div className="flex justify-center">
                    <div className="animate-pulse px-6 py-4 bg-[#e0dbf4] dark:bg-[#090325] bg-opacity-30 rounded-full text-[#362466] dark:text-[#fee2e2] font-medium">
                      Loading community projects…
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
                        No community projects yet.
                      </span>
                    </div>
                  </div>
                ) : (
                  <ul className="space-y-6">
                    {projects.map((project) => (
                      <li key={project._id}>
                        <motion.div
                          whileHover={{
                            scale: 1.05,
                            boxShadow: isDark
                              ? "0 2px 24px rgba(251,146,60,0.35)"
                              : "0 2px 24px rgba(251,146,60,0.6)",
                          }}
                          onClick={() => handleProjectClick(project._id!)}
                          className="group flex flex-col gap-2 px-6 py-4 bg-[#dad5ee] dark:bg-[#2a1e44] rounded-xl shadow-[0_2px_12px_rgba(139,92,246,0.15)] transition cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <FolderOpen className="w-6 h-6 stroke-[#cb8a07] dark:stroke-[#fb923c]" />
                            <h3 className="text-lg font-semibold truncate group-hover:text-[#cb8a07] dark:group-hover:text-[#fb923c]">
                              {project.titleCommunityPage}
                            </h3>
                          </div>

                          <div className="text-sm text-[#261e3b] dark:text-[#aaa6c3]">
                            By{" "}
                            <span className="font-medium">
                              {project.authorName}
                            </span>
                          </div>

                          {project.tags && project.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {project.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 text-xs rounded-full bg-[#e7e4f4] dark:bg-[#3a2e54]"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="text-sm mt-2">
                            <span className="font-medium text-[#c54516]">
                              Category:
                            </span>{" "}
                            {project.category || "—"}{" "}
                            <span className="mx-1">•</span>
                            <span className="font-medium text-[#d49307]">
                              Type:
                            </span>{" "}
                            {project.typeOfDocument || "—"}
                          </div>

                          <div className="text-xs text-[#666] dark:text-[#aaa] mt-1">
                            Created: {formatDate(project.createdAt!)} • Updated:{" "}
                            {formatDate(project.updatedAt!)}
                          </div>
                        </motion.div>
                      </li>
                    ))}
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

export default CommunityPage;
