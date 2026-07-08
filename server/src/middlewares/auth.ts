import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    is_admin: boolean;
  };
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }

  try {
    const decoded = verifyToken(token) as { id: string };
    const user = await prisma.account.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, is_admin: true, status: true }
    });

    if (!user || user.status !== 'activated') {
      res.status(401).json({ error: 'Unauthorized: Invalid or deactivated account' });
      return;
    }

    req.user = {
      id: user.id,
      username: user.username,
      is_admin: user.is_admin
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || !req.user.is_admin) {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
    return;
  }
  next();
};
