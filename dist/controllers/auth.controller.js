"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const auth_interface_1 = require("../interfaces/auth.interface");
class AuthController {
    static async register(req, res) {
        try {
            const user = await auth_service_1.AuthService.register(req.body);
            res.status(201).json(user);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async login(req, res) {
        try {
            const result = await auth_service_1.AuthService.login(req.body);
            res.json({ token: result.token, refreshToken: result.refreshToken, user: result.user });
        }
        catch (error) {
            res.status(401).json({ message: error.message });
        }
    }
    static async refresh(req, res) {
        try {
            const result = await auth_service_1.AuthService.refreshAccessToken(req.body.refreshToken);
            res.json(result);
        }
        catch (error) {
            res.status(401).json({ message: error.message });
        }
    }
    static async forgotPassword(req, res) {
        try {
            const result = await auth_service_1.AuthService.forgotPassword(req.body.email);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async resetPassword(req, res) {
        try {
            const result = await auth_service_1.AuthService.resetPassword(req.body.token, req.body.password);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async changePassword(req, res) {
        try {
            const result = await auth_service_1.AuthService.changePassword((0, auth_interface_1.getUserId)(req), req.body.currentPassword, req.body.newPassword);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}
exports.AuthController = AuthController;
