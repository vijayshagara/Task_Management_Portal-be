"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const sequelize_1 = require("sequelize");
const user_model_1 = __importDefault(require("../models/user.model"));
const user_profile_model_1 = __importDefault(require("../models/user-profile.model"));
const post_model_1 = __importDefault(require("../models/post.model"));
const marketplace_listing_model_1 = __importDefault(require("../models/marketplace-listing.model"));
const cow_model_1 = __importDefault(require("../models/cow.model"));
class SearchService {
    static async globalSearch(query, limit = 10) {
        const q = query.trim();
        if (!q) {
            return { users: [], farms: [], breeds: [], listings: [], hashtags: [], locations: [] };
        }
        const [users, listings, cows, posts] = await Promise.all([
            user_model_1.default.findAll({
                attributes: ['id', 'name'],
                include: [
                    {
                        model: user_profile_model_1.default,
                        where: {
                            [sequelize_1.Op.or]: [
                                { username: { [sequelize_1.Op.iLike]: `%${q}%` } },
                                { farmName: { [sequelize_1.Op.iLike]: `%${q}%` } },
                            ],
                        },
                    },
                ],
                limit,
            }),
            marketplace_listing_model_1.default.findAll({
                where: {
                    status: 'active',
                    [sequelize_1.Op.or]: [
                        { title: { [sequelize_1.Op.iLike]: `%${q}%` } },
                        { breed: { [sequelize_1.Op.iLike]: `%${q}%` } },
                        { location: { [sequelize_1.Op.iLike]: `%${q}%` } },
                    ],
                },
                limit,
            }),
            cow_model_1.default.findAll({
                where: {
                    [sequelize_1.Op.or]: [{ name: { [sequelize_1.Op.iLike]: `%${q}%` } }, { breed: { [sequelize_1.Op.iLike]: `%${q}%` } }],
                },
                limit,
            }),
            post_model_1.default.findAll({
                where: {
                    hashtags: { [sequelize_1.Op.contains]: [q.replace('#', '').toLowerCase()] },
                },
                limit,
            }),
        ]);
        const farms = users.filter((u) => u.profile?.farmName);
        const breeds = [...new Set(cows.map((c) => c.breed))];
        const hashtags = [...new Set(posts.flatMap((p) => p.hashtags))];
        const locations = [
            ...new Set(listings
                .map((l) => l.location)
                .filter(Boolean)
                .concat(users.map((u) => u.profile?.location).filter(Boolean))),
        ];
        return {
            users: users.map((u) => ({ id: u.id, name: u.name, profile: u.profile })),
            farms: farms.map((u) => ({
                id: u.id,
                farmName: u.profile?.farmName,
                location: u.profile?.location,
            })),
            breeds,
            listings,
            hashtags,
            locations,
        };
    }
}
exports.SearchService = SearchService;
exports.default = SearchService;
