import { Request, Response } from "express";
import Project from "../models/Project";

// Create a new Project entry
export const createProject = async (req: Request, res: Response): Promise<void> => {
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

// Get all projects or filter by project _id (Mongoose's internal ID)
export const getProjects = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.query;
  
      if (id) {
        // Verwenden von Mongoose's _id, statt der vorherigen "id"
        const project = await Project.findById(id.toString());
  
        if (!project) {
          res.status(404).json({ error: "Project not found" });
          return;
        }
  
        res.status(200).json(project);
      } else {
        const projects = await Project.find();
        res.status(200).json(projects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  

// Update a specific project entry by ID
export const updateProject = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, username, projectStructure } = req.body;

  if (!id || !name || !username || !projectStructure) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  try {
    const updatedProject = await Project.findOneAndUpdate(
      { id },
      { name, username, projectStructure },
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
export const getProjectsByUsername = async (req: Request, res: Response): Promise<void> => {
    const { username } = req.query;
  
    if (!username) {
      res.status(400).json({ error: "Username is required" });
      return;
    }
  
    try {
      const projects = await Project.find({ username: username.toString() });
  
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
  