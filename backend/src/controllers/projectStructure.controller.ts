import { Request, Response } from "express";
import ProjectStructure from "../models/projectStructure.model";

// ProjectStructure erstellen (verhindert Duplikate)
export const createProjectStructure = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id, username, structure } = req.body;

  if (!id || !username || !structure) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  try {
    // Überprüfen, ob die Struktur bereits existiert
    const existing = await ProjectStructure.findOne({ id });
    if (existing) {
      res.status(409).json({ error: "ProjectStructure with this id already exists" });
      return;
    }

    const newProjectStructure = new ProjectStructure({ id, username, structure });
    const savedProjectStructure = await newProjectStructure.save();
    res.status(201).json(savedProjectStructure);
  } catch (error) {
    console.error("Error saving project structure:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Alle ProjectStructure Einträge abrufen oder nach id filtern
export const getProjectStructures = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.query;

    if (id) {
      const filtered = await ProjectStructure.find({ id: id.toString() });
      res.status(200).json(filtered);
    } else {
      const structures = await ProjectStructure.find();
      res.status(200).json(structures);
    }
  } catch (error) {
    console.error("Error fetching project structures:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Eine spezifische ProjectStructure nach id abrufen
export const getProjectStructureById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const projectStructure = await ProjectStructure.findOne({ id });

    if (!projectStructure) {
      res.status(404).json({ error: "ProjectStructure not found" });
      return;
    }

    res.status(200).json(projectStructure);
  } catch (error) {
    console.error("Error fetching project structure by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Eine spezifische ProjectStructure nach id aktualisieren
export const updateProjectStructure = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { username, structure } = req.body;

  if (!username || !structure) {
    res.status(400).json({ error: "Username and structure are required" });
    return;
  }

  try {
    const updatedProjectStructure = await ProjectStructure.findOneAndUpdate(
      { id },
      { username, structure },
      { new: true }
    );

    if (!updatedProjectStructure) {
      res.status(404).json({ error: "ProjectStructure not found" });
      return;
    }

    res.status(200).json(updatedProjectStructure);
  } catch (error) {
    console.error("Error updating project structure:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
