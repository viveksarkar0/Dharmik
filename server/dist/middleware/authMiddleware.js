"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const protect = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No authentication token provided',
                code: 'NO_TOKEN'
            });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Malformed authentication token',
                code: 'INVALID_TOKEN_FORMAT'
            });
        }
        // Verify token
        const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (jwtError) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token',
                code: 'INVALID_TOKEN',
                error: jwtError instanceof Error ? jwtError.message : 'Unknown error'
            });
        }
        // Get user from database
        const user = await User_1.UserModel.findById(decoded.id).select('-password -salt');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User account not found',
                code: 'USER_NOT_FOUND'
            });
        }
        // Attach user to request
        req.user = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
        };
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication failed',
            code: 'AUTH_ERROR',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.protect = protect;
const isAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Forbidden - Admin access required',
            code: 'ADMIN_ACCESS_REQUIRED'
        });
    }
    next();
};
exports.isAdmin = isAdmin;
