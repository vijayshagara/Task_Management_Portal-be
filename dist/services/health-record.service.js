"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthRecordService = void 0;
const health_record_model_1 = __importDefault(require("../models/health-record.model"));
const cow_model_1 = require("../models/cow.model");
const zod_1 = require("zod");
const database_1 = __importDefault(require("../config/database"));
const notification_service_1 = require("../services1/notification.service");
const cow_health_status_model_1 = __importDefault(require("../models/cow-health-status.model"));
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
    // --------------------
    // GET ALL HEALTH RECORDS
    // --------------------
    static async getAllHealthRecords() {
        return health_record_model_1.default.findAll({
            order: [['recordedAt', 'DESC']],
            include: [
                {
                    model: cow_model_1.Cow,
                    attributes: ['id', 'name', 'breed'],
                },
            ],
        });
    }
    // --------------------
    // GET BY ID
    // --------------------
    static async getHealthRecordById(id) {
        return health_record_model_1.default.findByPk(id, {
            include: [
                {
                    model: cow_model_1.Cow,
                    attributes: ['id', 'name', 'breed'],
                },
            ],
        });
    }
    // --------------------
    // GET BY COW ID
    // --------------------
    static async getHealthRecordsByCowId(cowId) {
        return health_record_model_1.default.findAll({
            where: { cowId },
            order: [['recordedAt', 'DESC']],
        });
    }
    // --------------------
    // CREATE
    // --------------------
    static async createHealthRecord(data) {
        const validatedData = this.createSchema.parse(data);
        return database_1.default.transaction(async (transaction) => {
            // 1️⃣ Validate cow
            const cow = await cow_model_1.Cow.findByPk(validatedData.cowId, { transaction });
            if (!cow) {
                throw new Error('Cow not found');
            }
            // 2️⃣ Insert history record
            const healthRecord = await health_record_model_1.default.create(validatedData, { transaction });
            // 3️⃣ Determine fever status
            const feverStatus = this.getFeverStatus(validatedData.temperature);
            // 4️⃣ Read previous status (for alert control)
            const previousStatus = await cow_health_status_model_1.default.findByPk(cow.id, { transaction });
            // 5️⃣ UPSERT latest health snapshot
            await cow_health_status_model_1.default.upsert({
                cowId: cow.id,
                latestTemperature: validatedData.temperature ?? null,
                feverStatus,
                lastCheckedAt: validatedData.recordedAt
                    ? new Date(validatedData.recordedAt)
                    : new Date(),
            }, { transaction });
            // 6️⃣ Send alert ONLY on status change + fever
            if (feverStatus !== 'NORMAL' &&
                previousStatus?.feverStatus !== feverStatus) {
                (0, notification_service_1.sendEmail)(cow.id, cow.name, feverStatus).catch(err => {
                    console.error('Error sending fever alert email:', err);
                });
            }
            return healthRecord;
        });
    }
    // --------------------
    // UPDATE
    // --------------------
    static async updateHealthRecord(id, data) {
        const validatedData = this.updateSchema.parse(data);
        const record = await health_record_model_1.default.findByPk(id);
        if (!record)
            return null;
        return record.update(validatedData);
    }
    // --------------------
    // DELETE
    // --------------------
    static async deleteHealthRecord(id) {
        const deleted = await health_record_model_1.default.destroy({
            where: { id },
        });
        return deleted > 0;
    }
}
exports.HealthRecordService = HealthRecordService;
// --------------------
// VALIDATION SCHEMAS
// --------------------
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
