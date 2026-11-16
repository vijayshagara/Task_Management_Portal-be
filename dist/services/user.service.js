"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const sequelize_1 = require("sequelize");
const user_model_1 = require("../models/user.model");
const user_model_2 = require("../models/user.model");
const zod_1 = require("zod");
const database_1 = __importDefault(require("../config/database"));
const user_settings_model_1 = __importDefault(require("../models/user-settings.model"));
const user_profile_model_1 = __importDefault(require("../models/user-profile.model"));
const refresh_token_model_1 = __importDefault(require("../models/refresh-token.model"));
const password_reset_model_1 = __importDefault(require("../models/password-reset.model"));
const push_token_model_1 = __importDefault(require("../models/push-token.model"));
const device_api_key_model_1 = __importDefault(require("../models/device-api-key.model"));
const farm_diary_model_1 = __importDefault(require("../models/farm-diary.model"));
const milk_record_model_1 = __importDefault(require("../models/milk-record.model"));
const milk_collection_model_1 = __importDefault(require("../models/milk-collection.model"));
const vaccination_model_1 = __importDefault(require("../models/vaccination.model"));
const pregnancy_model_1 = __importDefault(require("../models/pregnancy.model"));
const knowledge_article_model_1 = __importDefault(require("../models/knowledge-article.model"));
const task_model_1 = __importDefault(require("../models/task.model"));
const cow_model_1 = __importDefault(require("../models/cow.model"));
const post_model_1 = __importDefault(require("../models/post.model"));
const post_media_model_1 = __importDefault(require("../models/post-media.model"));
const post_like_model_1 = __importDefault(require("../models/post-like.model"));
const comment_model_1 = __importDefault(require("../models/comment.model"));
const follow_model_1 = __importDefault(require("../models/follow.model"));
const follow_request_model_1 = __importDefault(require("../models/follow-request.model"));
const block_model_1 = __importDefault(require("../models/block.model"));
const saved_item_model_1 = __importDefault(require("../models/saved-item.model"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const message_model_1 = __importDefault(require("../models/message.model"));
const conversation_model_1 = __importDefault(require("../models/conversation.model"));
const marketplace_listing_model_1 = __importDefault(require("../models/marketplace-listing.model"));
const story_model_1 = __importDefault(require("../models/story.model"));
const story_view_model_1 = __importDefault(require("../models/story-view.model"));
const story_reaction_model_1 = __importDefault(require("../models/story-reaction.model"));
const SAFE_USER_ATTRIBUTES = ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'];
const SALT_ROUNDS = 10;
class UserService {
    static async getAllUsers() {
        return await user_model_1.User.findAll({
            attributes: [...SAFE_USER_ATTRIBUTES],
        });
    }
    static async getDevelopers() {
        return await user_model_1.User.findAll({
            where: { role: user_model_2.UserRole.DEVELOPER },
            attributes: [...SAFE_USER_ATTRIBUTES],
        });
    }
    static async getUserById(id) {
        return await user_model_1.User.findByPk(id, {
            attributes: [...SAFE_USER_ATTRIBUTES],
        });
    }
    static async createUser(userData) {
        const validatedData = this.userSchema.parse(userData);
        const hashedPassword = await bcryptjs_1.default.hash(validatedData.password, SALT_ROUNDS);
        const user = await user_model_1.User.create({
            name: validatedData.name,
            email: validatedData.email,
            password: hashedPassword,
            role: validatedData.role,
        });
        const safe = await this.getUserById(user.id);
        return safe;
    }
    static async updateUser(id, userData) {
        const user = await user_model_1.User.findByPk(id);
        if (!user)
            return null;
        const validatedData = this.userSchema.partial().parse(userData);
        const updates = {};
        if (validatedData.name !== undefined)
            updates.name = validatedData.name;
        if (validatedData.email !== undefined)
            updates.email = validatedData.email;
        if (validatedData.role !== undefined)
            updates.role = validatedData.role;
        if (validatedData.password !== undefined) {
            updates.password = await bcryptjs_1.default.hash(validatedData.password, SALT_ROUNDS);
        }
        await user.update(updates);
        return await this.getUserById(id);
    }
    static async cascadeDeleteUsers(ids) {
        if (!ids.length)
            return 0;
        return database_1.default.transaction(async (transaction) => {
            const posts = await post_model_1.default.findAll({
                where: { authorId: { [sequelize_1.Op.in]: ids } },
                attributes: ['id'],
                transaction,
            });
            const postIds = posts.map((p) => p.id);
            const stories = await story_model_1.default.findAll({
                where: { userId: { [sequelize_1.Op.in]: ids } },
                attributes: ['id'],
                transaction,
            });
            const storyIds = stories.map((s) => s.id);
            const conversations = await conversation_model_1.default.findAll({
                where: {
                    [sequelize_1.Op.or]: [
                        { participant1Id: { [sequelize_1.Op.in]: ids } },
                        { participant2Id: { [sequelize_1.Op.in]: ids } },
                    ],
                },
                attributes: ['id'],
                transaction,
            });
            const conversationIds = conversations.map((c) => c.id);
            if (storyIds.length) {
                await story_reaction_model_1.default.destroy({ where: { storyId: { [sequelize_1.Op.in]: storyIds } }, transaction });
                await story_view_model_1.default.destroy({ where: { storyId: { [sequelize_1.Op.in]: storyIds } }, transaction });
            }
            await story_reaction_model_1.default.destroy({ where: { userId: { [sequelize_1.Op.in]: ids } }, transaction });
            await story_view_model_1.default.destroy({ where: { viewerId: { [sequelize_1.Op.in]: ids } }, transaction });
            await story_model_1.default.destroy({ where: { userId: { [sequelize_1.Op.in]: ids } }, transaction });
            if (conversationIds.length) {
                await message_model_1.default.destroy({
                    where: { conversationId: { [sequelize_1.Op.in]: conversationIds } },
                    transaction,
                });
                await conversation_model_1.default.destroy({
                    where: { id: { [sequelize_1.Op.in]: conversationIds } },
                    transaction,
                });
            }
            await message_model_1.default.destroy({ where: { senderId: { [sequelize_1.Op.in]: ids } }, transaction });
            await notification_model_1.default.destroy({
                where: {
                    [sequelize_1.Op.or]: [{ userId: { [sequelize_1.Op.in]: ids } }, { actorId: { [sequelize_1.Op.in]: ids } }],
                },
                transaction,
            });
            await saved_item_model_1.default.destroy({ where: { userId: { [sequelize_1.Op.in]: ids } }, transaction });
            await block_model_1.default.destroy({
                where: {
                    [sequelize_1.Op.or]: [{ blockerId: { [sequelize_1.Op.in]: ids } }, { blockedId: { [sequelize_1.Op.in]: ids } }],
                },
                transaction,
            });
            await follow_model_1.default.destroy({
                where: {
                    [sequelize_1.Op.or]: [{ followerId: { [sequelize_1.Op.in]: ids } }, { followingId: { [sequelize_1.Op.in]: ids } }],
                },
                transaction,
            });
            await follow_request_model_1.default.destroy({
                where: {
                    [sequelize_1.Op.or]: [{ requesterId: { [sequelize_1.Op.in]: ids } }, { targetId: { [sequelize_1.Op.in]: ids } }],
                },
                transaction,
            });
            if (postIds.length) {
                await post_like_model_1.default.destroy({ where: { postId: { [sequelize_1.Op.in]: postIds } }, transaction });
                await comment_model_1.default.destroy({ where: { postId: { [sequelize_1.Op.in]: postIds } }, transaction });
                await post_media_model_1.default.destroy({ where: { postId: { [sequelize_1.Op.in]: postIds } }, transaction });
            }
            await post_like_model_1.default.destroy({ where: { userId: { [sequelize_1.Op.in]: ids } }, transaction });
            await comment_model_1.default.destroy({ where: { authorId: { [sequelize_1.Op.in]: ids } }, transaction });
            await post_model_1.default.destroy({ where: { authorId: { [sequelize_1.Op.in]: ids } }, transaction });
            await marketplace_listing_model_1.default.destroy({ where: { sellerId: { [sequelize_1.Op.in]: ids } }, transaction });
            await farm_diary_model_1.default.destroy({ where: { userId: { [sequelize_1.Op.in]: ids } }, transaction });
            await milk_record_model_1.default.destroy({ where: { userId: { [sequelize_1.Op.in]: ids } }, transaction });
            await milk_collection_model_1.default.destroy({ where: { userId: { [sequelize_1.Op.in]: ids } }, transaction });
            await vaccination_model_1.default.destroy({ where: { userId: { [sequelize_1.Op.in]: ids } }, transaction });
            await pregnancy_model_1.default.destroy({ where: { userId: { [sequelize_1.Op.in]: ids } }, transaction });
            await knowledge_article_model_1.default.destroy({ where: { authorId: { [sequelize_1.Op.in]: ids } }, transaction });
            await device_api_key_model_1.default.destroy({ where: { userId: { [sequelize_1.Op.in]: ids } }, transaction });
            await push_token_model_1.default.destroy({ where: { userId: { [sequelize_1.Op.in]: ids } }, transaction });
            await task_model_1.default.destroy({ where: { developerId: { [sequelize_1.Op.in]: ids } }, transaction });
            await cow_model_1.default.update({ ownerId: null }, { where: { ownerId: { [sequelize_1.Op.in]: ids } }, transaction });
            await refresh_token_model_1.default.destroy({ where: { userId: { [sequelize_1.Op.in]: ids } }, transaction });
            await password_reset_model_1.default.destroy({ where: { userId: { [sequelize_1.Op.in]: ids } }, transaction });
            await user_settings_model_1.default.destroy({ where: { userId: { [sequelize_1.Op.in]: ids } }, transaction });
            await user_profile_model_1.default.destroy({ where: { userId: { [sequelize_1.Op.in]: ids } }, transaction });
            return user_model_1.User.destroy({ where: { id: { [sequelize_1.Op.in]: ids } }, transaction });
        });
    }
    static async deleteUser(id) {
        const user = await user_model_1.User.findByPk(id);
        if (!user)
            return false;
        const count = await this.cascadeDeleteUsers([id]);
        return count > 0;
    }
    static async bulkDeleteUsers(ids, requestingUserId) {
        const filteredIds = [...new Set(ids)].filter((id) => id !== requestingUserId);
        if (!filteredIds.length)
            return { ids: [], count: 0 };
        const existing = await user_model_1.User.findAll({
            where: { id: { [sequelize_1.Op.in]: filteredIds } },
            attributes: ['id'],
        });
        const deleteIds = existing.map((u) => u.id);
        if (!deleteIds.length)
            return { ids: [], count: 0 };
        const count = await this.cascadeDeleteUsers(deleteIds);
        return { ids: deleteIds, count };
    }
}
exports.UserService = UserService;
UserService.userSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    role: zod_1.z.nativeEnum(user_model_2.UserRole),
});
