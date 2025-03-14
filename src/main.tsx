import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import ProjectSelection from "./pages/ProjectSelection";

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
