"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const taskController_1 = require("../controllers/taskController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validation_1 = require("../middleware/validation");
const rateLimiter_1 = require("../middleware/rateLimiter");
const taskValidation_1 = require("../validation/taskValidation");
const router = express_1.default.Router();
// All routes require authentication
router.use(authMiddleware_1.protect);
router.route('/')
    .get(taskValidation_1.getTasksValidation, validation_1.handleValidationErrors, taskController_1.getTasks)
    .post(rateLimiter_1.createTaskLimiter, taskValidation_1.createTaskValidation, validation_1.handleValidationErrors, taskController_1.createTask);
router.route('/:id')
    .get(taskValidation_1.getTaskValidation, validation_1.handleValidationErrors, taskController_1.getTask)
    .put(taskValidation_1.updateTaskValidation, validation_1.handleValidationErrors, taskController_1.updateTask)
    .delete(taskValidation_1.getTaskValidation, validation_1.handleValidationErrors, taskController_1.deleteTask);
exports.default = router;
