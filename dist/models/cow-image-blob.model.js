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
exports.CowImageBlob = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const cow_model_1 = __importDefault(require("./cow.model"));
let CowImageBlob = class CowImageBlob extends sequelize_typescript_1.Model {
};
exports.CowImageBlob = CowImageBlob;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        primaryKey: true,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
    }),
    __metadata("design:type", String)
], CowImageBlob.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => cow_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false, unique: true }),
    __metadata("design:type", String)
], CowImageBlob.prototype, "cowId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], CowImageBlob.prototype, "contentType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.BLOB, allowNull: false }),
    __metadata("design:type", Buffer)
], CowImageBlob.prototype, "data", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => cow_model_1.default),
    __metadata("design:type", cow_model_1.default)
], CowImageBlob.prototype, "cow", void 0);
exports.CowImageBlob = CowImageBlob = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'cow_image_blobs', timestamps: true })
], CowImageBlob);
exports.default = CowImageBlob;
