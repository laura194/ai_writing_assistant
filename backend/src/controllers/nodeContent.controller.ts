import { Request, Response } from "express";
import NodeContent from "../models/NodeContent";

// Create a new NodeContent entry
export const createNodeContent = async (req: Request, res: Response): Promise<void> => {
  const { nodeId, name, category, content } = req.body;

  // Check if content is empty and set it to a default value
  if (!content) {
    res.status(400).json({ error: "Content cannot be empty" });
    return; // Ensure we exit the function after sending the response
  }

  // Further validation for other fields
  if (!nodeId || !name || !category) {
    res.status(400).json({ error: "All fields are required" });
    return; // Ensure we exit the function after sending the response
  }

  const newNodeContent = new NodeContent({ nodeId, name, category, content });

  try {
    const savedNodeContent = await newNodeContent.save();
    res.status(201).json(savedNodeContent);  // Send successful response
  } catch (error) {
    console.error('Error saving node content:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all NodeContent entries by nodeId
export const getNodeContents = async (req: Request, res: Response): Promise<void> => {
  const { nodeId } = req.query;

  if (!nodeId || typeof nodeId !== "string") {
    res.status(400).json({ error: "nodeId is required as a query parameter" });
    return; // Exit after sending error response
  }

  try {
    const contents = await NodeContent.find({ nodeId });
    res.status(200).json(contents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get a specific NodeContent entry by its MongoDB _id
export const getNodeContentById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const nodeContent = await NodeContent.findById(id);
    if (!nodeContent) {
      res.status(404).json({ error: "NodeContent not found" });
      return; // Exit if the nodeContent is not found
    }
    res.status(200).json(nodeContent);  // Send the found node content
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update a specific NodeContent entry by nodeId
export const updateNodeContent = async (req: Request, res: Response): Promise<void> => {
    const { nodeId } = req.params;  // Get nodeId from URL params
    const { name, category, content } = req.body;  // Get the updated data from the request body
    
    // Check if content is empty
    if (!content) {
      res.status(400).json({ error: "Content cannot be empty" });
      return;
    }
  
    // Further validation for other fields
    if (!nodeId || !name || !category) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }
  
    try {
      // Find and update the document by nodeId
      const updatedNodeContent = await NodeContent.findOneAndUpdate(
        { nodeId },  // Find by nodeId
        { name, category, content },  // Update these fields
        { new: true }  // Return the updated document
      );
  
      if (!updatedNodeContent) {
        console.log('No content found with the given nodeId:', nodeId);
        res.status(404).json({ error: "NodeContent not found" });
        return;
      }
  
      res.status(200).json(updatedNodeContent);  // Return the updated node content
    } catch (error) {
      console.error('Error updating node content:', error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
