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
exports.Post = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const user_model_1 = __importDefault(require("./user.model"));
const cow_model_1 = __importDefault(require("./cow.model"));
const post_media_model_1 = __importDefault(require("./post-media.model"));
const post_like_model_1 = __importDefault(require("./post-like.model"));
const comment_model_1 = __importDefault(require("./comment.model"));
let Post = class Post extends sequelize_typescript_1.Model {
};
exports.Post = Post;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        primaryKey: true,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
    }),
    __metadata("design:type", String)
], Post.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false }),
    __metadata("design:type", String)
], Post.prototype, "authorId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: true }),
    __metadata("design:type", Object)
], Post.prototype, "content", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", Object)
], Post.prototype, "location", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => cow_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: true }),
    __metadata("design:type", Object)
], Post.prototype, "cowId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.ARRAY(sequelize_typescript_1.DataType.STRING), defaultValue: [] }),
    __metadata("design:type", Array)
], Post.prototype, "hashtags", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.default),
    __metadata("design:type", user_model_1.default)
], Post.prototype, "author", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => cow_model_1.default),
    __metadata("design:type", cow_model_1.default)
], Post.prototype, "cow", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => post_media_model_1.default),
    __metadata("design:type", Array)
], Post.prototype, "media", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => post_like_model_1.default),
    __metadata("design:type", Array)
], Post.prototype, "likes", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => comment_model_1.default),
    __metadata("design:type", Array)
], Post.prototype, "comments", void 0);
exports.Post = Post = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'posts', timestamps: true })
], Post);
exports.default = Post;
