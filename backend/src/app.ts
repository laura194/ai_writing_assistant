import express from 'express';
import cors from 'cors';
import helloRoutes from './routes/hello.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Routen
app.use("/api/hello", helloRoutes);

export default app;
