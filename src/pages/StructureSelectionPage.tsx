import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importiere useNavigate für die Navigation
import { ProjectService } from "../utils/ProjectService";
import imradJson from "../assets/imrad.json";
import projectStructureJson from "../assets/projectStructure.json";
import storyForDesignJson from "../assets/storyForDesign.json";
import { useUser } from "@clerk/clerk-react";

const StructureSelectionPage = () => {
  const { user } = useUser();
  const navigate = useNavigate(); // Nutze useNavigate für die Navigation

  // State für den Projektnamen
  const [projectName, setProjectName] = useState<string>("");

  const handleCreateProject = async (projectType: string) => {
    let projectStructure;

    // Use the actual JSON objects here
    switch (projectType) {
      case "imrad":
        projectStructure = imradJson; // Directly use the JSON object
        break;
      case "scratch":
        projectStructure = projectStructureJson; // Directly use the JSON object
        break;
      case "storyForDesign":
        projectStructure = storyForDesignJson; // Directly use the JSON object
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
        projectStructure: projectStructure, // Pass the JSON object directly
      };

      const createdProject = await ProjectService.createProject(projectData);

      // Navigate to the Edit page with the project ID
      navigate(`/edit/${createdProject._id}`);
      alert(`Projekt "${createdProject.name}" erfolgreich erstellt!`);
    } catch (error) {
      console.error("Fehler beim Erstellen des Projekts:", error);
      alert("Fehler beim Erstellen des Projekts!");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="flex flex-col space-y-4">
        {/* Eingabefeld für den Projektnamen */}
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)} // Setze den Wert des Textfeldes
          placeholder="Geben Sie den Projektnamen ein"
          className="p-3 border rounded-lg"
        />

        {/* Container mit drei Buttons */}
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
  );
};

export default StructureSelectionPage;
