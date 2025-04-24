import { getHello, createPlant, getPlants } from '../controllers/hello.controller';
import express, { Request, Response } from 'express';

const router = express.Router();

// Standard-Greeting Route
router.get("", getHello);

// Route zum Speichern einer Pflanze
router.post("/plant", createPlant);

// Route zum Abrufen aller Pflanzen
router.get("/plants", getPlants);

export default router;
