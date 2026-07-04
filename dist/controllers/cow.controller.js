"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CowController = void 0;
const cow_service_1 = require("../services/cow.service");
const cow_image_service_1 = require("../services/cow-image.service");
const mongodb_1 = require("../config/mongodb");
class CowController {
    static async getAllCows(req, res) {
        try {
            const cows = await cow_service_1.CowService.getAllCows();
            res.send(cows);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    static async getCowById(req, res) {
        try {
            const cow = await cow_service_1.CowService.getCowById(req.params.id);
            if (!cow) {
                res.status(404).json({ message: 'Cow not found' });
                return;
            }
            res.json(cow);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    static async createCow(req, res) {
        try {
            const cow = await cow_service_1.CowService.createCow(req.body);
            res.status(201).json(cow);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async updateCow(req, res) {
        try {
            const cow = await cow_service_1.CowService.updateCow(req.params.id, req.body);
            if (!cow) {
                res.status(404).json({ message: 'Cow not found' });
                return;
            }
            res.json(cow);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async deleteCow(req, res) {
        try {
            const success = await cow_service_1.CowService.deleteCow(req.params.id);
            if (!success) {
                res.status(404).json({ message: 'Cow not found' });
                return;
            }
            res.json({ message: 'Cow deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    static async uploadCowImage(req, res) {
        try {
            if (!(0, mongodb_1.isMongoConnected)()) {
                res.status(503).json({ message: 'Image storage is not configured. Set MONGODB_URI in .env' });
                return;
            }
            if (!req.file) {
                res.status(400).json({ message: 'No image file provided' });
                return;
            }
            const cow = await cow_service_1.CowService.getCowById(req.params.id);
            if (!cow) {
                res.status(404).json({ message: 'Cow not found' });
                return;
            }
            const fileId = await cow_image_service_1.CowImageService.uploadCowImage(cow.id, req.file, cow.image);
            const updatedCow = await cow_service_1.CowService.setCowImage(cow.id, fileId);
            res.json(updatedCow);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getCowImage(req, res) {
        try {
            if (!(0, mongodb_1.isMongoConnected)()) {
                res.status(503).json({ message: 'Image storage is not configured' });
                return;
            }
            const cow = await cow_service_1.CowService.getCowById(req.params.id);
            if (!cow || !cow.image) {
                res.status(404).json({ message: 'Image not found' });
                return;
            }
            const { stream, contentType } = await cow_image_service_1.CowImageService.getCowImageStream(cow.image);
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=86400');
            stream.pipe(res);
        }
        catch (error) {
            res.status(404).json({ message: error.message || 'Image not found' });
        }
    }
}
exports.CowController = CowController;
