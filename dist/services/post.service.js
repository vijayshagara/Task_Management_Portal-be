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
exports.PostService = void 0;
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const post_model_1 = __importDefault(require("../models/post.model"));
const post_media_model_1 = __importDefault(require("../models/post-media.model"));
const post_like_model_1 = __importDefault(require("../models/post-like.model"));
const comment_model_1 = __importDefault(require("../models/comment.model"));
const follow_model_1 = __importDefault(require("../models/follow.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const user_profile_model_1 = __importDefault(require("../models/user-profile.model"));
const cow_model_1 = __importDefault(require("../models/cow.model"));
const saved_item_model_1 = __importStar(require("../models/saved-item.model"));
const social_media_service_1 = require("./social-media.service");
const social_notification_service_1 = require("./social-notification.service");
const createPostSchema = zod_1.z.object({
    content: zod_1.z.string().max(2200).optional(),
    location: zod_1.z.string().max(100).optional(),
    cowId: zod_1.z.string().uuid().optional(),
    hashtags: zod_1.z.array(zod_1.z.string()).optional(),
});
const commentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1).max(1000),
    parentId: zod_1.z.string().uuid().optional(),
    mentions: zod_1.z.array(zod_1.z.string()).optional(),
});
function extractHashtags(content) {
    if (!content)
        return [];
    const matches = content.match(/#[\w]+/g) || [];
    return [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))];
}
class PostService {
    static async formatPost(post, viewerId) {
        const plain = post.get({ plain: true });
        const likesCount = await post_like_model_1.default.count({ where: { postId: post.id } });
        const commentsCount = await comment_model_1.default.count({ where: { postId: post.id } });
        const likedByMe = viewerId
            ? !!(await post_like_model_1.default.findOne({ where: { postId: post.id, userId: viewerId } }))
            : false;
        const savedByMe = viewerId
            ? !!(await saved_item_model_1.default.findOne({
                where: { userId: viewerId, itemType: saved_item_model_1.SavedItemType.POST, itemId: post.id },
            }))
            : false;
        return {
            ...plain,
            likesCount,
            commentsCount,
            likedByMe,
            savedByMe,
        };
    }
    static async createPost(authorId, data, files = []) {
        const validated = createPostSchema.parse(data);
        const hashtags = [
            ...new Set([...(validated.hashtags || []), ...extractHashtags(validated.content)]),
        ];
        const post = await post_model_1.default.create({
            authorId,
            content: validated.content ?? null,
            location: validated.location ?? null,
            cowId: validated.cowId ?? null,
            hashtags,
        });
        for (let i = 0; i < files.length; i++) {
            const uploaded = await social_media_service_1.SocialMediaService.upload(files[i], `post-${post.id}`);
            await post_media_model_1.default.create({
                postId: post.id,
                fileId: uploaded.fileId,
                mediaType: uploaded.mediaType,
                sortOrder: i,
            });
        }
        return this.getPostById(post.id, authorId);
    }
    static async getPostById(postId, viewerId) {
        const post = await post_model_1.default.findByPk(postId, {
            include: [
                {
                    model: user_model_1.default,
                    as: 'author',
                    attributes: ['id', 'name'],
                    include: [{ model: user_profile_model_1.default, attributes: ['username', 'profilePicture', 'farmName'] }],
                },
                { model: post_media_model_1.default, as: 'media' },
                { model: cow_model_1.default, as: 'cow', attributes: ['id', 'name', 'breed', 'image'] },
            ],
        });
        if (!post)
            throw new Error('Post not found');
        return this.formatPost(post, viewerId);
    }
    static async getFeed(userId, page = 1, limit = 10) {
        const following = await follow_model_1.default.findAll({
            where: { followerId: userId },
            attributes: ['followingId'],
        });
        const authorIds = [userId, ...following.map((f) => f.followingId)];
        const offset = (page - 1) * limit;
        const { rows, count } = await post_model_1.default.findAndCountAll({
            where: { authorId: { [sequelize_1.Op.in]: authorIds } },
            include: [
                {
                    model: user_model_1.default,
                    as: 'author',
                    attributes: ['id', 'name'],
                    include: [{ model: user_profile_model_1.default, attributes: ['username', 'profilePicture'] }],
                },
                { model: post_media_model_1.default, as: 'media' },
                { model: cow_model_1.default, as: 'cow', attributes: ['id', 'name', 'breed'] },
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });
        const items = await Promise.all(rows.map((post) => this.formatPost(post, userId)));
        return {
            items,
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
        };
    }
    static async getUserPosts(userId, viewerId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const { rows, count } = await post_model_1.default.findAndCountAll({
            where: { authorId: userId },
            include: [
                {
                    model: user_model_1.default,
                    as: 'author',
                    attributes: ['id', 'name'],
                    include: [{ model: user_profile_model_1.default, attributes: ['username', 'profilePicture'] }],
                },
                { model: post_media_model_1.default, as: 'media' },
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });
        const items = await Promise.all(rows.map((post) => this.formatPost(post, viewerId)));
        return {
            items,
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
        };
    }
    static async likePost(userId, postId) {
        const post = await post_model_1.default.findByPk(postId);
        if (!post)
            throw new Error('Post not found');
        await post_like_model_1.default.findOrCreate({
            where: { postId, userId },
            defaults: { postId, userId },
        });
        await social_notification_service_1.SocialNotificationService.create({
            userId: post.authorId,
            actorId: userId,
            type: 'like',
            entityType: 'post',
            entityId: postId,
            message: 'liked your post',
        });
        return { liked: true };
    }
    static async unlikePost(userId, postId) {
        await post_like_model_1.default.destroy({ where: { postId, userId } });
        return { liked: false };
    }
    static async getPostLikes(postId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const { rows, count } = await post_like_model_1.default.findAndCountAll({
            where: { postId },
            include: [
                {
                    model: user_model_1.default,
                    attributes: ['id', 'name'],
                    include: [{ model: user_profile_model_1.default, attributes: ['username', 'profilePicture'] }],
                },
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']],
        });
        return {
            items: rows.map((like) => like.user),
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
        };
    }
    static async addComment(userId, postId, data) {
        const validated = commentSchema.parse(data);
        const post = await post_model_1.default.findByPk(postId);
        if (!post)
            throw new Error('Post not found');
        const comment = await comment_model_1.default.create({
            postId,
            authorId: userId,
            content: validated.content,
            parentId: validated.parentId ?? null,
            mentions: validated.mentions ?? [],
        });
        await social_notification_service_1.SocialNotificationService.create({
            userId: post.authorId,
            actorId: userId,
            type: validated.parentId ? 'reply' : 'comment',
            entityType: 'post',
            entityId: postId,
            message: validated.parentId ? 'replied to a comment' : 'commented on your post',
        });
        return comment_model_1.default.findByPk(comment.id, {
            include: [
                {
                    model: user_model_1.default,
                    as: 'author',
                    attributes: ['id', 'name'],
                    include: [{ model: user_profile_model_1.default, attributes: ['username', 'profilePicture'] }],
                },
            ],
        });
    }
    static async getComments(postId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const { rows, count } = await comment_model_1.default.findAndCountAll({
            where: { postId, parentId: null },
            include: [
                {
                    model: user_model_1.default,
                    as: 'author',
                    attributes: ['id', 'name'],
                    include: [{ model: user_profile_model_1.default, attributes: ['username', 'profilePicture'] }],
                },
                {
                    model: comment_model_1.default,
                    as: 'replies',
                    include: [
                        {
                            model: user_model_1.default,
                            as: 'author',
                            attributes: ['id', 'name'],
                            include: [{ model: user_profile_model_1.default, attributes: ['username', 'profilePicture'] }],
                        },
                    ],
                },
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']],
        });
        return {
            items: rows,
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
        };
    }
    static async updateComment(userId, commentId, content) {
        const comment = await comment_model_1.default.findByPk(commentId);
        if (!comment || comment.authorId !== userId) {
            throw new Error('Comment not found');
        }
        await comment.update({ content });
        return comment;
    }
    static async deleteComment(userId, commentId) {
        const comment = await comment_model_1.default.findByPk(commentId);
        if (!comment || comment.authorId !== userId) {
            throw new Error('Comment not found');
        }
        await comment_model_1.default.destroy({ where: { parentId: commentId } });
        await comment.destroy();
        return { deleted: true };
    }
    static async savePost(userId, postId, collectionName) {
        await saved_item_model_1.default.findOrCreate({
            where: { userId, itemType: saved_item_model_1.SavedItemType.POST, itemId: postId },
            defaults: { userId, itemType: saved_item_model_1.SavedItemType.POST, itemId: postId, collectionName },
        });
        return { saved: true };
    }
    static async unsavePost(userId, postId) {
        await saved_item_model_1.default.destroy({
            where: { userId, itemType: saved_item_model_1.SavedItemType.POST, itemId: postId },
        });
        return { saved: false };
    }
    static async getSavedPosts(userId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const { rows, count } = await saved_item_model_1.default.findAndCountAll({
            where: { userId, itemType: saved_item_model_1.SavedItemType.POST },
            limit,
            offset,
            order: [['createdAt', 'DESC']],
        });
        const postIds = rows.map((item) => item.itemId);
        const posts = await post_model_1.default.findAll({
            where: { id: { [sequelize_1.Op.in]: postIds } },
            include: [
                { model: user_model_1.default, as: 'author', attributes: ['id', 'name'], include: [user_profile_model_1.default] },
                { model: post_media_model_1.default, as: 'media' },
            ],
        });
        const items = await Promise.all(posts.map((post) => this.formatPost(post, userId)));
        return {
            items,
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
        };
    }
}
exports.PostService = PostService;
exports.default = PostService;
