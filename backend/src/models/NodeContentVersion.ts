import mongoose, { Schema, Document } from "mongoose";

export interface INodeContentVersion extends Document {
  nodeId: string;
  projectId: string;
  name: string;
  category: string;
  content: string;
  userId?: string | null;
  meta?: Record<string, unknown>;
  createdAt?: Date;
}

const NodeContentVersionSchema: Schema = new Schema(
  {
    nodeId: { type: String, required: true },
    projectId: { type: String, required: true },
    name: { type: String, default: "" },
    category: { type: String, default: "file" },
    content: { type: String, default: "" },
    userId: { type: String, default: null },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

NodeContentVersionSchema.index({ nodeId: 1, projectId: 1, createdAt: -1 });

export default mongoose.models.NodeContentVersion ||
  mongoose.model<INodeContentVersion>(
    "NodeContentVersion",
    NodeContentVersionSchema
  );
