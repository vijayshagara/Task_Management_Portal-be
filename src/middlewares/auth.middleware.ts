import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = (roles: string[] = []) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // const token = req.header('Authorization')?.replace('Bearer ', '');
      
      // if (!token) {
      //   res.status(401).json({ message: 'No token provided' });
      //   return;
      // }

      // const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
      // req.user = decoded;

      // if (roles.length && !roles.includes(decoded.role)) {
      //   res.status(403).json({ message: 'Forbidden' });
      //   return;
      // }

      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  };
};