import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/user.model';
import UserProfile from '../models/user-profile.model';
import UserSettings from '../models/user-settings.model';
import {
  IUser,
  IUserLogin,
  IUserTokenPayload,
} from '../interfaces/user.interface';

// --------------------
// ENV VALIDATION
// --------------------
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

const JWT_SECRET: Secret = process.env.JWT_SECRET;
const JWT_EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || '2h';
const SALT_ROUNDS = 10;

// --------------------
// AUTH SERVICE
// --------------------
export class AuthService {
  // --------------------
  // VALIDATION SCHEMAS
  // --------------------
  private static userSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['admin', 'developer', 'farmer']).default('farmer'),
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  });

  private static loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  // --------------------
  // REGISTER
  // --------------------
  public static async register(
    userData: IUser
  ): Promise<Omit<User, 'password'>> {

    const validatedData = this.userSchema.parse(userData);

    const existingUser = await User.findOne({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const hashedPassword = await bcrypt.hash(
      validatedData.password,
      SALT_ROUNDS
    );

    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      role: validatedData.role,
    });

    const username =
      validatedData.username ||
      validatedData.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 30);

    let uniqueUsername = username;
    let suffix = 1;
    while (await UserProfile.findOne({ where: { username: uniqueUsername } })) {
      uniqueUsername = `${username}_${suffix++}`;
    }

    await UserProfile.create({
      userId: user.id,
      username: uniqueUsername,
      farmName: `${validatedData.name}'s Farm`,
    });

    await UserSettings.create({ userId: user.id });

    // Remove password before returning
    const { password, ...safeUser } = user.get({ plain: true });

    return safeUser as any;
  }

  // --------------------
  // LOGIN
  // --------------------
  public static async login(
    loginData: IUserLogin
  ): Promise<{ token: string; user: Omit<User, 'password'> & { profile?: UserProfile } }> {

    const validatedData = this.loginSchema.parse(loginData);

    const user = await User.findOne({
      where: { email: validatedData.email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const payload: IUserTokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role as 'admin' | 'developer' | 'farmer',
    };

    const signOptions: SignOptions = {
      expiresIn: JWT_EXPIRES_IN as any,
    };

    const token = jwt.sign(payload, JWT_SECRET, signOptions);

    const profile = await UserProfile.findOrCreate({
      where: { userId: user.id },
      defaults: {
        userId: user.id,
        username: user.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 30),
        farmName: `${user.name}'s Farm`,
      },
    }).then(([p]) => p);

    await UserSettings.findOrCreate({
      where: { userId: user.id },
      defaults: { userId: user.id },
    });

    const { password, ...safeUser } = user.get({ plain: true });

    return {
      token,
      user: { ...safeUser, profile: profile?.get({ plain: true }) } as any,
    };
  }

  // --------------------
  // VERIFY TOKEN
  // --------------------
  public static verifyToken(token: string): IUserTokenPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as IUserTokenPayload;
    } catch {
      throw new Error('Invalid or expired token');
    }
  }
}
