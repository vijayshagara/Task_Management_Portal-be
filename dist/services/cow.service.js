"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CowService = void 0;
const cow_model_1 = require("../models/cow.model");
const zod_1 = require("zod");
const database_1 = __importDefault(require("../config/database"));
const cow_image_service_1 = require("./cow-image.service");
const health_record_model_1 = __importDefault(require("../models/health-record.model"));
const heat_cycle_model_1 = __importDefault(require("../models/heat-cycle.model"));
const heat_schedules_model_1 = __importDefault(require("../models/heat-schedules.model"));
const cow_health_status_model_1 = __importDefault(require("../models/cow-health-status.model"));
const farm_access_1 = require("../utils/farm-access");
class CowService {
    static async getAllCows(userId, role) {
        const where = role && userId ? (0, farm_access_1.cowScopeWhere)(userId, role) : {};
        return cow_model_1.Cow.findAll({
            where,
            order: [['createdAt', 'DESC']],
        });
    }
    static async getCowById(id, userId, role) {
        const cow = await cow_model_1.Cow.findByPk(id);
        if (!cow)
            return null;
        if (role && userId && !(0, farm_access_1.isAdmin)(role) && cow.ownerId !== userId)
            return null;
        return cow;
    }
    static async createCow(cowData) {
        const validatedData = this.cowSchema.parse(cowData);
        const ownerId = cowData.ownerId ?? null;
        return database_1.default.transaction(async (transaction) => {
            const existingCow = await cow_model_1.Cow.findOne({
                where: {
                    name: validatedData.name,
                    birthDate: validatedData.birthDate,
                },
                transaction,
            });
            if (existingCow) {
                throw new Error('Cow with same name and birth date already exists');
            }
            return cow_model_1.Cow.create({ ...validatedData, ownerId }, { transaction });
        });
    }
    static async updateCow(id, cowData, userId, role) {
        const validatedData = this.cowSchema.partial().parse(cowData);
        const cow = await this.getCowById(id, userId, role);
        if (!cow)
            return null;
        return cow.update(validatedData);
    }
    static async setCowImage(cowId, fileId) {
        const cow = await cow_model_1.Cow.findByPk(cowId);
        if (!cow)
            return null;
        return cow.update({ image: fileId });
    }
    static async deleteCow(id, userId, role) {
        const cow = await this.getCowById(id, userId, role);
        if (!cow)
            return false;
        if (cow.image) {
            await cow_image_service_1.CowImageService.deleteByFileId(cow.image).catch(() => { });
        }
        const deletedCount = await database_1.default.transaction(async (transaction) => {
            await heat_schedules_model_1.default.destroy({ where: { cowId: id }, transaction });
            await heat_cycle_model_1.default.destroy({ where: { cowId: id }, transaction });
            await health_record_model_1.default.destroy({ where: { cowId: id }, transaction });
            await cow_health_status_model_1.default.destroy({ where: { cowId: id }, transaction });
            return cow_model_1.Cow.destroy({
                where: { id },
                transaction,
            });
        });
        return deletedCount > 0;
    }
}
exports.CowService = CowService;
CowService.cowSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    breed: zod_1.z.string().min(2),
    fatherName: zod_1.z.string().optional(),
    motherName: zod_1.z.string().optional(),
    gender: zod_1.z.nativeEnum(cow_model_1.CowGender),
    birthDate: zod_1.z.coerce.date(),
    image: zod_1.z.string().optional().nullable(),
});
