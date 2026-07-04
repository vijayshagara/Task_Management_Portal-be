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
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const cow_model_1 = require("./cow.model");
let CowHealthStatus = class CowHealthStatus extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => cow_model_1.Cow),
    (0, sequelize_typescript_1.Index)({
        name: 'idx_cow_health_status_cow',
        unique: true,
    }),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        primaryKey: true,
        allowNull: false,
    }),
    __metadata("design:type", String)
], CowHealthStatus.prototype, "cowId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.FLOAT,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], CowHealthStatus.prototype, "latestTemperature", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('NORMAL', 'MILD_FEVER', 'HIGH_FEVER'),
        allowNull: false,
        defaultValue: 'NORMAL',
    }),
    __metadata("design:type", String)
], CowHealthStatus.prototype, "feverStatus", void 0);
__decorate([
    (0, sequelize_typescript_1.Index)({
        name: 'idx_cow_health_status_time',
    }),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
        defaultValue: sequelize_typescript_1.DataType.NOW,
    }),
    __metadata("design:type", Date)
], CowHealthStatus.prototype, "lastCheckedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => cow_model_1.Cow),
    __metadata("design:type", cow_model_1.Cow)
], CowHealthStatus.prototype, "cow", void 0);
CowHealthStatus = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'cow_health_status',
        timestamps: true,
    })
], CowHealthStatus);
exports.default = CowHealthStatus;
