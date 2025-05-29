import express from 'express';
import { createAiProtocol, getAiProtocols } from '../controllers/ai.controller';

const router = express.Router();

router.post('/aiProtocol', createAiProtocol);
router.get('/aiProtocol', getAiProtocols);

export default router;