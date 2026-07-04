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
exports.MarketplaceService = void 0;
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const marketplace_listing_model_1 = __importStar(require("../models/marketplace-listing.model"));
const saved_item_model_1 = __importStar(require("../models/saved-item.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const user_profile_model_1 = __importDefault(require("../models/user-profile.model"));
const cow_model_1 = __importDefault(require("../models/cow.model"));
const social_media_service_1 = require("./social-media.service");
const message_service_1 = require("./message.service");
const listingSchema = zod_1.z.object({
    listingType: zod_1.z.enum(['cow', 'calf', 'bull', 'fodder', 'equipment', 'dairy_product']),
    title: zod_1.z.string().min(3).max(150),
    description: zod_1.z.string().max(2000).optional(),
    breed: zod_1.z.string().optional(),
    age: zod_1.z.string().optional(),
    weight: zod_1.z.coerce.number().optional(),
    milkProduction: zod_1.z.string().optional(),
    pregnancyStatus: zod_1.z.string().optional(),
    healthInfo: zod_1.z.string().optional(),
    vaccinationStatus: zod_1.z.string().optional(),
    price: zod_1.z.coerce.number().positive(),
    negotiable: zod_1.z.coerce.boolean().optional(),
    location: zod_1.z.string().optional(),
    cowId: zod_1.z.string().uuid().optional(),
});
class MarketplaceService {
    static async createListing(sellerId, data, files = []) {
        const validated = listingSchema.parse(data);
        const photos = [];
        for (const file of files) {
            const uploaded = await social_media_service_1.SocialMediaService.upload(file, `listing-${sellerId}`);
            photos.push(uploaded.fileId);
        }
        return marketplace_listing_model_1.default.create({
            sellerId,
            ...validated,
            listingType: validated.listingType,
            photos,
            status: marketplace_listing_model_1.ListingStatus.ACTIVE,
        });
    }
    static async getListings(filters) {
        const page = filters.page || 1;
        const limit = filters.limit || 12;
        const offset = (page - 1) * limit;
        const where = { status: marketplace_listing_model_1.ListingStatus.ACTIVE };
        if (filters.listingType)
            where.listingType = filters.listingType;
        if (filters.breed)
            where.breed = { [sequelize_1.Op.iLike]: `%${filters.breed}%` };
        if (filters.location)
            where.location = { [sequelize_1.Op.iLike]: `%${filters.location}%` };
        if (filters.search) {
            where[sequelize_1.Op.or] = [
                { title: { [sequelize_1.Op.iLike]: `%${filters.search}%` } },
                { description: { [sequelize_1.Op.iLike]: `%${filters.search}%` } },
            ];
        }
        const { rows, count } = await marketplace_listing_model_1.default.findAndCountAll({
            where,
            include: [
                {
                    model: user_model_1.default,
                    as: 'seller',
                    attributes: ['id', 'name'],
                    include: [{ model: user_profile_model_1.default, attributes: ['username', 'farmName', 'profilePicture', 'location'] }],
                },
                { model: cow_model_1.default, as: 'cow', attributes: ['id', 'name', 'breed', 'image'] },
            ],
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
    static async getListingById(id, viewerId) {
        const listing = await marketplace_listing_model_1.default.findByPk(id, {
            include: [
                {
                    model: user_model_1.default,
                    as: 'seller',
                    attributes: ['id', 'name'],
                    include: [{ model: user_profile_model_1.default, attributes: ['username', 'farmName', 'profilePicture', 'location', 'contactPhone'] }],
                },
                { model: cow_model_1.default, as: 'cow' },
            ],
        });
        if (!listing)
            throw new Error('Listing not found');
        const saved = viewerId
            ? !!(await saved_item_model_1.default.findOne({
                where: { userId: viewerId, itemType: saved_item_model_1.SavedItemType.LISTING, itemId: id },
            }))
            : false;
        return { ...listing.get({ plain: true }), savedByMe: saved };
    }
    static async updateListing(sellerId, id, data) {
        const listing = await marketplace_listing_model_1.default.findByPk(id);
        if (!listing || listing.sellerId !== sellerId)
            throw new Error('Listing not found');
        const validated = listingSchema.partial().parse(data);
        await listing.update(validated);
        return this.getListingById(id, sellerId);
    }
    static async markSold(sellerId, id) {
        const listing = await marketplace_listing_model_1.default.findByPk(id);
        if (!listing || listing.sellerId !== sellerId)
            throw new Error('Listing not found');
        await listing.update({ status: marketplace_listing_model_1.ListingStatus.SOLD });
        return listing;
    }
    static async saveListing(userId, listingId) {
        await saved_item_model_1.default.findOrCreate({
            where: { userId, itemType: saved_item_model_1.SavedItemType.LISTING, itemId: listingId },
            defaults: { userId, itemType: saved_item_model_1.SavedItemType.LISTING, itemId: listingId },
        });
        return { saved: true };
    }
    static async contactSeller(buyerId, listingId, message) {
        const listing = await marketplace_listing_model_1.default.findByPk(listingId);
        if (!listing)
            throw new Error('Listing not found');
        const conversation = await message_service_1.MessageService.getOrCreateConversation(buyerId, listing.sellerId);
        await message_service_1.MessageService.sendMessage(buyerId, conversation.id, {
            content: message || `Hi, I'm interested in your listing: ${listing.title}`,
        });
        return message_service_1.MessageService.getConversationWithUsers(conversation.id, buyerId);
    }
    static async getUserListings(userId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const { rows, count } = await marketplace_listing_model_1.default.findAndCountAll({
            where: { sellerId: userId },
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
}
exports.MarketplaceService = MarketplaceService;
exports.default = MarketplaceService;
