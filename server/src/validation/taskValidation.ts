import { body, param, query } from 'express-validator';

export const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done'])
    .withMessage('Status must be one of: todo, in-progress, done'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  
  body('assignee')
    .optional()
    .isMongoId()
    .withMessage('Assignee must be a valid user ID')
];

export const updateTaskValidation = [
  param('id')
    .isMongoId()
    .withMessage('Task ID must be valid'),
  
  ...createTaskValidation.map(validation => validation.optional())
];

export const getTaskValidation = [
  param('id')
    .isMongoId()
    .withMessage('Task ID must be valid')
];

export const getTasksValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done'])
    .withMessage('Status must be one of: todo, in-progress, done'),
  
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'dueDate', 'priority', 'title'])
    .withMessage('Sort by must be one of: createdAt, updatedAt, dueDate, priority, title'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];
