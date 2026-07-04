"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialMediaUpload = exports.cowImageUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const storage = multer_1.default.memoryStorage();
exports.cowImageUpload = (0, multer_1.default)({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
            return;
        }
        cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    },
});
exports.socialMediaUpload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
            return;
        }
        cb(new Error('Unsupported media type'));
    },
});
