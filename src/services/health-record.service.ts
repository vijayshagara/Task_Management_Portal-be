import HealthRecord from '../models/health-record.model';
import { Cow } from '../models/cow.model';
import { z } from 'zod';
import sequelize from '../config/database';
import { sendEmail } from '../services1/notification.service';
import CowHealthStatus from '../models/cow-health-status.model';

export class HealthRecordService {

  // --------------------
  // VALIDATION SCHEMAS
  // --------------------
  private static createSchema = z.object({
    cowId: z.string().uuid(),
    temperature: z.number().optional(),
    activityLevel: z.string().optional(),
    eatingStatus: z.string().optional(),
    rumination: z.string().optional(),
    issue: z.string().optional(),
    recordedAt: z.coerce.date().optional(),
  });

  private static updateSchema = z.object({
    temperature: z.number().optional(),
    activityLevel: z.string().optional(),
    eatingStatus: z.string().optional(),
    rumination: z.string().optional(),
    issue: z.string().optional(),
    recordedAt: z.coerce.date().optional(),
  });

  private static getFeverStatus(
    temperature?: number
  ): 'NORMAL' | 'MILD_FEVER' | 'HIGH_FEVER' {

    if (temperature == null) return 'NORMAL';
    if (temperature >= 40) return 'HIGH_FEVER';
    if (temperature >= 39.3) return 'MILD_FEVER';
    return 'NORMAL';
  }


  // --------------------
  // GET ALL HEALTH RECORDS
  // --------------------
  public static async getAllHealthRecords(): Promise<HealthRecord[]> {
    return HealthRecord.findAll({
      order: [['recordedAt', 'DESC']],
      include: [
        {
          model: Cow,
          attributes: ['id', 'name', 'breed'],
        },
      ],
    });
  }

  // --------------------
  // GET BY ID
  // --------------------
  public static async getHealthRecordById(
    id: string
  ): Promise<HealthRecord | null> {

    return HealthRecord.findByPk(id, {
      include: [
        {
          model: Cow,
          attributes: ['id', 'name', 'breed'],
        },
      ],
    });
  }

  // --------------------
  // GET BY COW ID
  // --------------------
  public static async getHealthRecordsByCowId(
    cowId: string
  ): Promise<HealthRecord[]> {

    return HealthRecord.findAll({
      where: { cowId },
      order: [['recordedAt', 'DESC']],
    });
  }

  // --------------------
  // CREATE
  // --------------------
  public static async createHealthRecord(
    data: {
      cowId: string;
      temperature?: number;
      activityLevel?: string;
      eatingStatus?: string;
      rumination?: string;
      issue?: string;
      recordedAt?: Date | string;
    }
  ): Promise<HealthRecord> {

    const validatedData = this.createSchema.parse(data);

    return sequelize.transaction(async (transaction) => {

      // 1️⃣ Validate cow
      const cow = await Cow.findByPk(validatedData.cowId, { transaction });
      if (!cow) {
        throw new Error('Cow not found');
      }

      // 2️⃣ Insert history record
      const healthRecord = await HealthRecord.create(validatedData, { transaction });

      // 3️⃣ Determine fever status
      const feverStatus = this.getFeverStatus(validatedData.temperature);

      // 4️⃣ Read previous status (for alert control)
      const previousStatus = await CowHealthStatus.findByPk(cow.id, { transaction });

      // 5️⃣ UPSERT latest health snapshot
      await CowHealthStatus.upsert(
        {
          cowId: cow.id,
          latestTemperature: validatedData.temperature ?? null,
          feverStatus,
          lastCheckedAt: validatedData.recordedAt
            ? new Date(validatedData.recordedAt)
            : new Date(),
        },
        { transaction }
      );

      // 6️⃣ Send alert ONLY on status change + fever
      if (
        feverStatus !== 'NORMAL' &&
        previousStatus?.feverStatus !== feverStatus
      ) {
        sendEmail(cow.id, cow.name, feverStatus).catch(err => {
          console.error('Error sending fever alert email:', err);
        });
      }

      return healthRecord;
    });
  }



  // --------------------
  // UPDATE
  // --------------------
  public static async updateHealthRecord(
    id: string,
    data: Partial<{
      temperature: number;
      activityLevel: string;
      eatingStatus: string;
      rumination: string;
      issue: string;
      recordedAt: Date | string;
    }>
  ): Promise<HealthRecord | null> {

    const validatedData = this.updateSchema.parse(data);

    const record = await HealthRecord.findByPk(id);
    if (!record) return null;

    return record.update(validatedData);
  }

  // --------------------
  // DELETE
  // --------------------
  public static async deleteHealthRecord(id: string): Promise<boolean> {
    const deleted = await HealthRecord.destroy({
      where: { id },
    });

    return deleted > 0;
  }
}
