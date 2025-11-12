import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
  name: string;
  username: string;
  projectStructure: object;
  isPublic: boolean; // neu: public/private toggle
  tags?: string[]; // neu: Tags
  titleCommunityPage?: string; // neu: Community Page Title
  category?: string; // neu: Kategorie
  typeOfDocument?: string; // neu: Dokumenttyp
  authorName?: string; // Optional: Name des Autors
  created_at?: Date;
  updated_at?: Date;
  upvotedBy: string[];
  favoritedBy: string[];
}

const projectSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true },
    projectStructure: { type: Schema.Types.Mixed, required: true }, // Store JSON object directly

    // neue Felder:
    isPublic: { type: Boolean, default: false }, // default = private
    tags: { type: [String], default: [] },
    titleCommunityPage: { type: String, default: "" },
    category: { type: String, default: "" },
    typeOfDocument: { type: String, default: "" },
    authorName: { type: String, default: "" }, // Optional: Name des Autors

    upvotedBy: { type: [String], default: [] },
    favoritedBy: { type: [String], default: [] },
  },
  {
    timestamps: true, // created_at + updated_at automatisch
  },
);

export default mongoose.model<IProject>("Project", projectSchema);
