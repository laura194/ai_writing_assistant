import mongoose, { Schema, Document } from "mongoose";
import {
  encryptValue,
  decryptValue,
  isEncryptionEnabled,
} from "../utils/encryption";

export interface IComment extends Document {
  projectId: mongoose.Types.ObjectId;
  username: string;
  content: string;
  date?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const commentSchema: Schema = new Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    username: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Encryption hook - before saving
commentSchema.pre("save", function (next) {
  if (!isEncryptionEnabled()) {
    return next();
  }

  try {
    // Encrypt content
    if (this.isModified("content") && this.content) {
      this.content = encryptValue(this.content as string);
    }

    // Encrypt username
    if (this.isModified("username") && this.username) {
      this.username = encryptValue(this.username as string);
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

// Decryption hook - after finding multiple documents
commentSchema.post("find", function (docs: IComment[]) {
  if (!isEncryptionEnabled() || !docs) {
    return;
  }

  docs.forEach((doc) => {
    if (doc.content) {
      doc.content = decryptValue(doc.content);
    }

    if (doc.username) {
      doc.username = decryptValue(doc.username);
    }
  });
});

// Decryption hook - after finding one document
commentSchema.post("findOne", function (doc: IComment | null) {
  if (!isEncryptionEnabled() || !doc) {
    return;
  }

  if (doc.content) {
    doc.content = decryptValue(doc.content);
  }

  if (doc.username) {
    doc.username = decryptValue(doc.username);
  }
});

export default mongoose.model<IComment>("Comment", commentSchema);
