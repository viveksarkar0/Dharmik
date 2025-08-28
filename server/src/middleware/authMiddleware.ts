import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: 'admin' | 'member';
        email: string;
        firstName: string;
        lastName: string;
      };
    }
  }
}

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'admin' | 'member';
    email: string;
    firstName: string;
    lastName: string;
  };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN',
        error: jwtError instanceof Error ? jwtError.message : 'Unknown error'
      });
    }
    
    // Get user from database
    const user = await UserModel.findById((decoded as any).id).select('-password -salt');
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
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_ERROR',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Forbidden - Admin access required',
      code: 'ADMIN_ACCESS_REQUIRED'
    });
  }
  next();
};
