import express from 'express';
import { restartSoketi } from '../services/soketi.js';

const router = express.Router();

// POST /api/restart - Manually restart Soketi
router.post('/', async (req, res) => {
  try {
    const restartResult = await restartSoketi();
    res.json(restartResult);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
