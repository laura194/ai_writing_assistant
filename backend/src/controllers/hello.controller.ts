import { Request, Response } from 'express';
import { getGreetingMessage } from '../services/hello.service';
import Plant from '../models/Hello';

export const getHello = (_req: Request, res: Response) => {
  const message = getGreetingMessage();
  res.json({ message });
};

// Pflanze speichern
export const createPlant = async (req: Request, res: Response) => {
  const { name, type } = req.body;

  const newPlant = new Plant({ name, type });

  try {
    const savedPlant = await newPlant.save();
    res.status(201).json(savedPlant);
  } catch (error) {
    res.status(400).json({ error: 'Fehler beim Speichern der Pflanze' });
  }
};

// Alle Pflanzen abrufen
export const getPlants = async (_req: Request, res: Response) => {
  try {
    const plants = await Plant.find();
    res.json(plants);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Abrufen der Pflanzen' });
  }

};

