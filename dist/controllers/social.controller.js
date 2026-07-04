"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialController = void 0;
const auth_interface_1 = require("../interfaces/auth.interface");
const social_media_service_1 = require("../services/social-media.service");
const story_service_1 = require("../services/story.service");
const marketplace_service_1 = require("../services/marketplace.service");
const message_service_1 = require("../services/message.service");
const social_notification_service_1 = require("../services/social-notification.service");
const search_service_1 = require("../services/search.service");
const explore_service_1 = require("../services/explore.service");
const settings_service_1 = require("../services/settings.service");
class SocialController {
    static async getMedia(req, res) {
        try {
            const { stream, contentType } = await social_media_service_1.SocialMediaService.getStream(req.params.fileId);
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=86400');
            stream.pipe(res);
        }
        catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
    static async createStory(req, res) {
        try {
            if (!req.file) {
                res.status(400).json({ message: 'No file uploaded' });
                return;
            }
            const story = await story_service_1.StoryService.createStory((0, auth_interface_1.getUserId)(req), req.file);
            res.status(201).json(story);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getStories(req, res) {
        try {
            const stories = await story_service_1.StoryService.getFeedStories((0, auth_interface_1.getUserId)(req));
            res.json(stories);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async viewStory(req, res) {
        try {
            const result = await story_service_1.StoryService.viewStory((0, auth_interface_1.getUserId)(req), req.params.id);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getStoryViews(req, res) {
        try {
            const views = await story_service_1.StoryService.getStoryViews(req.params.id, (0, auth_interface_1.getUserId)(req));
            res.json(views);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async reactStory(req, res) {
        try {
            const result = await story_service_1.StoryService.reactToStory((0, auth_interface_1.getUserId)(req), req.params.id, req.body.reactionType);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async createListing(req, res) {
        try {
            const files = req.files || [];
            const listing = await marketplace_service_1.MarketplaceService.createListing((0, auth_interface_1.getUserId)(req), req.body, files);
            res.status(201).json(listing);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getListings(req, res) {
        try {
            const listings = await marketplace_service_1.MarketplaceService.getListings({
                listingType: req.query.listingType,
                breed: req.query.breed,
                location: req.query.location,
                search: req.query.search,
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 12,
            });
            res.json(listings);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getListing(req, res) {
        try {
            const listing = await marketplace_service_1.MarketplaceService.getListingById(req.params.id, req.user?.id);
            res.json(listing);
        }
        catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
    static async updateListing(req, res) {
        try {
            const listing = await marketplace_service_1.MarketplaceService.updateListing((0, auth_interface_1.getUserId)(req), req.params.id, req.body);
            res.json(listing);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async markSold(req, res) {
        try {
            const listing = await marketplace_service_1.MarketplaceService.markSold((0, auth_interface_1.getUserId)(req), req.params.id);
            res.json(listing);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async saveListing(req, res) {
        try {
            const result = await marketplace_service_1.MarketplaceService.saveListing((0, auth_interface_1.getUserId)(req), req.params.id);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async contactSeller(req, res) {
        try {
            const conversation = await marketplace_service_1.MarketplaceService.contactSeller((0, auth_interface_1.getUserId)(req), req.params.id, req.body.message);
            res.json(conversation);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getUserListings(req, res) {
        try {
            const listings = await marketplace_service_1.MarketplaceService.getUserListings(req.params.userId);
            res.json(listings);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getConversations(req, res) {
        try {
            const conversations = await message_service_1.MessageService.getConversations((0, auth_interface_1.getUserId)(req));
            res.json(conversations);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getMessages(req, res) {
        try {
            const messages = await message_service_1.MessageService.getMessages((0, auth_interface_1.getUserId)(req), req.params.id);
            res.json(messages);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async sendMessage(req, res) {
        try {
            const message = await message_service_1.MessageService.sendMessage((0, auth_interface_1.getUserId)(req), req.params.id, req.body);
            res.status(201).json(message);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async startConversation(req, res) {
        try {
            const conversation = await message_service_1.MessageService.getOrCreateConversation((0, auth_interface_1.getUserId)(req), req.params.userId);
            res.json(conversation);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getNotifications(req, res) {
        try {
            const notifications = await social_notification_service_1.SocialNotificationService.getForUser((0, auth_interface_1.getUserId)(req));
            res.json(notifications);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async markNotificationsRead(req, res) {
        try {
            const result = await social_notification_service_1.SocialNotificationService.markRead((0, auth_interface_1.getUserId)(req), req.body.notificationId);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getUnreadCount(req, res) {
        try {
            const result = await social_notification_service_1.SocialNotificationService.getUnreadCount((0, auth_interface_1.getUserId)(req));
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async search(req, res) {
        try {
            const results = await search_service_1.SearchService.globalSearch(req.query.q);
            res.json(results);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async explore(req, res) {
        try {
            const data = await explore_service_1.ExploreService.getExplore((0, auth_interface_1.getUserId)(req));
            res.json(data);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getSettings(req, res) {
        try {
            const settings = await settings_service_1.SettingsService.getSettings((0, auth_interface_1.getUserId)(req));
            res.json(settings);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async updateSettings(req, res) {
        try {
            const settings = await settings_service_1.SettingsService.updateSettings((0, auth_interface_1.getUserId)(req), req.body);
            res.json(settings);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async blockUser(req, res) {
        try {
            const result = await settings_service_1.SettingsService.blockUser((0, auth_interface_1.getUserId)(req), req.params.userId);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async unblockUser(req, res) {
        try {
            const result = await settings_service_1.SettingsService.unblockUser((0, auth_interface_1.getUserId)(req), req.params.userId);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}
exports.SocialController = SocialController;
exports.default = SocialController;
