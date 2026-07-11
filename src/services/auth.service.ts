import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import { Op } from 'sequelize';
import { User } from '../models/user.model';
import UserProfile from '../models/user-profile.model';
import UserSettings from '../models/user-settings.model';
import PasswordReset from '../models/password-reset.model';
import RefreshToken from '../models/refresh-token.model';
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
const REFRESH_EXPIRES_DAYS = 30;
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
    // Public registration never trusts client-supplied privileged roles
    role: z.enum(['farmer']).default('farmer'),
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  });

  private static adminCreateSchema = z.object({
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

  private static forgotPasswordSchema = z.object({
    email: z.string().email(),
  });

  private static resetPasswordSchema = z.object({
    token: z.string().min(1),
    password: z.string().min(6),
  });

  private static refreshSchema = z.object({
    refreshToken: z.string().min(1),
  });

  private static changePasswordSchema = z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
  });

  private static signAccessToken(payload: IUserTokenPayload): string {
    const signOptions: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
    return jwt.sign(payload, JWT_SECRET, signOptions);
  }

  private static async createRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRES_DAYS);
    await RefreshToken.create({ userId, token, expiresAt });
    return token;
  }

  private static async createUserAccount(
    validatedData: {
      name: string;
      email: string;
      password: string;
      role: 'admin' | 'developer' | 'farmer';
      username?: string;
    }
  ): Promise<Omit<User, 'password'>> {
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

    const { password, ...safeUser } = user.get({ plain: true });
    return safeUser as any;
  }

  // --------------------
  // REGISTER (public — always farmer)
  // --------------------
  public static async register(
    userData: IUser
  ): Promise<Omit<User, 'password'>> {
    const validatedData = this.userSchema.parse({
      ...userData,
      role: 'farmer',
    });
    return this.createUserAccount(validatedData);
  }

  // --------------------
  // ADMIN CREATE USER (privileged roles allowed)
  // --------------------
  public static async createUserAsAdmin(
    userData: IUser
  ): Promise<Omit<User, 'password'>> {
    const validatedData = this.adminCreateSchema.parse(userData);
    return this.createUserAccount(validatedData);
  }

  // --------------------
  // LOGIN
  // --------------------
  public static async login(
    loginData: IUserLogin
  ): Promise<{ token: string; refreshToken: string; user: Omit<User, 'password'> & { profile?: UserProfile } }> {

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

    const token = this.signAccessToken(payload);
    const refreshToken = await this.createRefreshToken(user.id);

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
      refreshToken,
      user: { ...safeUser, profile: profile?.get({ plain: true }) } as any,
    };
  }

  // --------------------
  // REFRESH TOKEN
  // --------------------
  public static async refreshAccessToken(refreshToken: string) {
    const validated = this.refreshSchema.parse({ refreshToken });
    const stored = await RefreshToken.findOne({
      where: { token: validated.refreshToken, expiresAt: { [Op.gt]: new Date() } },
    });
    if (!stored) throw new Error('Invalid or expired refresh token');

    const user = await User.findByPk(stored.userId);
    if (!user) throw new Error('User not found');

    const payload: IUserTokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role as 'admin' | 'developer' | 'farmer',
    };

    return { token: this.signAccessToken(payload), refreshToken: stored.token };
  }

  // --------------------
  // FORGOT / RESET PASSWORD
  // --------------------
  public static async forgotPassword(email: string) {
    const { email: validEmail } = this.forgotPasswordSchema.parse({ email });
    const user = await User.findOne({ where: { email: validEmail } });
    if (!user) return { message: 'If the email exists, a reset link has been sent' };

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await PasswordReset.create({ userId: user.id, token, expiresAt });

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[PASSWORD RESET] Link for ${validEmail}: ${resetLink}`);
    }

    return { message: 'If the email exists, a reset link has been sent', ...(process.env.NODE_ENV === 'development' ? { token } : {}) };
  }

  public static async resetPassword(token: string, password: string) {
    const validated = this.resetPasswordSchema.parse({ token, password });
    const reset = await PasswordReset.findOne({
      where: { token: validated.token, used: false, expiresAt: { [Op.gt]: new Date() } },
    });
    if (!reset) throw new Error('Invalid or expired reset token');

    const user = await User.findByPk(reset.userId);
    if (!user) throw new Error('User not found');

    const hashedPassword = await bcrypt.hash(validated.password, SALT_ROUNDS);
    await user.update({ password: hashedPassword });
    await reset.update({ used: true });
    await RefreshToken.destroy({ where: { userId: user.id } });

    return { message: 'Password reset successful' };
  }

  public static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const validated = this.changePasswordSchema.parse({ currentPassword, newPassword });
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const valid = await bcrypt.compare(validated.currentPassword, user.password);
    if (!valid) throw new Error('Current password is incorrect');

    await user.update({ password: await bcrypt.hash(validated.newPassword, SALT_ROUNDS) });
    await RefreshToken.destroy({ where: { userId: user.id } });
    return { message: 'Password changed successfully' };
  }

  public static async logout(refreshToken?: string, userId?: string) {
    if (refreshToken) {
      await RefreshToken.destroy({ where: { token: refreshToken } });
    } else if (userId) {
      await RefreshToken.destroy({ where: { userId } });
    }
    return { message: 'Logged out successfully' };
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
