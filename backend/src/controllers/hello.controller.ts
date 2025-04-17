import { Request, Response } from 'express';
import { getGreetingMessage } from '../services/hello.service';

export const getHello = (_req: Request, res: Response) => {
  const message = getGreetingMessage();
  res.json({ message });
};

