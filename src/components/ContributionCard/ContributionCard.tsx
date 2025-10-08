import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ProjectService } from "../../utils/ProjectService";
import { Project } from "../../utils/types";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";

const ContributionCard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [newTag, setNewTag] = useState<string>("");
  const [initialIsPublic, setInitialIsPublic] = useState<boolean | null>(null);
  const [originalProject, setOriginalProject] = useState<Project | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    if (projectId) {
      ProjectService.getProjectById(projectId)
        .then((project: Project) => {
          if (
            Array.isArray(project.projectStructure) ||
            typeof project.projectStructure === "object"
          ) {
            setProject({
              ...project,
              isPublic: project.isPublic ?? false,
              titleCommunityPage: project.titleCommunityPage ?? project.name,
              category: project.category ?? "",
              tags: project.tags ?? [],
              typeOfDocument: project.typeOfDocument ?? "",
              username: project.username ?? "Anonymous",
            });
            setIsAnonymous(project.authorName === "Anonymous");
            setInitialIsPublic(project.isPublic ?? false);
            setOriginalProject(project);
          } else {
            console.error("Project structure is not valid!");
          }
        })
        .catch((error) => console.error("Error fetching project:", error));
    }
  }, [projectId, reloadTrigger]);

  const updateProjectField = <K extends keyof Project>(
    field: K,
    value: Project[K]
  ) => {
    setProject((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const addTag = () => {
    if (newTag.trim() !== "" && project) {
      updateProjectField("tags", [...(project.tags || []), newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (project) {
      updateProjectField(
        "tags",
        project.tags?.filter((tag) => tag !== tagToRemove) || []
      );
    }
  };
  const hasChanges = () => {
    if (!project || !originalProject) return false;

    return (
      project.isPublic !== originalProject.isPublic ||
      project.titleCommunityPage !== originalProject.titleCommunityPage ||
      project.category !== originalProject.category ||
      project.typeOfDocument !== originalProject.typeOfDocument ||
      project.authorName !== originalProject.authorName ||
      JSON.stringify(project.tags) !== JSON.stringify(originalProject.tags) ||
      isAnonymous !== (originalProject.authorName === "Anonymous") // 👈 Änderung hier
    );
  };

  const isFormValid = () => {
    if (!project) return false;

    // wenn das Projekt privat ist, gibt es keine Pflichtfelder
    if (!project.isPublic) return true;

    const hasCategory = project.category && project.category !== "";
    const hasDocType = project.typeOfDocument && project.typeOfDocument !== "";
    const hasTitle =
      project.titleCommunityPage && project.titleCommunityPage.trim() !== "";
    const hasTags = project.tags && project.tags.length > 0;

    return hasCategory && hasDocType && hasTitle && hasTags;
  };

  const getButtonText = () => {
    if (initialIsPublic === false && project?.isPublic === false) return null;
    if (initialIsPublic === false && project?.isPublic === true)
      return "Publish Project";
    if (initialIsPublic === true && project?.isPublic) return "Update Project";
    if (initialIsPublic === true && !project?.isPublic) return "Hide Project";
    return null;
  };

  const getButtonStyles = () => {
    const text = getButtonText();
    if (text === "Hide Project") {
      return {
        gradient: "bg-gradient-to-r from-red-500 via-orange-400 to-yellow-500",
        shadow: "shadow-inner/30 dark:shadow-inner shadow-orange-800/40",
        textColor: "text-[#cb8a07] dark:text-[#eeae38]",
        hoverText: "group-hover:text-[#815c11] dark:group-hover:text-[#faebcf]",
        iconColor: "stroke-[#cb8a07] dark:stroke-[#eeae38]",
      };
    } else {
      return {
        gradient: "bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500",
        shadow: "shadow-inner/30 dark:shadow-inner shadow-cyan-800/40",
        textColor: "text-[#14ab94] dark:text-[#00FFD1]",
        hoverText: "group-hover:text-[#0d6e60] dark:group-hover:text-[#d7faf3]",
        iconColor: "stroke-[#14ab94] dark:stroke-[#00FFD1]",
      };
    }
  };

  const saveProject = async () => {
    if (!projectId || !project) return;

    const projectData = {
      name: project.name || "Untitled Project",
      authorName: isAnonymous ? "Anonymous" : project.username || "Anonymous",
      isPublic: project.isPublic,
      titleCommunityPage: project.titleCommunityPage,
      category: project.category,
      typeOfDocument: project.typeOfDocument,
      tags: project.tags || [],
      projectStructure: project.projectStructure || [],
    };

    try {
      await ProjectService.updateProject(projectId, projectData);
      console.log("✅ Project updated successfully.");
      setReloadTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("❌ Failed to update project:", error);
    }
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full text-gray-700 dark:text-gray-300">
        Loading project...
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full p-10 rounded-3xl bg-[#e9e5f8] dark:bg-[#1e1538] text-[#261e3b] dark:text-white shadow-[0_0_40px_rgba(14,165,233,0.2)]">
      <h2 className="text-3xl font-bold inline-block tracking-wide mb-6">
        Contribution
        <div className="h-1 mt-1.5 w-[166px] bg-gradient-to-r from-purple-500 via-pink-400 to-yellow-300 rounded-full" />
      </h2>

      {/* Public / Private Toggle */}
      <label className="flex items-center gap-4 mb-8">
        <span className="font-semibold">Visibility:</span>
        <div
          className={`w-16 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
            project.isPublic
              ? "bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500"
              : "bg-[#c5bedc] dark:bg-[#3a2f57]"
          }`}
          onClick={() => updateProjectField("isPublic", !project.isPublic)}
        >
          <div
            className={`bg-white dark:bg-gray-200 w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
              project.isPublic ? "translate-x-8" : "translate-x-0"
            }`}
          ></div>
        </div>
        <span className="text-sm font-medium">
          {project.isPublic ? "Public" : "Private"}
        </span>
      </label>

      {project.isPublic && (
        <>
          {/* Community Page Title */}
          <input
            type="text"
            value={project.titleCommunityPage || ""}
            onChange={(e) =>
              updateProjectField("titleCommunityPage", e.target.value)
            }
            placeholder="Community Page Title"
            className="w-full px-4 py-3 mb-6 rounded-md bg-[#dad5ee] text-[#261e3b] dark:bg-[#2a1e44] dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />

          {/* Category */}
          <select
            value={project.category || ""}
            onChange={(e) => updateProjectField("category", e.target.value)}
            className="w-full px-4 py-3 mb-6 rounded-md bg-[#dad5ee] text-[#261e3b] 
    dark:bg-[#2a1e44] dark:text-white focus:outline-none focus:ring-2 
    focus:ring-teal-400"
          >
            <option value="">-- Select Category --</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Biology">Biology</option>
            <option value="Economy">Economy</option>
            <option value="Physics">Physics</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Psychology">Psychology</option>
            <option value="Sociology">Sociology</option>
            <option value="Political Science">Political Science</option>
            <option value="History">History</option>
            <option value="Philosophy">Philosophy</option>
            <option value="Literature">Literature</option>
            <option value="Engineering">Engineering</option>
            <option value="Environmental Science">Environmental Science</option>
            <option value="Medicine">Medicine</option>
            <option value="Nursing">Nursing</option>
            <option value="Law">Law</option>
            <option value="Linguistics">Linguistics</option>
            <option value="Anthropology">Anthropology</option>
            <option value="Art History">Art History</option>
            <option value="Education">Education</option>
            <option value="Business Administration">
              Business Administration
            </option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
            <option value="Architecture">Architecture</option>
            <option value="Geography">Geography</option>
            <option value="Astronomy">Astronomy</option>
            <option value="Neuroscience">Neuroscience</option>
            <option value="Information Technology">
              Information Technology
            </option>
            <option value="Pharmacy">Pharmacy</option>
            <option value="Social Work">Social Work</option>
            <option value="Communication Studies">Communication Studies</option>
            <option value="Journalism">Journalism</option>
            <option value="Statistics">Statistics</option>
            <option value="Data Science">Data Science</option>
            <option value="Ethics">Ethics</option>
            <option value="Cognitive Science">Cognitive Science</option>
            <option value="Public Health">Public Health</option>
            <option value="International Relations">
              International Relations
            </option>
            <option value="Theology">Theology</option>
            <option value="Musicology">Musicology</option>
            <option value="Performing Arts">Performing Arts</option>
            <option value="Film Studies">Film Studies</option>
            <option value="Nutrition Science">Nutrition Science</option>
            <option value="Sports Science">Sports Science</option>
            <option value="Other">Other</option>
          </select>

          {/* Tags */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add Tag"
              className="flex-1 px-4 py-3 rounded-md bg-[#dad5ee] text-[#261e3b] 
      dark:bg-[#2a1e44] dark:text-white placeholder-gray-600 
      dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            <button
              onClick={addTag}
              className="relative px-5 py-2 rounded-md font-medium 
    border border-teal-400 dark:border-cyan-400 
    text-teal-500 dark:text-cyan-300 
    bg-transparent transition-all duration-300 
    group hover:scale-105"
            >
              <span
                className="transition-colors duration-300 group-hover:text-teal-700 dark:group-hover:text-cyan-200
      relative before:absolute before:-bottom-1 before:left-0 before:w-0 before:h-[2px] 
      before:bg-teal-400 dark:before:bg-cyan-400 
      group-hover:before:w-full before:transition-all before:duration-300"
              >
                Add
              </span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags?.map((tag, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 
        bg-purple-200 dark:bg-purple-700/40 
        text-purple-800 dark:text-purple-200 
        rounded-full text-sm font-medium shadow-sm"
              >
                <span>{tag}</span>
                <button
                  onClick={() => removeTag(tag)}
                  className="text-purple-600 dark:text-purple-300 hover:text-red-500 transition-colors duration-200 font-bold"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Type of Document */}
          <select
            value={project.typeOfDocument || ""}
            onChange={(e) =>
              updateProjectField("typeOfDocument", e.target.value)
            }
            className="w-full px-4 py-3 mb-8 rounded-md bg-[#dad5ee] text-[#261e3b] 
    dark:bg-[#2a1e44] dark:text-white focus:outline-none focus:ring-2 
    focus:ring-teal-400"
          >
            <option value="">-- Select Work Type --</option>
            <option value="Bachelor Thesis">Bachelor Thesis</option>
            <option value="Master Thesis">Master Thesis</option>
            <option value="Doctoral Dissertation">Doctoral Dissertation</option>
            <option value="PTB">PTB</option>
            <option value="Research Paper">Research Paper</option>
            <option value="Term Paper">Term Paper</option>
            <option value="Seminar Paper">Seminar Paper</option>
            <option value="Essay">Essay</option>
            <option value="Project Report">Project Report</option>
            <option value="Capstone Project">Capstone Project</option>
            <option value="Case Study">Case Study</option>
            <option value="Thesis Proposal">Thesis Proposal</option>
            <option value="Literature Review">Literature Review</option>
            <option value="Technical Report">Technical Report</option>
            <option value="White Paper">White Paper</option>
            <option value="Dissertation Proposal">Dissertation Proposal</option>
            <option value="Academic Article">Academic Article</option>
            <option value="Conference Paper">Conference Paper</option>
            <option value="Review Paper">Review Paper</option>
            <option value="Book Chapter">Book Chapter</option>
            <option value="Policy Paper">Policy Paper</option>
            <option value="Other">Other</option>
          </select>

          {/* Anonymous Checkbox */}
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="anonymous" className="text-sm font-medium">
              Post as Anonymous
            </label>
          </div>
        </>
      )}
      {/* Save / Share Button */}
      {getButtonText() && (
        <motion.div
          onClick={saveProject}
          whileHover={{
            scale: hasChanges() && isFormValid() ? 1.05 : 1,
            boxShadow:
              hasChanges() && isFormValid()
                ? getButtonText() === "Hide Project"
                  ? "0 0 20px rgba(251,146,60,0.5)"
                  : "0 0 20px rgba(0,255,163,0.5)"
                : "none",
          }}
          className={`cursor-pointer p-[2px] rounded-xl ${getButtonStyles().gradient} w-[300px] mx-auto mt-4 ${
            (!hasChanges() || !isFormValid()) &&
            getButtonText() !== "Publish Project"
              ? "opacity-40 pointer-events-none"
              : ""
          }`}
        >
          <div
            className={`group flex items-center justify-center bg-[#e9e5f8] dark:bg-[#1e1538] dark:bg-opacity-90 backdrop-blur-md p-4 rounded-xl ${getButtonStyles().shadow} border border-[#dad1f5] dark:border-[#32265b]`}
          >
            <UploadCloud className={`w-8 h-8 ${getButtonStyles().iconColor}`} />
            <span
              className={`ml-4 text-xl font-semibold transition-colors duration-300 ${getButtonStyles().textColor} ${getButtonStyles().hoverText} relative before:absolute before:-bottom-1 before:left-0 before:w-0 before:h-[2px] before:bg-[#00FFD1] group-hover:before:w-full before:transition-all before:duration-300`}
            >
              {getButtonText()}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ContributionCard;
