import { Request, Response } from 'express';
import { CowService } from '../services/cow.service';
import { CowImageService } from '../services/cow-image.service';
import { AuthenticatedRequest } from '../interfaces/auth.interface';

export class CowController {
  public static async getAllCows(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const cows = await CowService.getAllCows(req.user?.id, req.user?.role);
      res.send(cows);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async getCowById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const cow = await CowService.getCowById(req.params.id, req.user?.id, req.user?.role);
      if (!cow) {
        res.status(404).json({ message: 'Cow not found' });
        return;
      }
      res.json(cow);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async createCow(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ownerId = req.user?.role === 'admin' ? req.body.ownerId : req.user?.id;
      const cow = await CowService.createCow({ ...req.body, ownerId: ownerId || req.user?.id });
      res.status(201).json(cow);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async updateCow(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const cow = await CowService.updateCow(req.params.id, req.body, req.user?.id, req.user?.role);
      if (!cow) {
        res.status(404).json({ message: 'Cow not found' });
        return;
      }
      res.json(cow);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async deleteCow(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const success = await CowService.deleteCow(req.params.id, req.user?.id, req.user?.role);
      if (!success) {
        res.status(404).json({ message: 'Cow not found' });
        return;
      }
      res.json({ message: 'Cow deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async uploadCowImage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No image file provided' });
        return;
      }

      const cow = await CowService.getCowById(req.params.id, req.user?.id, req.user?.role);
      if (!cow) {
        res.status(404).json({ message: 'Cow not found' });
        return;
      }

      const fileId = await CowImageService.uploadCowImage(
        cow.id,
        req.file,
        cow.image
      );

      const updatedCow = await CowService.setCowImage(cow.id, fileId);
      res.json(updatedCow);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async getCowImage(req: Request, res: Response): Promise<void> {
    try {
      const cow = await CowService.getCowById(req.params.id);
      if (!cow || !cow.image) {
        res.status(404).json({ message: 'Image not found' });
        return;
      }

      const { stream, contentType } = await CowImageService.getCowImageStream(
        cow.image,
        cow.id
      );

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      stream.pipe(res);
    } catch (error: any) {
      res.status(404).json({ message: error.message || 'Image not found' });
    }
  }
}
