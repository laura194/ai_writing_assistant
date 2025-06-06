import express from "express";
import cors from "cors";
import helloRoutes from "./routes/hello.routes";
import connectDB from "./db";
import aiRoutes from "./routes/ai.routes";

const app = express();

app.use(cors());
app.use(express.json());

// Verbindung zur MongoDB-Datenbank herstellen
connectDB();

// Routen
app.use("/api/hello", helloRoutes);
app.use("/api/ai", aiRoutes);

export default app;
