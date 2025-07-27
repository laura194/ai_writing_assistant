import { Request, Response } from "express";
import Project from "../models/Project";
import NodeContent from "../models/NodeContent";
import AiProtocol from "../models/AIProtocol";

// Create a new Project entry
export const createProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, username, projectStructure } = req.body;

  if (!name || !username || !projectStructure) {
    res.status(400).json({ error: "Alle Felder sind erforderlich" });
    return;
  }

  try {
    // Save the project with projectStructure as an object (not a string)
    const newProject = new Project({
      name,
      username,
      projectStructure, // projectStructure is stored as an object
    });

    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    console.error("Fehler beim Erstellen des Projekts:", error);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
};

// Get a project by its ID
export const getProjectById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params; // ID aus den URL-Parametern holen

    if (!id) {
      res.status(400).json({ error: "Project ID is required" });
      return;
    }

    const project = await Project.findById(id);

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.status(200).json(project);
  } catch (error) {
    console.error("Error fetching project by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all projects
export const getAllProjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching all projects:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update a specific project entry by ID
export const updateProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { name, username, projectStructure } = req.body;

  if (!id || !name || !username || !projectStructure) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  try {
    const updatedProject = await Project.findOneAndUpdate(
      { _id: id }, // Verwende _id statt id als Mongoose ID
      { name, username, projectStructure: projectStructure || [] }, // Falls projectStructure nicht übergeben wurde, leer lassen
      { new: true }
    );

    if (!updatedProject) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.status(200).json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all projects by username
export const getProjectsByUsername = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username } = req.query;

  if (!username) {
    res.status(400).json({ error: "Username is required" });
    return;
  }

  try {
    const projects = await Project.find({ username: username.toString() }).sort(
      { createdAt: -1 }
    );

    if (projects.length === 0) {
      res.status(404).json({ error: "No projects found for this username" });
      return;
    }

    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects by username:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get the last 3 recent created projects by username
export const getRecentProjectsByUsername = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username } = req.query;

  if (!username) {
    res.status(400).json({ error: "Username is required" });
    return;
  }

  try {
    const projects = await Project.find({ username: username.toString() })
      .sort({ createdAt: -1 })
      .limit(3);

    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching recent projects:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a project by its ID
export const deleteProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ error: "Project ID is required" });
    return;
  }

  try {
    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const deletedNodeContents = await NodeContent.deleteMany({ projectId: id });

    const deletedAiProtocols = await AiProtocol.deleteMany({ projectId: id });

    res.status(200).json({
      message: "Project and related data successfully deleted",
      deletedProject,
      deletedNodeContents: deletedNodeContents.deletedCount,
      deletedAiProtocols: deletedAiProtocols.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
