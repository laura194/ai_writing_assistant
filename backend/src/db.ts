import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { getAutoEncryptionOptions } from "./config/csfle.config";
import { AutoEncryptionOptions } from "mongodb";

// Pfad zur .env eine Ebene höher
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
console.log("MONGO_URI from env:", process.env.MONGO_URI);

const connectDB = async () => {
  try {
    // Check if CSFLE is enabled
    const csfleEnabled = process.env.CSFLE_MASTER_KEY && process.env.CSFLE_MASTER_KEY.length > 0;
    
    if (csfleEnabled) {
      console.log("CSFLE is enabled. Setting up auto-encryption...");

      // Get auto-encryption options
      const autoEncryption = await getAutoEncryptionOptions();

      // Connect mongoose with CSFLE enabled
      await mongoose.connect(process.env.MONGO_URI || "", {
        authSource: "admin",
        autoEncryption: autoEncryption as AutoEncryptionOptions,
      });

    console.log("MongoDB connected with CSFLE enabled");
    console.log("Content in nodecontents will be automatically encrypted");
    } else {
      // Connect mongoose without CSFLE
      await mongoose.connect(process.env.MONGO_URI || "", {
        authSource: "admin",
      });

      console.log("MongoDB connected without CSFLE encryption");
    }
  } 
  catch (error) {
    console.error("MongoDB Error:", error);
    console.log("\nTroubleshooting:");
    console.log("1. Ensure MongoDB is running and accessible.");
    console.log("2. Verify MONGO_URI and CSFLE_MASTER_KEY in .env file is correct.");
    console.log("3. Go to backend and run: 'npx ts-node src/scripts/generateMasterKey.ts' to generate a new master key for local development.");
    console.log("4. Check if mongodb-client-encryption package is installed.");
    process.exit(1);
  }
};

export default connectDB;
