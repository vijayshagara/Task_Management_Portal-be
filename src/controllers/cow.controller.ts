import { Request, Response } from 'express';
import { CowService } from '../services/cow.service';
import { CowImageService } from '../services/cow-image.service';
import { isMongoConnected } from '../config/mongodb';

export class CowController {
  public static async getAllCows(req: Request, res: Response): Promise<void> {
    try {
      const cows = await CowService.getAllCows();
      res.send(cows);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async getCowById(req: Request, res: Response): Promise<void> {
    try {
      const cow = await CowService.getCowById(req.params.id);
      if (!cow) {
        res.status(404).json({ message: 'Cow not found' });
        return;
      }
      res.json(cow);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async createCow(req: Request, res: Response): Promise<void> {
    try {
      const cow = await CowService.createCow(req.body);
      res.status(201).json(cow);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async updateCow(req: Request, res: Response): Promise<void> {
    try {
      const cow = await CowService.updateCow(req.params.id, req.body);
      if (!cow) {
        res.status(404).json({ message: 'Cow not found' });
        return;
      }
      res.json(cow);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async deleteCow(req: Request, res: Response): Promise<void> {
    try {
      const success = await CowService.deleteCow(req.params.id);
      if (!success) {
        res.status(404).json({ message: 'Cow not found' });
        return;
      }
      res.json({ message: 'Cow deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async uploadCowImage(req: Request, res: Response): Promise<void> {
    try {
      if (!isMongoConnected()) {
        res.status(503).json({ message: 'Image storage is not configured. Set MONGODB_URI in .env' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ message: 'No image file provided' });
        return;
      }

      const cow = await CowService.getCowById(req.params.id);
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
      if (!isMongoConnected()) {
        res.status(503).json({ message: 'Image storage is not configured' });
        return;
      }

      const cow = await CowService.getCowById(req.params.id);
      if (!cow || !cow.image) {
        res.status(404).json({ message: 'Image not found' });
        return;
      }

      const { stream, contentType } = await CowImageService.getCowImageStream(cow.image);

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      stream.pipe(res);
    } catch (error: any) {
      res.status(404).json({ message: error.message || 'Image not found' });
    }
  }
}
