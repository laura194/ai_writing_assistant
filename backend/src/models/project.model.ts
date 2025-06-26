import mongoose, { Schema, Document } from "mongoose";

// Interface für die Project-Dokumente
export interface IProject extends Document {
  id: string;
  name: string;
  username: string;
  projectStructure: object;  // JSON-Struktur der Projektstruktur
}

// Schema für Project
const projectSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  username: { type: String, required: true },
  projectStructure: { type: Object, required: true },
});

export default mongoose.model<IProject>("Project", projectSchema);
