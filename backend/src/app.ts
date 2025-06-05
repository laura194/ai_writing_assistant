import express from "express";
import cors from "cors";
import helloRoutes from "./routes/hello.routes";
import connectDB from "./db";

const app = express();

app.use(cors());
app.use(express.json());

// Verbindung zur MongoDB-Datenbank herstellen
connectDB();

// Routen
app.use("/api/hello", helloRoutes);

export default app;
