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
    let token;
    
    // Check for token in cookies or Authorization header
    if (req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const user = await UserModel.findById(decoded.id);
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
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden - Admin access required' });
  }
  next();
};
