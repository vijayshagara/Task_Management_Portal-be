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
exports.StoryReaction = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const story_model_1 = __importDefault(require("./story.model"));
const user_model_1 = __importDefault(require("./user.model"));
let StoryReaction = class StoryReaction extends sequelize_typescript_1.Model {
};
exports.StoryReaction = StoryReaction;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        primaryKey: true,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
    }),
    __metadata("design:type", String)
], StoryReaction.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => story_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false }),
    __metadata("design:type", String)
], StoryReaction.prototype, "storyId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false }),
    __metadata("design:type", String)
], StoryReaction.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: 'like' }),
    __metadata("design:type", String)
], StoryReaction.prototype, "reactionType", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => story_model_1.default),
    __metadata("design:type", story_model_1.default)
], StoryReaction.prototype, "story", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.default),
    __metadata("design:type", user_model_1.default)
], StoryReaction.prototype, "user", void 0);
exports.StoryReaction = StoryReaction = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'story_reactions', timestamps: true, updatedAt: false })
], StoryReaction);
exports.default = StoryReaction;
