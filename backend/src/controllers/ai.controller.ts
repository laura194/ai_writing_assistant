import { Request, Response } from 'express';

import AIProtocol from '../models/AIProtocol';

export const createAiProtocol = async (req: Request, res: Response): Promise<void> => {
  const { aiName, usageForm, affectedParts, remarks } = req.body;

  const newAiProtocol = new AIProtocol({
    aiName, usageForm, affectedParts, remarks
  });
  try {
    const savedAiProtocol = await newAiProtocol.save();
    res.status(201).json(savedAiProtocol);
    res.status(201).json({ message: 'AI Protocol created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const getAiProtocols = async (_req: Request, res: Response): Promise<void> => {
  try {
    const aiProtocols = await AIProtocol.find();
    res.status(200).json(aiProtocols);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

