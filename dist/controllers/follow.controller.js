"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowController = void 0;
const auth_interface_1 = require("../interfaces/auth.interface");
const follow_service_1 = require("../services/follow.service");
class FollowController {
    static async follow(req, res) {
        try {
            const result = await follow_service_1.FollowService.follow((0, auth_interface_1.getUserId)(req), req.params.userId);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async unfollow(req, res) {
        try {
            const result = await follow_service_1.FollowService.unfollow((0, auth_interface_1.getUserId)(req), req.params.userId);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async respond(req, res) {
        try {
            const result = await follow_service_1.FollowService.respondToRequest((0, auth_interface_1.getUserId)(req), req.params.requestId, req.body.action);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getFollowers(req, res) {
        try {
            const result = await follow_service_1.FollowService.getFollowers(req.params.userId);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getFollowing(req, res) {
        try {
            const result = await follow_service_1.FollowService.getFollowing(req.params.userId);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getPendingRequests(req, res) {
        try {
            const requests = await follow_service_1.FollowService.getPendingRequests((0, auth_interface_1.getUserId)(req));
            res.json(requests);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}
exports.FollowController = FollowController;
exports.default = FollowController;
