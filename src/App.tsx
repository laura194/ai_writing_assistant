import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EditPage from "./pages/EditPage";
import LandingPage from "./pages/LandingPage";
import StructureSelectionPage from "./pages/StructureSelectionPage.tsx";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/structureSelectionPage"
          element={<StructureSelectionPage />}
        />
        <Route path="/editPage" element={<EditPage />} />
      </Routes>
    </Router>
  );
};

export default App;
