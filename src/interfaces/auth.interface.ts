import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function getUserId(req: AuthenticatedRequest): string {
  if (!req.user?.id) {
    throw new Error('Unauthorized');
  }
  return req.user.id;
}
