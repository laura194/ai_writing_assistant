import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import Header from "../components/Header";
import { ProjectService } from "../utils/ProjectService";

import imradJson from "../assets/imrad.json";
import projectStructureJson from "../assets/projectStructure.json";
import storyForDesignJson from "../assets/storyForDesign.json";

const StructureSelectionPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState("");
  const [selectedStructure, setSelectedStructure] = useState<string | null>(
    null
  );

  const handleSave = async () => {
    if (!projectName.trim()) {
      alert("Please enter a project name.");
      return;
    }

    if (!selectedStructure) {
      alert("Please select a project structure.");
      return;
    }

    let projectStructure;
    // Deep-Copy der Struktur
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
      alert("Something went wrong while creating the project.");
    }
  };

  const structureOptions = [
    { id: "imrad", label: "Story-for-Explanation (IMRaD)" },
    { id: "storyForDesign", label: "Story-for-Design Pattern" },
    { id: "scratch", label: "Custom Structure (from Scratch)" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-200 text-gray-800">
      <Header />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl bg-white shadow-md rounded-xl p-8 text-center">
          <h1 className="text-2xl font-semibold mb-4">Create a New Project</h1>
          <p className="text-gray-600 mb-6">
            Enter a title and choose a structure to get started
          </p>

          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter project title"
            className="w-full px-4 py-3 mb-6 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />

          <div className="border rounded-lg p-4 mb-6 text-left">
            <h2 className="text-lg font-semibold mb-3">Structures</h2>
            <div className="grid gap-3">
              {structureOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedStructure(option.id)}
                  className={`w-full text-left px-5 py-3 rounded-md transition shadow-sm ${
                    selectedStructure === option.id
                      ? "bg-gray-100 shadow-inner font-semibold"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-gray-400 hover:bg-gray-500 text-white font-medium py-3 px-4 rounded-md transition"
          >
            Save and Create Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default StructureSelectionPage;
