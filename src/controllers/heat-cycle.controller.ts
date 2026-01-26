import { Request, Response } from 'express';
import { HeatCycleService } from '../services/heat-cycle.service';

export class HeatCycleController {

  public static async getAllHeatCycles(req: Request, res: Response): Promise<void> {
    try {
      const cycles = await HeatCycleService.getAllHeatCycles();
      res.json(cycles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async getHeatCycleById(req: Request, res: Response): Promise<void> {
    try {
      const cycle = await HeatCycleService.getHeatCycleById(req.params.id);
      if (!cycle) {
        res.status(404).json({ message: 'Heat cycle not found' });
        return;
      }
      res.json(cycle);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async getHeatCyclesByCowId(req: Request, res: Response): Promise<void> {
    try {
      const cycles = await HeatCycleService.getHeatCyclesByCowId(req.params.cowId);
      res.json(cycles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async createHeatCycle(req: Request, res: Response): Promise<void> {
    try {
      const cycle = await HeatCycleService.createHeatCycle(req.body);
      res.status(201).json(cycle);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async updateHeatCycle(req: Request, res: Response): Promise<void> {
    try {
      const cycle = await HeatCycleService.updateHeatCycle(req.params.id, req.body);
      if (!cycle) {
        res.status(404).json({ message: 'Heat cycle not found' });
        return;
      }
      res.json(cycle);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async deleteHeatCycle(req: Request, res: Response): Promise<void> {
    try {
      const success = await HeatCycleService.deleteHeatCycle(req.params.id);
      if (!success) {
        res.status(404).json({ message: 'Heat cycle not found' });
        return;
      }
      res.json({ message: 'Heat cycle deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async confirmHeat(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const result = await HeatCycleService.confirmHeat(req.params.id);

      if (!result) {
        res.status(404).json({ message: 'Heat cycle not found' });
        return;
      }

      res.json({
        message: 'Heat confirmed. Future alerts cancelled.',
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

}
