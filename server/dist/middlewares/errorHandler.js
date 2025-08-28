export function errorHandler(error, _request, reply) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    reply.code(statusCode).send({ message });
}
