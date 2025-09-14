import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Pfad zur .env eine Ebene höher
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
console.log("MONGO_URI aus env:", process.env.MONGO_URI);
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "", {
      authSource: "admin",
    });
    console.log("MongoDB verbunden");
  } catch (error) {
    console.error("MongoDB Fehler:", error);
  }
};

export default connectDB;
