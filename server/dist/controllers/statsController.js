"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatsOverview = void 0;
const Task_1 = __importDefault(require("../models/Task"));
const getStatsOverview = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const query = {};
        // Role-based filtering: Members see only their task stats
        if (req.user.role === 'member') {
            query.$or = [
                { createdBy: req.user.id },
                { assignee: req.user.id },
            ];
        }
        // Get counts by status
        const statusStats = await Task_1.default.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);
        // Get counts by priority
        const priorityStats = await Task_1.default.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 },
                },
            },
        ]);
        // Get overdue tasks count
        const overdueQuery = {
            ...query,
            dueDate: { $lt: new Date() },
            status: { $ne: 'done' },
        };
        const overdueCount = await Task_1.default.countDocuments(overdueQuery);
        // Get total tasks count
        const totalTasks = await Task_1.default.countDocuments(query);
        // Format status stats
        const statusCounts = {
            todo: 0,
            'in-progress': 0,
            done: 0,
        };
        statusStats.forEach(stat => {
            if (stat._id in statusCounts) {
                statusCounts[stat._id] = stat.count;
            }
        });
        // Format priority stats
        const priorityCounts = {
            low: 0,
            medium: 0,
            high: 0,
        };
        priorityStats.forEach(stat => {
            if (stat._id in priorityCounts) {
                priorityCounts[stat._id] = stat.count;
            }
        });
        // Get recent activity (last 10 task updates)
        const recentTasks = await Task_1.default.find(query)
            .populate('createdBy', 'firstName lastName')
            .populate('assignee', 'firstName lastName')
            .sort({ updatedAt: -1 })
            .limit(10)
            .select('title status priority updatedAt createdBy assignee');
        res.json({
            success: true,
            data: {
                totalTasks,
                statusCounts,
                priorityCounts,
                overdueCount,
                recentTasks,
            },
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Server error', error: message });
    }
};
exports.getStatsOverview = getStatsOverview;
