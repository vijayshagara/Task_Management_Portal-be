"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowService = void 0;
const sequelize_1 = require("sequelize");
const follow_model_1 = __importDefault(require("../models/follow.model"));
const follow_request_model_1 = __importStar(require("../models/follow-request.model"));
const user_profile_model_1 = __importDefault(require("../models/user-profile.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const block_model_1 = __importDefault(require("../models/block.model"));
const social_notification_service_1 = require("./social-notification.service");
class FollowService {
    static async isBlocked(userA, userB) {
        const block = await block_model_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { blockerId: userA, blockedId: userB },
                    { blockerId: userB, blockedId: userA },
                ],
            },
        });
        return !!block;
    }
    static async follow(followerId, followingId) {
        if (followerId === followingId)
            throw new Error('Cannot follow yourself');
        if (await this.isBlocked(followerId, followingId)) {
            throw new Error('Action not allowed');
        }
        const existing = await follow_model_1.default.findOne({ where: { followerId, followingId } });
        if (existing)
            throw new Error('Already following');
        const profile = await user_profile_model_1.default.findByPk(followingId);
        if (!profile)
            throw new Error('User not found');
        if (profile.isPrivate) {
            const pending = await follow_request_model_1.default.findOne({
                where: { requesterId: followerId, targetId: followingId, status: follow_request_model_1.FollowRequestStatus.PENDING },
            });
            if (pending)
                throw new Error('Follow request already sent');
            const request = await follow_request_model_1.default.create({
                requesterId: followerId,
                targetId: followingId,
            });
            await social_notification_service_1.SocialNotificationService.create({
                userId: followingId,
                actorId: followerId,
                type: 'follow_request',
                entityType: 'follow_request',
                entityId: request.id,
                message: 'sent you a follow request',
            });
            return { status: 'requested' };
        }
        await follow_model_1.default.create({ followerId, followingId });
        await social_notification_service_1.SocialNotificationService.create({
            userId: followingId,
            actorId: followerId,
            type: 'follow',
            entityType: 'user',
            entityId: followerId,
            message: 'started following you',
        });
        return { status: 'following' };
    }
    static async unfollow(followerId, followingId) {
        await follow_model_1.default.destroy({ where: { followerId, followingId } });
        await follow_request_model_1.default.destroy({
            where: { requesterId: followerId, targetId: followingId },
        });
        return { status: 'unfollowed' };
    }
    static async respondToRequest(userId, requestId, action) {
        const request = await follow_request_model_1.default.findByPk(requestId);
        if (!request || request.targetId !== userId) {
            throw new Error('Request not found');
        }
        if (action === 'accept') {
            await request.update({ status: follow_request_model_1.FollowRequestStatus.ACCEPTED });
            await follow_model_1.default.findOrCreate({
                where: {
                    followerId: request.requesterId,
                    followingId: request.targetId,
                },
                defaults: {
                    followerId: request.requesterId,
                    followingId: request.targetId,
                },
            });
            await social_notification_service_1.SocialNotificationService.create({
                userId: request.requesterId,
                actorId: userId,
                type: 'follow',
                entityType: 'user',
                entityId: userId,
                message: 'accepted your follow request',
            });
        }
        else {
            await request.update({ status: follow_request_model_1.FollowRequestStatus.REJECTED });
        }
        return request;
    }
    static async getFollowers(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const { rows, count } = await follow_model_1.default.findAndCountAll({
            where: { followingId: userId },
            include: [
                {
                    model: user_model_1.default,
                    as: 'follower',
                    attributes: ['id', 'name'],
                    include: [{ model: user_profile_model_1.default, attributes: ['username', 'profilePicture', 'farmName'] }],
                },
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']],
        });
        return {
            items: rows.map((r) => r.follower),
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
        };
    }
    static async getFollowing(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const { rows, count } = await follow_model_1.default.findAndCountAll({
            where: { followerId: userId },
            include: [
                {
                    model: user_model_1.default,
                    as: 'following',
                    attributes: ['id', 'name'],
                    include: [{ model: user_profile_model_1.default, attributes: ['username', 'profilePicture', 'farmName'] }],
                },
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']],
        });
        return {
            items: rows.map((r) => r.following),
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
        };
    }
    static async getPendingRequests(userId) {
        return follow_request_model_1.default.findAll({
            where: { targetId: userId, status: follow_request_model_1.FollowRequestStatus.PENDING },
            include: [
                {
                    model: user_model_1.default,
                    as: 'requester',
                    attributes: ['id', 'name'],
                    include: [{ model: user_profile_model_1.default, attributes: ['username', 'profilePicture'] }],
                },
            ],
            order: [['createdAt', 'DESC']],
        });
    }
}
exports.FollowService = FollowService;
exports.default = FollowService;
