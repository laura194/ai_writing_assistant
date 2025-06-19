import mongoose, { Schema, Document } from "mongoose";

export interface INodeContent extends Document {
    nodeId: string; 
    name: string;
    category: string;
    content: string
}

const nodeContent: Schema = new Schema({
    nodeId: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    content: { type: String, required: true }
    });

export default mongoose.model<INodeContent>("Node Content", nodeContent);