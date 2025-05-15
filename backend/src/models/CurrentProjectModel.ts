import { Schema, model, Document } from "mongoose";

// Interface, das die Struktur des "Projekt"-Dokuments definiert
export interface ICurrentProject extends Document {
    name: string; // Der Name des Projekts
    type: string; // Der Typ des Projekts (z. B. "Website", "App", etc.)
    description?: string; // Optionale Beschreibung des Projekts
    structure: object; // Eine JSON-ähnliche Struktur für Projekt-Inhalte
    createdAt: Date; // Zeitstempel, wann das Projekt erstellt wurde
    updatedAt: Date; // Zeitstempel, wann das Projekt zuletzt aktualisiert wurde
}

// Schema-Definition für das Projekt
const CurrentProjectSchema = new Schema<ICurrentProject>(
    {
        name: {
            type: String,
            required: true, // Der Name ist erforderlich
            trim: true, // Entfernt Leerzeichen am Anfang und Ende
        },
        type: {
            type: String,
            required: true, // Der Typ ist ebenfalls erforderlich
            enum: ["Website", "App", "Custom", "Other"], // Bestimmte Typen zulässig
            default: "Custom", // Standardwert, falls kein Typ angegeben ist
        },
        description: {
            type: String,
            trim: true, // Entfernt Leerzeichen am Anfang und Ende (falls vorhanden)
        },
        structure: {
            type: Schema.Types.Mixed, // JSON-ähnliche Struktur kann hier gespeichert werden
            required: true, // Die Projektstruktur ist erforderlich
        },
    },
    {
        timestamps: true, // Automatisiert die Felder createdAt und updatedAt
    }
);

// Das Modell erstellen und exportieren
const CurrentProject = model<ICurrentProject>("CurrentProject", CurrentProjectSchema);

export default CurrentProject;