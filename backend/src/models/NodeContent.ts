import mongoose, { Schema, Document } from "mongoose";

export interface INodeContent extends Document {
  nodeId: string;
  name: string;
  category: string;
  content: string;
  projectId: string;
  icon?: string;
  updatedAt?: Date;
  createdAt?: Date;
}

const NodeContentSchema: Schema = new Schema(
  {
    nodeId: { type: String, required: true },
    name: { type: String, required: true, default: "" },
    category: { type: String, required: true, default: "file" },
    content: { type: String, required: true, default: "" },
    projectId: { type: String, required: true },
    icon: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

NodeContentSchema.index({ nodeId: 1, projectId: 1 }, { unique: true });

export default mongoose.models.NodeContent ||
  mongoose.model<INodeContent>("NodeContent", NodeContentSchema);
