import { useNavigate } from "react-router-dom";

const StructureSelectionPage = () => {
  const navigate = useNavigate();

  const handleSelection = (type: string) => {
    navigate("/editPage", { state: { structureType: type } }); // Strukturtyp an EditPage weiterreichen
  };

  return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col space-y-4">
          <button
              onClick={() => handleSelection("explanation")} // IMRaD-Struktur
              className="bg-blue-500 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:bg-blue-600"
          >
            Story-for-Explanation Pattern (IMRaD)
          </button>

          <button
              onClick={() => handleSelection("design")} // Design-Pattern-Struktur
              className="bg-green-500 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:bg-green-600"
          >
            Story-for-Design Pattern
          </button>

          <button
              onClick={() => handleSelection("scratch")} // Leere Struktur
              className="bg-purple-500 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:bg-purple-600"
          >
            Create structure from scratch
          </button>
        </div>
      </div>
  );
};

export default StructureSelectionPage;