"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileController = void 0;
const auth_interface_1 = require("../interfaces/auth.interface");
const profile_service_1 = require("../services/profile.service");
class ProfileController {
    static async getMe(req, res) {
        try {
            const userId = (0, auth_interface_1.getUserId)(req);
            const profile = await profile_service_1.ProfileService.getProfile(userId, userId);
            res.json(profile);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getProfile(req, res) {
        try {
            const profile = await profile_service_1.ProfileService.getProfile(req.params.userId, req.user?.id);
            res.json(profile);
        }
        catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
    static async updateProfile(req, res) {
        try {
            const profile = await profile_service_1.ProfileService.updateProfile((0, auth_interface_1.getUserId)(req), req.body);
            res.json(profile);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async uploadProfilePicture(req, res) {
        try {
            if (!req.file) {
                res.status(400).json({ message: 'No file uploaded' });
                return;
            }
            const result = await profile_service_1.ProfileService.uploadProfilePicture((0, auth_interface_1.getUserId)(req), req.file);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async uploadCoverPhoto(req, res) {
        try {
            if (!req.file) {
                res.status(400).json({ message: 'No file uploaded' });
                return;
            }
            const result = await profile_service_1.ProfileService.uploadCoverPhoto((0, auth_interface_1.getUserId)(req), req.file);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getSuggested(req, res) {
        try {
            const users = await profile_service_1.ProfileService.getSuggestedUsers((0, auth_interface_1.getUserId)(req));
            res.json(users);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}
exports.ProfileController = ProfileController;
exports.default = ProfileController;
