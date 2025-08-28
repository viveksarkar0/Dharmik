import userController from "../../controllers/v1/userController";
import path from "path";
import fs from "fs";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import userService from "../../services/userService";
import { pipeline } from "stream/promises";
export default async function userRoutes(server) {
    // Register multipart for file uploads (once)
    if (!server.hasMultipart) {
        await server.register(multipart);
        server.hasMultipart = true;
    }
    // Serve uploaded avatars statically
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });
    if (!server.hasStatic) {
        await server.register(fastifyStatic, { root: uploadDir, prefix: "/uploads/" });
        server.hasStatic = true;
    }
    server.get("/me", { preValidation: [server.authenticate] }, userController.getMe);
    server.put("/me", { preValidation: [server.authenticate] }, userController.updateMe);
    server.get("/admin/users", { preValidation: [server.authorize(["admin"])] }, userController.listUsersAdmin);
    server.post("/me/avatar", { preValidation: [server.authenticate] }, async (request, reply) => {
        const parts = request.parts();
        for await (const part of parts) {
            if (part.file && part.fieldname === "avatar") {
                const ext = path.extname(part.filename || "").toLowerCase();
                const allowed = [".png", ".jpg", ".jpeg", ".webp"];
                if (!allowed.includes(ext))
                    return reply.code(400).send({ message: "Invalid file type" });
                const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
                const filepath = path.join(uploadDir, filename);
                await pipeline(part.file, fs.createWriteStream(filepath));
                const url = `/uploads/${filename}`;
                // request.user is normalized in authenticate hook to shape { id, email, role }
                const userId = request.user.id;
                const user = await userService.updateUser(userId, { avatar: url });
                return reply.send({ message: "Avatar uploaded", url, user });
            }
        }
        return reply.code(400).send({ message: "No avatar provided" });
    });
    // Admin: paginated users list
    server.get("/", { preValidation: [server.authorize(["admin"])] }, async (request, reply) => {
        const q = request.query || {};
        const page = Number(q.page || 1);
        const limit = Number(q.limit || 10);
        const role = q.role;
        const keyword = q.q;
        const data = await userService.listUsersPaginated({ page, limit, role, q: keyword });
        return reply.send(data);
    });
    // Admin: update role/status
    server.patch("/:id", { preValidation: [server.authorize(["admin"])] }, async (request, reply) => {
        const id = request.params.id;
        const body = request.body || {};
        const user = await userService.updateUserRoleStatus(id, { role: body.role, status: body.status });
        return reply.send({ user });
    });
}
