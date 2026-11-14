import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest, getUserId } from '../interfaces/auth.interface';

function errorMessage(error: any): string {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => issue.message).join('; ');
  }
  return error.message;
}

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const user = await AuthService.register(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ message: errorMessage(error) });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await AuthService.login(req.body);
      res.json({ token: result.token, refreshToken: result.refreshToken, user: result.user });
    } catch (error: any) {
      res.status(401).json({ message: errorMessage(error) });
    }
  }

  public static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const result = await AuthService.refreshAccessToken(req.body.refreshToken);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ message: errorMessage(error) });
    }
  }

  public static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const result = await AuthService.forgotPassword(req.body.email);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: errorMessage(error) });
    }
  }

  public static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const result = await AuthService.resetPassword(req.body.token, req.body.password);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: errorMessage(error) });
    }
  }

  public static async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await AuthService.changePassword(
        getUserId(req),
        req.body.currentPassword,
        req.body.newPassword
      );
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: errorMessage(error) });
    }
  }

  public static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await AuthService.logout(req.body.refreshToken, req.user?.id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: errorMessage(error) });
    }
  }
}
