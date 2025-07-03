import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { IUser, IUserLogin, IUserTokenPayload } from '../interfaces/user.interface';
import { z } from 'zod';
import { Op } from 'sequelize';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export class AuthService {
  private static userSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['admin', 'developer']),
  });

  private static loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  public static async register(userData: IUser): Promise<User> {
    try {
      if(!userData.role){
        userData.role = 'developer';
      }
      const validatedData = this.userSchema.parse(userData);
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ email: validatedData.email }],
        },
      });

      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      return await User.create<any>({
        ...validatedData,
        password: hashedPassword,
      });

    } catch (error) {
      throw new Error('Registration failed');
    }
  }

  public static async login(loginData: IUserLogin): Promise<any> {
    const validatedData = this.loginSchema.parse(loginData);
    const user = await User.findOne({ where: { email: validatedData.email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(validatedData.password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const payload: IUserTokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role as 'admin' | 'developer',
    };

    return {
      token: jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }),
      user: user
    };
  }

  public static async verifyToken(token: string): Promise<IUserTokenPayload> {
    return jwt.verify(token, JWT_SECRET) as IUserTokenPayload;
  }
}