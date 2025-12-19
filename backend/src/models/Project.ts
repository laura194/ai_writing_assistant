import mongoose, { Schema, Document } from "mongoose";
import { encryptValue, decryptValue, isEncryptionEnabled } from "../utils/encryption";

export interface IProject extends Document {
  name: string;
  username: string;
  projectStructure: object;
  isPublic: boolean; // neu: public/private toggle
  tags?: string[]; // neu: Tags
  titleCommunityPage?: string; // neu: Community Page Title
  category?: string; // neu: Kategorie
  typeOfDocument?: string; // neu: Dokumenttyp
  authorName?: string; // Optional: Name des Autors
  created_at?: Date;
  updated_at?: Date;
  upvotedBy: string[];
  favoritedBy: string[];
}

const projectSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true },
    projectStructure: { type: Schema.Types.Mixed, required: true }, // Store JSON object directly

    // neue Felder:
    isPublic: { type: Boolean, default: false }, // default = private
    tags: { type: [String], default: [] },
    titleCommunityPage: { type: String, default: "" },
    category: { type: String, default: "" },
    typeOfDocument: { type: String, default: "" },
    authorName: { type: String, default: "" }, // Optional: Name des Autors

    upvotedBy: { type: [String], default: [] },
    favoritedBy: { type: [String], default: [] },
  },
  {
    timestamps: true, // created_at + updated_at automatisch
  },
);

// Encryption hook - before saving
projectSchema.pre("save", function (next) {
  if (!isEncryptionEnabled()) {
    return next();
  }

  try {
    // Encrypt name
    if (this.isModified("name") && this.name) {
      this.name = encryptValue(this.name as string);
    }

    // Encrypt projectStructure
    if (this.isModified("projectStructure") && this.projectStructure) {
      const encrypted = encryptValue(JSON.stringify(this.projectStructure));
      this.projectStructure = encrypted as unknown as object;
    }

    // Encrypt authorName
    if (this.isModified("authorName") && this.authorName) {
      this.authorName = encryptValue(this.authorName as string);
    }

    // Encrypt titleCommunityPage
    if (this.isModified("titleCommunityPage") && this.titleCommunityPage) {
      this.titleCommunityPage = encryptValue(this.titleCommunityPage as string);
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

// Decryption hook - after finding multiple documents
projectSchema.post("find", function (docs: IProject[]) {
  if (!isEncryptionEnabled() || !docs) {
    return;
  }

  docs.forEach((doc) => {
    if (doc.name) {
      doc.name = decryptValue(doc.name);
    }

    if (doc.projectStructure) {
      try {
        const decrypted = decryptValue(doc.projectStructure as unknown as string);
        doc.projectStructure = JSON.parse(decrypted);
      } catch (error) {
        console.error("Error decrypting projectStructure:", error);
      }
    }

    if (doc.authorName) {
      doc.authorName = decryptValue(doc.authorName);
    }

    if (doc.titleCommunityPage) {
      doc.titleCommunityPage = decryptValue(doc.titleCommunityPage);
    }
  });
});

// Decryption hook - after finding one document
projectSchema.post("findOne", function (doc: IProject | null) {
  if (!isEncryptionEnabled() || !doc) {
    return;
  }

  if (doc.name) {
    doc.name = decryptValue(doc.name);
  }

  if (doc.projectStructure) {
    try {
      const decrypted = decryptValue(doc.projectStructure as unknown as string);
      doc.projectStructure = JSON.parse(decrypted);
    } catch (error) {
      console.error("Error decrypting projectStructure:", error);
    }
  }

  if (doc.authorName) {
    doc.authorName = decryptValue(doc.authorName);
  }

  if (doc.titleCommunityPage) {
    doc.titleCommunityPage = decryptValue(doc.titleCommunityPage);
  }
});

export default mongoose.model<IProject>("Project", projectSchema);
