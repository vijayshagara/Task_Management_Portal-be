import { User } from '../models/user.model';
import { UserRole } from '../models/user.model'; // Import the enum
import { z } from 'zod';
import { Op } from 'sequelize';

export class UserService {
  private static userSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.nativeEnum(UserRole), // Use nativeEnum with the UserRole enum
  });

  public static async getAllUsers(): Promise<User[]> {
    return await User.findAll();
  }

  public static async getDevelopers(): Promise<User[]> {
    return await User.findAll({ where: { role: UserRole.DEVELOPER } });
  }

  public static async getUserById(id: string): Promise<User | null> {
    return await User.findByPk(id);
  }

  public static async createUser(userData: { name: string; email: string; password: string; role: UserRole }): Promise<User> {
    const validatedData = this.userSchema.parse(userData);
    return await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
      role: validatedData.role
    });
  }

  public static async updateUser(id: string, userData: Partial<{ name: string; email: string; password: string; role: UserRole }>): Promise<User | null> {
    const user = await User.findByPk(id);
    if (!user) return null;

    const validatedData = this.userSchema.partial().parse(userData);
    return await user.update({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
      role: validatedData.role
    });
  }

  public static async deleteUser(id: string): Promise<boolean> {
    const deleted = await User.destroy({ where: { id } });
    return deleted > 0;
  }
}