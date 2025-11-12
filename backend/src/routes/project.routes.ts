import express from "express";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  getProjectsByUsername,
  deleteProject,
  getRecentProjectsByUsername,
  getPublicProjects,
  toggleUpvote,
  toggleFavorite,
} from "../controllers/project.controller";

const router = express.Router();

// Define your routes
router.get("/public", getPublicProjects);
router.post("/", createProject);
router.get("/", getAllProjects);
router.get("/by-username", getProjectsByUsername);
router.get("/by-username/recent", getRecentProjectsByUsername);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
router.post("/:id/toggle-upvote", toggleUpvote);
router.post("/:id/toggle-favorite", toggleFavorite);

export default router;
