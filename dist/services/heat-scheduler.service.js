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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeatSchedulerService = void 0;
const heat_schedules_model_1 = __importStar(require("../models/heat-schedules.model"));
class HeatSchedulerService {
    static async scheduleHeatReminder(heatCycleId, cowId, heatStartDate, transaction) {
        for (const day of this.HEAT_ALERT_DAYS) {
            // 🔒 Always normalize date (extra safety)
            const startDate = new Date(heatStartDate);
            const scheduledAt = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
            // Skip past alerts
            if (scheduledAt <= new Date())
                continue;
            // 🔒 Prevent duplicate schedules
            const existing = await heat_schedules_model_1.default.findOne({
                where: {
                    heatCycleId,
                    alertDay: day,
                },
                transaction, // ✅ SAME transaction
            });
            if (existing)
                continue;
            await heat_schedules_model_1.default.create({
                heatCycleId,
                cowId,
                alertDay: day,
                scheduledAt,
                status: heat_schedules_model_1.HeatScheduleStatus.SCHEDULED,
            }, { transaction } // ✅ SAME transaction
            );
        }
    }
}
exports.HeatSchedulerService = HeatSchedulerService;
HeatSchedulerService.HEAT_ALERT_DAYS = [18, 19, 20, 21, 22, 23];
