import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
// Pfad zur .env eine Ebene höher
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
console.log("MONGO_URI aus env:", process.env.MONGO_URI);

import { isEncryptionEnabled } from "./utils/encryption.util";

const connectDB = async () => {
  try {
    // Simple connection without CSFLE complexity
    await mongoose.connect(process.env.MONGO_URI || "", {
      authSource: "admin",
    });

    console.log("Loaded .env path:", path.resolve(__dirname, "../../.env"));
    console.log("ENCRYPTION_KEY:", process.env.ENCRYPTION_KEY);
    console.log("✅ MongoDB verbunden");
    
    // Check encryption status
    if (isEncryptionEnabled()) {
      console.log("🔒 Application-level encryption AKTIV");
      console.log("   Das 'content' Feld wird automatisch verschlüsselt");
    } else {
      console.log("⚠️  Encryption NICHT aktiv - bitte ENCRYPTION_KEY in .env setzen");
      console.log("   Führen Sie aus: npx ts-node src/scripts/generateEncryptionKey.ts");
    }
  } catch (error) {
    console.error("❌ MongoDB Fehler:", error);
    process.exit(1);
  }
};

export default connectDB;
