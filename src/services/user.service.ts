import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import { UserRole } from '../models/user.model';
import { z } from 'zod';

const SAFE_USER_ATTRIBUTES = ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'] as const;
const SALT_ROUNDS = 10;

export class UserService {
  private static userSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.nativeEnum(UserRole),
  });

  public static async getAllUsers(): Promise<User[]> {
    return await User.findAll({
      attributes: [...SAFE_USER_ATTRIBUTES],
    });
  }

  public static async getDevelopers(): Promise<User[]> {
    return await User.findAll({
      where: { role: UserRole.DEVELOPER },
      attributes: [...SAFE_USER_ATTRIBUTES],
    });
  }

  public static async getUserById(id: string): Promise<User | null> {
    return await User.findByPk(id, {
      attributes: [...SAFE_USER_ATTRIBUTES],
    });
  }

  public static async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<User> {
    const validatedData = this.userSchema.parse(userData);
    const hashedPassword = await bcrypt.hash(validatedData.password, SALT_ROUNDS);
    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      role: validatedData.role,
    });
    const safe = await this.getUserById(user.id);
    return safe as User;
  }

  public static async updateUser(
    id: string,
    userData: Partial<{ name: string; email: string; password: string; role: UserRole }>
  ): Promise<User | null> {
    const user = await User.findByPk(id);
    if (!user) return null;

    const validatedData = this.userSchema.partial().parse(userData);
    const updates: Partial<{ name: string; email: string; password: string; role: UserRole }> = {};
    if (validatedData.name !== undefined) updates.name = validatedData.name;
    if (validatedData.email !== undefined) updates.email = validatedData.email;
    if (validatedData.role !== undefined) updates.role = validatedData.role;
    if (validatedData.password !== undefined) {
      updates.password = await bcrypt.hash(validatedData.password, SALT_ROUNDS);
    }

    await user.update(updates);
    return await this.getUserById(id);
  }

  public static async deleteUser(id: string): Promise<boolean> {
    const deleted = await User.destroy({ where: { id } });
    return deleted > 0;
  }
}
