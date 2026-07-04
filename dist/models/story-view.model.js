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
exports.StoryView = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const story_model_1 = __importDefault(require("./story.model"));
const user_model_1 = __importDefault(require("./user.model"));
let StoryView = class StoryView extends sequelize_typescript_1.Model {
};
exports.StoryView = StoryView;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        primaryKey: true,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
    }),
    __metadata("design:type", String)
], StoryView.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => story_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false }),
    __metadata("design:type", String)
], StoryView.prototype, "storyId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false }),
    __metadata("design:type", String)
], StoryView.prototype, "viewerId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => story_model_1.default),
    __metadata("design:type", story_model_1.default)
], StoryView.prototype, "story", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.default),
    __metadata("design:type", user_model_1.default)
], StoryView.prototype, "viewer", void 0);
exports.StoryView = StoryView = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'story_views', timestamps: true, updatedAt: false })
], StoryView);
exports.default = StoryView;
