import { Request, Response } from 'express';
import Task from '../models/Task';

export const getStatsOverview = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const query: any = {};

    // Role-based filtering: Members see only their task stats
    if (req.user.role === 'member') {
      query.$or = [
        { createdBy: req.user.id },
        { assignee: req.user.id },
      ];
    }

    // Get counts by status
    const statusStats = await Task.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get counts by priority
    const priorityStats = await Task.aggregate([
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
    const overdueCount = await Task.countDocuments(overdueQuery);

    // Get total tasks count
    const totalTasks = await Task.countDocuments(query);

    // Format status stats
    const statusCounts: Record<string, number> = {
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
    const priorityCounts: Record<string, number> = {
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
    const recentTasks = await Task.find(query)
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: message });
  }
};
