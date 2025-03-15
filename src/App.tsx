import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProjectNamePage from "./pages/ProjectNamePage";
import EditorPage from "./pages/EditorPage"; // Die Seite, auf der das Editor-Layout ist
import './App.css';
import ProjectSelection from "./pages/ProjectSelection.tsx";

function App() {
    return (
        <Router>
            <Routes>
                {/* Route für die Seite, auf der der Projektname eingegeben wird */}
                <Route path="/" element={<ProjectNamePage />} />

                {/* Route für die Seite, auf der Struktur 1 oder Struktur 2 ausgewählt wird */}
                <Route path="/select-structure" element={<ProjectSelection />} />

                {/* Route für den leeren Projekteditor */}
                <Route path="/editor" element={<EditorPage />} />
            </Routes>
        </Router>
    );
}

export default App;
