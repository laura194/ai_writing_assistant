import { Request, Response } from "express";
import Comment, { IComment } from "../models/Comment";

export const createComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, username, content } = req.body;

    if (!projectId || !username || !content) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const comment = new Comment({ projectId, username, content });
    const saved = await comment.save();

    res.status(201).json(saved);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create comment" });
  }
};

export const getCommentsByProjectId = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const comments = await Comment.find({ projectId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await Comment.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
};
