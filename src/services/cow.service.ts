import { Cow, CowGender } from '../models/cow.model';
import { z } from 'zod';
import { Transaction } from 'sequelize';
import sequelize from '../config/database';
import { isMongoConnected } from '../config/mongodb';
import { CowImageService } from './cow-image.service';
import HealthRecord from '../models/health-record.model';
import HeatCycle from '../models/heat-cycle.model';
import HeatSchedule from '../models/heat-schedules.model';
import CowHealthStatus from '../models/cow-health-status.model';

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

  public static async getAllCows(): Promise<Cow[]> {
    return Cow.findAll({
      order: [['createdAt', 'DESC']],
    });
  }

  public static async getCowById(id: string): Promise<Cow | null> {
    return Cow.findByPk(id);
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
    }
  ): Promise<Cow> {
    const validatedData = this.cowSchema.parse(cowData);

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

      return Cow.create(validatedData, { transaction });
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
    }>
  ): Promise<Cow | null> {
    const validatedData = this.cowSchema.partial().parse(cowData);

    const cow = await Cow.findByPk(id);
    if (!cow) return null;

    return cow.update(validatedData);
  }

  public static async setCowImage(cowId: string, fileId: string): Promise<Cow | null> {
    const cow = await Cow.findByPk(cowId);
    if (!cow) return null;

    return cow.update({ image: fileId });
  }

  public static async deleteCow(id: string): Promise<boolean> {
    const cow = await Cow.findByPk(id);
    if (!cow) return false;

    if (cow.image && isMongoConnected()) {
      await CowImageService.deleteByFileId(cow.image);
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
