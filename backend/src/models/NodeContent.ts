import mongoose, { Schema, Document } from "mongoose";
import { encrypt, decrypt, isEncryptionEnabled } from "../utils/encryption.util";

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
  },
);

NodeContentSchema.index({ nodeId: 1, projectId: 1 }, { unique: true });

// 🔒 ENCRYPTION: Encrypt content before saving to database
NodeContentSchema.pre('save', function(next) {
  if (isEncryptionEnabled() && this.isModified('content') && this.content) {
    try {
      this.content = encrypt(String(this.content));
    } catch (error) {
      console.error('❌ Error encrypting content:', error);
      return next(error as Error);
    }
  }
  next();
});

// 🔓 DECRYPTION: Decrypt content after retrieving from database
NodeContentSchema.post('init', function(doc) {
  if (isEncryptionEnabled() && doc.content) {
    try {
      doc.content = decrypt(String(doc.content));
    } catch {
      console.error('❌ Error decrypting content for document:', doc._id);
      // Don't throw error, just log it - prevents app from crashing
    }
  }
});

// 🔓 DECRYPTION: Handle findOneAndUpdate queries
NodeContentSchema.post('findOneAndUpdate', function(doc) {
  if (doc && isEncryptionEnabled() && doc.content) {
    try {
      doc.content = decrypt(String(doc.content));
    } catch {
      console.error('❌ Error decrypting content:', doc._id);
    }
  }
});

// 🔒 ENCRYPTION: Handle updates
NodeContentSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() as Record<string, unknown>;
  
  if (isEncryptionEnabled() && update && update.content) {
    try {
      update.content = encrypt(String(update.content));
    } catch (error) {
      console.error('❌ Error encrypting content on update:', error);
      return next(error as Error);
    }
  }
  next();
});

export default mongoose.models.NodeContent ||
  mongoose.model<INodeContent>("NodeContent", NodeContentSchema);
  