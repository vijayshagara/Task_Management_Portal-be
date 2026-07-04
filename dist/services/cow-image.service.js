"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CowImageService = void 0;
const mongodb_1 = require("mongodb");
const sharp_1 = __importDefault(require("sharp"));
const mongodb_2 = require("../config/mongodb");
const BUCKET_NAME = 'cow_images';
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
class CowImageService {
    static getBucket() {
        return new mongodb_1.GridFSBucket((0, mongodb_2.getMongoDb)(), { bucketName: BUCKET_NAME });
    }
    static async processImage(buffer, mimetype) {
        const pipeline = (0, sharp_1.default)(buffer).rotate().resize({
            width: 800,
            withoutEnlargement: true,
        });
        if (mimetype === 'image/png') {
            return {
                buffer: await pipeline.png({ quality: 80 }).toBuffer(),
                contentType: 'image/png',
            };
        }
        if (mimetype === 'image/webp') {
            return {
                buffer: await pipeline.webp({ quality: 70 }).toBuffer(),
                contentType: 'image/webp',
            };
        }
        return {
            buffer: await pipeline.jpeg({ quality: 70 }).toBuffer(),
            contentType: 'image/jpeg',
        };
    }
    static validateFile(mimetype, size) {
        if (!ALLOWED_TYPES.includes(mimetype)) {
            throw new Error('Only JPEG, PNG, and WebP images are allowed');
        }
        if (size > 2 * 1024 * 1024) {
            throw new Error('Image must be 2MB or smaller');
        }
    }
    static async uploadCowImage(cowId, file, existingFileId) {
        this.validateFile(file.mimetype, file.size);
        const { buffer, contentType } = await this.processImage(file.buffer, file.mimetype);
        const bucket = this.getBucket();
        if (existingFileId && mongodb_1.ObjectId.isValid(existingFileId)) {
            await this.deleteByFileId(existingFileId);
        }
        return new Promise((resolve, reject) => {
            const uploadStream = bucket.openUploadStream(`cow-${cowId}`, {
                metadata: { cowId, contentType },
            });
            uploadStream.on('error', reject);
            uploadStream.on('finish', () => {
                resolve(uploadStream.id.toString());
            });
            uploadStream.end(buffer);
        });
    }
    static async getCowImageStream(fileId) {
        if (!mongodb_1.ObjectId.isValid(fileId)) {
            throw new Error('Invalid image reference');
        }
        const bucket = this.getBucket();
        const objectId = new mongodb_1.ObjectId(fileId);
        const files = await bucket.find({ _id: objectId }).toArray();
        if (!files.length) {
            throw new Error('Image not found');
        }
        const file = files[0];
        const contentType = file.metadata?.contentType || 'image/jpeg';
        return {
            stream: bucket.openDownloadStream(objectId),
            contentType,
        };
    }
    static async deleteByFileId(fileId) {
        if (!mongodb_1.ObjectId.isValid(fileId))
            return;
        const bucket = this.getBucket();
        try {
            await bucket.delete(new mongodb_1.ObjectId(fileId));
        }
        catch {
            // File may already be deleted
        }
    }
}
exports.CowImageService = CowImageService;
