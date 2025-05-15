import { Request, Response } from "express";
import CurrentProject from "../models/CurrentProjectModel";

// Funktion zum Erstellen eines neuen Projekts
export const createProject = async (req: Request, res: Response) => {
    try {
        const { name, type, description, structure } = req.body;

        // Neues Projekt basierend auf dem Request erstellen
        const newProject = new CurrentProject({
            name,
            type,
            description,
            structure,
        });

        // Projekt in der Datenbank speichern
        const savedProject = await newProject.save();

        res.status(201).json({
            message: "Projekt erfolgreich erstellt!",
            project: savedProject,
        });
    } catch (error) {
        console.error("Fehler beim Erstellen des Projekts:", error);
        res.status(500).json({
            error: "Ein Fehler ist beim Erstellen des Projekts aufgetreten.",
        });
    }
};

// Funktion zum Abrufen aller Projekte
export const getAllProjects = async (req: Request, res: Response) => {
    try {
        const projects = await CurrentProject.find();
        res.status(200).json({
            message: "Projekte erfolgreich abgerufen!",
            projects,
        });
    } catch (error) {
        console.error("Fehler beim Abrufen der Projekte:", error);
        res.status(500).json({
            error: "Ein Fehler ist beim Abrufen der Projekte aufgetreten.",
        });
    }
};

// Funktion zum Abrufen eines einzelnen Projekts anhand der ID
export const getProjectById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const project = await CurrentProject.findById(id);

        if (!project) {
            return res.status(404).json({
                error: "Projekt nicht gefunden.",
            });
        }

        res.status(200).json({
            message: "Projekt erfolgreich abgerufen!",
            project,
        });
    } catch (error) {
        console.error("Fehler beim Abrufen des Projekts:", error);
        res.status(500).json({
            error: "Ein Fehler ist beim Abrufen des Projekts aufgetreten.",
        });
    }
};

// Funktion zum Aktualisieren eines Projekts
export const updateProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, type, description, structure } = req.body;

        const updatedProject = await CurrentProject.findByIdAndUpdate(
            id,
            { name, type, description, structure },
            { new: true } // Rückgabe des aktualisierten Dokuments
        );

        if (!updatedProject) {
            return res.status(404).json({
                error: "Projekt nicht gefunden.",
            });
        }

        res.status(200).json({
            message: "Projekt erfolgreich aktualisiert!",
            project: updatedProject,
        });
    } catch (error) {
        console.error("Fehler beim Aktualisieren des Projekts:", error);
        res.status(500).json({
            error: "Ein Fehler ist beim Aktualisieren des Projekts aufgetreten.",
        });
    }
};

// Funktion zum Löschen eines Projekts
export const deleteProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const deletedProject = await CurrentProject.findByIdAndDelete(id);

        if (!deletedProject) {
            return res.status(404).json({
                error: "Projekt nicht gefunden.",
            });
        }

        res.status(200).json({
            message: "Projekt erfolgreich gelöscht!",
            project: deletedProject,
        });
    } catch (error) {
        console.error("Fehler beim Löschen des Projekts:", error);
        res.status(500).json({
            error: "Ein Fehler ist beim Löschen des Projekts aufgetreten.",
        });
    }
};