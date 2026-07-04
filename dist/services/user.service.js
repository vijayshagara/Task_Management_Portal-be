"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_model_1 = require("../models/user.model");
const user_model_2 = require("../models/user.model"); // Import the enum
const zod_1 = require("zod");
class UserService {
    static async getAllUsers() {
        return await user_model_1.User.findAll();
    }
    static async getDevelopers() {
        return await user_model_1.User.findAll({ where: { role: user_model_2.UserRole.DEVELOPER } });
    }
    static async getUserById(id) {
        return await user_model_1.User.findByPk(id);
    }
    static async createUser(userData) {
        const validatedData = this.userSchema.parse(userData);
        return await user_model_1.User.create({
            name: validatedData.name,
            email: validatedData.email,
            password: validatedData.password,
            role: validatedData.role
        });
    }
    static async updateUser(id, userData) {
        const user = await user_model_1.User.findByPk(id);
        if (!user)
            return null;
        const validatedData = this.userSchema.partial().parse(userData);
        return await user.update({
            name: validatedData.name,
            email: validatedData.email,
            password: validatedData.password,
            role: validatedData.role
        });
    }
    static async deleteUser(id) {
        const deleted = await user_model_1.User.destroy({ where: { id } });
        return deleted > 0;
    }
}
exports.UserService = UserService;
UserService.userSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    role: zod_1.z.nativeEnum(user_model_2.UserRole), // Use nativeEnum with the UserRole enum
});
