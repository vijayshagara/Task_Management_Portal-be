import { Request, Response } from 'express';
import { CowService } from '../services/cow.service';

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
        res.status(404).json({ message: 'Cow not found33333333' });
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
        res.status(404).json({ message: 'Cow not found4444444444444' });
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
        res.status(404).json({ message: 'Cow not found55555555555555' });
        return;
      }
      res.json({ message: 'Cow deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
