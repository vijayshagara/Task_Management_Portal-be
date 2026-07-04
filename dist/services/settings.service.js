"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const block_model_1 = __importDefault(require("../models/block.model"));
const user_settings_model_1 = __importDefault(require("../models/user-settings.model"));
class SettingsService {
    static async getSettings(userId) {
        const [settings] = await user_settings_model_1.default.findOrCreate({
            where: { userId },
            defaults: { userId },
        });
        return settings;
    }
    static async updateSettings(userId, data) {
        const settings = await this.getSettings(userId);
        await settings.update(data);
        return settings;
    }
    static async blockUser(blockerId, blockedId) {
        if (blockerId === blockedId)
            throw new Error('Invalid action');
        await block_model_1.default.findOrCreate({
            where: { blockerId, blockedId },
            defaults: { blockerId, blockedId },
        });
        return { blocked: true };
    }
    static async unblockUser(blockerId, blockedId) {
        await block_model_1.default.destroy({ where: { blockerId, blockedId } });
        return { blocked: false };
    }
}
exports.SettingsService = SettingsService;
exports.default = SettingsService;
