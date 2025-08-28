import { UserModel, hashPassword } from "../models/User";

class UserService {
  async createUserWithEmail(data: {
    firstName?: string;
    lastName?: string;
    email: string;
    password: string;
  }) {
    const existing = await UserModel.findOne({ email: data.email });
    if (existing) throw new Error("Email already registered");
    const { hash, salt } = await hashPassword(data.password);
    const user = await UserModel.create({
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      email: data.email,
      password: hash,
      salt,
      verified: true,
    });
    return user;
  }

  async findByEmail(email: string) {
    return UserModel.findOne({ email }).select("+password +salt");
  }

  async findById(id: string) {
    try {
      const user = await UserModel.findById(id);
      return user;
    } catch {
      return null;
    }
  }

  async updateUser(userId: string, updates: Record<string, any>) {
    const allowed: Record<string, boolean> = {
      firstName: true,
      lastName: true,
      avatar: true,
      bio: true,
    };
    const safeUpdates: Record<string, any> = {};
    Object.keys(updates || {}).forEach((key) => {
      if (allowed[key]) safeUpdates[key] = (updates as any)[key];
    });
    const user = await UserModel.findByIdAndUpdate(userId, safeUpdates, {
      new: true,
    });
    if (!user) throw new Error("User not found");
    return user;
  }

  async getSummaryMetrics(filters?: { from?: Date; to?: Date; role?: string; q?: string }) {
    // Total users with optional role/q filters applied
    const totalUsers = await UserModel.countDocuments(this.buildUserMatchQuery({ role: filters?.role, q: filters?.q }));

    // Respect the requested range if provided; otherwise default to last 7 days
    const rangeFrom = filters?.from ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const rangeTo = filters?.to ?? new Date();
    const rangeMatch = this.buildUserMatchQuery({ from: rangeFrom, to: rangeTo, role: filters?.role, q: filters?.q });
    const last7Days = await UserModel.countDocuments(rangeMatch);

    return { totalUsers, last7Days };
  }

  async getSignupTrends(params?: { days?: number; from?: Date; to?: Date; role?: string; q?: string }) {
    const { days, from, to, role, q } = params || {};
    const start = from || new Date(Date.now() - (days || 30) * 24 * 60 * 60 * 1000);
    const end = to || new Date();
    const match: any = this.buildUserMatchQuery({ from: start, to: end, role, q });
    const rows = await UserModel.aggregate([
      { $match: match },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    return rows.map((r) => ({ date: r._id as string, count: r.count as number }));
  }

  private buildUserMatchQuery(filters?: { from?: Date; to?: Date; role?: string; q?: string }) {
    const match: any = {};
    if (filters?.from || filters?.to) {
      match.createdAt = {} as any;
      if (filters.from) (match.createdAt as any).$gte = filters.from;
      if (filters.to) {
        // Treat "to" as inclusive end-of-day. Convert to an exclusive upper bound.
        const end = new Date(filters.to);
        const isMidnight =
          end.getUTCHours() === 0 &&
          end.getUTCMinutes() === 0 &&
          end.getUTCSeconds() === 0 &&
          end.getUTCMilliseconds() === 0;
        if (isMidnight) {
          // Move to the next day 00:00 UTC and use $lt
          end.setUTCDate(end.getUTCDate() + 1);
        } else {
          // Add 1ms to make it exclusive upper bound
          end.setUTCMilliseconds(end.getUTCMilliseconds() + 1);
        }
        (match.createdAt as any).$lt = end;
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
    return UserModel.find().limit(200).sort({ createdAt: -1 });
  }

  async listRecentUsers(limit = 10, filters?: { from?: Date; to?: Date; role?: string; q?: string }) {
    const match = this.buildUserMatchQuery(filters);
    return UserModel.find(match, { email: 1, firstName: 1, lastName: 1, avatar: 1, role: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getRoleBreakdown(filters?: { from?: Date; to?: Date; q?: string }) {
    const match: any = this.buildUserMatchQuery(filters);
    const rows = await UserModel.aggregate([
      { $match: match },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);
    const out: Record<string, number> = { admin: 0, teacher: 0, user: 0 };
    for (const r of rows) out[r._id as string] = r.count as number;
    return out;
  }

  async listUsersPaginated(params: { page?: number; limit?: number; role?: string; q?: string }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 10));
    const match: any = {};
    if (params.role) match.role = params.role;
    if (params.q) {
      const r = new RegExp(params.q, 'i');
      match.$or = [{ firstName: r }, { lastName: r }, { email: r }];
    }
    const [items, total] = await Promise.all([
      UserModel.find(match)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      UserModel.countDocuments(match),
    ]);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async updateUserRoleStatus(userId: string, data: { role?: string; status?: boolean }) {
    const update: any = {};
    if (data.role) update.role = data.role;
    if (typeof data.status === 'boolean') update['status.status'] = data.status;
    const user = await UserModel.findByIdAndUpdate(userId, update, { new: true });
    if (!user) throw new Error('User not found');
    return user;
  }

  async getUserCount() {
    return UserModel.countDocuments();
  }
}

export default new UserService();
