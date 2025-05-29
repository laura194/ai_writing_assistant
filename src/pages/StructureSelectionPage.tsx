/* chat gpt
import { useNavigate } from "react-router-dom";

const StructureSelectionPage = () => {
  const navigate = useNavigate();

  const handleSelection = (type: string) => {
    const jsonFile = type === "imrad" ? "/imrad.json" : "/design.json";
    fetch(jsonFile)
        .then((response) => response.json())
        .then((structure) =>
            navigate("/editPage", { state: { structure } })
        )
        .catch((error) =>
            console.error("Fehler beim Laden der Kapitelstruktur:", error)
        );
  };

  return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col space-y-4">
          {}
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
              onClick={() => navigate("/editPage", { state: { structure: [] } })}
              className="bg-purple-500 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:bg-purple-600"
          >
            Create structure from scratch
          </button>
        </div>
      </div>
  );
};

export default StructureSelectionPage;
*/

import { useNavigate } from "react-router-dom";

const StructureSelectionPage = () => {
  const navigate = useNavigate();

  const handleSelection = (type: string) => {
    // Je nach Typ die entsprechende JSON-Datei laden
    const jsonFile = type === "imrad" ? "/imrad.json" : "/design.json";
    fetch(jsonFile)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Fehler beim Laden der JSON-Struktur");
          }
          return response.json();
        })
        .then((structure) =>
            // Navigiere zur EditPage und übergebe die Strukturdaten per state
            navigate("/editPage", { state: { structure } })
        )
        .catch((error) =>
            console.error("Fehler beim Laden der Kapitelstruktur:", error)
        );
  };

  return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col space-y-4">
          {/* Button für IMRaD */}
          <button
              onClick={() => handleSelection("imrad")}
              className="bg-blue-500 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:bg-blue-600"
          >
            Story-for-Explanation Pattern (IMRaD)
          </button>

          {/* Button für Design */}
          <button
              onClick={() => handleSelection("design")}
              className="bg-green-500 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:bg-green-600"
          >
            Story-for-Design Pattern
          </button>

          {/* Button für das Erstellen einer leeren Struktur */}
          <button
              onClick={() => navigate("/editPage", { state: { structure: [] } })}
              className="bg-purple-500 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:bg-purple-600"
          >
            Create structure from scratch
          </button>
        </div>
      </div>
  );
};

export default StructureSelectionPage;

/* (funktionierend von laura)
const StructureSelectionPage = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      {}
      <div className="flex flex-col space-y-4">
        <button
          onClick={() =>
            alert("Story-for-Explanation Pattern (IMRaD) ausgewählt")
          }
          className="bg-blue-500 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:bg-blue-600"
        >
          Story-for-Explanation Pattern (IMRaD)
        </button>

        <button
          onClick={() => alert("Story-for-Design Pattern ausgewählt")} // Platzhalter
          className="bg-green-500 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:bg-green-600"
        >
          Story-for-Design Pattern
        </button>

        <button
          onClick={() => alert("Create structure from scratch ausgewählt")} // Platzhalter
          className="bg-purple-500 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:bg-purple-600"
        >
          Create structure from scratch
        </button>
      </div>
    </div>
  );
};

export default StructureSelectionPage;
*/