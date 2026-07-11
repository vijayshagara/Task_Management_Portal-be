import { Request, Response } from 'express';
import { HealthRecordService } from '../services/health-record.service';
import { AuthenticatedRequest, getUserId } from '../interfaces/auth.interface';

export class HealthRecordController {

  public static async getAllHealthRecords(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const records = await HealthRecordService.getAllHealthRecords(
        getUserId(req),
        req.user!.role
      );
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  public static async getHealthRecordById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const record = await HealthRecordService.getHealthRecordById(
        req.params.id,
        getUserId(req),
        req.user!.role
      );
      if (!record) {
        res.status(404).json({ message: 'Health record not found' });
        return;
      }
      res.json(record);
    } catch (error: any) {
      const status = error.message?.includes('access') ? 403 : 500;
      res.status(status).json({ message: error.message });
    }
  }

  public static async getHealthRecordsByCowId(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const records = await HealthRecordService.getHealthRecordsByCowId(
        req.params.cowId,
        getUserId(req),
        req.user!.role
      );
      res.json(records);
    } catch (error: any) {
      const status = error.message?.includes('access') || error.message?.includes('not found') ? 403 : 500;
      res.status(status).json({ message: error.message });
    }
  }

  public static async createHealthRecord(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const record = await HealthRecordService.createHealthRecord(
        req.body,
        getUserId(req),
        req.user!.role
      );
      res.status(201).json(record);
    } catch (error: any) {
      const status = error.message?.includes('access') ? 403 : 400;
      res.status(status).json({ message: error.message });
    }
  }

  public static async updateHealthRecord(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const record = await HealthRecordService.updateHealthRecord(
        req.params.id,
        req.body,
        getUserId(req),
        req.user!.role
      );

      if (!record) {
        res.status(404).json({ message: 'Health record not found' });
        return;
      }

      res.json(record);
    } catch (error: any) {
      const status = error.message?.includes('access') ? 403 : 400;
      res.status(status).json({ message: error.message });
    }
  }

  public static async deleteHealthRecord(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const success = await HealthRecordService.deleteHealthRecord(
        req.params.id,
        getUserId(req),
        req.user!.role
      );

      if (!success) {
        res.status(404).json({ message: 'Health record not found' });
        return;
      }

      res.json({ message: 'Health record deleted successfully' });
    } catch (error: any) {
      const status = error.message?.includes('access') ? 403 : 500;
      res.status(status).json({ message: error.message });
    }
  }

  public static async createFromDevice(req: Request, res: Response): Promise<void> {
    try {
      const record = await HealthRecordService.createHealthRecord(req.body);
      res.status(201).json(record);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
