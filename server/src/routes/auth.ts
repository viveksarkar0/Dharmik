import express from 'express';
import { register, login, logout, getMe } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { registerValidation, loginValidation } from '../validation/authValidation';
import { handleValidationErrors } from '../middleware/validation';

const router = express.Router();

router.post('/register', registerValidation, handleValidationErrors, register);
router.post('/login', loginValidation, handleValidationErrors, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
