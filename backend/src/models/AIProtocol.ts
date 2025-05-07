import mongoose, { Schema, Document } from 'mongoose';

export interface IAiProtocol extends Document {
  aiName: string;
  usageForm: string;
  affectedParts: string;
  remarks: string;
}

const aiProtocolSchema: Schema = new Schema(
  {
    aiName: { type: String, required: true },
    usageForm: { type: String, required: true },
    affectedParts: { type: String, required: true },
    remarks: { type: String, required: true },
  },
  { timestamps: true }  // Optional: Aktiviert automatisch `createdAt` und `updatedAt`
);

export default mongoose.model<IAiProtocol>('AiProtocol', aiProtocolSchema);
