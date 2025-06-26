import mongoose, { Schema, Document } from "mongoose";

export interface IAiProtocol extends Document {
  aiName: string;
  usageForm: string;
  affectedParts: string;
  remarks: string;
  projectId: mongoose.Types.ObjectId; // Referenz auf das Projekt
  createdAt?: Date; 
  updatedAt?: Date;
}

const aiProtocolSchema: Schema = new Schema(
  {
    aiName: { type: String, required: true },
    usageForm: { type: String, required: true },
    affectedParts: { type: String, required: true },
    remarks: { type: String, required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true }, // Referenz zum Projekt
  },
  { timestamps: true },
);

export default mongoose.model<IAiProtocol>("AiProtocol", aiProtocolSchema);
