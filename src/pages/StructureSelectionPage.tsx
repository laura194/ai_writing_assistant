import { useNavigate } from "react-router-dom";

const StructureSelectionPage = () => {
  const navigate = useNavigate();

  return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        {/* Container mit drei Buttons zur Auswahl der Struktur */}
        <div className="flex flex-col space-y-4">
          {/* IMRaD-Struktur */}
          <button
              onClick={() => navigate("/editPage?type=structure1")}
              className="bg-blue-500 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:bg-blue-600"
          >
            Story-for-Explanation Pattern (IMRaD)
          </button>

          {/* Design-Struktur */}
          <button
              onClick={() => navigate("/editPage?type=structure2")}
              className="bg-green-500 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:bg-green-600"
          >
            Story-for-Design Pattern
          </button>

          {/* Benutzerdefinierte Struktur */}
          <button
              onClick={() => navigate("/editPage?type=custom")}
              className="bg-purple-500 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:bg-purple-600"
          >
            Create structure from scratch
          </button>
        </div>
      </div>
  );
};

export default StructureSelectionPage;
