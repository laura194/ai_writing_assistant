import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import ProjectNamePage from "./pages/ProjectNamePage.tsx";
import ProjectSelection from "./pages/ProjectSelection.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<ProjectSelection />} />
                <Route path="/editor" element={<App />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>
);
