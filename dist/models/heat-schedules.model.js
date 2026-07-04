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
exports.HeatScheduleStatus = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const heat_cycle_model_1 = __importDefault(require("./heat-cycle.model"));
const cow_model_1 = require("./cow.model");
var HeatScheduleStatus;
(function (HeatScheduleStatus) {
    HeatScheduleStatus["SCHEDULED"] = "scheduled";
    HeatScheduleStatus["SENDING"] = "sending";
    HeatScheduleStatus["SENT"] = "sent";
    HeatScheduleStatus["FAILED"] = "failed";
})(HeatScheduleStatus || (exports.HeatScheduleStatus = HeatScheduleStatus = {}));
let HeatSchedule = class HeatSchedule extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        primaryKey: true,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
    }),
    __metadata("design:type", String)
], HeatSchedule.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => heat_cycle_model_1.default),
    (0, sequelize_typescript_1.Index)({
        name: 'idx_heat_schedule_cycle',
    }),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
    }),
    __metadata("design:type", String)
], HeatSchedule.prototype, "heatCycleId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => cow_model_1.Cow),
    (0, sequelize_typescript_1.Index)({
        name: 'idx_heat_schedule_cow',
    }),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
    }),
    __metadata("design:type", String)
], HeatSchedule.prototype, "cowId", void 0);
__decorate([
    (0, sequelize_typescript_1.Index)({
        name: 'idx_heat_schedule_day',
    }),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
    }),
    __metadata("design:type", Number)
], HeatSchedule.prototype, "alertDay", void 0);
__decorate([
    (0, sequelize_typescript_1.Index)({
        name: 'idx_heat_schedule_time',
    }),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
    }),
    __metadata("design:type", Date)
], HeatSchedule.prototype, "scheduledAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Index)({
        name: 'idx_heat_schedule_status',
    }),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(HeatScheduleStatus)),
        allowNull: false,
        defaultValue: HeatScheduleStatus.SCHEDULED,
    }),
    __metadata("design:type", String)
], HeatSchedule.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => heat_cycle_model_1.default),
    __metadata("design:type", heat_cycle_model_1.default)
], HeatSchedule.prototype, "heatCycle", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => cow_model_1.Cow),
    __metadata("design:type", cow_model_1.Cow)
], HeatSchedule.prototype, "cow", void 0);
HeatSchedule = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'heat_schedules',
        timestamps: true,
    })
], HeatSchedule);
exports.default = HeatSchedule;
