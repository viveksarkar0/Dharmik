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
        let token;
        // Get token from Authorization header
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized - No token provided' });
        }
        const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await User_1.UserModel.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }
        req.user = {
            id: decoded.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }
};
exports.protect = protect;
const isAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }
    next();
};
exports.isAdmin = isAdmin;
