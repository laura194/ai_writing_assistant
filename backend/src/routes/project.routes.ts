import express from 'express';
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  getProjectsByUsername // Importing the function
} from "../controllers/project.controller";

const router = express.Router();

// Define your routes
router.post("/", createProject);
router.get("/", getAllProjects);
router.get("/by-username", getProjectsByUsername);  
router.get("/:id", getProjectById);  // Retrieve by ID
router.put("/:id", updateProject);  // Update by ID

export default router;
