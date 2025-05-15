import express from "express";
import {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
} from "../controllers/CurrentProjectController";

const router = express.Router();

// Route: Neues Projekt erstellen
router.post("/", createProject);

// Route: Alle Projekte abrufen
router.get("/", getAllProjects);

// Route: Einzelnes Projekt abrufen
router.get("/:id", getProjectById);

// Route: Projekt aktualisieren
router.put("/:id", updateProject);

// Route: Projekt löschen
router.delete("/:id", deleteProject);

export default router;