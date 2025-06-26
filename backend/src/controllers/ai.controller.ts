import { Request, Response } from "express";

import AIProtocol from "../models/AIProtocol";

export const createAiProtocol = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { aiName, usageForm, affectedParts, remarks, projectId } = req.body;

  if (!projectId) {
    res.status(400).json({ error: "ProjectId is required" });
    return;
  }

  const newAiProtocol = new AIProtocol({
    aiName,
    usageForm,
    affectedParts,
    remarks,
    projectId,
  });

  try {
    const savedAiProtocol = await newAiProtocol.save();
    res.status(201).json(savedAiProtocol);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAiProtocols = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { projectId } = req.query;

  if (!projectId || typeof projectId !== "string") {
    res
      .status(400)
      .json({ error: "ProjectId is required as a query parameter" });
    return;
  }

  try {
    const aiProtocols = await AIProtocol.find({ projectId });
    res.status(200).json(aiProtocols);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
