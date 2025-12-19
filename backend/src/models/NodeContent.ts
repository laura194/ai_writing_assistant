import mongoose, { Schema, Document } from "mongoose";
import { encryptValue, decryptValue, isEncryptionEnabled } from "../utils/encryption";

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

// Encryption hook - before saving
NodeContentSchema.pre("save", function (next) {
  if (!isEncryptionEnabled()) {
    return next();
  }

  try {
    // Encrypt content
    if (this.isModified("content") && this.content) {
      this.content = encryptValue(this.content as string);
    }

    // Encrypt name
    if (this.isModified("name") && this.name) {
      this.name = encryptValue(this.name as string);
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

// Decryption hook - after finding multiple documents
NodeContentSchema.post("find", function (docs: INodeContent[]) {
  if (!isEncryptionEnabled() || !docs) {
    return;
  }

  docs.forEach((doc) => {
    if (doc.content) {
      doc.content = decryptValue(doc.content);
    }

    if (doc.name) {
      doc.name = decryptValue(doc.name);
    }
  });
});

// Decryption hook - after finding one document
NodeContentSchema.post("findOne", function (doc: INodeContent | null) {
  if (!isEncryptionEnabled() || !doc) {
    return;
  }

  if (doc.content) {
    doc.content = decryptValue(doc.content);
  }

  if (doc.name) {
    doc.name = decryptValue(doc.name);
  }
});

export default mongoose.models.NodeContent ||
  mongoose.model<INodeContent>("NodeContent", NodeContentSchema);
