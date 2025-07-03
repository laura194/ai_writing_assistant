import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectService } from "../utils/ProjectService";
import imradJson from "../assets/imrad.json";
import projectStructureJson from "../assets/projectStructure.json";
import storyForDesignJson from "../assets/storyForDesign.json";
import { useUser } from "@clerk/clerk-react";
import Header from "../components/Header"; // Header importieren

const StructureSelectionPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState<string>("");

  const handleCreateProject = async (projectType: string) => {
    let projectStructure;

    switch (projectType) {
      case "imrad":
        projectStructure = imradJson;
        break;
      case "scratch":
        projectStructure = projectStructureJson;
        break;
      case "storyForDesign":
        projectStructure = storyForDesignJson;
        break;
      default:
        alert("Unbekannter Projekttyp!");
        return;
    }

    if (!projectName.trim()) {
      alert("Bitte geben Sie einen Projektnamen ein.");
      return;
    }

    try {
      const projectData = {
        name: projectName,
        username: user?.username || user?.id || "unknown-user",
        projectStructure: projectStructure,
      };

      const createdProject = await ProjectService.createProject(projectData);
      navigate(`/edit/${createdProject._id}`);
    } catch (error) {
      console.error("Fehler beim Erstellen des Projekts:", error);
      alert("Fehler beim Erstellen des Projekts!");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1 justify-center items-center px-4">
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Geben Sie den Projektnamen ein"
            className="p-3 border rounded-lg"
          />

          <button
            onClick={() => handleCreateProject("imrad")}
            className="bg-blue-500 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:bg-blue-600"
          >
            Story-for-Explanation Pattern (IMRaD)
          </button>

          <button
            onClick={() => handleCreateProject("storyForDesign")}
            className="bg-green-500 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:bg-green-600"
          >
            Story-for-Design Pattern
          </button>

          <button
            onClick={() => handleCreateProject("scratch")}
            className="bg-purple-500 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:bg-purple-600"
          >
            Create structure from scratch
          </button>
        </div>
      </div>
    </div>
  );
};

export default StructureSelectionPage;
