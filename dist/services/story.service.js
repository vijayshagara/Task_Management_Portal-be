"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryService = void 0;
const sequelize_1 = require("sequelize");
const story_model_1 = __importDefault(require("../models/story.model"));
const story_view_model_1 = __importDefault(require("../models/story-view.model"));
const story_reaction_model_1 = __importDefault(require("../models/story-reaction.model"));
const follow_model_1 = __importDefault(require("../models/follow.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const user_profile_model_1 = __importDefault(require("../models/user-profile.model"));
const social_media_service_1 = require("./social-media.service");
const social_notification_service_1 = require("./social-notification.service");
class StoryService {
    static async createStory(userId, file) {
        const uploaded = await social_media_service_1.SocialMediaService.upload(file, `story-${userId}`);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        return story_model_1.default.create({
            userId,
            fileId: uploaded.fileId,
            mediaType: uploaded.mediaType,
            expiresAt,
        });
    }
    static async getFeedStories(userId) {
        const following = await follow_model_1.default.findAll({
            where: { followerId: userId },
            attributes: ['followingId'],
        });
        const userIds = [userId, ...following.map((f) => f.followingId)];
        const stories = await story_model_1.default.findAll({
            where: {
                userId: { [sequelize_1.Op.in]: userIds },
                expiresAt: { [sequelize_1.Op.gt]: new Date() },
            },
            include: [
                {
                    model: user_model_1.default,
                    attributes: ['id', 'name'],
                    include: [{ model: user_profile_model_1.default, attributes: ['username', 'profilePicture'] }],
                },
            ],
            order: [['createdAt', 'ASC']],
        });
        const grouped = {};
        for (const story of stories) {
            if (!grouped[story.userId]) {
                grouped[story.userId] = {
                    user: story.user,
                    stories: [],
                };
            }
            grouped[story.userId].stories.push(story);
        }
        return Object.values(grouped);
    }
    static async viewStory(viewerId, storyId) {
        const story = await story_model_1.default.findByPk(storyId);
        if (!story)
            throw new Error('Story not found');
        await story_view_model_1.default.findOrCreate({
            where: { storyId, viewerId },
            defaults: { storyId, viewerId },
        });
        return { viewed: true };
    }
    static async getStoryViews(storyId, userId) {
        const story = await story_model_1.default.findByPk(storyId);
        if (!story || story.userId !== userId)
            throw new Error('Story not found');
        return story_view_model_1.default.findAll({
            where: { storyId },
            include: [
                {
                    model: user_model_1.default,
                    as: 'viewer',
                    attributes: ['id', 'name'],
                    include: [{ model: user_profile_model_1.default, attributes: ['username', 'profilePicture'] }],
                },
            ],
            order: [['createdAt', 'DESC']],
        });
    }
    static async reactToStory(userId, storyId, reactionType = 'like') {
        const story = await story_model_1.default.findByPk(storyId);
        if (!story)
            throw new Error('Story not found');
        await story_reaction_model_1.default.findOrCreate({
            where: { storyId, userId },
            defaults: { storyId, userId, reactionType },
        });
        await social_notification_service_1.SocialNotificationService.create({
            userId: story.userId,
            actorId: userId,
            type: 'story_reply',
            entityType: 'story',
            entityId: storyId,
            message: 'reacted to your story',
        });
        return { reacted: true };
    }
}
exports.StoryService = StoryService;
exports.default = StoryService;
