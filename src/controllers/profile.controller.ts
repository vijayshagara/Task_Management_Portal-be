import { Response } from 'express';
import { AuthenticatedRequest, getUserId } from '../interfaces/auth.interface';
import { ProfileService } from '../services/profile.service';

export class ProfileController {
  public static async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = getUserId(req);
      const profile = await ProfileService.getProfile(userId, userId);
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const profile = await ProfileService.getProfile(req.params.userId, req.user?.id);
      res.json(profile);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  public static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const profile = await ProfileService.updateProfile(getUserId(req), req.body);
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async uploadProfilePicture(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }
      const result = await ProfileService.uploadProfilePicture(getUserId(req), req.file);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async uploadCoverPhoto(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }
      const result = await ProfileService.uploadCoverPhoto(getUserId(req), req.file);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async getSuggested(req: AuthenticatedRequest, res: Response) {
    try {
      const users = await ProfileService.getSuggestedUsers(getUserId(req));
      res.json(users);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default ProfileController;
