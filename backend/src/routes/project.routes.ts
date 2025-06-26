import express from "express";
import {
  createProject,
  getProjects,
  updateProject,
  getProjectsByUsername // Neue Funktion importieren
} from "../controllers/project.controller";

const router = express.Router();

router.post("/", createProject);
router.get("/", getProjects);
router.get("/:id", getProjects);  // Retrieve by ID
router.put("/:id", updateProject);  // Update by ID
router.get("/by-username", getProjectsByUsername);  // Neue Route für Projekte nach Username

export default router;
