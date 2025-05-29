import { useNavigate } from "react-router-dom";

const StructureSelectionPage = () => {
  const navigate = useNavigate();

  const handleSelection = (structureType: string) => {
    // Speichere die Auswahl in localStorage und navigiere zur EditPage
    localStorage.setItem("selectedStructure", structureType);
    navigate("/editPage");
  };

  return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col space-y-4">
          <button
              onClick={() => handleSelection("imrad")}
              className="bg-blue-500 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:bg-blue-600"
          >
            Story-for-Explanation Pattern (IMRaD)
          </button>
          <button
              onClick={() => handleSelection("design")}
              className="bg-green-500 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:bg-green-600"
          >
            Story-for-Design Pattern
          </button>
          <button
              onClick={() => handleSelection("custom")}
              className="bg-purple-500 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:bg-purple-600"
          >
            Create Structure from Scratch
          </button>
        </div>
      </div>
  );
};

export default StructureSelectionPage;