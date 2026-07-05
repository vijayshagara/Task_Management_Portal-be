"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CowImageService = void 0;
const stream_1 = require("stream");
const mongodb_1 = require("mongodb");
const sharp_1 = __importDefault(require("sharp"));
const mongodb_2 = require("../config/mongodb");
const cow_image_blob_model_1 = __importDefault(require("../models/cow-image-blob.model"));
const BUCKET_NAME = 'cow_images';
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PG_PREFIX = 'pg:';
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
    static async saveToPostgres(cowId, buffer, contentType) {
        const [blob] = await cow_image_blob_model_1.default.upsert({ cowId, data: buffer, contentType }, { returning: true });
        const id = blob.id;
        return `${PG_PREFIX}${id}`;
    }
    static async uploadCowImage(cowId, file, existingFileId) {
        this.validateFile(file.mimetype, file.size);
        const { buffer, contentType } = await this.processImage(file.buffer, file.mimetype);
        if (existingFileId) {
            await this.deleteByFileId(existingFileId);
        }
        const mongoReady = await (0, mongodb_2.ensureMongoConnected)();
        if (mongoReady) {
            const bucket = this.getBucket();
            return new Promise((resolve, reject) => {
                const uploadStream = bucket.openUploadStream(`cow-${cowId}`, {
                    metadata: { cowId, contentType },
                });
                uploadStream.on('error', reject);
                uploadStream.on('finish', () => resolve(uploadStream.id.toString()));
                uploadStream.end(buffer);
            });
        }
        return this.saveToPostgres(cowId, buffer, contentType);
    }
    static async getCowImageStream(fileId, cowId) {
        if (fileId.startsWith(PG_PREFIX)) {
            const blob = await cow_image_blob_model_1.default.findByPk(fileId.slice(PG_PREFIX.length));
            if (!blob)
                throw new Error('Image not found');
            return {
                stream: stream_1.Readable.from(blob.data),
                contentType: blob.contentType,
            };
        }
        const mongoReady = await (0, mongodb_2.ensureMongoConnected)();
        if (mongoReady && mongodb_1.ObjectId.isValid(fileId)) {
            const bucket = this.getBucket();
            const objectId = new mongodb_1.ObjectId(fileId);
            const files = await bucket.find({ _id: objectId }).toArray();
            if (files.length) {
                const file = files[0];
                const contentType = file.metadata?.contentType || 'image/jpeg';
                return {
                    stream: bucket.openDownloadStream(objectId),
                    contentType,
                };
            }
        }
        // Fallback: lookup by cowId in PostgreSQL (e.g. after re-upload without mongo)
        if (cowId) {
            const blob = await cow_image_blob_model_1.default.findOne({ where: { cowId } });
            if (blob) {
                return {
                    stream: stream_1.Readable.from(blob.data),
                    contentType: blob.contentType,
                };
            }
        }
        throw new Error('Image not found');
    }
    static async deleteByFileId(fileId) {
        if (fileId.startsWith(PG_PREFIX)) {
            await cow_image_blob_model_1.default.destroy({ where: { id: fileId.slice(PG_PREFIX.length) } });
            return;
        }
        if (mongodb_1.ObjectId.isValid(fileId)) {
            const mongoReady = await (0, mongodb_2.ensureMongoConnected)();
            if (mongoReady) {
                const bucket = this.getBucket();
                try {
                    await bucket.delete(new mongodb_1.ObjectId(fileId));
                }
                catch {
                    // already deleted
                }
            }
        }
    }
    /** Returns true if any image storage backend is available */
    static async isStorageAvailable() {
        return true; // PostgreSQL fallback is always available when DB is connected
    }
}
exports.CowImageService = CowImageService;
