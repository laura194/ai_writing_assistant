import mongoose, { Schema, Document } from "mongoose";

export interface IAiProtocol extends Document {
  aiName: string;
  usageForm: string;
  affectedParts: string;
  remarks: string;
  username: string;
  createdAt?: Date; // Optional, will be added by mongoose timestamps
  updatedAt?: Date; // Optional, will be added by mongoose timestamps
}

const aiProtocolSchema: Schema = new Schema(
  {
    aiName: { type: String, required: true },
    usageForm: { type: String, required: true },
    affectedParts: { type: String, required: true },
    remarks: { type: String, required: true },
    username: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model<IAiProtocol>("AiProtocol", aiProtocolSchema);
