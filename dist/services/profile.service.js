"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const user_model_1 = __importDefault(require("../models/user.model"));
const user_profile_model_1 = __importDefault(require("../models/user-profile.model"));
const user_settings_model_1 = __importDefault(require("../models/user-settings.model"));
const follow_model_1 = __importDefault(require("../models/follow.model"));
const post_model_1 = __importDefault(require("../models/post.model"));
const marketplace_listing_model_1 = __importDefault(require("../models/marketplace-listing.model"));
const cow_model_1 = __importDefault(require("../models/cow.model"));
const block_model_1 = __importDefault(require("../models/block.model"));
const social_media_service_1 = require("./social-media.service");
const updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    username: zod_1.z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
    bio: zod_1.z.string().max(500).optional(),
    farmName: zod_1.z.string().max(100).optional(),
    location: zod_1.z.string().max(100).optional(),
    contactPhone: zod_1.z.string().max(20).optional(),
    contactEmail: zod_1.z.string().email().optional().nullable(),
    isPrivate: zod_1.z.boolean().optional(),
});
class ProfileService {
    static async getProfile(userId, viewerId) {
        const user = await user_model_1.default.findByPk(userId, {
            attributes: ['id', 'name', 'email', 'role', 'createdAt'],
            include: [{ model: user_profile_model_1.default }],
        });
        if (!user)
            throw new Error('User not found');
        const profile = user.profile;
        const isOwner = viewerId === userId;
        if (profile?.isPrivate && !isOwner && viewerId) {
            const isFollowing = await follow_model_1.default.findOne({
                where: { followerId: viewerId, followingId: userId },
            });
            if (!isFollowing) {
                return {
                    id: user.id,
                    name: user.name,
                    profile: {
                        username: profile.username,
                        isPrivate: true,
                        isVerified: profile.isVerified,
                    },
                    stats: await this.getStats(userId, viewerId),
                    isFollowing: false,
                    isPrivate: true,
                };
            }
        }
        const settings = await user_settings_model_1.default.findByPk(userId);
        const stats = await this.getStats(userId, viewerId);
        return {
            id: user.id,
            name: user.name,
            email: isOwner || settings?.showEmail ? user.email : undefined,
            role: user.role,
            profile: {
                username: profile?.username,
                bio: profile?.bio,
                farmName: profile?.farmName,
                location: profile?.location,
                contactPhone: isOwner || settings?.showPhone ? profile?.contactPhone : undefined,
                contactEmail: isOwner || settings?.showEmail ? profile?.contactEmail : undefined,
                profilePicture: profile?.profilePicture,
                coverPhoto: profile?.coverPhoto,
                isPrivate: profile?.isPrivate ?? false,
                isVerified: profile?.isVerified ?? false,
            },
            stats,
            isFollowing: viewerId
                ? !!(await follow_model_1.default.findOne({ where: { followerId: viewerId, followingId: userId } }))
                : false,
            isOwner,
        };
    }
    static async getStats(userId, viewerId) {
        const [postsCount, followersCount, followingCount, listingsCount, cowsCount] = await Promise.all([
            post_model_1.default.count({ where: { authorId: userId } }),
            follow_model_1.default.count({ where: { followingId: userId } }),
            follow_model_1.default.count({ where: { followerId: userId } }),
            marketplace_listing_model_1.default.count({ where: { sellerId: userId, status: 'active' } }),
            cow_model_1.default.count(),
        ]);
        return { postsCount, followersCount, followingCount, listingsCount, cowsCount };
    }
    static async updateProfile(userId, data) {
        const validated = updateProfileSchema.parse(data);
        const user = await user_model_1.default.findByPk(userId);
        if (!user)
            throw new Error('User not found');
        if (validated.name) {
            await user.update({ name: validated.name });
        }
        const [profile] = await user_profile_model_1.default.findOrCreate({
            where: { userId },
            defaults: { userId, username: `user_${userId.slice(0, 8)}` },
        });
        if (validated.username && validated.username !== profile.username) {
            const exists = await user_profile_model_1.default.findOne({
                where: { username: validated.username, userId: { [sequelize_1.Op.ne]: userId } },
            });
            if (exists)
                throw new Error('Username already taken');
        }
        await profile.update({
            username: validated.username ?? profile.username,
            bio: validated.bio ?? profile.bio,
            farmName: validated.farmName ?? profile.farmName,
            location: validated.location ?? profile.location,
            contactPhone: validated.contactPhone ?? profile.contactPhone,
            contactEmail: validated.contactEmail ?? profile.contactEmail,
            isPrivate: validated.isPrivate ?? profile.isPrivate,
        });
        return this.getProfile(userId, userId);
    }
    static async uploadProfilePicture(userId, file) {
        const profile = await user_profile_model_1.default.findByPk(userId);
        if (!profile)
            throw new Error('Profile not found');
        const { fileId } = await social_media_service_1.SocialMediaService.upload(file, `profile-${userId}`);
        if (profile.profilePicture) {
            await social_media_service_1.SocialMediaService.deleteByFileId(profile.profilePicture);
        }
        await profile.update({ profilePicture: fileId });
        return { profilePicture: fileId };
    }
    static async uploadCoverPhoto(userId, file) {
        const profile = await user_profile_model_1.default.findByPk(userId);
        if (!profile)
            throw new Error('Profile not found');
        const { fileId } = await social_media_service_1.SocialMediaService.upload(file, `cover-${userId}`);
        if (profile.coverPhoto) {
            await social_media_service_1.SocialMediaService.deleteByFileId(profile.coverPhoto);
        }
        await profile.update({ coverPhoto: fileId });
        return { coverPhoto: fileId };
    }
    static async getSuggestedUsers(userId, limit = 10) {
        const following = await follow_model_1.default.findAll({
            where: { followerId: userId },
            attributes: ['followingId'],
        });
        const blocked = await block_model_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [{ blockerId: userId }, { blockedId: userId }],
            },
        });
        const excludeIds = new Set([userId]);
        following.forEach((f) => excludeIds.add(f.followingId));
        blocked.forEach((b) => {
            excludeIds.add(b.blockerId);
            excludeIds.add(b.blockedId);
        });
        const users = await user_model_1.default.findAll({
            where: { id: { [sequelize_1.Op.notIn]: [...excludeIds] } },
            attributes: ['id', 'name'],
            include: [{ model: user_profile_model_1.default, attributes: ['username', 'farmName', 'profilePicture', 'isVerified'] }],
            limit,
            order: [['createdAt', 'DESC']],
        });
        return users.map((u) => ({
            id: u.id,
            name: u.name,
            profile: u.profile,
        }));
    }
}
exports.ProfileService = ProfileService;
exports.default = ProfileService;
