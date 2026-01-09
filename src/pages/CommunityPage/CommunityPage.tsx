import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectService } from "../../utils/ProjectService";
import { Project } from "../../utils/types";
import Header from "../../components/Header/Header";
import { motion } from "framer-motion";
import { useTheme } from "../../providers/ThemeProvider";
import CommentSection from "../../components/CommentSection/CommentSection";
import { FolderOpen, ThumbsUp, Heart } from "lucide-react";

import { useUser } from "@clerk/clerk-react";

const CommunityPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { user, isSignedIn } = useUser();
  const currentUsername = user?.username || user?.id || "";

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

    void fetchProjects();
  }, []);

  const handleProjectClick = (id: string) => {
    navigate(`/read/${id}`); // eigene Route zur Detailansicht
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredProjects = projects.filter((project) => {
    const search = searchTerm.toLowerCase();
    const createdDate = project.createdAt ? new Date(project.createdAt) : null;
    const updatedDate = project.updatedAt ? new Date(project.updatedAt) : null;

    // formatiere als locale string (z. B. "Nov 11, 2025") für Textsuche
    const createdString = createdDate
      ? createdDate
          .toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
          .toLowerCase()
      : "";

    const updatedString = updatedDate
      ? updatedDate
          .toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
          .toLowerCase()
      : "";

    // hole Zahlenanteile (Jahr, Monat, Tag) als Strings
    const createdParts = createdDate
      ? [
          createdDate.getFullYear().toString(),
          (createdDate.getMonth() + 1).toString(), // Monate: 0-11 → +1
          createdDate.getDate().toString(),
        ]
      : [];

    const updatedParts = updatedDate
      ? [
          updatedDate.getFullYear().toString(),
          (updatedDate.getMonth() + 1).toString(),
          updatedDate.getDate().toString(),
        ]
      : [];

    // jetzt das eigentliche Matching:
    const matchesSearch =
      project.titleCommunityPage?.toLowerCase().includes(search) ||
      project.authorName?.toLowerCase().includes(search) ||
      project.category?.toLowerCase().includes(search) ||
      project.typeOfDocument?.toLowerCase().includes(search) ||
      project.tags?.some((tag) => tag.toLowerCase().includes(search)) ||
      createdString.includes(search) ||
      updatedString.includes(search) ||
      createdParts.some((p) => p.includes(search)) ||
      updatedParts.some((p) => p.includes(search));

    if (showOnlyFavorites) {
      return (
        matchesSearch && (project.favoritedBy ?? []).includes(currentUsername)
      );
    }
    return matchesSearch;
  });

  const handleUpvote = async (id: string) => {
    if (!isSignedIn || !currentUsername) {
      alert("Please sign in to upvote.");
      return;
    }

    setProjects((prev) =>
      prev.map((project) =>
        project._id === id
          ? {
              ...project,
              upvotedBy: (project.upvotedBy ?? []).includes(currentUsername)
                ? project.upvotedBy.filter((u) => u !== currentUsername)
                : [...project.upvotedBy, currentUsername],
            }
          : project
      )
    );

    try {
      await ProjectService.toggleUpvote(id, currentUsername);
    } catch (err) {
      console.error("Error toggling upvote:", err);
    }
  };

  const toggleFavorite = async (id: string) => {
    if (!isSignedIn || !currentUsername) {
      alert("Please sign in to favorite.");
      return;
    }

    setProjects((prev) =>
      prev.map((project) =>
        project._id === id
          ? {
              ...project,
              favoritedBy: (project.favoritedBy ?? []).includes(currentUsername)
                ? project.favoritedBy.filter((u) => u !== currentUsername)
                : [...project.favoritedBy, currentUsername],
            }
          : project
      )
    );

    try {
      await ProjectService.toggleFavorite(id, currentUsername);
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#e0dbf4] text-[#362466] dark:bg-[#090325] dark:text-white relative overflow-hidden flex flex-col items-center">
      <Header />

      {/* Hintergrund-Effekte */}
      <motion.div
        className="absolute -top-32 -left-32 w-108 h-108 bg-[#ff78c5] opacity-25 dark:bg-[#ff74c3] dark:opacity-30 blur-3xl rotate-12 rounded-[1.25rem]"
        animate={{ scale: [1, 0.7, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 w-86 h-86 bg-[#e02232] opacity-30 dark:bg-[#ff4756] dark:opacity-25 blur-3xl -rotate-12 rounded-[1.25rem]"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="flex-1 flex items-center justify-center relative pt-14">
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="w-[900px] h-[900px] bg-[#eb2d6d] opacity-15 dark:bg-[#f33776] dark:opacity-15 blur-3xl rounded-full mix-blend-screen" />
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
              className="p-[3px] rounded-3xl shadow-[0_0_30px_rgba(243,36,105,0.7)] dark:shadow-[0_0_30px_rgba(243,36,105,0.25)] w-full max-w-3xl"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #a10c20, #f3155f, #f977b0)",
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

                <div className="flex justify-center gap-4 mb-8 flex-wrap">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title, author, category, or tag..."
                    className="w-full max-w-md px-4 py-2 rounded-full border border-[#c5bbeb] dark:border-[#3b2f58] bg-[#f3f0fb] dark:bg-[#2a1e44] text-[#362466] dark:text-white placeholder-[#7b6ea5] dark:placeholder-[#aaa6c3] focus:outline-none focus:ring-2 focus:ring-[#f32469] transition"
                  />
                  <button
                    onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                    className={`px-6 py-2 rounded-full cursor-pointer font-medium transition ${
                      showOnlyFavorites
                        ? "bg-[#791134] text-white shadow-[0_0_15px_rgba(243,36,105,0.4)]"
                        : "bg-[#e7e4f4] dark:bg-[#3a2e54] text-[#362466] dark:text-[#aaa6c3] hover:bg-[#ddd6f3] dark:hover:bg-[#4a3a64]"
                    }`}
                  >
                    ❤️ Favorites
                  </button>
                </div>

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
                      <span className="bg-gradient-to-r from-red-600 via-rose-500 to-pink-500 bg-clip-text text-transparent">
                        No community projects yet.
                      </span>
                    </div>
                  </div>
                ) : (
                  <ul className="space-y-0">
                    {filteredProjects.map((project, index) => (
                      <li key={project._id} className={index > 0 ? "mt-6" : ""}>
                        {/* Animierte Card mit Header und Buttons - OHNE CommentSection */}
                        <motion.div
                          layout={false}
                          whileHover={{
                            scale: 1.05,
                            boxShadow: isDark
                              ? "0 2px 24px rgba(243,36,105,0.35)"
                              : "0 2px 24px rgba(243,36,105,0.6)",
                          }}
                          className="group flex flex-col gap-4 px-6 py-6 bg-[#dad5ee] dark:bg-[#2a1e44] rounded-xl shadow-[0_2px_12px_rgba(139,92,246,0.15)] transition"
                        >
                          {/* Header mit Titel, Autor etc. */}
                          <div className="cursor-default">
                            <div
                              onClick={() => handleProjectClick(project._id!)}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <FolderOpen className="w-6 h-6 stroke-[#c92058] dark:stroke-[#ef3573]" />
                                <h3 className="text-lg font-semibold truncate group-hover:text-[#c92058] dark:group-hover:text-[#ef3573]">
                                  {project.titleCommunityPage}
                                </h3>
                              </div>
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
                              <span className="font-medium text-[#b93539]">
                                Category:
                              </span>{" "}
                              {project.category || "—"}{" "}
                              <span className="mx-1">•</span>
                              <span className="font-medium text-[#d22fa9]">
                                Type:
                              </span>{" "}
                              {project.typeOfDocument || "—"}
                            </div>

                            <div className="text-xs text-[#666] dark:text-[#aaa] mt-1">
                              Created: {formatDate(project.createdAt!)} •
                              Updated: {formatDate(project.updatedAt!)}
                            </div>
                          </div>

                          {/* Button-Zeile */}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#c5bbeb] dark:border-[#3b2f58]">
                            {/* Upvote */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleUpvote(project._id!);
                              }}
                              className="flex items-center gap-1 text-sm hover:text-[#c92058] dark:hover:text-[#ef3573] transition cursor-pointer"
                            >
                              <ThumbsUp
                                className={`w-5 h-5 ${
                                  (project.upvotedBy ?? []).includes(
                                    currentUsername
                                  )
                                    ? "fill-[#ef3573]"
                                    : "stroke-[#ef3573]"
                                }`}
                              />
                              <span>{(project.upvotedBy ?? []).length}</span>
                            </button>

                            {/* Favorite */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleFavorite(project._id!);
                              }}
                              className="flex items-center gap-1 text-sm hover:text-[#c92058] dark:hover:text-[#ef3573] transition cursor-pointer"
                            >
                              <Heart
                                className={`w-5 h-5 ${
                                  (project.favoritedBy ?? []).includes(
                                    currentUsername
                                  )
                                    ? "fill-[#ef3573]"
                                    : "stroke-[#ef3573]"
                                }`}
                              />
                              <span>Favorite</span>
                            </button>
                          </div>
                        </motion.div>

                        {/* Entkoppelte CommentSection - KOMPLETT AUSSERHALB der animierten Card */}
                        <div className="ml-4 mr-0 mt-2 px-6 py-5 bg-[#dad5ee] dark:bg-[#2a1e44] rounded-lg shadow-[0_1px_8px_rgba(139,92,246,0.08)]">
                          <CommentSection projectId={project._id!} />
                        </div>
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
