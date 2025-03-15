import { useLocation } from "react-router-dom";
import "./EditorPage.css";

function EditorPage() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const projectName = queryParams.get("projectName") || "Neues Projekt";
    const structureType = queryParams.get("structure") || "empty";

    return (
        <div className="editor-container">
            <h1 className="editor-title">{projectName}</h1>
            <p>Projektstruktur: {structureType}</p>
            {/* Hier kannst du deine Editor-Komponenten einfügen */}
        </div>
    );
}

export default EditorPage;
