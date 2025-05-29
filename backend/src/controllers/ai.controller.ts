import { Request, Response } from 'express';

import AIProtocol from '../models/AIProtocol';

export const createAiProtocol = async (req: Request, res: Response): Promise<void> => {
  const { aiName, usageForm, affectedParts, remarks, username } = req.body;

  if (!username) {
    res.status(400).json({ error: "Username is required" });
    return;
  }

  const newAiProtocol = new AIProtocol({
    aiName,
    usageForm,
    affectedParts,
    remarks,
    username,
  });

  try {
    const savedAiProtocol = await newAiProtocol.save();
    res.status(201).json(savedAiProtocol);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};




export const getAiProtocols = async (req: Request, res: Response): Promise<void> => {
  const { username } = req.query;

  if (!username || typeof username !== 'string') {
    res.status(400).json({ error: 'Username is required as a query parameter' });
    return;
  }

  try {
    const aiProtocols = await AIProtocol.find({ username });
    res.status(200).json(aiProtocols);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
