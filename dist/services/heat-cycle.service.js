"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeatCycleService = void 0;
const heat_cycle_model_1 = __importStar(require("../models/heat-cycle.model"));
const cow_model_1 = require("../models/cow.model");
const heat_schedules_model_1 = __importDefault(require("../models/heat-schedules.model"));
const heat_scheduler_service_1 = require("./heat-scheduler.service");
const zod_1 = require("zod");
const database_1 = __importDefault(require("../config/database"));
class HeatCycleService {
    // --------------------
    // GET ALL
    // --------------------
    static async getAllHeatCycles() {
        return heat_cycle_model_1.default.findAll({
            order: [['heatStartDate', 'DESC']],
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
    static async getHeatCycleById(id) {
        return heat_cycle_model_1.default.findByPk(id, {
            include: [
                {
                    model: cow_model_1.Cow,
                    attributes: ['id', 'name', 'breed'],
                },
            ],
        });
    }
    // --------------------
    // GET BY COW
    // --------------------
    static async getHeatCyclesByCowId(cowId) {
        return heat_cycle_model_1.default.findAll({
            where: { cowId },
            order: [['heatStartDate', 'DESC']],
        });
    }
    // --------------------
    // CREATE
    // --------------------
    static async createHeatCycle(data) {
        const validatedData = this.createSchema.parse(data);
        return database_1.default.transaction(async (transaction) => {
            const cow = await cow_model_1.Cow.findByPk(validatedData.cowId, { transaction });
            if (!cow) {
                throw new Error('Cow not found');
            }
            // ❗ Prevent multiple active cycles
            const activeCycle = await heat_cycle_model_1.default.findOne({
                where: {
                    cowId: validatedData.cowId,
                    status: heat_cycle_model_1.HeatCycleStatus.PENDING,
                },
                transaction,
            });
            if (activeCycle) {
                throw new Error('Active heat cycle already exists for this cow');
            }
            const cycle = await heat_cycle_model_1.default.create({
                ...validatedData,
                status: heat_cycle_model_1.HeatCycleStatus.PENDING,
            }, { transaction });
            // Schedule alerts AFTER create (still inside transaction context)
            await heat_scheduler_service_1.HeatSchedulerService.scheduleHeatReminder(cycle.id, cycle.cowId, cycle.heatStartDate, transaction);
            return cycle;
        });
    }
    // --------------------
    // UPDATE
    // --------------------
    static async updateHeatCycle(id, data) {
        const validatedData = this.updateSchema.parse(data);
        const cycle = await heat_cycle_model_1.default.findByPk(id);
        if (!cycle)
            return null;
        return cycle.update(validatedData);
    }
    // --------------------
    // DELETE
    // --------------------
    static async deleteHeatCycle(id) {
        const cycle = await heat_cycle_model_1.default.findByPk(id);
        if (!cycle)
            return false;
        const deletedCount = await database_1.default.transaction(async (transaction) => {
            await heat_schedules_model_1.default.destroy({
                where: { heatCycleId: id },
                transaction,
            });
            return heat_cycle_model_1.default.destroy({
                where: { id },
                transaction,
            });
        });
        return deletedCount > 0;
    }
    // --------------------
    // CONFIRM HEAT
    // --------------------
    static async confirmHeat(heatCycleId) {
        return database_1.default.transaction(async (transaction) => {
            const heatCycle = await heat_cycle_model_1.default.findByPk(heatCycleId, { transaction });
            if (!heatCycle)
                return false;
            await heatCycle.update({
                status: heat_cycle_model_1.HeatCycleStatus.CONFIRMED,
                confirmedAt: new Date(),
            }, { transaction });
            await heat_schedules_model_1.default.update({ status: 'CANCELLED' }, {
                where: {
                    heatCycleId,
                    status: 'SCHEDULED',
                },
                transaction,
            });
            return true;
        });
    }
}
exports.HeatCycleService = HeatCycleService;
// --------------------
// VALIDATION SCHEMAS
// --------------------
HeatCycleService.createSchema = zod_1.z.object({
    cowId: zod_1.z.string().uuid(),
    heatStartDate: zod_1.z.coerce.date(),
    heatEndDate: zod_1.z.coerce.date().optional(),
    detectionMethod: zod_1.z.nativeEnum(heat_cycle_model_1.HeatDetectionMethod),
    nextExpectedHeat: zod_1.z.coerce.date().optional(),
    notes: zod_1.z.string().optional(),
});
HeatCycleService.updateSchema = zod_1.z.object({
    heatStartDate: zod_1.z.coerce.date().optional(),
    heatEndDate: zod_1.z.coerce.date().optional(),
    detectionMethod: zod_1.z.nativeEnum(heat_cycle_model_1.HeatDetectionMethod).optional(),
    nextExpectedHeat: zod_1.z.coerce.date().optional(),
    notes: zod_1.z.string().optional(),
});
