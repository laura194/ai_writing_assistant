import { Router } from 'express';
import { exportWord } from '../controllers/export.controller';

const router = Router();

// Add debug middleware
router.use((req, res, next) => {
  console.log('Export Route Hit:', {
    method: req.method,
    path: req.path,
    url: req.url,
  });
  next();
});

// Fix path and add debug logging
router.post('/word', exportWord);

export default router;