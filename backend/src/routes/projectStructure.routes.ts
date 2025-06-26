import express from "express";
import {
  createProjectStructure,
  getProjectStructures,
  getProjectStructureById,
  updateProjectStructure,
} from "../controllers/projectStructure.controller";

const router = express.Router();

router.post("/", createProjectStructure);
router.get("/", getProjectStructures);
router.get("/:id", getProjectStructureById);
router.put("/:id", updateProjectStructure);

export default router;
