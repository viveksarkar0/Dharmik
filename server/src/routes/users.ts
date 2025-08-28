import express from 'express';
import { getUsers, updateUserRole } from '../controllers/userController';
import { protect, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, isAdmin, getUsers);
router.patch('/:id/role', protect, isAdmin, updateUserRole);

export default router;
