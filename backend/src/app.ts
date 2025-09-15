import express from "express";
import cors from "cors";
import helloRoutes from "./routes/hello.routes";
import connectDB from "./db";
import aiRoutes from "./routes/ai.routes";
import nodeContentRoutes from "./routes/nodeContent.routes";
import projectRoutes from "./routes/project.routes";
import exportRoutes from './routes/export.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Verbindung zur MongoDB-Datenbank herstellen
connectDB();

// Routen
app.use("/api/hello", helloRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/nodeContent", nodeContentRoutes);
app.use("/api/projects", projectRoutes);
app.use('/api/export', exportRoutes);

export default app;
