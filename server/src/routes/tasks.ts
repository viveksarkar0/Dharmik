import express from 'express';
import {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController';
import { protect } from '../middleware/authMiddleware';
import { handleValidationErrors } from '../middleware/validation';
import { createTaskLimiter } from '../middleware/rateLimiter';
import {
  createTaskValidation,
  updateTaskValidation,
  getTaskValidation,
  getTasksValidation,
} from '../validation/taskValidation';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getTasksValidation, handleValidationErrors, getTasks)
  .post(createTaskLimiter, createTaskValidation, handleValidationErrors, createTask);

router.route('/:id')
  .get(getTaskValidation, handleValidationErrors, getTask)
  .put(updateTaskValidation, handleValidationErrors, updateTask)
  .delete(getTaskValidation, handleValidationErrors, deleteTask);

export default router;
