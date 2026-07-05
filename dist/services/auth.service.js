"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const sequelize_1 = require("sequelize");
const user_model_1 = require("../models/user.model");
const user_profile_model_1 = __importDefault(require("../models/user-profile.model"));
const user_settings_model_1 = __importDefault(require("../models/user-settings.model"));
const password_reset_model_1 = __importDefault(require("../models/password-reset.model"));
const refresh_token_model_1 = __importDefault(require("../models/refresh-token.model"));
// --------------------
// ENV VALIDATION
// --------------------
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';
const REFRESH_EXPIRES_DAYS = 30;
const SALT_ROUNDS = 10;
// --------------------
// AUTH SERVICE
// --------------------
class AuthService {
    static signAccessToken(payload) {
        const signOptions = { expiresIn: JWT_EXPIRES_IN };
        return jsonwebtoken_1.default.sign(payload, JWT_SECRET, signOptions);
    }
    static async createRefreshToken(userId) {
        const token = crypto_1.default.randomBytes(40).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRES_DAYS);
        await refresh_token_model_1.default.create({ userId, token, expiresAt });
        return token;
    }
    // --------------------
    // REGISTER
    // --------------------
    static async register(userData) {
        const validatedData = this.userSchema.parse(userData);
        const existingUser = await user_model_1.User.findOne({
            where: { email: validatedData.email },
        });
        if (existingUser) {
            throw new Error('User already exists with this email');
        }
        const hashedPassword = await bcryptjs_1.default.hash(validatedData.password, SALT_ROUNDS);
        const user = await user_model_1.User.create({
            name: validatedData.name,
            email: validatedData.email,
            password: hashedPassword,
            role: validatedData.role,
        });
        const username = validatedData.username ||
            validatedData.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 30);
        let uniqueUsername = username;
        let suffix = 1;
        while (await user_profile_model_1.default.findOne({ where: { username: uniqueUsername } })) {
            uniqueUsername = `${username}_${suffix++}`;
        }
        await user_profile_model_1.default.create({
            userId: user.id,
            username: uniqueUsername,
            farmName: `${validatedData.name}'s Farm`,
        });
        await user_settings_model_1.default.create({ userId: user.id });
        // Remove password before returning
        const { password, ...safeUser } = user.get({ plain: true });
        return safeUser;
    }
    // --------------------
    // LOGIN
    // --------------------
    static async login(loginData) {
        const validatedData = this.loginSchema.parse(loginData);
        const user = await user_model_1.User.findOne({
            where: { email: validatedData.email },
        });
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isPasswordValid = await bcryptjs_1.default.compare(validatedData.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
        const token = this.signAccessToken(payload);
        const refreshToken = await this.createRefreshToken(user.id);
        const profile = await user_profile_model_1.default.findOrCreate({
            where: { userId: user.id },
            defaults: {
                userId: user.id,
                username: user.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 30),
                farmName: `${user.name}'s Farm`,
            },
        }).then(([p]) => p);
        await user_settings_model_1.default.findOrCreate({
            where: { userId: user.id },
            defaults: { userId: user.id },
        });
        const { password, ...safeUser } = user.get({ plain: true });
        return {
            token,
            refreshToken,
            user: { ...safeUser, profile: profile?.get({ plain: true }) },
        };
    }
    // --------------------
    // REFRESH TOKEN
    // --------------------
    static async refreshAccessToken(refreshToken) {
        const validated = this.refreshSchema.parse({ refreshToken });
        const stored = await refresh_token_model_1.default.findOne({
            where: { token: validated.refreshToken, expiresAt: { [sequelize_1.Op.gt]: new Date() } },
        });
        if (!stored)
            throw new Error('Invalid or expired refresh token');
        const user = await user_model_1.User.findByPk(stored.userId);
        if (!user)
            throw new Error('User not found');
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
        return { token: this.signAccessToken(payload), refreshToken: stored.token };
    }
    // --------------------
    // FORGOT / RESET PASSWORD
    // --------------------
    static async forgotPassword(email) {
        const { email: validEmail } = this.forgotPasswordSchema.parse({ email });
        const user = await user_model_1.User.findOne({ where: { email: validEmail } });
        if (!user)
            return { message: 'If the email exists, a reset link has been sent' };
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);
        await password_reset_model_1.default.create({ userId: user.id, token, expiresAt });
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
        if (process.env.NODE_ENV === 'development') {
            console.log(`[PASSWORD RESET] Link for ${validEmail}: ${resetLink}`);
        }
        return { message: 'If the email exists, a reset link has been sent', ...(process.env.NODE_ENV === 'development' ? { token } : {}) };
    }
    static async resetPassword(token, password) {
        const validated = this.resetPasswordSchema.parse({ token, password });
        const reset = await password_reset_model_1.default.findOne({
            where: { token: validated.token, used: false, expiresAt: { [sequelize_1.Op.gt]: new Date() } },
        });
        if (!reset)
            throw new Error('Invalid or expired reset token');
        const user = await user_model_1.User.findByPk(reset.userId);
        if (!user)
            throw new Error('User not found');
        const hashedPassword = await bcryptjs_1.default.hash(validated.password, SALT_ROUNDS);
        await user.update({ password: hashedPassword });
        await reset.update({ used: true });
        await refresh_token_model_1.default.destroy({ where: { userId: user.id } });
        return { message: 'Password reset successful' };
    }
    static async changePassword(userId, currentPassword, newPassword) {
        const validated = this.changePasswordSchema.parse({ currentPassword, newPassword });
        const user = await user_model_1.User.findByPk(userId);
        if (!user)
            throw new Error('User not found');
        const valid = await bcryptjs_1.default.compare(validated.currentPassword, user.password);
        if (!valid)
            throw new Error('Current password is incorrect');
        await user.update({ password: await bcryptjs_1.default.hash(validated.newPassword, SALT_ROUNDS) });
        return { message: 'Password changed successfully' };
    }
    // --------------------
    // VERIFY TOKEN
    // --------------------
    static verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch {
            throw new Error('Invalid or expired token');
        }
    }
}
exports.AuthService = AuthService;
// --------------------
// VALIDATION SCHEMAS
// --------------------
AuthService.userSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    role: zod_1.z.enum(['admin', 'developer', 'farmer']).default('farmer'),
    username: zod_1.z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
});
AuthService.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
AuthService.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
AuthService.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1),
    password: zod_1.z.string().min(6),
});
AuthService.refreshSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1),
});
AuthService.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(6),
    newPassword: zod_1.z.string().min(6),
});
