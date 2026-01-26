import { Request, Response } from 'express';
import { HealthRecordService } from '../services/health-record.service';

export class HealthRecordController {

  // Get all health records
  public static async getAllHealthRecords(req: Request, res: Response): Promise<void> {
    try {
      const records = await HealthRecordService.getAllHealthRecords();
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get health record by ID
  public static async getHealthRecordById(req: Request, res: Response): Promise<void> {
    try {
      const record = await HealthRecordService.getHealthRecordById(req.params.id);
      if (!record) {
        res.status(404).json({ message: 'Health record not found' });
        return;
      }
      res.json(record);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get health records by cow ID
  public static async getHealthRecordsByCowId(req: Request, res: Response): Promise<void> {
    try {
      const records = await HealthRecordService.getHealthRecordsByCowId(req.params.cowId);
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Create health record (admin / app)
  public static async createHealthRecord(req: Request, res: Response): Promise<void> {
    try {
      const record = await HealthRecordService.createHealthRecord(req.body);
      res.status(201).json(record);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // Update health record
  public static async updateHealthRecord(req: Request, res: Response): Promise<void> {
    try {
      const record = await HealthRecordService.updateHealthRecord(
        req.params.id,
        req.body
      );

      if (!record) {
        res.status(404).json({ message: 'Health record not found' });
        return;
      }

      res.json(record);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // Delete health record
  public static async deleteHealthRecord(req: Request, res: Response): Promise<void> {
    try {
      const success = await HealthRecordService.deleteHealthRecord(req.params.id);

      if (!success) {
        res.status(404).json({ message: 'Health record not found' });
        return;
      }

      res.json({ message: 'Health record deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Create health record from IoT device (ESP32)
  public static async createFromDevice(req: Request, res: Response): Promise<void> {
    try {
      const record = await HealthRecordService.createHealthRecord(req.body);
      res.status(201).json({
        message: 'Health data received from device',
        data: record,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
