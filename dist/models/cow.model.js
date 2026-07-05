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
exports.Cow = exports.CowGender = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const heat_cycle_model_1 = __importDefault(require("./heat-cycle.model"));
const health_record_model_1 = __importDefault(require("./health-record.model"));
const user_model_1 = __importDefault(require("./user.model"));
var CowGender;
(function (CowGender) {
    CowGender["FEMALE"] = "female";
    CowGender["MALE"] = "male";
})(CowGender || (exports.CowGender = CowGender = {}));
let Cow = class Cow extends sequelize_typescript_1.Model {
};
exports.Cow = Cow;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        primaryKey: true,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
    }),
    __metadata("design:type", String)
], Cow.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Index)({
        name: 'idx_cow_name_birthdate',
        unique: true,
    }),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Cow.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Index)({
        name: 'idx_cow_name_birthdate',
        unique: true,
    }),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATEONLY,
        allowNull: false,
    }),
    __metadata("design:type", Date)
], Cow.prototype, "birthDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Cow.prototype, "breed", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], Cow.prototype, "fatherName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], Cow.prototype, "motherName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(CowGender)),
        allowNull: false,
    }),
    __metadata("design:type", String)
], Cow.prototype, "gender", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], Cow.prototype, "image", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: true }),
    __metadata("design:type", Object)
], Cow.prototype, "ownerId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.default),
    __metadata("design:type", user_model_1.default)
], Cow.prototype, "owner", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => heat_cycle_model_1.default),
    __metadata("design:type", Array)
], Cow.prototype, "heatCycles", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => health_record_model_1.default),
    __metadata("design:type", Array)
], Cow.prototype, "healthRecords", void 0);
exports.Cow = Cow = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'cows',
        timestamps: true,
    })
], Cow);
exports.default = Cow;
