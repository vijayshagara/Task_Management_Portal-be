"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialNotificationService = void 0;
const notification_model_1 = __importDefault(require("../models/notification.model"));
class SocialNotificationService {
    static async create(input) {
        if (input.userId === input.actorId)
            return null;
        return notification_model_1.default.create({
            userId: input.userId,
            actorId: input.actorId ?? null,
            type: input.type,
            entityType: input.entityType ?? null,
            entityId: input.entityId ?? null,
            message: input.message,
        });
    }
    static async getForUser(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const { rows, count } = await notification_model_1.default.findAndCountAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });
        return {
            items: rows,
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
        };
    }
    static async markRead(userId, notificationId) {
        if (notificationId) {
            await notification_model_1.default.update({ isRead: true }, { where: { id: notificationId, userId } });
        }
        else {
            await notification_model_1.default.update({ isRead: true }, { where: { userId, isRead: false } });
        }
        return { success: true };
    }
    static async getUnreadCount(userId) {
        const count = await notification_model_1.default.count({ where: { userId, isRead: false } });
        return { count };
    }
}
exports.SocialNotificationService = SocialNotificationService;
exports.default = SocialNotificationService;
