import mongoose, { Schema, Document } from "mongoose";

// Interface für die ProjectStructure-Dokumente
export interface IProjectStructure extends Document {
  id: string;
  username: string;
  structure: object;  // JSON-Struktur
}

// Schema für ProjectStructure
const projectStructureSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  structure: { type: Object, required: true },
});

export default mongoose.model<IProjectStructure>("ProjectStructure", projectStructureSchema);
