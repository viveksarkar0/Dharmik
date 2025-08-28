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
        // Validate required fields
        if (!email || !password || !firstName) {
            return res.status(400).json({
                success: false,
                message: 'Email, password, and first name are required',
                code: 'VALIDATION_ERROR'
            });
        }
        // Check if user exists
        const existingUser = await User_1.UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered',
                code: 'EMAIL_EXISTS'
            });
        }
        // Hash password
        const { hash, salt } = await (0, User_1.hashPassword)(password);
        // Create user
        const user = await User_1.UserModel.create({
            firstName: firstName.trim(),
            lastName: lastName?.trim(),
            email: email.toLowerCase().trim(),
            password: hash,
            salt,
            role: role || 'member',
            verified: true,
            onboard: true,
            status: {
                status: true,
                lastLoginAt: new Date(),
                lastLogoutAt: null
            },
            lastSeen: new Date()
        });
        // Generate token
        const token = generateToken(user._id.toString());
        // Return response
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                verified: user.verified,
                onboard: user.onboard
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            code: 'REGISTRATION_ERROR',
            error: message
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
                code: 'VALIDATION_ERROR'
            });
        }
        // Find user and include password
        const user = await User_1.UserModel.findOne({ email: email.toLowerCase().trim() })
            .select('+password +salt +status');
        if (!user || !user.comparePassword(password)) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                code: 'INVALID_CREDENTIALS'
            });
        }
        // Update user status
        user.status = {
            status: true,
            lastLoginAt: new Date(),
            lastLogoutAt: user.status?.lastLogoutAt,
        };
        user.lastSeen = new Date();
        await user.save();
        // Generate token
        const token = generateToken(user._id.toString());
        // Return response
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                verified: user.verified,
                onboard: user.onboard
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            message: 'Login failed',
            code: 'LOGIN_ERROR',
            error: message
        });
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
                lastSeen: new Date()
            });
        }
        // Return success response
        res.json({
            success: true,
            message: 'Successfully logged out'
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            message: 'Logout failed',
            code: 'LOGOUT_ERROR',
            error: message
        });
    }
};
exports.logout = logout;
const getMe = async (req, res) => {
    try {
        const user = await User_1.UserModel.findById(req.user.id)
            .select('-password -salt -__v')
            .lean();
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }
        // Update last seen without waiting for the update to complete
        User_1.UserModel.findByIdAndUpdate(user._id, { lastSeen: new Date() }).catch(console.error);
        res.json({
            success: true,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                verified: user.verified,
                onboard: user.onboard,
                status: user.status,
                lastSeen: user.lastSeen,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user profile',
            code: 'PROFILE_FETCH_ERROR',
            error: message
        });
    }
};
exports.getMe = getMe;
