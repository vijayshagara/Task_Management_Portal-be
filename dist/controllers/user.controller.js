"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const auth_service_1 = require("../services/auth.service");
const auth_interface_1 = require("../interfaces/auth.interface");
const bulk_1 = require("../utils/bulk");
class UserController {
    static async getAllUsers(req, res) {
        try {
            const users = await user_service_1.UserService.getAllUsers();
            res.json(users);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    static async getDevelopers(req, res) {
        try {
            const developers = await user_service_1.UserService.getDevelopers();
            res.json(developers);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    static async getUserById(req, res) {
        try {
            const user = await user_service_1.UserService.getUserById(req.params.id);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            res.json(user);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    static async createUser(req, res) {
        try {
            const user = await auth_service_1.AuthService.createUserAsAdmin(req.body);
            res.status(201).json(user);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async updateUser(req, res) {
        try {
            const user = await user_service_1.UserService.updateUser(req.params.id, req.body);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            res.json(user);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async deleteUser(req, res) {
        try {
            const success = await user_service_1.UserService.deleteUser(req.params.id);
            if (!success) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            res.json({ message: 'User deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    static async bulkDeleteUsers(req, res) {
        try {
            const ids = (0, bulk_1.parseBulkIds)(req.body);
            const result = await user_service_1.UserService.bulkDeleteUsers(ids, (0, auth_interface_1.getUserId)(req));
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}
exports.UserController = UserController;
