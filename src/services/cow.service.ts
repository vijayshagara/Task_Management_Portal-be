import { Cow, CowGender } from '../models/cow.model';
import { z } from 'zod';
import { Transaction } from 'sequelize';
import sequelize from '../config/database';

export class CowService {
  // --------------------
  // VALIDATION SCHEMA
  // --------------------
  private static cowSchema = z.object({
    name: z.string().min(2),
    breed: z.string().min(2),
    fatherName: z.string().optional(),
    motherName: z.string().optional(),
    gender: z.nativeEnum(CowGender),
    birthDate: z.coerce.date(),
  });

  // --------------------
  // GET ALL COWS
  // --------------------
  public static async getAllCows(): Promise<Cow[]> {
    return Cow.findAll({
      order: [['createdAt', 'DESC']],
    });
  }

  // --------------------
  // GET COW BY ID
  // --------------------
  public static async getCowById(id: string): Promise<Cow | null> {
    return Cow.findByPk(id);
  }

  // --------------------
  // CREATE COW
  // --------------------
  public static async createCow(
    cowData: {
      name: string;
      breed: string;
      fatherName?: string;
      motherName?: string;
      gender: CowGender;
      birthDate: Date | string;
    }
  ): Promise<Cow> {

    const validatedData = this.cowSchema.parse(cowData);

    return sequelize.transaction(async (transaction: Transaction) => {

      // ✅ Better uniqueness check (name + birthDate)
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

  // --------------------
  // UPDATE COW
  // --------------------
  public static async updateCow(
    id: string,
    cowData: Partial<{
      name: string;
      breed: string;
      fatherName?: string;
      motherName?: string;
      gender: CowGender;
      birthDate: Date | string;
    }>
  ): Promise<Cow | null> {

    const validatedData = this.cowSchema.partial().parse(cowData);

    const cow = await Cow.findByPk(id);
    if (!cow) return null;

    return cow.update(validatedData);
  }

  // --------------------
  // DELETE COW
  // --------------------
  public static async deleteCow(id: string): Promise<boolean> {
    const deletedCount = await Cow.destroy({
      where: { id },
    });

    return deletedCount > 0;
  }
}
