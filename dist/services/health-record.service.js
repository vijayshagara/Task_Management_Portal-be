"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthRecordService = void 0;
const health_record_model_1 = __importDefault(require("../models/health-record.model"));
const cow_model_1 = require("../models/cow.model");
const zod_1 = require("zod");
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const notification_service_1 = require("../services1/notification.service");
const cow_health_status_model_1 = __importDefault(require("../models/cow-health-status.model"));
const farm_access_1 = require("../utils/farm-access");
class HealthRecordService {
    static getFeverStatus(temperature) {
        if (temperature == null)
            return 'NORMAL';
        if (temperature >= 40)
            return 'HIGH_FEVER';
        if (temperature >= 39.3)
            return 'MILD_FEVER';
        return 'NORMAL';
    }
    static async getAllHealthRecords(userId, role) {
        const cowWhere = (0, farm_access_1.cowScopeWhere)(userId, role);
        return health_record_model_1.default.findAll({
            order: [['recordedAt', 'DESC']],
            include: [
                {
                    model: cow_model_1.Cow,
                    attributes: ['id', 'name', 'breed', 'ownerId'],
                    where: Object.keys(cowWhere).length ? cowWhere : undefined,
                    required: true,
                },
            ],
        });
    }
    static async getHealthRecordById(id, userId, role) {
        const record = await health_record_model_1.default.findByPk(id, {
            include: [
                {
                    model: cow_model_1.Cow,
                    attributes: ['id', 'name', 'breed', 'ownerId'],
                },
            ],
        });
        if (!record)
            return null;
        await (0, farm_access_1.assertCowAccess)(record.cowId, userId, role);
        return record;
    }
    static async getHealthRecordsByCowId(cowId, userId, role) {
        await (0, farm_access_1.assertCowAccess)(cowId, userId, role);
        return health_record_model_1.default.findAll({
            where: { cowId },
            order: [['recordedAt', 'DESC']],
        });
    }
    static async createHealthRecord(data, userId, role) {
        const validatedData = this.createSchema.parse(data);
        return database_1.default.transaction(async (transaction) => {
            const cow = userId && role
                ? await (0, farm_access_1.assertCowAccess)(validatedData.cowId, userId, role)
                : await cow_model_1.Cow.findByPk(validatedData.cowId, { transaction });
            if (!cow) {
                throw new Error('Cow not found');
            }
            const healthRecord = await health_record_model_1.default.create(validatedData, { transaction });
            const feverStatus = this.getFeverStatus(validatedData.temperature);
            const previousStatus = await cow_health_status_model_1.default.findByPk(cow.id, { transaction });
            await cow_health_status_model_1.default.upsert({
                cowId: cow.id,
                latestTemperature: validatedData.temperature ?? null,
                feverStatus,
                lastCheckedAt: validatedData.recordedAt
                    ? new Date(validatedData.recordedAt)
                    : new Date(),
            }, { transaction });
            if (feverStatus !== 'NORMAL' &&
                previousStatus?.feverStatus !== feverStatus) {
                (0, notification_service_1.sendEmail)(cow.id, cow.name, feverStatus).catch((err) => {
                    console.error('Error sending fever alert email:', err);
                });
            }
            return healthRecord;
        });
    }
    static async updateHealthRecord(id, data, userId, role) {
        const validatedData = this.updateSchema.parse(data);
        const record = await health_record_model_1.default.findByPk(id);
        if (!record)
            return null;
        await (0, farm_access_1.assertCowAccess)(record.cowId, userId, role);
        return record.update(validatedData);
    }
    static async deleteHealthRecord(id, userId, role) {
        const record = await health_record_model_1.default.findByPk(id);
        if (!record)
            return false;
        await (0, farm_access_1.assertCowAccess)(record.cowId, userId, role);
        const deleted = await health_record_model_1.default.destroy({ where: { id } });
        return deleted > 0;
    }
    static async bulkDeleteHealthRecords(ids, userId, role) {
        const uniqueIds = [...new Set(ids)];
        const cowWhere = (0, farm_access_1.cowScopeWhere)(userId, role);
        const records = await health_record_model_1.default.findAll({
            where: { id: { [sequelize_1.Op.in]: uniqueIds } },
            include: [
                {
                    model: cow_model_1.Cow,
                    attributes: ['id', 'ownerId'],
                    where: Object.keys(cowWhere).length ? cowWhere : undefined,
                    required: true,
                },
            ],
            attributes: ['id'],
        });
        const allowedIds = records.map((r) => r.id);
        if (!allowedIds.length)
            return { ids: [], count: 0 };
        const count = await health_record_model_1.default.destroy({
            where: { id: { [sequelize_1.Op.in]: allowedIds } },
        });
        return { ids: allowedIds, count };
    }
}
exports.HealthRecordService = HealthRecordService;
HealthRecordService.createSchema = zod_1.z.object({
    cowId: zod_1.z.string().uuid(),
    temperature: zod_1.z.number().optional(),
    activityLevel: zod_1.z.string().optional(),
    eatingStatus: zod_1.z.string().optional(),
    rumination: zod_1.z.string().optional(),
    issue: zod_1.z.string().optional(),
    recordedAt: zod_1.z.coerce.date().optional(),
});
HealthRecordService.updateSchema = zod_1.z.object({
    temperature: zod_1.z.number().optional(),
    activityLevel: zod_1.z.string().optional(),
    eatingStatus: zod_1.z.string().optional(),
    rumination: zod_1.z.string().optional(),
    issue: zod_1.z.string().optional(),
    recordedAt: zod_1.z.coerce.date().optional(),
});
