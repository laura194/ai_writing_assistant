import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">Willkommen!</h1>
      <button
        onClick={() => navigate("/editPage")}
        className="bg-blue-500 text-white py-2 px-4 rounded mb-4 hover:bg-blue-600"
      >
        Bestehendes Projekt öffnen
      </button>
      <button
        onClick={() => navigate("/structureSelectionPage")}
        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
      >
        Neues Projekt erstellen
      </button>
    </div>
  );
};

export default LandingPage;
