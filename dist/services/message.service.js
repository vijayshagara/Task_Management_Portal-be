"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const sequelize_1 = require("sequelize");
const conversation_model_1 = __importDefault(require("../models/conversation.model"));
const message_model_1 = __importDefault(require("../models/message.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const user_profile_model_1 = __importDefault(require("../models/user-profile.model"));
const social_notification_service_1 = require("./social-notification.service");
class MessageService {
    static async getOrCreateConversation(userId, otherUserId) {
        if (userId === otherUserId)
            throw new Error('Invalid conversation');
        let conversation = await conversation_model_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { participant1Id: userId, participant2Id: otherUserId },
                    { participant1Id: otherUserId, participant2Id: userId },
                ],
            },
        });
        if (!conversation) {
            conversation = await conversation_model_1.default.create({
                participant1Id: userId,
                participant2Id: otherUserId,
            });
        }
        return this.getConversationWithUsers(conversation.id, userId);
    }
    static formatConversation(conv, userId) {
        const plain = conv.get({ plain: true });
        const otherUser = plain.participant1Id === userId ? plain.participant2 : plain.participant1;
        const lastMessage = plain.messages?.[0] || null;
        return { ...plain, otherUser, lastMessage };
    }
    static async getConversationWithUsers(conversationId, userId) {
        const conversation = await conversation_model_1.default.findByPk(conversationId, {
            include: [
                {
                    model: user_model_1.default,
                    as: 'participant1',
                    attributes: ['id', 'name'],
                    include: [{ model: user_profile_model_1.default, attributes: ['username', 'profilePicture'] }],
                },
                {
                    model: user_model_1.default,
                    as: 'participant2',
                    attributes: ['id', 'name'],
                    include: [{ model: user_profile_model_1.default, attributes: ['username', 'profilePicture'] }],
                },
                {
                    model: message_model_1.default,
                    as: 'messages',
                    limit: 1,
                    order: [['createdAt', 'DESC']],
                },
            ],
        });
        if (!conversation ||
            (conversation.participant1Id !== userId && conversation.participant2Id !== userId)) {
            throw new Error('Conversation not found');
        }
        return this.formatConversation(conversation, userId);
    }
    static async getConversations(userId) {
        const conversations = await conversation_model_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [{ participant1Id: userId }, { participant2Id: userId }],
            },
            include: [
                {
                    model: user_model_1.default,
                    as: 'participant1',
                    attributes: ['id', 'name'],
                    include: [{ model: user_profile_model_1.default, attributes: ['username', 'profilePicture'] }],
                },
                {
                    model: user_model_1.default,
                    as: 'participant2',
                    attributes: ['id', 'name'],
                    include: [{ model: user_profile_model_1.default, attributes: ['username', 'profilePicture'] }],
                },
                {
                    model: message_model_1.default,
                    as: 'messages',
                    limit: 1,
                    order: [['createdAt', 'DESC']],
                },
            ],
            order: [['lastMessageAt', 'DESC NULLS LAST'], ['updatedAt', 'DESC']],
        });
        return conversations.map((conv) => this.formatConversation(conv, userId));
    }
    static async getMessages(userId, conversationId, page = 1, limit = 30) {
        const conversation = await conversation_model_1.default.findByPk(conversationId);
        if (!conversation ||
            (conversation.participant1Id !== userId && conversation.participant2Id !== userId)) {
            throw new Error('Conversation not found');
        }
        const offset = (page - 1) * limit;
        const { rows, count } = await message_model_1.default.findAndCountAll({
            where: { conversationId },
            include: [
                {
                    model: user_model_1.default,
                    as: 'sender',
                    attributes: ['id', 'name'],
                    include: [{ model: user_profile_model_1.default, attributes: ['username', 'profilePicture'] }],
                },
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });
        await message_model_1.default.update({ readAt: new Date() }, {
            where: {
                conversationId,
                readAt: null,
                senderId: { [sequelize_1.Op.ne]: userId },
            },
        });
        return {
            items: rows.reverse(),
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
        };
    }
    static async sendMessage(senderId, conversationId, data) {
        const conversation = await conversation_model_1.default.findByPk(conversationId);
        if (!conversation ||
            (conversation.participant1Id !== senderId && conversation.participant2Id !== senderId)) {
            throw new Error('Conversation not found');
        }
        const message = await message_model_1.default.create({
            conversationId,
            senderId,
            content: data.content ?? null,
            imageFileId: data.imageFileId ?? null,
            sharedPostId: data.sharedPostId ?? null,
        });
        await conversation.update({ lastMessageAt: new Date() });
        const recipientId = conversation.participant1Id === senderId
            ? conversation.participant2Id
            : conversation.participant1Id;
        await social_notification_service_1.SocialNotificationService.create({
            userId: recipientId,
            actorId: senderId,
            type: 'message',
            entityType: 'conversation',
            entityId: conversationId,
            message: 'sent you a message',
        });
        return message_model_1.default.findByPk(message.id, {
            include: [
                {
                    model: user_model_1.default,
                    as: 'sender',
                    attributes: ['id', 'name'],
                    include: [{ model: user_profile_model_1.default, attributes: ['username', 'profilePicture'] }],
                },
            ],
        });
    }
}
exports.MessageService = MessageService;
exports.default = MessageService;
