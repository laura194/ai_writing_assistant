import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EditPage from "./pages/EditPage"; // Ausgelagerte Logik
import LandingPage from "./pages/LandingPage"; // Neue Seite für Auswahl

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} /> {/* Neue Landing Page */}
                <Route path="/editPage" element={<EditPage />} /> {/* Bestehende Anwendung */}
            </Routes>
        </Router>
    );
};

export default App;