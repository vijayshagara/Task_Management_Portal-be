"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostController = void 0;
const auth_interface_1 = require("../interfaces/auth.interface");
const post_service_1 = require("../services/post.service");
class PostController {
    static async createPost(req, res) {
        try {
            const files = req.files || [];
            const post = await post_service_1.PostService.createPost((0, auth_interface_1.getUserId)(req), req.body, files);
            res.status(201).json(post);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getFeed(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const feed = await post_service_1.PostService.getFeed((0, auth_interface_1.getUserId)(req), page, limit);
            res.json(feed);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getPost(req, res) {
        try {
            const post = await post_service_1.PostService.getPostById(req.params.id, req.user?.id);
            res.json(post);
        }
        catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
    static async getUserPosts(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const posts = await post_service_1.PostService.getUserPosts(req.params.userId, (0, auth_interface_1.getUserId)(req), page);
            res.json(posts);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async likePost(req, res) {
        try {
            const result = await post_service_1.PostService.likePost((0, auth_interface_1.getUserId)(req), req.params.id);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async unlikePost(req, res) {
        try {
            const result = await post_service_1.PostService.unlikePost((0, auth_interface_1.getUserId)(req), req.params.id);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getLikes(req, res) {
        try {
            const likes = await post_service_1.PostService.getPostLikes(req.params.id);
            res.json(likes);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async addComment(req, res) {
        try {
            const comment = await post_service_1.PostService.addComment((0, auth_interface_1.getUserId)(req), req.params.id, req.body);
            res.status(201).json(comment);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getComments(req, res) {
        try {
            const comments = await post_service_1.PostService.getComments(req.params.id);
            res.json(comments);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async updateComment(req, res) {
        try {
            const comment = await post_service_1.PostService.updateComment((0, auth_interface_1.getUserId)(req), req.params.commentId, req.body.content);
            res.json(comment);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async deleteComment(req, res) {
        try {
            await post_service_1.PostService.deleteComment((0, auth_interface_1.getUserId)(req), req.params.commentId);
            res.json({ deleted: true });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async savePost(req, res) {
        try {
            const result = await post_service_1.PostService.savePost((0, auth_interface_1.getUserId)(req), req.params.id, req.body.collectionName);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async unsavePost(req, res) {
        try {
            const result = await post_service_1.PostService.unsavePost((0, auth_interface_1.getUserId)(req), req.params.id);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getSavedPosts(req, res) {
        try {
            const posts = await post_service_1.PostService.getSavedPosts((0, auth_interface_1.getUserId)(req));
            res.json(posts);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}
exports.PostController = PostController;
exports.default = PostController;
