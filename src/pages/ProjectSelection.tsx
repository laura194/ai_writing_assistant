import { useNavigate } from "react-router-dom";
import "./ProjectSelection.css"; // Importiere die CSS-Datei

function ProjectSelection() {
    const navigate = useNavigate();

    const handleSelection = (projectType: string) => {
        navigate(`/editor?type=${projectType}`); // Leitet zur Editor-Seite mit dem gewählten Projekttyp
    };

    return (
        <div className="project-selection-container">
            <h1 className="project-selection-title">Wähle dein Projekt</h1>
            <div className="project-selection-buttons">
                <button
                    className="project-selection-button structure1"
                    onClick={() => handleSelection("structure1")}
                >
                    Projektstruktur 1 starten
                </button>
                <button
                    className="project-selection-button structure2"
                    onClick={() => handleSelection("structure2")}
                >
                    Projektstruktur 2 starten
                </button>
                <button
                    className="project-selection-button empty"
                    onClick={() => handleSelection("empty")}
                >
                    Leeres Projekt starten
                </button>
            </div>
        </div>
    );
}

export default ProjectSelection;
