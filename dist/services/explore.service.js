"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExploreService = void 0;
const sequelize_1 = require("sequelize");
const post_model_1 = __importDefault(require("../models/post.model"));
const post_like_model_1 = __importDefault(require("../models/post-like.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const user_profile_model_1 = __importDefault(require("../models/user-profile.model"));
const marketplace_listing_model_1 = __importDefault(require("../models/marketplace-listing.model"));
const profile_service_1 = require("./profile.service");
class ExploreService {
    static async getExplore(userId) {
        const [popularPosts, recentListings, suggestedUsers] = await Promise.all([
            post_model_1.default.findAll({
                include: [
                    {
                        model: user_model_1.default,
                        as: 'author',
                        attributes: ['id', 'name'],
                        include: [{ model: user_profile_model_1.default, attributes: ['username', 'profilePicture'] }],
                    },
                ],
                order: [['createdAt', 'DESC']],
                limit: 10,
            }),
            marketplace_listing_model_1.default.findAll({
                where: { status: 'active' },
                order: [['createdAt', 'DESC']],
                limit: 8,
            }),
            profile_service_1.ProfileService.getSuggestedUsers(userId, 8),
        ]);
        const postIds = popularPosts.map((p) => p.id);
        const likeCounts = await post_like_model_1.default.findAll({
            where: { postId: { [sequelize_1.Op.in]: postIds } },
            attributes: ['postId'],
        });
        const trendingHashtags = await post_model_1.default.findAll({
            attributes: ['hashtags'],
            limit: 50,
            order: [['createdAt', 'DESC']],
        });
        const tagMap = {};
        trendingHashtags.forEach((post) => {
            post.hashtags.forEach((tag) => {
                tagMap[tag] = (tagMap[tag] || 0) + 1;
            });
        });
        const hashtags = Object.entries(tagMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([tag, count]) => ({ tag, count }));
        return {
            popularPosts: popularPosts.map((post) => ({
                ...post.get({ plain: true }),
                likesCount: likeCounts.filter((l) => l.postId === post.id).length,
            })),
            recentListings,
            suggestedUsers,
            trendingHashtags: hashtags,
            trendingFarms: suggestedUsers.filter((u) => u.profile?.farmName),
        };
    }
}
exports.ExploreService = ExploreService;
exports.default = ExploreService;
