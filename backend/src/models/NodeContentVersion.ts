import mongoose, { Schema, Document } from "mongoose";
import { encryptValue, decryptValue, isEncryptionEnabled } from "../utils/encryption";
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
  { timestamps: { createdAt: true, updatedAt: false } },
);

NodeContentVersionSchema.index({ nodeId: 1, projectId: 1, createdAt: -1 });

// Encryption hook - before saving
NodeContentVersionSchema.pre("save", function (next) {
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
NodeContentVersionSchema.post("find", function (docs: INodeContentVersion[]) {
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
NodeContentVersionSchema.post("findOne", function (doc: INodeContentVersion | null) {
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

export default mongoose.models.NodeContentVersion ||
  mongoose.model<INodeContentVersion>(
    "NodeContentVersion",
    NodeContentVersionSchema,
  );
