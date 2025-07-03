import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import Header from "../components/Header";
import { FolderPlus, FolderOpen } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  return (
    <div className="flex flex-col min-h-screen bg-gray-200 text-gray-800">
      <Header />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white shadow-md rounded-xl p-8 text-center">
          <h1 className="text-2xl font-semibold mb-2">
            Welcome{user?.firstName ? `, ${user.firstName}` : ""}!
          </h1>
          <p className="text-gray-600 mb-8">What would you like to do next?</p>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate("/myProjects")}
              className="flex items-center justify-center gap-2 bg-gray-400 hover:bg-gray-500 text-white font-medium py-3 px-4 rounded-md transition"
            >
              <FolderOpen className="w-5 h-5" />
              Open Existing Project
            </button>

            <button
              onClick={() => navigate("/structureSelection")}
              className="flex items-center justify-center gap-2 bg-gray-400 hover:bg-gray-500 text-white font-medium py-3 px-4 rounded-md transition"
            >
              <FolderPlus className="w-5 h-5" />
              Create New Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
