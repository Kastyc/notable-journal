import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { auditLog } from '../utils/audit';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    userType: 'patient' | 'provider';
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requirePatient = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.userType !== 'patient') {
    return res.status(403).json({ error: 'Patient access required' });
  }
  next();
};

export const requireProvider = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.userType !== 'provider') {
    return res.status(403).json({ error: 'Provider access required' });
  }
  next();
};

export const generateToken = (user: { id: string; username: string; userType: string }) => {
  return jwt.sign(
    { id: user.id, username: user.username, userType: user.userType },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};
