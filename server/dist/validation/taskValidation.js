"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTasksValidation = exports.getTaskValidation = exports.updateTaskValidation = exports.createTaskValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createTaskValidation = [
    (0, express_validator_1.body)('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be between 1 and 200 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description must not exceed 1000 characters'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['todo', 'in-progress', 'done'])
        .withMessage('Status must be one of: todo, in-progress, done'),
    (0, express_validator_1.body)('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Priority must be one of: low, medium, high'),
    (0, express_validator_1.body)('dueDate')
        .optional()
        .isISO8601()
        .withMessage('Due date must be a valid date'),
    (0, express_validator_1.body)('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    (0, express_validator_1.body)('tags.*')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Each tag must be between 1 and 50 characters'),
    (0, express_validator_1.body)('assignee')
        .optional()
        .isMongoId()
        .withMessage('Assignee must be a valid user ID')
];
exports.updateTaskValidation = [
    (0, express_validator_1.param)('id')
        .isMongoId()
        .withMessage('Task ID must be valid'),
    ...exports.createTaskValidation.map(validation => validation.optional())
];
exports.getTaskValidation = [
    (0, express_validator_1.param)('id')
        .isMongoId()
        .withMessage('Task ID must be valid')
];
exports.getTasksValidation = [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('status')
        .optional()
        .isIn(['todo', 'in-progress', 'done'])
        .withMessage('Status must be one of: todo, in-progress, done'),
    (0, express_validator_1.query)('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Priority must be one of: low, medium, high'),
    (0, express_validator_1.query)('search')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search term must be between 1 and 100 characters'),
    (0, express_validator_1.query)('sortBy')
        .optional()
        .isIn(['createdAt', 'updatedAt', 'dueDate', 'priority', 'title'])
        .withMessage('Sort by must be one of: createdAt, updatedAt, dueDate, priority, title'),
    (0, express_validator_1.query)('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Sort order must be asc or desc')
];
