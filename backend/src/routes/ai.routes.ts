import express from 'express';
import { createAiProtocol, getAiProtocols } from '../controllers/ai.controllers';

const router = express.Router();

// Route zum Speichern eines KI-Protokolls
router.post('/aiProtocol', createAiProtocol);
router.get('/aiProtocol', getAiProtocols);

export default router;