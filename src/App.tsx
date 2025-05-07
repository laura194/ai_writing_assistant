import { Routes, Route } from "react-router-dom";
import EditPage from "./pages/EditPage";
import StructureSelectionPage from "./pages/StructureSelectionPage.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import HomePage from "./pages/HomePage.tsx";

const App = () => {
  return (
    <Routes>
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/structureSelectionPage"
        element={
          <ProtectedRoute>
            <StructureSelectionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/editPage"
        element={
          <ProtectedRoute>
            <EditPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<p>Page not found</p>} />
    </Routes>
  );
};

export default App;
