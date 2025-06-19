import { Request, Response } from "express";
import NodeContent from "../models/NodeContent";

// Create a new NodeContent entry (prevents duplicates)
export const createNodeContent = async (req: Request, res: Response): Promise<void> => {
  const { nodeId, name, category, content } = req.body;

  if (!content) {
    res.status(400).json({ error: "Content cannot be empty" });
    return;
  }

  if (!nodeId || !name || !category) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  try {
    const existing = await NodeContent.findOne({ nodeId });
    if (existing) {
      res.status(409).json({ error: "NodeContent with this nodeId already exists", existing });
      return;
    }

    const newNodeContent = new NodeContent({ nodeId, name, category, content });
    const savedNodeContent = await newNodeContent.save();
    res.status(201).json(savedNodeContent);
  } catch (error) {
    console.error("Error saving node content:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all NodeContent entries, or filter by ?nodeId=...
export const getNodeContents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nodeId } = req.query;

    if (nodeId) {
      const filtered = await NodeContent.find({ nodeId: nodeId.toString() });
      res.status(200).json(filtered);
    } else {
      const contents = await NodeContent.find();
      res.status(200).json(contents);
    }
  } catch (error) {
    console.error("Error fetching node contents:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get a specific NodeContent entry by its nodeId (via URL param)
export const getNodeContentById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const nodeContent = await NodeContent.findOne({ nodeId: id });

    if (!nodeContent) {
      res.status(404).json({ error: "NodeContent with the given nodeId not found" });
      return;
    }

    res.status(200).json(nodeContent);
  } catch (error) {
    console.error("Error fetching node content by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update a specific NodeContent entry by nodeId
export const updateNodeContent = async (req: Request, res: Response): Promise<void> => {
  const { nodeId } = req.params;
  const { name, category, content } = req.body;

  if (!content) {
    res.status(400).json({ error: "Content cannot be empty" });
    return;
  }

  if (!nodeId || !name || !category) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  try {
    const updatedNodeContent = await NodeContent.findOneAndUpdate(
      { nodeId },
      { name, category, content },
      { new: true }
    );

    if (!updatedNodeContent) {
      console.log("No content found with the given nodeId:", nodeId);
      res.status(404).json({ error: "NodeContent not found" });
      return;
    }

    res.status(200).json(updatedNodeContent);
  } catch (error) {
    console.error("Error updating node content:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
