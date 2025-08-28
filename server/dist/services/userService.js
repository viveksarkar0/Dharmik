"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../models/User");
class UserService {
    async createUserWithEmail(data) {
        const existing = await User_1.UserModel.findOne({ email: data.email });
        if (existing)
            throw new Error("Email already registered");
        const { hash, salt } = await (0, User_1.hashPassword)(data.password);
        const user = await User_1.UserModel.create({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email,
            password: hash,
            salt,
            verified: true,
        });
        return user;
    }
    async findByEmail(email) {
        return User_1.UserModel.findOne({ email }).select("+password +salt");
    }
    async findById(id) {
        try {
            const user = await User_1.UserModel.findById(id);
            return user;
        }
        catch {
            return null;
        }
    }
    async updateUser(userId, updates) {
        const allowed = {
            firstName: true,
            lastName: true,
            avatar: true,
            bio: true,
        };
        const safeUpdates = {};
        Object.keys(updates || {}).forEach((key) => {
            if (allowed[key])
                safeUpdates[key] = updates[key];
        });
        const user = await User_1.UserModel.findByIdAndUpdate(userId, safeUpdates, {
            new: true,
        });
        if (!user)
            throw new Error("User not found");
        return user;
    }
    async getSummaryMetrics(filters) {
        // Total users with optional role/q filters applied
        const totalUsers = await User_1.UserModel.countDocuments(this.buildUserMatchQuery({ role: filters?.role, q: filters?.q }));
        // Respect the requested range if provided; otherwise default to last 7 days
        const rangeFrom = filters?.from ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const rangeTo = filters?.to ?? new Date();
        const rangeMatch = this.buildUserMatchQuery({ from: rangeFrom, to: rangeTo, role: filters?.role, q: filters?.q });
        const last7Days = await User_1.UserModel.countDocuments(rangeMatch);
        return { totalUsers, last7Days };
    }
    async getSignupTrends(params) {
        const { days, from, to, role, q } = params || {};
        const start = from || new Date(Date.now() - (days || 30) * 24 * 60 * 60 * 1000);
        const end = to || new Date();
        const match = this.buildUserMatchQuery({ from: start, to: end, role, q });
        const rows = await User_1.UserModel.aggregate([
            { $match: match },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);
        return rows.map((r) => ({ date: r._id, count: r.count }));
    }
    buildUserMatchQuery(filters) {
        const match = {};
        if (filters?.from || filters?.to) {
            match.createdAt = {};
            if (filters.from)
                match.createdAt.$gte = filters.from;
            if (filters.to) {
                // Treat "to" as inclusive end-of-day. Convert to an exclusive upper bound.
                const end = new Date(filters.to);
                const isMidnight = end.getUTCHours() === 0 &&
                    end.getUTCMinutes() === 0 &&
                    end.getUTCSeconds() === 0 &&
                    end.getUTCMilliseconds() === 0;
                if (isMidnight) {
                    // Move to the next day 00:00 UTC and use $lt
                    end.setUTCDate(end.getUTCDate() + 1);
                }
                else {
                    // Add 1ms to make it exclusive upper bound
                    end.setUTCMilliseconds(end.getUTCMilliseconds() + 1);
                }
                match.createdAt.$lt = end;
            }
        }
        if (filters?.role) {
            match.role = filters.role;
        }
        if (filters?.q) {
            const regex = new RegExp(filters.q, 'i');
            match.$or = [
                { firstName: regex },
                { lastName: regex },
                { email: regex },
                { username: regex },
            ];
        }
        return match;
    }
    async listUsers() {
        return User_1.UserModel.find().limit(200).sort({ createdAt: -1 });
    }
    async listRecentUsers(limit = 10, filters) {
        const match = this.buildUserMatchQuery(filters);
        return User_1.UserModel.find(match, { email: 1, firstName: 1, lastName: 1, avatar: 1, role: 1, createdAt: 1 })
            .sort({ createdAt: -1 })
            .limit(limit);
    }
    async getRoleBreakdown(filters) {
        const match = this.buildUserMatchQuery(filters);
        const rows = await User_1.UserModel.aggregate([
            { $match: match },
            { $group: { _id: "$role", count: { $sum: 1 } } },
        ]);
        const out = { admin: 0, teacher: 0, user: 0 };
        for (const r of rows)
            out[r._id] = r.count;
        return out;
    }
    async listUsersPaginated(params) {
        const page = Math.max(1, params.page || 1);
        const limit = Math.min(100, Math.max(1, params.limit || 10));
        const match = {};
        if (params.role)
            match.role = params.role;
        if (params.q) {
            const r = new RegExp(params.q, 'i');
            match.$or = [{ firstName: r }, { lastName: r }, { email: r }];
        }
        const [items, total] = await Promise.all([
            User_1.UserModel.find(match)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            User_1.UserModel.countDocuments(match),
        ]);
        return { items, total, page, limit, pages: Math.ceil(total / limit) };
    }
    async updateUserRoleStatus(userId, data) {
        const update = {};
        if (data.role)
            update.role = data.role;
        if (typeof data.status === 'boolean')
            update['status.status'] = data.status;
        const user = await User_1.UserModel.findByIdAndUpdate(userId, update, { new: true });
        if (!user)
            throw new Error('User not found');
        return user;
    }
    async getUserCount() {
        return User_1.UserModel.countDocuments();
    }
}
exports.default = new UserService();
