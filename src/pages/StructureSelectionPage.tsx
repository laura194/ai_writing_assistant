import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import { ProjectService } from "../utils/ProjectService";
import { FolderPlus } from "lucide-react";
import { useTheme } from "../providers/ThemeProvider";
import { getToastOptions } from "../utils/ToastOptionsSSP";

import imradJson from "../assets/imrad.json";
import projectStructureJson from "../assets/projectStructure.json";
import storyForDesignJson from "../assets/storyForDesign.json";
import toast from "react-hot-toast";

const StructureSelectionPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [projectName, setProjectName] = useState("");
  const [selectedStructure, setSelectedStructure] = useState<string | null>(
    null,
  );

  const handleSave = async () => {
    if (!projectName.trim()) {
      toast("Please enter a project name.", getToastOptions(theme));
      return;
    }

    if (!selectedStructure) {
      toast("Please select a project structure.", getToastOptions(theme));
      return;
    }

    let projectStructure;
    switch (selectedStructure) {
      case "imrad":
        projectStructure = JSON.parse(JSON.stringify(imradJson));
        break;
      case "scratch":
        projectStructure = JSON.parse(JSON.stringify(projectStructureJson));
        break;
      case "storyForDesign":
        projectStructure = JSON.parse(JSON.stringify(storyForDesignJson));
        break;
      default:
        alert("Invalid structure selected.");
        return;
    }

    // 🟢 Ersetze "Chapter structure" durch den Projektnamen
    if (
      Array.isArray(projectStructure) &&
      projectStructure.length > 0 &&
      typeof projectStructure[0].name === "string"
    ) {
      projectStructure[0].name = projectName.trim();
    }

    try {
      const createdProject = await ProjectService.createProject({
        name: projectName,
        username: user?.username || user?.id || "unknown-user",
        projectStructure: projectStructure,
      });

      navigate(`/edit/${createdProject._id}`);
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error(
        "Something went wrong while creating the project. Please try again or contact: plantfriends@gmail.com",
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
        },
      );
    }
  };

  const structureOptions = [
    { id: "imrad", label: "Story-for-Explanation (IMRaD)" },
    { id: "storyForDesign", label: "Story-for-Design Pattern" },
    { id: "scratch", label: "Custom Structure (from Scratch)" },
  ];

  return (
    <div className="min-h-screen bg-[#e0dbf4] text-[#362466] dark:bg-[#090325] dark:text-white relative overflow-hidden flex flex-col items-center">
      <Header />

      {/* Animated Blurred Squares in opposite corners */}
      <motion.div
        className="absolute top-[-4rem] right-[-4rem] w-84 h-84 bg-[#088fd3] opacity-35 dark:bg-[#16abf6] dark:opacity-20 blur-3xl rotate-12 rounded-[1.25rem]"
        animate={{ scale: [1, 0.85, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute bottom-[-6rem] left-[-4rem] w-80 h-80 bg-[#3bdb96] opacity-40 dark:bg-[#37f5a2] dark:opacity-20 blur-3xl -rotate-12 rounded-[1.25rem]"
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="flex-1 flex items-center justify-center relative pt-14">
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="w-[900px] h-[900px] bg-[#2fc1ae] dark:bg-[#3adec8] opacity-20 dark:opacity-10 blur-3xl rounded-full mix-blend-screen" />
        </div>
        <main className="flex-1 w-full flex items-center justify-center py-10 z-10">
          <motion.div
            initial={{ opacity: 0, x: -200 }}
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
              className="p-[3px] rounded-3xl shadow-[0_0_30px_rgba(48,240,178,0.4)] dark:shadow-[0_0_30px_rgba(48,240,178,0.25)] w-full max-w-3xl"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #45f5cf, #05d1f5, #244fed)",
                backgroundSize: "200% 200%",
              }}
            >
              <div className="w-full max-w-3xl bg-[#e9e5f8] dark:bg-[#1e1538] rounded-3xl px-10 py-10 shadow-[0_0_40px_rgba(14,165,233,0.2)]">
                <h1
                  data-aos="fade-down"
                  data-aos-duration="800"
                  data-aos-delay="1400"
                  className="text-5xl font-bold text-center mb-6 uppercase"
                >
                  Create New Project
                </h1>
                <p
                  data-aos="fade-up"
                  data-aos-duration="500"
                  data-aos-delay="1800"
                  className="text-[#261e3b] dark:text-[#aaa6c3] max-w-[600px] leading-relaxed mb-8 mx-auto text-center"
                >
                  Give your project a name and choose a structure to begin.
                </p>

                <input
                  data-aos="fade-up"
                  data-aos-duration="700"
                  data-aos-delay="2000"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project title"
                  className="w-full px-4 py-3 mb-10 rounded-md bg-[#dad5ee] text-[#261e3b] dark:bg-[#2a1e44] dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />

                <div className="mb-12">
                  <h2
                    data-aos="fade-right"
                    data-aos-duration="600"
                    data-aos-delay="2400"
                    className="text-xl font-semibold mb-4"
                  >
                    Select Structure
                  </h2>
                  <div
                    data-aos="fade-left"
                    data-aos-duration="800"
                    data-aos-delay="2600"
                    className="grid gap-4 sm:grid-cols-1 md:grid-cols-2"
                  >
                    {structureOptions.map((option) => {
                      const isSelected = selectedStructure === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => setSelectedStructure(option.id)}
                          className={`relative group rounded-xl p-[2px] transition-all duration-300 ${
                            isSelected
                              ? "bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500"
                              : isDark
                                ? "bg-[#403071]"
                                : "bg-[#8b75cb]"
                          }`}
                        >
                          <div
                            className={`w-full h-full px-5 py-4 rounded-[10px] backdrop-blur-md transition duration-300 cursor-pointer
                                          ${
                                            isSelected
                                              ? "bg-[#e9e5f8] dark:bg-[#1e1538] text-[#14ab94] dark:text-teal-100 shadow-[0_0_15px_rgba(34,211,238,0.5)] dark:shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                                              : "bg-[#e9e5f8] dark:bg-[#1e1538] text-[#261e3b] dark:text-[#aaa6c3] hover:bg-[#e4ddf6] dark:hover:bg-[#2c204a]"
                                          }`}
                          >
                            <span className="text-lg font-semibold block group-hover:text-[#14ab94] dark:group-hover:text-teal-100 transition-colors duration-300">
                              {option.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div
                  data-aos="fade-up"
                  data-aos-duration="1000"
                  data-aos-delay="3000"
                >
                  <motion.div
                    onClick={handleSave}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: isDark
                        ? "0 0 20px rgba(0,255,163,0.3)"
                        : "0 0 20px rgba(0,255,163,0.5)",
                    }}
                    className="cursor-pointer p-[2px] rounded-xl bg-teal-400 dark:bg-teal-400 w-[300px] mx-auto"
                  >
                    <div className="group flex items-center justify-center bg-[#e9e5f8] dark:bg-[#1e1538] dark:bg-opacity-90 backdrop-blur-md p-4 rounded-xl shadow-inner/10 dark:shadow-inner shadow-cyan-800/40 border border-[#dad1f5] dark:border-[#32265b]">
                      <FolderPlus className="w-8 h-8 stroke-[#14ab94] dark:stroke-[#00FFD1]" />
                      <span className="ml-4 text-xl text-[#14ab94] dark:text-[#00FFD1] font-semibold transition-colors duration-300 group-hover:text-[#0d6e60] dark:group-hover:text-[#d7faf3] relative before:absolute before:-bottom-1 before:left-0 before:w-0 before:h-[2px] before:bg-[#00FFD1] group-hover:before:w-full before:transition-all before:duration-300">
                        Create Project
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default StructureSelectionPage;
