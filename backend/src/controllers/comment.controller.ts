import { Request, Response } from "express";
import Comment from "../models/Comment";

export const createComment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { projectId, username, content } = req.body;

  if (!projectId || !username || !content) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  try {
    const newComment = new Comment({
      projectId,
      username,
      content,
    });

    // Pre-save hook encrypts here
    await newComment.save();

    // Query back to get decrypted version
    const savedComment = await Comment.findById(newComment._id);
    res.status(201).json(savedComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getCommentsByProjectId = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { projectId } = req.params;

  if (!projectId) {
    res.status(400).json({ error: "Project ID is required" });
    return;
  }

  try {
    // Post-find hook automatically decrypts all results
    const comments = await Comment.find({ projectId }).sort({ createdAt: -1 });

    res.status(200).json(comments); // Already decrypted
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getCommentById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ error: "Comment ID is required" });
    return;
  }

  try {
    // Post-findOne hook automatically decrypts
    const comment = await Comment.findById(id);

    if (!comment) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }

    res.status(200).json(comment); // Already decrypted
  } catch (error) {
    console.error("Error fetching comment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Use findById() + save() pattern
export const updateComment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const { content } = req.body;

  if (!id) {
    res.status(400).json({ error: "Comment ID is required" });
    return;
  }

  if (!content) {
    res.status(400).json({ error: "Content is required" });
    return;
  }

  try {
    // 1. Find the comment first (post-findOne hook decrypts)
    const comment = await Comment.findById(id);

    if (!comment) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }

    // 2. Update the field
    comment.content = content;

    // 3. Save (pre-save hook encrypts here)
    await comment.save();

    // 4. Query back to get decrypted version for response
    const updatedComment = await Comment.findById(id);
    res.status(200).json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteComment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ error: "Comment ID is required" });
    return;
  }

  try {
    // Get comment before deletion (for response, already decrypted)
    const comment = await Comment.findById(id);

    if (!comment) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }

    // Delete the comment
    await Comment.deleteOne({ _id: id });

    res.status(200).json({
      message: "Comment successfully deleted",
      deletedComment: comment,
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getCommentsByUsername = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { username } = req.query;

  if (!username) {
    res.status(400).json({ error: "Username is required" });
    return;
  }

  try {
    // The username in the database is encrypted.
    // For now, this will return empty results if username is encrypted:
    const comments = await Comment.find({ username: username.toString() });

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments by username:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Use find() + save() pattern
export const toggleUpvote = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const { username } = req.body;

  if (!username) {
    res.status(400).json({ error: "Username is required" });
    return;
  }

  try {
    // Find first (post-findOne hook decrypts)
    const comment = await Comment.findById(id);

    if (!comment) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }

    // Save (pre-save hook encrypts)
    await comment.save();

    // Query back for decrypted response
    const updatedComment = await Comment.findById(id);
    res.status(200).json(updatedComment);
  } catch (error) {
    console.error("Error toggling upvote:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
