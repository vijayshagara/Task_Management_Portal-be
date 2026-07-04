"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostMedia = exports.MediaType = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const post_model_1 = __importDefault(require("./post.model"));
var MediaType;
(function (MediaType) {
    MediaType["IMAGE"] = "image";
    MediaType["VIDEO"] = "video";
})(MediaType || (exports.MediaType = MediaType = {}));
let PostMedia = class PostMedia extends sequelize_typescript_1.Model {
};
exports.PostMedia = PostMedia;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        primaryKey: true,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
    }),
    __metadata("design:type", String)
], PostMedia.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => post_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false }),
    __metadata("design:type", String)
], PostMedia.prototype, "postId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], PostMedia.prototype, "fileId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(MediaType)),
        defaultValue: MediaType.IMAGE,
    }),
    __metadata("design:type", String)
], PostMedia.prototype, "mediaType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, defaultValue: 0 }),
    __metadata("design:type", Number)
], PostMedia.prototype, "sortOrder", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => post_model_1.default),
    __metadata("design:type", post_model_1.default)
], PostMedia.prototype, "post", void 0);
exports.PostMedia = PostMedia = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'post_media', timestamps: true })
], PostMedia);
exports.default = PostMedia;
