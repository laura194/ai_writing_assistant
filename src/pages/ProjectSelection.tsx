import { useNavigate } from "react-router-dom";
import "./ProjectSelection.css"; // Importiere die CSS-Datei

function ProjectSelection() {
    const navigate = useNavigate();

    const handleSelection = (projectType: string) => {
        navigate(`/editor?type=${projectType}`); // Leitet zur Editor-Seite mit dem gewählten Projekttyp
    };

    return (
        <div className="project-selection-container">
            <h1 className="project-selection-title">Choose structure</h1>
            <div className="project-selection-buttons">
                <button
                    className="project-selection-button structure1"
                    onClick={() => handleSelection("structure1")}
                >
                    Story-for-Explanation Pattern (IMRaD)
                </button>
                <button
                    className="project-selection-button structure2"
                    onClick={() => handleSelection("structure2")}
                >
                    Story-for-Design Pattern
                </button>
                <button
                    className="project-selection-button empty"
                    onClick={() => handleSelection("empty")}
                >
                    Create structure from scratch
                </button>
            </div>
        </div>
    );
}

export default ProjectSelection;
