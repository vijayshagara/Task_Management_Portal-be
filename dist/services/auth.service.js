"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const user_model_1 = require("../models/user.model");
const user_profile_model_1 = __importDefault(require("../models/user-profile.model"));
const user_settings_model_1 = __importDefault(require("../models/user-settings.model"));
// --------------------
// ENV VALIDATION
// --------------------
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';
const SALT_ROUNDS = 10;
// --------------------
// AUTH SERVICE
// --------------------
class AuthService {
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
        const signOptions = {
            expiresIn: JWT_EXPIRES_IN,
        };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, signOptions);
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
            user: { ...safeUser, profile: profile?.get({ plain: true }) },
        };
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
