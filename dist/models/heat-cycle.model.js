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
exports.HeatCycleStatus = exports.HeatDetectionMethod = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const cow_model_1 = require("./cow.model");
var HeatDetectionMethod;
(function (HeatDetectionMethod) {
    HeatDetectionMethod["SENSOR"] = "sensor";
    HeatDetectionMethod["MANUAL"] = "manual";
})(HeatDetectionMethod || (exports.HeatDetectionMethod = HeatDetectionMethod = {}));
var HeatCycleStatus;
(function (HeatCycleStatus) {
    HeatCycleStatus["PENDING"] = "pending";
    HeatCycleStatus["CONFIRMED"] = "confirmed";
    HeatCycleStatus["MISSED"] = "missed";
})(HeatCycleStatus || (exports.HeatCycleStatus = HeatCycleStatus = {}));
let HeatCycle = class HeatCycle extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        primaryKey: true,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
    }),
    __metadata("design:type", String)
], HeatCycle.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => cow_model_1.Cow),
    (0, sequelize_typescript_1.Index)({
        name: 'idx_heat_cycle_cow',
    }),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
    }),
    __metadata("design:type", String)
], HeatCycle.prototype, "cowId", void 0);
__decorate([
    (0, sequelize_typescript_1.Index)({
        name: 'idx_heat_cycle_cow_start',
    }),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
    }),
    __metadata("design:type", Date)
], HeatCycle.prototype, "heatStartDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], HeatCycle.prototype, "heatEndDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(HeatDetectionMethod)),
        allowNull: false,
    }),
    __metadata("design:type", String)
], HeatCycle.prototype, "detectionMethod", void 0);
__decorate([
    (0, sequelize_typescript_1.Index)({
        name: 'idx_heat_cycle_cow_status',
    }),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(HeatCycleStatus)),
        allowNull: false,
        defaultValue: HeatCycleStatus.PENDING,
    }),
    __metadata("design:type", String)
], HeatCycle.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], HeatCycle.prototype, "confirmedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], HeatCycle.prototype, "nextExpectedHeat", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], HeatCycle.prototype, "notes", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => cow_model_1.Cow),
    __metadata("design:type", cow_model_1.Cow)
], HeatCycle.prototype, "cow", void 0);
HeatCycle = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'heat_cycles',
        timestamps: true,
    })
], HeatCycle);
exports.default = HeatCycle;
