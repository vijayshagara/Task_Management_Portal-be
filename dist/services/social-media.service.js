"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialMediaService = void 0;
const mongodb_1 = require("mongodb");
const sharp_1 = __importDefault(require("sharp"));
const mongodb_2 = require("../config/mongodb");
const BUCKET_NAME = 'social_media';
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
const MEDIA_NOT_CONFIGURED = 'Media storage is not configured on the server. Add MONGODB_URI to Vercel Environment Variables (Settings → Environment Variables), then redeploy.';
class SocialMediaService {
    static async getBucket() {
        const connected = await (0, mongodb_2.ensureMongoConnected)();
        if (!connected) {
            throw new Error(MEDIA_NOT_CONFIGURED);
        }
        return new mongodb_1.GridFSBucket((0, mongodb_2.getMongoDb)(), { bucketName: BUCKET_NAME });
    }
    static async processImage(buffer, mimetype) {
        const pipeline = (0, sharp_1.default)(buffer).rotate().resize({
            width: 1200,
            withoutEnlargement: true,
        });
        if (mimetype === 'image/png') {
            return { buffer: await pipeline.png({ quality: 80 }).toBuffer(), contentType: 'image/png' };
        }
        if (mimetype === 'image/webp') {
            return { buffer: await pipeline.webp({ quality: 75 }).toBuffer(), contentType: 'image/webp' };
        }
        return { buffer: await pipeline.jpeg({ quality: 75 }).toBuffer(), contentType: 'image/jpeg' };
    }
    static validateFile(mimetype, size, isVideo = false) {
        if (!ALLOWED_TYPES.includes(mimetype)) {
            throw new Error('Unsupported media type');
        }
        const maxSize = isVideo ? 15 * 1024 * 1024 : 5 * 1024 * 1024;
        if (size > maxSize) {
            throw new Error(`File must be ${isVideo ? '15MB' : '5MB'} or smaller`);
        }
    }
    static async upload(file, prefix) {
        const isVideo = file.mimetype.startsWith('video/');
        this.validateFile(file.mimetype, file.size, isVideo);
        const bucket = await this.getBucket();
        let buffer = file.buffer;
        let contentType = file.mimetype;
        if (!isVideo) {
            const processed = await this.processImage(file.buffer, file.mimetype);
            buffer = processed.buffer;
            contentType = processed.contentType;
        }
        return new Promise((resolve, reject) => {
            const uploadStream = bucket.openUploadStream(`${prefix}-${Date.now()}`, {
                metadata: { prefix, contentType, mediaType: isVideo ? 'video' : 'image' },
            });
            uploadStream.on('error', reject);
            uploadStream.on('finish', () => {
                resolve({
                    fileId: uploadStream.id.toString(),
                    mediaType: isVideo ? 'video' : 'image',
                });
            });
            uploadStream.end(buffer);
        });
    }
    static async getStream(fileId) {
        if (!mongodb_1.ObjectId.isValid(fileId)) {
            throw new Error('Invalid file id');
        }
        const bucket = await this.getBucket();
        const files = await bucket.find({ _id: new mongodb_1.ObjectId(fileId) }).toArray();
        if (!files.length) {
            throw new Error('File not found');
        }
        const file = files[0];
        const contentType = file.metadata?.contentType || 'application/octet-stream';
        return {
            stream: bucket.openDownloadStream(new mongodb_1.ObjectId(fileId)),
            contentType,
        };
    }
    static async deleteByFileId(fileId) {
        if (!mongodb_1.ObjectId.isValid(fileId))
            return;
        const connected = await (0, mongodb_2.ensureMongoConnected)();
        if (!connected)
            return;
        const bucket = await this.getBucket();
        await bucket.delete(new mongodb_1.ObjectId(fileId));
    }
}
exports.SocialMediaService = SocialMediaService;
exports.default = SocialMediaService;
