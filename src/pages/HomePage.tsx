import { useNavigate } from "react-router-dom";
import { SignOutButton, useUser } from "@clerk/clerk-react";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Willkommen{user?.firstName ? `, ${user.firstName}` : ""}!
        </h1>
        <p className="text-gray-600 mb-6">Was möchtest du als Nächstes tun?</p>

        <div className="flex flex-col gap-4 mb-6">
          <button
            onClick={() => navigate("/editPage")}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Bestehendes Projekt öffnen
          </button>
          <button
            onClick={() => navigate("/structureSelectionPage")}
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            Neues Projekt erstellen
          </button>
        </div>

        <SignOutButton>
          <button className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
            Abmelden
          </button>
        </SignOutButton>
      </div>
    </div>
  );
};

export default HomePage;
