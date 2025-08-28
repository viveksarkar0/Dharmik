import { z } from "zod";
import userService from "../../services/userService";
import { UserModel } from "../../models/User";
export default async function authRoutes(server) {
    server.post("/register", async (request, reply) => {
        const schema = z.object({
            firstName: z.string().min(1).optional(),
            lastName: z.string().optional(),
            email: z.string().email(),
            password: z.string().min(6),
        });
        const body = schema.parse(request.body || {});
        try {
            const user = await userService.createUserWithEmail(body);
            const token = await server.jwt.sign({ sub: user.id, email: user.email, role: user.role });
            const cookieName = process.env.COOKIE_NAME || "token";
            reply.setCookie(cookieName, token, {
                httpOnly: true,
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                secure: process.env.NODE_ENV === 'production',
                path: '/',
                maxAge: 7 * 24 * 60 * 60,
                domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
            });
            return reply.code(201).send({
                message: "Registered successfully",
                token,
                user,
            });
        }
        catch (err) {
            return reply.code(400).send({ message: err.message || 'Registration failed' });
        }
    });
    server.post("/login", async (request, reply) => {
        const schema = z.object({ email: z.string().email(), password: z.string().min(6) });
        const body = schema.parse(request.body || {});
        try {
            const user = await userService.findByEmail(body.email);
            if (!user)
                return reply.code(401).send({ message: "Invalid credentials" });
            const isValid = user.comparePassword(body.password);
            if (!isValid)
                return reply.code(401).send({ message: "Invalid credentials" });
            const token = await server.jwt.sign({ sub: user.id, email: user.email, role: user.role });
            const cookieName = process.env.COOKIE_NAME || "token";
            reply.setCookie(cookieName, token, {
                httpOnly: true,
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                secure: process.env.NODE_ENV === 'production',
                path: '/',
                maxAge: 7 * 24 * 60 * 60,
                domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
            });
            return reply.send({ message: "Logged in", token, user });
        }
        catch (err) {
            request.log.error(err);
            return reply.code(500).send({ message: "Login failed" });
        }
    });
    server.get("/refresh", { preValidation: [server.authenticate] }, async (request, reply) => {
        try {
            const payload = request.user;
            const dbUser = await UserModel.findById(payload.sub);
            if (!dbUser)
                return reply.code(404).send({ message: "User not found" });
            const token = await server.jwt.sign({ sub: dbUser.id, email: dbUser.email, role: dbUser.role });
            const cookieName = process.env.COOKIE_NAME || "token";
            reply.setCookie(cookieName, token, {
                httpOnly: true,
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                secure: process.env.NODE_ENV === 'production',
                path: '/',
                maxAge: 7 * 24 * 60 * 60,
                domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
            });
            return reply.send({ message: "Token refreshed", token });
        }
        catch (err) {
            request.log.error(err);
            return reply.code(500).send({ message: "Failed to refresh token" });
        }
    });
    server.post("/logout", async (request, reply) => {
        const cookieName = process.env.COOKIE_NAME || "token";
        reply.clearCookie(cookieName, { path: "/" });
        return reply.send({ message: "Logged out" });
    });
}
