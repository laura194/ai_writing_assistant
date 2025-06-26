import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
  name: string;
  username: string;
  projectStructure: object;
  created_at?: Date;
  updated_at?: Date;
}

const projectSchema: Schema = new Schema(
    {
      name: { type: String, required: true },
      username: { type: String, required: true },
      projectStructure: { type: Schema.Types.Mixed, required: true }, // Store JSON object directly
    },
    {
      timestamps: true, // Automatically manage created_at and updated_at
    }
  );
  

export default mongoose.model<IProject>("Project", projectSchema);
