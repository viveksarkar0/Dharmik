"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const generateToken = (id) => {
    const secret = process.env.JWT_SECRET || 'dev_jwt_secret';
    return jsonwebtoken_1.default.sign({ id }, secret, { expiresIn: '7d' });
};
const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;
        // Check if user exists
        const existingUser = await User_1.UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Hash password
        const { hash, salt } = await (0, User_1.hashPassword)(password);
        // Create user
        const user = await User_1.UserModel.create({
            firstName,
            lastName,
            email,
            password: hash,
            salt,
            role: role || 'member',
            verified: true,
            onboard: true,
        });
        // Generate token
        const token = generateToken(user._id.toString());
        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // Set to false for development
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            path: '/',
        });
        res.status(201).json({
            success: true,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Server error', error: message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user and include password
        const user = await User_1.UserModel.findOne({ email }).select('+password +salt');
        if (!user || !user.comparePassword(password)) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Update last login
        user.status = {
            status: true,
            lastLoginAt: new Date(),
            lastLogoutAt: user.status?.lastLogoutAt,
        };
        user.lastSeen = new Date();
        await user.save();
        // Generate token
        const token = generateToken(user._id.toString());
        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // Set to false for development
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            path: '/',
        });
        res.json({
            success: true,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Server error', error: message });
    }
};
exports.login = login;
const logout = async (req, res) => {
    try {
        // Update user status
        if (req.user?.id) {
            await User_1.UserModel.findByIdAndUpdate(req.user.id, {
                'status.status': false,
                'status.lastLogoutAt': new Date(),
            });
        }
        // Clear cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
        });
        res.json({ success: true, message: 'Logged out successfully' });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Server error', error: message });
    }
};
exports.logout = logout;
const getMe = async (req, res) => {
    try {
        const user = await User_1.UserModel.findById(req.user.id);
        res.json({
            success: true,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Server error', error: message });
    }
};
exports.getMe = getMe;
