import HealthRecord from '../models/health-record.model';
import { Cow } from '../models/cow.model';
import { z } from 'zod';
import sequelize from '../config/database';
import { sendEmail } from '../services1/notification.service';
import CowHealthStatus from '../models/cow-health-status.model';
import { assertCowAccess, cowScopeWhere } from '../utils/farm-access';

export class HealthRecordService {

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

  public static async getAllHealthRecords(
    userId: string,
    role: string
  ): Promise<HealthRecord[]> {
    const cowWhere = cowScopeWhere(userId, role);
    return HealthRecord.findAll({
      order: [['recordedAt', 'DESC']],
      include: [
        {
          model: Cow,
          attributes: ['id', 'name', 'breed', 'ownerId'],
          where: Object.keys(cowWhere).length ? cowWhere : undefined,
          required: true,
        },
      ],
    });
  }

  public static async getHealthRecordById(
    id: string,
    userId: string,
    role: string
  ): Promise<HealthRecord | null> {
    const record = await HealthRecord.findByPk(id, {
      include: [
        {
          model: Cow,
          attributes: ['id', 'name', 'breed', 'ownerId'],
        },
      ],
    });
    if (!record) return null;
    await assertCowAccess(record.cowId, userId, role);
    return record;
  }

  public static async getHealthRecordsByCowId(
    cowId: string,
    userId: string,
    role: string
  ): Promise<HealthRecord[]> {
    await assertCowAccess(cowId, userId, role);
    return HealthRecord.findAll({
      where: { cowId },
      order: [['recordedAt', 'DESC']],
    });
  }

  public static async createHealthRecord(
    data: {
      cowId: string;
      temperature?: number;
      activityLevel?: string;
      eatingStatus?: string;
      rumination?: string;
      issue?: string;
      recordedAt?: Date | string;
    },
    userId?: string,
    role?: string
  ): Promise<HealthRecord> {
    const validatedData = this.createSchema.parse(data);

    return sequelize.transaction(async (transaction) => {
      const cow = userId && role
        ? await assertCowAccess(validatedData.cowId, userId, role)
        : await Cow.findByPk(validatedData.cowId, { transaction });

      if (!cow) {
        throw new Error('Cow not found');
      }

      const healthRecord = await HealthRecord.create(validatedData, { transaction });
      const feverStatus = this.getFeverStatus(validatedData.temperature);
      const previousStatus = await CowHealthStatus.findByPk(cow.id, { transaction });

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

      if (
        feverStatus !== 'NORMAL' &&
        previousStatus?.feverStatus !== feverStatus
      ) {
        sendEmail(cow.id, cow.name, feverStatus).catch((err) => {
          console.error('Error sending fever alert email:', err);
        });
      }

      return healthRecord;
    });
  }

  public static async updateHealthRecord(
    id: string,
    data: Partial<{
      temperature: number;
      activityLevel: string;
      eatingStatus: string;
      rumination: string;
      issue: string;
      recordedAt: Date | string;
    }>,
    userId: string,
    role: string
  ): Promise<HealthRecord | null> {
    const validatedData = this.updateSchema.parse(data);
    const record = await HealthRecord.findByPk(id);
    if (!record) return null;
    await assertCowAccess(record.cowId, userId, role);
    return record.update(validatedData);
  }

  public static async deleteHealthRecord(
    id: string,
    userId: string,
    role: string
  ): Promise<boolean> {
    const record = await HealthRecord.findByPk(id);
    if (!record) return false;
    await assertCowAccess(record.cowId, userId, role);
    const deleted = await HealthRecord.destroy({ where: { id } });
    return deleted > 0;
  }
}
