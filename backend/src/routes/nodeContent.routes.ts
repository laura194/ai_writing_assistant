import express from "express";
import {
  createNodeContent,
  getNodeContents,
  getNodeContentById,
  updateNodeContent,
} from "../controllers/nodeContent.controller";

const router = express.Router();

router.post("/", createNodeContent);
router.get("/", getNodeContents);
router.get("/:id", getNodeContentById);
router.put("/:nodeId", updateNodeContent);  

export default router;
