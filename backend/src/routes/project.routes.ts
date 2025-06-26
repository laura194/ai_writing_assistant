import express from "express";
import {
  createProject,
  getProjects,
  updateProject
} from "../controllers/project.controller";

const router = express.Router();

router.post("/", createProject);
router.get("/", getProjects);
router.get("/:id", getProjects);  // Retrieve by ID
router.put("/:id", updateProject);  // Update by ID

export default router;
