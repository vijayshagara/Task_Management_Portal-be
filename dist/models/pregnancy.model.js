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
exports.Pregnancy = exports.PregnancyStatus = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const user_model_1 = __importDefault(require("./user.model"));
const cow_model_1 = __importDefault(require("./cow.model"));
var PregnancyStatus;
(function (PregnancyStatus) {
    PregnancyStatus["CONFIRMED"] = "confirmed";
    PregnancyStatus["IN_PROGRESS"] = "in_progress";
    PregnancyStatus["CALVED"] = "calved";
    PregnancyStatus["ABORTED"] = "aborted";
})(PregnancyStatus || (exports.PregnancyStatus = PregnancyStatus = {}));
let Pregnancy = class Pregnancy extends sequelize_typescript_1.Model {
};
exports.Pregnancy = Pregnancy;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        primaryKey: true,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
    }),
    __metadata("design:type", String)
], Pregnancy.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false }),
    __metadata("design:type", String)
], Pregnancy.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => cow_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false }),
    __metadata("design:type", String)
], Pregnancy.prototype, "cowId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATEONLY, allowNull: false }),
    __metadata("design:type", Date)
], Pregnancy.prototype, "conceptionDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATEONLY, allowNull: true }),
    __metadata("design:type", Object)
], Pregnancy.prototype, "expectedCalvingDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATEONLY, allowNull: true }),
    __metadata("design:type", Object)
], Pregnancy.prototype, "actualCalvingDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(PregnancyStatus)),
        defaultValue: PregnancyStatus.CONFIRMED,
    }),
    __metadata("design:type", String)
], Pregnancy.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", Object)
], Pregnancy.prototype, "sireName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: true }),
    __metadata("design:type", Object)
], Pregnancy.prototype, "notes", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => cow_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: true }),
    __metadata("design:type", Object)
], Pregnancy.prototype, "calfId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.default),
    __metadata("design:type", user_model_1.default)
], Pregnancy.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => cow_model_1.default, 'cowId'),
    __metadata("design:type", cow_model_1.default)
], Pregnancy.prototype, "cow", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => cow_model_1.default, 'calfId'),
    __metadata("design:type", cow_model_1.default)
], Pregnancy.prototype, "calf", void 0);
exports.Pregnancy = Pregnancy = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'pregnancies', timestamps: true })
], Pregnancy);
exports.default = Pregnancy;
