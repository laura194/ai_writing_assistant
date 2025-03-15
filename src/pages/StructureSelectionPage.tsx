import { useNavigate, useLocation } from "react-router-dom";
import "./StructureSelectionPage.css";

function StructureSelectionPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const projectName = location.state?.projectName || "Neues Projekt";

    const handleStructureSelection = (structure: string) => {
        navigate(`/editor?structure=${structure}&projectName=${projectName}`);
    };

    return (
        <div className="structure-selection-container">
            <h1 className="structure-selection-title">Wähle eine Struktur für {projectName}</h1>
            <div className="structure-selection-buttons">
                <button
                    className="structure-selection-button structure1"
                    onClick={() => handleStructureSelection("structure1")}
                >
                    Struktur 1 wählen
                </button>
                <button
                    className="structure-selection-button structure2"
                    onClick={() => handleStructureSelection("structure2")}
                >
                    Struktur 2 wählen
                </button>
                <button
                    className="structure-selection-button empty"
                    onClick={() => handleStructureSelection("empty")}
                >
                    Leeres Projekt erstellen
                </button>
            </div>
        </div>
    );
}

export default StructureSelectionPage;
