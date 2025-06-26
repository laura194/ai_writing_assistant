import express from "express";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
} from "../controllers/project.controller";

const router = express.Router();

router.post("/", createProject);  // POST zum Erstellen eines neuen Projekts
router.get("/", getProjects);  // GET zum Abrufen aller Projekte
router.get("/:id", getProjectById);  // GET zum Abrufen eines Projekts nach ID
router.put("/:id", updateProject);  // PUT zum Aktualisieren eines Projekts

export default router;
