"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(error, req, res, next) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    console.error('Error:', error);
    res.status(statusCode).json({ message });
}
