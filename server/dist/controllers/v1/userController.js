import userService from "../../services/userService";
class UserController {
    async getMe(request, reply) {
        try {
            // authenticate hook in index.ts sets request.user = { id, email, role }
            const userId = request.user?.id;
            const user = await userService.findById(userId);
            if (!user)
                return reply.code(404).send({ message: "User not found" });
            return reply.send({ user });
        }
        catch (err) {
            request.log.error(err);
            return reply.code(500).send({ message: "Internal Server Error" });
        }
    }
    async updateMe(request, reply) {
        try {
            // authenticate hook in index.ts sets request.user = { id, email, role }
            const userId = request.user?.id;
            const updates = request.body || {};
            const user = await userService.updateUser(userId, updates);
            return reply.send({ message: "Profile updated", user });
        }
        catch (err) {
            request.log.error(err);
            return reply.code(500).send({ message: "Internal Server Error" });
        }
    }
    async listUsersAdmin(_request, reply) {
        try {
            const users = await userService.listUsers();
            return reply.send({ users });
        }
        catch (err) {
            return reply.code(500).send({ message: "Internal Server Error" });
        }
    }
}
export default new UserController();
