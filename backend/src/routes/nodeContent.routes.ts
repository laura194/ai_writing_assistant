import express from "express";
import {
  createNodeContent,
  getNodeContents,
  getNodeContentById,
  updateNodeContent,
  createVersion,
  listVersions,
  getVersion,
  revertToVersion,
} from "../controllers/nodeContent.controller";

const router = express.Router();

router.post("/", createNodeContent);
router.get("/", getNodeContents);
router.get("/:id", getNodeContentById);
router.put("/:nodeId", updateNodeContent);

router.post("/:nodeId/versions", createVersion);
router.get("/:nodeId/versions", listVersions);
router.get("/:nodeId/versions/:versionId", getVersion);
router.post("/:nodeId/versions/:versionId/revert", revertToVersion);

export default router;
