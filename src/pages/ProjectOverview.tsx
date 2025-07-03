import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectService } from "../utils/ProjectService";
import { useUser } from "@clerk/clerk-react";
import { Project } from "../utils/types";

const ProjectOverview = () => {
  const { user } = useUser(); // Hole den aktuellen Benutzernamen über Clerk
  const navigate = useNavigate(); // Nutze useNavigate für die Navigation
  const [projects, setProjects] = useState<Project[]>([]); // Zustand für Projekte
  const [loading, setLoading] = useState<boolean>(true); // Ladezustand
  const [error, setError] = useState<string | null>(null); // Fehlerzustand

  // Hole alle Projekte des Benutzers beim ersten Laden
  useEffect(() => {
    const fetchProjects = async () => {
      if (user?.username) {
        try {
          const userProjects = await ProjectService.getProjectsByUsername(
            user.username,
          );
          setProjects(userProjects); // Setze die Projekte des Benutzers
        } catch (error) {
          setError("Fehler beim Laden der Projekte.");
          console.error("Fehler beim Laden der Projekte:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setError("Benutzername nicht gefunden.");
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const handleProjectClick = (id: string) => {
    // Navigiere zur Edit-Seite des Projektes
    navigate(`/edit/${id}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="flex flex-col space-y-4">
        <h1 className="text-center text-2xl font-bold mb-4">Deine Projekte</h1>

        {projects.length > 0 ? (
          <ul className="space-y-3">
            {projects.map((project) => (
              <li
                key={project._id}
                onClick={() => project._id && handleProjectClick(project._id)}
                className="cursor-pointer bg-white p-4 rounded-lg shadow-md hover:bg-gray-100"
              >
                {project.name}
              </li>
            ))}
          </ul>
        ) : (
          <div>Keine Projekte gefunden</div>
        )}
      </div>
    </div>
  );
};

export default ProjectOverview;
