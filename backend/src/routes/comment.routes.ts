import express from "express";
import {
  createComment,
  getCommentsByProjectId,
  deleteComment,
} from "../controllers/comment.controller";

const router = express.Router();

router.get("/:projectId", getCommentsByProjectId);
router.post("/", createComment);
router.delete("/:id", deleteComment);

export default router;
