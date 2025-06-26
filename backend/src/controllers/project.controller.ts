import { Request, Response } from "express";
import Project from "../models/project.model";  // Hier das neue Project Modell importieren

// Project erstellen (verhindert Duplikate)
export const createProject = async (req: Request, res: Response): Promise<void> => {
  const { id, name, username, projectStructure } = req.body;

  if (!id || !name || !username || !projectStructure) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  try {
    // Überprüfen, ob das Projekt bereits existiert
    const existing = await Project.findOne({ id });
    if (existing) {
      res.status(409).json({ error: "Project with this id already exists" });
      return;
    }

    const newProject = new Project({ id, name, username, projectStructure });
    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    console.error("Error saving project:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Alle Projekte abrufen oder nach id filtern
export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.query;

    if (id) {
      const filtered = await Project.find({ id: id.toString() });
      res.status(200).json(filtered);
    } else {
      const projects = await Project.find();
      res.status(200).json(projects);
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Ein spezifisches Project nach id abrufen
export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const project = await Project.findOne({ id });

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

// Ein spezifisches Project nach id aktualisieren
export const updateProject = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, username, projectStructure } = req.body;

  if (!name || !username || !projectStructure) {
    res.status(400).json({ error: "Name, username, and project structure are required" });
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
