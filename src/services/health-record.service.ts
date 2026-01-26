import HealthRecord from '../models/health-record.model';
import { Cow } from '../models/cow.model';
import { z } from 'zod';
import sequelize from '../config/database';

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

    return sequelize.transaction(async transaction => {

      const cow = await Cow.findByPk(validatedData.cowId, { transaction });
      if (!cow) {
        throw new Error('Cow not found');
      }

      return HealthRecord.create(validatedData, { transaction });
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
