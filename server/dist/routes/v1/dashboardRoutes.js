import userService from "../../services/userService";
import { z } from "zod";
export default async function dashboardRoutes(server) {
    server.get("/summary", { preValidation: [server.authenticate] }, async (request, reply) => {
        const schema = z.object({
            from: z.string().datetime().optional(),
            to: z.string().datetime().optional(),
            role: z.string().optional(),
            q: z.string().optional(),
        });
        const query = schema.safeParse(request.query);
        if (!query.success)
            return reply.code(400).send({ message: "Invalid query" });
        const { from, to, role, q } = query.data;
        const data = await userService.getSummaryMetrics({
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
            role,
            q,
        });
        return reply.send({ summary: data });
    });
    server.get("/trends", { preValidation: [server.authenticate] }, async (request, reply) => {
        const schema = z.object({
            days: z.coerce.number().optional(),
            from: z.string().datetime().optional(),
            to: z.string().datetime().optional(),
            role: z.string().optional(),
            q: z.string().optional(),
        });
        const query = schema.safeParse(request.query);
        if (!query.success)
            return reply.code(400).send({ message: "Invalid query" });
        const { days, from, to, role, q } = query.data;
        const data = await userService.getSignupTrends({
            days,
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
            role,
            q,
        });
        return reply.send({ trends: data });
    });
    server.get("/roles", { preValidation: [server.authenticate] }, async (request, reply) => {
        const schema = z.object({
            from: z.string().datetime().optional(),
            to: z.string().datetime().optional(),
            q: z.string().optional(),
        });
        const query = schema.safeParse(request.query);
        if (!query.success)
            return reply.code(400).send({ message: "Invalid query" });
        const { from, to, q } = query.data;
        const data = await userService.getRoleBreakdown({
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
            q,
        });
        return reply.send({ roles: data });
    });
    server.get("/recent-users", { preValidation: [server.authenticate] }, async (_request, reply) => {
        const users = await userService.listRecentUsers(8);
        return reply.send({ users });
    });
}
