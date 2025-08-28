import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel, hashPassword } from '../models/User';

const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || 'dev_jwt_secret';
  return jwt.sign({ id }, secret, { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const { hash, salt } = await hashPassword(password);

    // Create user
    const user = await UserModel.create({
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
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/',
      domain: isProduction ? '.dharmik-lyart.vercel.app' : undefined,
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user and include password
    const user = await UserModel.findOne({ email }).select('+password +salt');
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
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/',
      domain: isProduction ? '.dharmik-lyart.vercel.app' : undefined,
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // Update user status
    if (req.user?.id) {
      await UserModel.findByIdAndUpdate(req.user.id, {
        'status.status': false,
        'status.lastLogoutAt': new Date(),
      });
    }

    // Clear cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      domain: isProduction ? '.dharmik-lyart.vercel.app' : undefined,
    });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById(req.user!.id);
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: message });
  }
};
