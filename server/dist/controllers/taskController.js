"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.getTask = exports.createTask = exports.getTasks = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Task_1 = __importDefault(require("../models/Task"));
const User_1 = require("../models/User");
const getTasks = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { page = 1, limit = 10, status, priority, search, sortBy = 'createdAt', sortOrder = 'desc', assignee, } = req.query;
        const query = {};
        // Role-based filtering: Members see only their tasks, Admins see all
        if (req.user.role === 'member') {
            query.$or = [
                { createdBy: req.user.id },
                { assignee: req.user.id },
            ];
        }
        // Apply filters
        if (status)
            query.status = status;
        if (priority)
            query.priority = priority;
        if (assignee)
            query.assignee = assignee;
        if (search) {
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { tags: { $in: [new RegExp(search, 'i')] } },
                ],
            });
        }
        const skip = (Number(page) - 1) * Number(limit);
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        const tasks = await Task_1.default.find(query)
            .populate('assignee', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName email')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));
        const total = await Task_1.default.countDocuments(query);
        res.json({
            success: true,
            data: tasks,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Server error', error: message });
    }
};
exports.getTasks = getTasks;
const createTask = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const { title, description, status, priority, dueDate, tags, assignee } = req.body;
        // Validate assignee if provided
        if (assignee) {
            const assigneeUser = await User_1.UserModel.findById(assignee);
            if (!assigneeUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Assignee not found'
                });
            }
        }
        const task = new Task_1.default({
            title: title?.trim(),
            description: description?.trim() || '',
            status: status || 'todo',
            priority: priority || 'medium',
            dueDate: dueDate ? (isNaN(Date.parse(dueDate)) ? undefined : new Date(dueDate)) : undefined,
            tags: Array.isArray(tags) ? tags.filter(tag => tag && tag.trim()) : [],
            createdBy: req.user.id,
            assignee: assignee || req.user.id,
            activityLog: [{
                    action: 'created',
                    timestamp: new Date(),
                    user: new mongoose_1.default.Types.ObjectId(req.user.id),
                    details: 'Task created'
                }],
        });
        const savedTask = await task.save();
        await savedTask.populate('assignee', 'firstName lastName email');
        await savedTask.populate('createdBy', 'firstName lastName email');
        res.status(201).json({
            success: true,
            data: savedTask,
            message: 'Task created successfully'
        });
    }
    catch (error) {
        console.error('Task creation error:', error);
        if (error instanceof Error) {
            // Handle validation errors
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    error: error.message
                });
            }
            // Handle duplicate key errors
            if (error.message.includes('duplicate key')) {
                return res.status(409).json({
                    success: false,
                    message: 'Task already exists'
                });
            }
        }
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: message
        });
    }
};
exports.createTask = createTask;
const getTask = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const task = await Task_1.default.findById(req.params.id)
            .populate('assignee', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName email')
            .populate('activityLog.user', 'firstName lastName email');
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        // Check permissions: Members can only view their own tasks
        if (req.user.role === 'member') {
            const canView = task.createdBy._id.toString() === req.user.id ||
                (task.assignee && task.assignee._id.toString() === req.user.id);
            if (!canView) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }
        res.json({
            success: true,
            data: task,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Server error', error: message });
    }
};
exports.getTask = getTask;
const updateTask = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const task = await Task_1.default.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        // Check permissions: Members can only update their own tasks
        if (req.user.role === 'member') {
            const canUpdate = task.createdBy.toString() === req.user.id ||
                (task.assignee && task.assignee.toString() === req.user.id);
            if (!canUpdate) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }
        const { title, description, status, priority, dueDate, tags, assignee } = req.body;
        const updates = {};
        const changes = [];
        if (title && title !== task.title) {
            updates.title = title;
            changes.push(`title changed to "${title}"`);
        }
        if (description !== undefined && description !== task.description) {
            updates.description = description;
            changes.push('description updated');
        }
        if (status && status !== task.status) {
            updates.status = status;
            changes.push(`status changed to "${status}"`);
        }
        if (priority && priority !== task.priority) {
            updates.priority = priority;
            changes.push(`priority changed to "${priority}"`);
        }
        if (dueDate !== undefined) {
            updates.dueDate = dueDate ? (isNaN(Date.parse(dueDate)) ? null : new Date(dueDate)) : null;
            changes.push('due date updated');
        }
        if (tags !== undefined) {
            updates.tags = tags;
            changes.push('tags updated');
        }
        if (assignee !== undefined) {
            if (assignee && assignee !== task.assignee?.toString()) {
                const assigneeUser = await User_1.UserModel.findById(assignee);
                if (!assigneeUser) {
                    return res.status(400).json({ message: 'Assignee not found' });
                }
                updates.assignee = assignee;
                changes.push(`assigned to ${assigneeUser.firstName} ${assigneeUser.lastName}`);
            }
            else if (!assignee && task.assignee) {
                updates.assignee = null;
                changes.push('unassigned');
            }
        }
        if (changes.length > 0) {
            updates.$push = {
                activityLog: {
                    action: 'updated',
                    user: new mongoose_1.default.Types.ObjectId(req.user.id),
                    timestamp: new Date(),
                    details: changes.join(', '),
                },
            };
        }
        const updatedTask = await Task_1.default.findByIdAndUpdate(req.params.id, updates, { new: true })
            .populate('assignee', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName email');
        res.json({
            success: true,
            data: updatedTask,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Server error', error: message });
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const task = await Task_1.default.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        // Check permissions: Members can only delete their own tasks
        if (req.user.role === 'member') {
            if (task.createdBy.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }
        await Task_1.default.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: 'Task deleted successfully',
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Server error', error: message });
    }
};
exports.deleteTask = deleteTask;
