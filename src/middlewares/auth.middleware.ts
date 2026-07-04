import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest } from '../interfaces/auth.interface';

export const authMiddleware = (roles: string[] = []) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
      }

      const decoded = AuthService.verifyToken(token);
      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      next();
    } catch {
      res.status(401).json({ message: 'Invalid token' });
    }
  };
};

export const optionalAuthMiddleware = () => {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (token) {
        req.user = AuthService.verifyToken(token);
      }
    } catch {
      // ignore invalid token for optional auth
    }
    next();
  };
};
