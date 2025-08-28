import express from 'express';
import { getStatsOverview } from '../controllers/statsController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/overview', protect, getStatsOverview);

export default router;
