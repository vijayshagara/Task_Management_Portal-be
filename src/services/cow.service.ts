import { Cow, CowGender } from '../models/cow.model';
import { z } from 'zod';
import { Transaction, WhereOptions } from 'sequelize';
import sequelize from '../config/database';
import { CowImageService } from './cow-image.service';
import HealthRecord from '../models/health-record.model';
import HeatCycle from '../models/heat-cycle.model';
import HeatSchedule from '../models/heat-schedules.model';
import CowHealthStatus from '../models/cow-health-status.model';
import { cowScopeWhere, isAdmin } from '../utils/farm-access';

export class CowService {
  private static cowSchema = z.object({
    name: z.string().min(2),
    breed: z.string().min(2),
    fatherName: z.string().optional(),
    motherName: z.string().optional(),
    gender: z.nativeEnum(CowGender),
    birthDate: z.coerce.date(),
    image: z.string().optional().nullable(),
  });

  public static async getAllCows(userId?: string, role?: string): Promise<Cow[]> {
    const where: WhereOptions<Cow> = role && userId ? cowScopeWhere(userId, role) : {};
    return Cow.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
  }

  public static async getCowById(id: string, userId?: string, role?: string): Promise<Cow | null> {
    const cow = await Cow.findByPk(id);
    if (!cow) return null;
    if (role && userId && !isAdmin(role) && cow.ownerId !== userId) return null;
    return cow;
  }

  public static async createCow(
    cowData: {
      name: string;
      breed: string;
      fatherName?: string;
      motherName?: string;
      gender: CowGender;
      birthDate: Date | string;
      image?: string | null;
      ownerId?: string | null;
    }
  ): Promise<Cow> {
    const validatedData = this.cowSchema.parse(cowData);
    const ownerId = cowData.ownerId ?? null;

    return sequelize.transaction(async (transaction: Transaction) => {
      const existingCow = await Cow.findOne({
        where: {
          name: validatedData.name,
          birthDate: validatedData.birthDate,
        },
        transaction,
      });

      if (existingCow) {
        throw new Error('Cow with same name and birth date already exists');
      }

      return Cow.create({ ...validatedData, ownerId }, { transaction });
    });
  }

  public static async updateCow(
    id: string,
    cowData: Partial<{
      name: string;
      breed: string;
      fatherName?: string;
      motherName?: string;
      gender: CowGender;
      birthDate: Date | string;
      image?: string | null;
    }>,
    userId?: string,
    role?: string
  ): Promise<Cow | null> {
    const validatedData = this.cowSchema.partial().parse(cowData);

    const cow = await this.getCowById(id, userId, role);
    if (!cow) return null;

    return cow.update(validatedData);
  }

  public static async setCowImage(cowId: string, fileId: string): Promise<Cow | null> {
    const cow = await Cow.findByPk(cowId);
    if (!cow) return null;

    return cow.update({ image: fileId });
  }

  public static async deleteCow(id: string, userId?: string, role?: string): Promise<boolean> {
    const cow = await this.getCowById(id, userId, role);
    if (!cow) return false;

    if (cow.image) {
      await CowImageService.deleteByFileId(cow.image).catch(() => {});
    }

    const deletedCount = await sequelize.transaction(async (transaction: Transaction) => {
      await HeatSchedule.destroy({ where: { cowId: id }, transaction });
      await HeatCycle.destroy({ where: { cowId: id }, transaction });
      await HealthRecord.destroy({ where: { cowId: id }, transaction });
      await CowHealthStatus.destroy({ where: { cowId: id }, transaction });

      return Cow.destroy({
        where: { id },
        transaction,
      });
    });

    return deletedCount > 0;
  }
}
